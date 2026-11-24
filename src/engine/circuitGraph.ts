import {
  HARDWARE_CATALOG,
  getPinWorldPosition,
  makePinKey,
} from './catalog';
import type {
  CircuitAnalysis,
  ComponentType,
  ConnectedOutputInfo,
  ConnectedSensorInfo,
  EnvironmentState,
  PlacedComponent,
  SafetyFault,
  WireConnection,
} from '../types/game';

class DisjointSet {
  private parent = new Map<string, string>();

  add(x: string) {
    if (!this.parent.has(x)) this.parent.set(x, x);
  }

  find(x: string): string {
    this.add(x);
    let root = x;
    while (this.parent.get(root) !== root) {
      root = this.parent.get(root)!;
    }
    let curr = x;
    while (curr !== root) {
      const next = this.parent.get(curr)!;
      this.parent.set(curr, root);
      curr = next;
    }
    return root;
  }

  union(a: string, b: string) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }

  allKeys(): string[] {
    return Array.from(this.parent.keys());
  }
}

const SENSOR_TYPES = new Set<ComponentType>([
  'push_button',
  'ldr_sensor',
  'soil_sensor',
  'ultrasonic_sensor',
  'ir_sensor',
]);

const OUTPUT_TYPES = new Set<ComponentType>([
  'led',
  'desk_lamp',
  'buzzer',
  'relay',
  'water_pump',
  'servo_motor',
  'dc_motor_gear',
]);

