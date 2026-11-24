import type {
  ComponentPin,
  ComponentType,
  HardwareComponentDef,
  PlacedComponent,
} from '../types/game';

function createBreadboardPins(): ComponentPin[] {
  const pins: ComponentPin[] = [];
  const railXs = [-3.75, -2.25, -0.75, 0.75, 2.25, 3.75];

  railXs.forEach((x, idx) => {
    pins.push({
      id: `rail_tp_${idx + 1}`,
      label: `+5V Rail T${idx + 1}`,
      type: 'BREADBOARD',
      localPos: [x, 0.46, -1.65],
      group: 'rail_top_pos',
    });
    pins.push({
      id: `rail_tn_${idx + 1}`,
      label: `GND Rail T${idx + 1}`,
      type: 'BREADBOARD',
      localPos: [x, 0.46, -1.2],
      group: 'rail_top_neg',
    });
    pins.push({
      id: `rail_bp_${idx + 1}`,
      label: `+5V Rail B${idx + 1}`,
      type: 'BREADBOARD',
      localPos: [x, 0.46, 1.2],
      group: 'rail_bot_pos',
    });
    pins.push({
      id: `rail_bn_${idx + 1}`,
      label: `GND Rail B${idx + 1}`,
      type: 'BREADBOARD',
      localPos: [x, 0.46, 1.65],
      group: 'rail_bot_neg',
    });
  });

  const colXs = [-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5];
  colXs.forEach((x, idx) => {
    const col = idx + 1;
    pins.push(
      {
        id: `t_c${col}_a`,
        label: `Row ${col}A`,
        type: 'BREADBOARD',
        localPos: [x, 0.46, -0.68],
        group: `strip_top_${col}`,
      },
      {
        id: `t_c${col}_b`,
        label: `Row ${col}B`,
        type: 'BREADBOARD',
        localPos: [x, 0.46, -0.26],
        group: `strip_top_${col}`,
      },
      {
        id: `b_c${col}_c`,
        label: `Row ${col}C`,
        type: 'BREADBOARD',
        localPos: [x, 0.46, 0.26],
        group: `strip_bot_${col}`,
      },
      {
        id: `b_c${col}_d`,
        label: `Row ${col}D`,
        type: 'BREADBOARD',
        localPos: [x, 0.46, 0.68],
        group: `strip_bot_${col}`,
      }
    );
  });

  return pins;
}

export const HARDWARE_CATALOG: Record<ComponentType, HardwareComponentDef> = {
  microcontroller: {
    type: 'microcontroller',
    name: 'RBT Microcontroller',
    nameBm: 'Mikropengawal RBT',
    category: 'core',
    kssmTag: 'F2 Bab 2.4 / F3 Bab 2.1',
    cost: 28,
    description: '5V programmable controller board with 5V/GND rails, A0–A2 analog inputs, and D2–D7 digital/PWM pins.',
    descriptionBm: 'Papan mikropengawal 5V dengan pin kuasa 5V/GND, input analog A0–A2, dan pin digital/PWM D2–D7.',
    footprint: [7, 5.2],
    pins: [
      // Bottom power & analog header
      { id: '5V', label: 'VCC 5V', type: 'VCC', localPos: [-2.4, 0.62, 2.05], polarity: 'positive' },
      { id: 'GND1', label: 'GND', type: 'GND', localPos: [-1.5, 0.62, 2.05], polarity: 'negative' },
      { id: 'GND2', label: 'GND', type: 'GND', localPos: [-0.6, 0.62, 2.05], polarity: 'negative' },
      { id: 'A0', label: 'A0 (Analog)', type: 'ANALOG_IN', localPos: [0.6, 0.62, 2.05] },
      { id: 'A1', label: 'A1 (Analog)', type: 'ANALOG_IN', localPos: [1.5, 0.62, 2.05] },
      { id: 'A2', label: 'A2 (Analog)', type: 'ANALOG_IN', localPos: [2.4, 0.62, 2.05] },
      // Top digital & PWM header
      { id: 'D2', label: 'D2 (Digital)', type: 'DIGITAL_IN', localPos: [-2.25, 0.62, -2.05] },
      { id: 'D3', label: 'D3 (PWM~)', type: 'PWM', localPos: [-1.35, 0.62, -2.05] },
      { id: 'D4', label: 'D4 (Digital)', type: 'DIGITAL_OUT', localPos: [-0.45, 0.62, -2.05] },
      { id: 'D5', label: 'D5 (PWM~)', type: 'PWM', localPos: [0.45, 0.62, -2.05] },
      { id: 'D6', label: 'D6 (PWM~)', type: 'PWM', localPos: [1.35, 0.62, -2.05] },
      { id: 'D7', label: 'D7 (Digital)', type: 'DIGITAL_OUT', localPos: [2.25, 0.62, -2.05] },
    ],
  },

  breadboard: {
    type: 'breadboard',
    name: 'Solderless Breadboard',
    nameBm: 'Papan Projek (Breadboard)',
    category: 'core',
    kssmTag: 'F2 Bab 2.3 / 2.4',
    cost: 8,
    description: 'Prototyping board with horizontal power rails (+ / −) and vertical terminal strips.',
    descriptionBm: 'Papan prototaip dengan rel kuasa mendatar (+ / −) dan jalur terminal menegak.',
    footprint: [10, 4.4],
    pins: createBreadboardPins(),
  },

  battery_pack: {
    type: 'battery_pack',
    name: '5V Battery Pack',
    nameBm: 'Pek Bateri 5V (Sumber)',
    category: 'power',
    kssmTag: 'F2 Bab 2.3',
    cost: 6,
    description: 'Regulated 5V DC power source for electrical circuits and auxiliary actuator loads.',
    descriptionBm: 'Sumber kuasa DC 5V untuk litar elektrik dan beban penggerak tambahan.',
    footprint: [4.2, 2.8],
    polarized: true,
    pins: [
      { id: 'VCC', label: '+5V (+)', type: 'VCC', localPos: [1.85, 0.65, -0.55], polarity: 'positive' },
      { id: 'GND', label: 'GND (−)', type: 'GND', localPos: [1.85, 0.65, 0.55], polarity: 'negative' },
    ],
  },

  resistor: {
    type: 'resistor',
    name: '220Ω Resistor',
    nameBm: 'Perintang 220Ω',
    category: 'passive',
    kssmTag: 'F2 Bab 2.3 / 2.4',
    cost: 1,
    description: 'Current-limiting axial resistor (Red-Red-Brown) for safe LED and sensor wiring.',
    descriptionBm: 'Perintang had arus (Merah-Merah-Perang) untuk melindungi LED dan penderia.',
    footprint: [3.2, 1.2],
    pins: [
      { id: 'T1', label: 'Lead A', type: 'PASSIVE', localPos: [-1.3, 0.35, 0] },
      { id: 'T2', label: 'Lead B', type: 'PASSIVE', localPos: [1.3, 0.35, 0] },
    ],
  },

  toggle_switch: {
    type: 'toggle_switch',
    name: 'SPST Rocker Switch',
    nameBm: 'Suis Togel (Kawalan)',
    category: 'sensor',
    kssmTag: 'F2 Bab 2.3',
    cost: 4,
    description: 'Latching mechanical control switch to open or close an electrical circuit.',
    descriptionBm: 'Suis kawalan mekanikal untuk membuka atau menutup litar elektrik.',
    footprint: [2.4, 2.4],
    pins: [
      { id: 'IN', label: 'COM In', type: 'SWITCH', localPos: [-0.85, 0.45, 0.85] },
      { id: 'OUT', label: 'LOAD Out', type: 'SWITCH', localPos: [0.85, 0.45, 0.85] },
    ],
  },

  push_button: {
    type: 'push_button',
    name: 'Push Button Module',
    nameBm: 'Modul Suis Tekan',
    category: 'sensor',
    kssmTag: 'F2 Bab 2.4',
    cost: 4,
    description: 'Momentary tactile switch module with built-in pull-down output (SIG).',
    descriptionBm: 'Modul suis tekan sesaat dengan isyarat keluaran digital (SIG).',
    footprint: [2.4, 2.4],
    pins: [
      { id: 'VCC', label: 'VCC 5V', type: 'VCC', localPos: [-0.7, 0.45, 0.95], polarity: 'positive' },
      { id: 'SIG', label: 'SIG (Out)', type: 'DIGITAL_OUT', localPos: [0, 0.45, 0.95] },
      { id: 'GND', label: 'GND', type: 'GND', localPos: [0.7, 0.45, 0.95], polarity: 'negative' },
    ],
  },

  ldr_sensor: {
    type: 'ldr_sensor',
    name: 'LDR Light Sensor',
    nameBm: 'Penderia Cahaya (LDR)',
    category: 'sensor',
    kssmTag: 'F2 Bab 2.4',
    cost: 7,
    description: 'Analog ambient light module outputting 0–100% brightness on AO.',
    descriptionBm: 'Modul penderia cahaya analog yang mengukur kecerahan 0–100% pada pin AO.',
    footprint: [2.8, 2.6],
    polarized: true,
    pins: [
      { id: 'VCC', label: 'VCC 5V', type: 'VCC', localPos: [-0.75, 0.48, 1.0], polarity: 'positive' },
      { id: 'GND', label: 'GND', type: 'GND', localPos: [0, 0.48, 1.0], polarity: 'negative' },
      { id: 'SIG', label: 'AO (Light)', type: 'ANALOG_IN', localPos: [0.75, 0.48, 1.0] },
    ],
  },

  soil_sensor: {
    type: 'soil_sensor',
    name: 'Soil Moisture Sensor',
    nameBm: 'Penderia Kelembapan Tanah',
    category: 'sensor',
    kssmTag: 'F2 Bab 2.4',
    cost: 9,
    description: 'Forked moisture probe module measuring soil humidity (0–100%) on AO.',
    descriptionBm: 'Penderia prob kelembapan tanah yang mengukur 0–100% kelembapan pada pin AO.',
    footprint: [2.6, 4.2],
    polarized: true,
    pins: [
      { id: 'VCC', label: 'VCC 5V', type: 'VCC', localPos: [-0.75, 0.48, 1.7], polarity: 'positive' },
      { id: 'GND', label: 'GND', type: 'GND', localPos: [0, 0.48, 1.7], polarity: 'negative' },
      { id: 'SIG', label: 'AO (Moist)', type: 'ANALOG_IN', localPos: [0.75, 0.48, 1.7] },
    ],
  },

  ultrasonic_sensor: {
    type: 'ultrasonic_sensor',
    name: 'Ultrasonic Sensor (HC-SR04)',
    nameBm: 'Penderia Ultrasonik (HC-SR04)',
    category: 'sensor',
    kssmTag: 'F3 Bab 2.1',
    cost: 12,
    description: 'Acoustic distance sensor measuring obstacle proximity (2–100 cm) via SIG.',
    descriptionBm: 'Penderia jarak akustik mengukur halangan (2–100 cm) melalui pin SIG.',
    footprint: [4.4, 2.2],
    polarized: true,
    pins: [
      { id: 'VCC', label: 'VCC 5V', type: 'VCC', localPos: [-1.1, 0.48, 0.85], polarity: 'positive' },
      { id: 'SIG', label: 'ECHO/SIG', type: 'DIGITAL_IN', localPos: [0, 0.48, 0.85] },
      { id: 'GND', label: 'GND', type: 'GND', localPos: [1.1, 0.48, 0.85], polarity: 'negative' },
    ],
  },

  ir_sensor: {
    type: 'ir_sensor',
    name: 'IR Object Sensor',
    nameBm: 'Penderia Inframerah (IR)',
    category: 'sensor',
    kssmTag: 'F3 Bab 2.1',
    cost: 8,
    description: 'Infrared proximity sensor outputting HIGH (1) when an object is detected on the line.',
    descriptionBm: 'Penderia inframerah mengeluarkan isyarat TINGGI (1) apabila objek dikesan.',
    footprint: [3.2, 2.2],
    polarized: true,
    pins: [
      { id: 'VCC', label: 'VCC 5V', type: 'VCC', localPos: [-0.8, 0.48, 0.85], polarity: 'positive' },
      { id: 'GND', label: 'GND', type: 'GND', localPos: [0, 0.48, 0.85], polarity: 'negative' },
      { id: 'SIG', label: 'OUT (IR)', type: 'DIGITAL_IN', localPos: [0.8, 0.48, 0.85] },
    ],
  },

  led: {
    type: 'led',
    name: 'LED Module (5V Safe)',
    nameBm: 'Modul LED (5V Selamat)',
    category: 'actuator',
    kssmTag: 'F2 Bab 2.3 / 2.4',
    cost: 3,
    description: 'High-visibility dome LED with integrated protective resistor. Connect Anode (+) to Signal/5V and Cathode (−) to GND.',
    descriptionBm: 'LED kubah terang dengan perintang pelindung terbina. Sambung Anod (+) ke Isyarat/5V dan Katod (−) ke GND.',
    footprint: [2.0, 2.0],
    polarized: true,
    pins: [
      { id: 'SIG', label: 'Anode (+)', type: 'DIGITAL_OUT', localPos: [-0.55, 0.45, 0.75], polarity: 'positive' },
      { id: 'GND', label: 'Cathode (−)', type: 'GND', localPos: [0.55, 0.45, 0.75], polarity: 'negative' },
    ],
  },

  desk_lamp: {
    type: 'desk_lamp',
    name: 'Study Desk Lamp',
    nameBm: 'Lampu Meja Belajar',
    category: 'actuator',
    kssmTag: 'F2 Bab 2.3',
    cost: 10,
    description: '5V articulated study lamp load for electrical circuit builds.',
    descriptionBm: 'Beban lampu meja 5V untuk pembinaan litar elektrik asas.',
    footprint: [2.8, 2.8],
    polarized: true,
    pins: [
      { id: 'SIG', label: 'Lamp (+)', type: 'DIGITAL_OUT', localPos: [-0.65, 0.42, 1.05], polarity: 'positive' },
      { id: 'GND', label: 'Lamp (−)', type: 'GND', localPos: [0.65, 0.42, 1.05], polarity: 'negative' },
    ],
  },

  buzzer: {
    type: 'buzzer',
    name: 'Piezo Buzzer',
    nameBm: 'Pembaz Piezo',
    category: 'actuator',
    kssmTag: 'F2 Bab 2.4 / F3 Bab 2.1',
    cost: 5,
    description: 'Active piezo sounder emitting an alert tone when driven HIGH.',
    descriptionBm: 'Pembaz piezo aktif yang menghasilkan bunyi amaran apabila menerima isyarat TINGGI.',
    footprint: [2.2, 2.2],
    polarized: true,
    pins: [
      { id: 'SIG', label: 'SIG (+)', type: 'DIGITAL_OUT', localPos: [-0.6, 0.45, 0.85], polarity: 'positive' },
      { id: 'GND', label: 'GND (−)', type: 'GND', localPos: [0.6, 0.45, 0.85], polarity: 'negative' },
    ],
  },

  relay: {
    type: 'relay',
    name: '5V Relay Module',
    nameBm: 'Modul Geganti 5V (Relay)',
    category: 'actuator',
    kssmTag: 'F2 Bab 2.4',
    cost: 10,
    description: 'Electromagnetic switch controlled by MCU IN pin to safely switch high-current loads (COM → NO).',
    descriptionBm: 'Suis elektromagnet dikawal oleh pin IN mikropengawal untuk mengawal beban arus tinggi (COM → NO).',
    footprint: [3.6, 2.8],
    polarized: true,
    pins: [
      // Control side
      { id: 'VCC', label: 'VCC 5V', type: 'VCC', localPos: [-1.45, 0.48, -0.7], polarity: 'positive' },
      { id: 'IN', label: 'IN (Ctrl)', type: 'DIGITAL_OUT', localPos: [-1.45, 0.48, 0], polarity: 'neutral' },
      { id: 'GND', label: 'GND', type: 'GND', localPos: [-1.45, 0.48, 0.7], polarity: 'negative' },
      // Load switch side
      { id: 'COM', label: 'COM', type: 'RELAY_COM', localPos: [1.45, 0.55, -0.45] },
      { id: 'NO', label: 'NO (Load)', type: 'RELAY_NO', localPos: [1.45, 0.55, 0.45] },
    ],
  },

  water_pump: {
    type: 'water_pump',
    name: 'Mini DC Water Pump',
    nameBm: 'Pam Air Mini DC',
    category: 'actuator',
    kssmTag: 'F2 Bab 2.4',
    cost: 14,
    description: 'Submersible 5V micro pump emitting water flow when powered directly or switched by a Relay.',
    descriptionBm: 'Pam air mikro 5V yang memancutkan air apabila dibekalkan kuasa atau dikawal geganti.',
    footprint: [3.2, 3.0],
    polarized: true,
    pins: [
      { id: 'SIG', label: 'Pump (+)', type: 'DIGITAL_OUT', localPos: [-0.7, 0.45, 1.15], polarity: 'positive' },
      { id: 'GND', label: 'Pump (−)', type: 'GND', localPos: [0.7, 0.45, 1.15], polarity: 'negative' },
    ],
  },

  servo_motor: {
    type: 'servo_motor',
    name: 'Servo Barrier Gate',
    nameBm: 'Motor Servo & Palang',
    category: 'actuator',
    kssmTag: 'F3 Bab 2.1',
    cost: 16,
    description: 'Mechatronic servo with meshing gear drive and barrier arm rotating 0°–90° via PWM.',
    descriptionBm: 'Motor servo mekatronik dengan gear dan lengan palang berputar 0°–90° melalui isyarat PWM.',
    footprint: [4.2, 3.0],
    polarized: true,
    pins: [
      { id: 'VCC', label: 'VCC 5V', type: 'VCC', localPos: [-0.8, 0.48, 1.15], polarity: 'positive' },
      { id: 'SIG', label: 'PWM (Sig)', type: 'PWM', localPos: [0, 0.48, 1.15] },
      { id: 'GND', label: 'GND', type: 'GND', localPos: [0.8, 0.48, 1.15], polarity: 'negative' },
    ],
  },

  dc_motor_gear: {
    type: 'dc_motor_gear',
    name: 'DC Motor & Gear Drive',
    nameBm: 'Motor DC & Pacuan Gear',
    category: 'actuator',
    kssmTag: 'F2 Bab 2.3 / F3 Bab 2.1',
    cost: 15,
    description: '5V DC motor with meshing spur gears and fan/conveyor drive shaft.',
    descriptionBm: 'Motor DC 5V dengan gear taji berpaut untuk kipas meja atau penghantar konveyor.',
    footprint: [4.2, 3.0],
    polarized: true,
    pins: [
      { id: 'SIG', label: 'Motor (+)', type: 'DIGITAL_OUT', localPos: [-0.75, 0.45, 1.15], polarity: 'positive' },
      { id: 'GND', label: 'Motor (−)', type: 'GND', localPos: [0.75, 0.45, 1.15], polarity: 'negative' },
    ],
  },
};