const MCU_SIGNAL_PINS = new Set(['A0', 'A1', 'A2', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']);
const MCU_ANALOG_ONLY_PINS = new Set(['A0', 'A1', 'A2']);

export function getSensorNumericValue(type: ComponentType, env: EnvironmentState): number {
  switch (type) {
    case 'ldr_sensor':
      return env.lightLevel;
    case 'soil_sensor':
      return env.soilMoisture;
    case 'ultrasonic_sensor':
      return env.obstacleDistance;
    case 'ir_sensor':
      return env.irDetected ? 1 : 0;
    case 'push_button':
      return env.pushButtonPressed ? 1 : 0;
    default:
      return 0;
  }
}

export function getSensorVoltage(type: ComponentType, env: EnvironmentState): number {
  switch (type) {
    case 'ldr_sensor':
      return Number(((env.lightLevel / 100) * 5).toFixed(2));
    case 'soil_sensor':
      return Number(((env.soilMoisture / 100) * 5).toFixed(2));
    case 'ultrasonic_sensor':
      return Number((((100 - env.obstacleDistance) / 98) * 5).toFixed(2));
    case 'ir_sensor':
      return env.irDetected ? 5.0 : 0.0;
    case 'push_button':
      return env.pushButtonPressed ? 5.0 : 0.0;
    default:
      return 0.0;
  }
}

export function analyzeCircuit(
  components: PlacedComponent[],
  wires: WireConnection[],
  env: EnvironmentState,
  energizedRelays: Set<string> = new Set(),
  mcuPinOutputs: Record<string, number> = {}
): CircuitAnalysis {
  const ds = new DisjointSet();
  const compMap = new Map<string, PlacedComponent>();

  for (const comp of components) {
    compMap.set(comp.id, comp);
    const def = HARDWARE_CATALOG[comp.type];
    const groups = new Map<string, string>();

    for (const pin of def.pins) {
      const key = makePinKey(comp.id, pin.id);
      ds.add(key);

      // Internal breadboard rail / strip continuity
      if (pin.group) {
        const existing = groups.get(pin.group);
        if (existing) {
          ds.union(existing, key);
        } else {
          groups.set(pin.group, key);
        }
      }
    }

    // Internal microcontroller GND continuity
    if (comp.type === 'microcontroller') {
      ds.union(makePinKey(comp.id, 'GND1'), makePinKey(comp.id, 'GND2'));
    }

    // Axial resistor bridges its two leads for netlist continuity
    if (comp.type === 'resistor') {
      ds.union(makePinKey(comp.id, 'T1'), makePinKey(comp.id, 'T2'));
    }

    // Closed toggle switch conducts between IN and OUT
    if (comp.type === 'toggle_switch' && env.toggleSwitchOn) {
      ds.union(makePinKey(comp.id, 'IN'), makePinKey(comp.id, 'OUT'));
    }

    // Energized relay closes COM -> NO
    if (comp.type === 'relay' && energizedRelays.has(comp.id)) {
      ds.union(makePinKey(comp.id, 'COM'), makePinKey(comp.id, 'NO'));
    }
  }

  // Union all jumper wires
  for (const wire of wires) {
    if (!compMap.has(wire.fromComponentId) || !compMap.has(wire.toComponentId)) continue;
    const fromKey = makePinKey(wire.fromComponentId, wire.fromPinId);
    const toKey = makePinKey(wire.toComponentId, wire.toPinId);
    ds.union(fromKey, toKey);
  }

  // Assign integer net IDs
  const rootToNet = new Map<string, number>();
  const pinNetMap: Record<string, number> = {};
  let nextNet = 1;
  for (const key of ds.allKeys()) {
    const root = ds.find(key);
    if (!rootToNet.has(root)) {
      rootToNet.set(root, nextNet++);
    }
    pinNetMap[key] = rootToNet.get(root)!;
  }

  // Collect source VCC and GND nets
  const vccSet = new Set<number>();
  const gndSet = new Set<number>();
  const mcuPinNets = new Map<number, string>(); // netId -> MCU pin id (e.g., 'A0', 'D3')

  for (const comp of components) {
    if (comp.type === 'microcontroller') {
      vccSet.add(pinNetMap[makePinKey(comp.id, '5V')]);
      gndSet.add(pinNetMap[makePinKey(comp.id, 'GND1')]);
      gndSet.add(pinNetMap[makePinKey(comp.id, 'GND2')]);
      for (const pinId of MCU_SIGNAL_PINS) {
        const net = pinNetMap[makePinKey(comp.id, pinId)];
        if (net !== undefined) mcuPinNets.set(net, pinId);
      }
    } else if (comp.type === 'battery_pack') {
      vccSet.add(pinNetMap[makePinKey(comp.id, 'VCC')]);
      gndSet.add(pinNetMap[makePinKey(comp.id, 'GND')]);
    }
  }

  const faults: SafetyFault[] = [];
  const seenFaultIds = new Set<string>();
  const pushFault = (fault: SafetyFault) => {
    if (!seenFaultIds.has(fault.id)) {
      seenFaultIds.add(fault.id);
      faults.push(fault);
    }
  };

  // 1. Detect direct VCC-to-GND short circuits
  const shortedNets = new Set<number>();
  for (const vNet of vccSet) {
    if (gndSet.has(vNet)) {
      shortedNets.add(vNet);
      // Locate a power source pin on this net for 3D spark visual
      const sourceComp = components.find(
        (c) =>
          (c.type === 'microcontroller' && pinNetMap[makePinKey(c.id, '5V')] === vNet) ||
          (c.type === 'battery_pack' && pinNetMap[makePinKey(c.id, 'VCC')] === vNet)
      );
      const sourcePinId = sourceComp?.type === 'microcontroller' ? '5V' : 'VCC';
      pushFault({
        id: `short-${vNet}`,
        severity: 'critical',
        code: 'SHORT_CIRCUIT',
        title: 'Short Circuit Detected (VCC ↔ GND)',
        titleBm: 'Litar Pintas Dikesan (VCC ↔ GND)',
        message:
          'Direct electrical path between +5V (VCC) and Ground (GND). Remove the offending jumper wire immediately to prevent overheating.',
        messageBm:
          'Terdapat sambungan terus antara +5V (VCC) dan Bumi (GND). Tanggalkan wayar pelompat yang salah bagi mengelakkan kerosakan komponen.',
        componentId: sourceComp?.id,
        pinId: sourcePinId,
        worldPos: sourceComp ? getPinWorldPosition(sourceComp, sourcePinId) : [0, 0.8, 0],
      });
    }
  }

  const hasShort = shortedNets.size > 0;
  const componentPower: Record<string, boolean> = {};
  const connectedSensors: ConnectedSensorInfo[] = [];
  const connectedOutputs: ConnectedOutputInfo[] = [];
  const directPoweredOutputs: Record<string, boolean> = {};

  // 2. Evaluate each component's power, polarity, and MCU connections
  for (const comp of components) {
    const def = HARDWARE_CATALOG[comp.type];

    if (comp.type === 'microcontroller' || comp.type === 'battery_pack') {
      componentPower[comp.id] = !hasShort;
      continue;
    }

    if (comp.type === 'breadboard' || comp.type === 'resistor' || comp.type === 'toggle_switch') {
      componentPower[comp.id] = true;
      continue;
    }

    const vccPin = def.pins.find((p) => p.id === 'VCC');
    const gndPin = def.pins.find((p) => p.id === 'GND');
    const sigPin = def.pins.find((p) => p.id === 'SIG' || p.id === 'IN');

    const vccNet = vccPin ? pinNetMap[makePinKey(comp.id, vccPin.id)] : undefined;
    const gndNet = gndPin ? pinNetMap[makePinKey(comp.id, gndPin.id)] : undefined;
    const sigNet = sigPin ? pinNetMap[makePinKey(comp.id, sigPin.id)] : undefined;

    // Check reversed polarity on polarized components
    if (def.polarized && !hasShort) {
      const posPin = vccPin ?? sigPin;
      const posNet = vccPin ? vccNet : sigNet;
      if (
        (posPin && posNet !== undefined && gndSet.has(posNet) && gndPin && gndNet !== undefined && vccSet.has(gndNet)) ||
        (vccPin && vccNet !== undefined && gndSet.has(vccNet)) ||
        (gndPin && gndNet !== undefined && vccSet.has(gndNet))
      ) {
        const offendingPin = gndPin && gndNet !== undefined && vccSet.has(gndNet) ? gndPin.id : (posPin?.id ?? 'GND');
        pushFault({
          id: `polarity-${comp.id}`,
          severity: 'critical',
          code: 'REVERSED_POLARITY',
          title: `Reversed Polarity on ${def.name}`,
          titleBm: `Kekutuban Terbalik pada ${def.nameBm}`,
          message: `Positive (+ / VCC) and Negative (− / GND) connections are swapped on ${def.name}. Check red (+5V) and black (GND) leads.`,
          messageBm: `Sambungan positif (+ / VCC) dan negatif (− / GND) terbalik pada ${def.nameBm}. Semak wayar merah (+5V) dan hitam (GND).`,
          componentId: comp.id,
          pinId: offendingPin,
          worldPos: getPinWorldPosition(comp, offendingPin),
        });
      }
    }

    // Sensors
    if (SENSOR_TYPES.has(comp.type)) {
      const hasVcc = vccNet !== undefined && vccSet.has(vccNet);
      const hasGnd = gndNet !== undefined && gndSet.has(gndNet);
      const powered = !hasShort && hasVcc && hasGnd;
      componentPower[comp.id] = powered;

      if (sigNet !== undefined) {
        if (!hasShort && (vccSet.has(sigNet) || gndSet.has(sigNet))) {
          pushFault({
            id: `sig-power-${comp.id}`,
            severity: 'warning',
            code: 'INCOMPATIBLE_PIN',
            title: `Signal Pin Shorted to Power on ${def.name}`,
            titleBm: `Pin Isyarat Tersambung ke Kuasa pada ${def.nameBm}`,
            message: `Connect ${def.name}'s signal pin to a microcontroller input (A0–A2 or D2–D7), not directly to 5V or GND.`,
            messageBm: `Sambungkan pin isyarat ${def.nameBm} ke pin input mikropengawal (A0–A2 atau D2–D7), bukan terus ke 5V atau GND.`,
            componentId: comp.id,
            pinId: sigPin?.id,
            worldPos: sigPin ? getPinWorldPosition(comp, sigPin.id) : undefined,
          });
        }

        const mcuPin = mcuPinNets.get(sigNet);
        if (mcuPin) {
          connectedSensors.push({
            componentId: comp.id,
            type: comp.type,
            mcuPin,
            powered,
          });
        }
      }
      continue;
    }

    // Outputs & Actuators
    if (OUTPUT_TYPES.has(comp.type)) {
      const hasGnd = gndNet !== undefined && gndSet.has(gndNet);
      const hasVcc = vccPin ? vccNet !== undefined && vccSet.has(vccNet) : true;
      const mcuPin = sigNet !== undefined ? mcuPinNets.get(sigNet) : undefined;

      // Check incompatible output wired to analog-only input A0-A2
      if (mcuPin && MCU_ANALOG_ONLY_PINS.has(mcuPin)) {
        pushFault({
          id: `incompat-${comp.id}`,
          severity: 'warning',
          code: 'INCOMPATIBLE_PIN',
          title: `Output Wired to Analog Input (${mcuPin})`,
          titleBm: `Output Disambung ke Pin Analog (${mcuPin})`,
          message: `${def.name} is an output actuator and must be wired to a Digital/PWM pin (D2–D7), not Analog Input ${mcuPin}.`,
          messageBm: `${def.nameBm} ialah penggerak output dan mesti disambung ke pin Digital/PWM (D2–D7), bukan input analog ${mcuPin}.`,
          componentId: comp.id,
          pinId: sigPin?.id,
          worldPos: sigPin ? getPinWorldPosition(comp, sigPin.id) : undefined,
        });
      }

      // Direct electrical power (e.g., Battery -> Toggle Switch -> Desk Lamp/DC Motor -> GND, or Battery -> Relay COM/NO -> Water Pump -> GND)
      const sigHasVcc = sigNet !== undefined && vccSet.has(sigNet);
      const isDirectPowered = !hasShort && !vccPin && sigHasVcc && hasGnd;
      if (isDirectPowered) {
        directPoweredOutputs[comp.id] = true;
      }

      const validPower = !hasShort && hasVcc && hasGnd;
      componentPower[comp.id] = validPower || isDirectPowered;

      if (mcuPin && !MCU_ANALOG_ONLY_PINS.has(mcuPin)) {
        connectedOutputs.push({
          componentId: comp.id,
          type: comp.type,
          mcuPin,
          powered: validPower,
        });
      }
    }
  }

  // 3. Compute pin voltages for Multimeter & X-Ray flow
  const pinVoltages: Record<string, number> = {};
  const activeHighNets = new Set<number>();

  // Gather active MCU output nets
  for (const comp of components) {
    if (comp.type !== 'microcontroller') continue;
    for (const [pinId, val] of Object.entries(mcuPinOutputs)) {
      const net = pinNetMap[makePinKey(comp.id, pinId)];
      if (net !== undefined && val > 0 && !hasShort) {
        activeHighNets.add(net);
      }
    }
  }

  // Sensor live signal voltages
  const sensorNetVoltage = new Map<number, number>();
  for (const s of connectedSensors) {
    if (!s.powered) continue;
    const net = pinNetMap[makePinKey(s.componentId, 'SIG')];
    if (net !== undefined) {
      const v = getSensorVoltage(s.type, env);
      sensorNetVoltage.set(net, v);
      if (v >= 2.5) activeHighNets.add(net);
    }
  }

  for (const [pinKey, net] of Object.entries(pinNetMap)) {
    if (hasShort && shortedNets.has(net)) {
      pinVoltages[pinKey] = 0.0;
    } else if (vccSet.has(net)) {
      pinVoltages[pinKey] = 5.0;
    } else if (gndSet.has(net)) {
      pinVoltages[pinKey] = 0.0;
    } else if (activeHighNets.has(net)) {
      pinVoltages[pinKey] = 5.0;
    } else if (sensorNetVoltage.has(net)) {
      pinVoltages[pinKey] = sensorNetVoltage.get(net)!;
    } else {
      pinVoltages[pinKey] = 0.0;
    }
  }

  // 4. Compute wire flow types for X-Ray animation
  const wireFlow: CircuitAnalysis['wireFlow'] = {};
  for (const wire of wires) {
    const net = pinNetMap[makePinKey(wire.fromComponentId, wire.fromPinId)];
    if (net === undefined || hasShort) {
      wireFlow[wire.id] = 'inactive';
    } else if (vccSet.has(net)) {
      wireFlow[wire.id] = 'vcc';
    } else if (gndSet.has(net)) {
      wireFlow[wire.id] = 'gnd';
    } else if (activeHighNets.has(net)) {
      wireFlow[wire.id] = 'signal_high';
    } else {
      wireFlow[wire.id] = 'signal_low';
    }
  }

  return {
    pinNetMap,
    vccNetIds: Array.from(vccSet),
    gndNetIds: Array.from(gndSet),
    pinVoltages,
    componentPower,
    faults,
    connectedSensors,
    connectedOutputs,
    directPoweredOutputs,
    wireFlow,
  };
}

export function measureMultimeter(
  analysis: CircuitAnalysis,
  probeAKey: string | null,
  probeBKey: string | null
): { voltage: number; continuity: boolean; ready: boolean } {
  if (!probeAKey || !probeBKey) {
    return { voltage: 0, continuity: false, ready: false };
  }
  const vA = analysis.pinVoltages[probeAKey] ?? 0;
  const vB = analysis.pinVoltages[probeBKey] ?? 0;
  const netA = analysis.pinNetMap[probeAKey];
  const netB = analysis.pinNetMap[probeBKey];
  const continuity = netA !== undefined && netA === netB;
  return {
    voltage: Number((vA - vB).toFixed(2)),
    continuity,
    ready: true,
  };
}