export const COMPONENT_LIST: HardwareComponentDef[] = Object.values(HARDWARE_CATALOG);

export function makePinKey(componentId: string, pinId: string): string {
  return `${componentId}::${pinId}`;
}

export function getPinDef(type: ComponentType, pinId: string): ComponentPin | undefined {
  return HARDWARE_CATALOG[type]?.pins.find((p) => p.id === pinId);
}

/**
 * Computes exact world-space coordinates for a pin on a placed component,
 * accounting for Three.js right-handed Y-axis rotation.
 */
export function getPinWorldPosition(
  component: PlacedComponent,
  pinId: string
): [number, number, number] {
  const pin = getPinDef(component.type, pinId);
  if (!pin) return [...component.position];
  const [lx, ly, lz] = pin.localPos;
  const cos = Math.cos(component.rotation);
  const sin = Math.sin(component.rotation);
  const wx = component.position[0] + lx * cos + lz * sin;
  const wy = component.position[1] + ly;
  const wz = component.position[2] - lx * sin + lz * cos;
  return [wx, wy, wz];
}

export function getAutoWireColor(fromPin?: ComponentPin, toPin?: ComponentPin): string {
  const types = [fromPin?.type, toPin?.type];
  if (types.includes('VCC')) return '#dc2626'; // Red for 5V power
  if (types.includes('GND')) return '#1e293b'; // Charcoal/Black for GND
  if (types.includes('PWM')) return '#f59e0b'; // Amber for PWM
  if (types.includes('ANALOG_IN')) return '#0ea5e9'; // Sky blue for analog
  if (types.includes('RELAY_COM') || types.includes('RELAY_NO') || types.includes('SWITCH')) {
    return '#ea580c'; // Orange for switched load
  }
  return '#eab308'; // Yellow for digital signals
}
