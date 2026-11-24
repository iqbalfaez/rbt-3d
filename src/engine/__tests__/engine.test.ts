import { describe, expect, it } from 'vitest';
import { analyzeCircuit, measureMultimeter } from '../circuitGraph';
import { evaluateSimulationStep } from '../blockRunner';
import { DEFAULT_ENVIRONMENT, MISSIONS, evaluateMission } from '../missions';
import { makePinKey } from '../catalog';
import type { LogicBlockRule, PlacedComponent, WireConnection } from '../../types/game';

const w = (
  id: string,
  fc: string,
  fp: string,
  tc: string,
  tp: string
): WireConnection => ({
  id,
  fromComponentId: fc,
  fromPinId: fp,
  toComponentId: tc,
  toPinId: tp,
  color: '#eab308',
});

describe('RBT Workshop 3D — Circuit Graph & KSSM Mission Verification', () => {
  it('detects direct VCC-to-GND short circuit', () => {
    const comps: PlacedComponent[] = [
      { id: 'mcu', type: 'microcontroller', position: [0, 0, 0], rotation: 0 },
    ];
    const wires = [w('w1', 'mcu', '5V', 'mcu', 'GND1')];
    const analysis = analyzeCircuit(comps, wires, DEFAULT_ENVIRONMENT);
    expect(analysis.faults.some((f) => f.code === 'SHORT_CIRCUIT')).toBe(true);
  });

  it('detects reversed polarity on LED', () => {
    const comps: PlacedComponent[] = [
      { id: 'bat', type: 'battery_pack', position: [-4, 0, 0], rotation: 0 },
      { id: 'led', type: 'led', position: [2, 0, 0], rotation: 0 },
    ];
    const wires = [
      w('w1', 'bat', 'VCC', 'led', 'GND'),
      w('w2', 'bat', 'GND', 'led', 'SIG'),
    ];
    const analysis = analyzeCircuit(comps, wires, DEFAULT_ENVIRONMENT);
    expect(analysis.faults.some((f) => f.code === 'REVERSED_POLARITY')).toBe(true);
  });

  it('supports solderless breadboard rail continuity & multimeter voltage checks', () => {
    const comps: PlacedComponent[] = [
      { id: 'mcu', type: 'microcontroller', position: [-4, 0, 0], rotation: 0 },
      { id: 'bb', type: 'breadboard', position: [0, 0, 4], rotation: 0 },
    ];
    const wires = [
      w('w1', 'mcu', '5V', 'bb', 'rail_tp_1'),
      w('w2', 'mcu', 'GND1', 'bb', 'rail_tn_1'),
    ];
    const analysis = analyzeCircuit(comps, wires, DEFAULT_ENVIRONMENT);
    const meter = measureMultimeter(
      analysis,
      makePinKey('bb', 'rail_tp_6'),
      makePinKey('bb', 'rail_tn_6')
    );
    expect(meter.voltage).toBe(5);
    expect(meter.continuity).toBe(false);

    const railContinuity = measureMultimeter(
      analysis,
      makePinKey('bb', 'rail_tp_1'),
      makePinKey('bb', 'rail_tp_6')
    );
    expect(railContinuity.continuity).toBe(true);
    expect(railContinuity.voltage).toBe(0);
  });

  it('Mission 1: passes parallel Study Desk Lamp & DC Motor Fan switch circuit with 3 stars', () => {
    const mission = MISSIONS[0];
    const comps: PlacedComponent[] = [
      { id: 'bat', type: 'battery_pack', position: [-6, 0, 2], rotation: 0 },
      { id: 'sw', type: 'toggle_switch', position: [-1, 0, 2], rotation: 0 },
      { id: 'lamp', type: 'desk_lamp', position: [4, 0, -2], rotation: 0 },
      { id: 'fan', type: 'dc_motor_gear', position: [4, 0, 3], rotation: 0 },
    ];
    const wires = [
      w('w1', 'bat', 'VCC', 'sw', 'IN'),
      w('w2', 'sw', 'OUT', 'lamp', 'SIG'),
      w('w3', 'sw', 'OUT', 'fan', 'SIG'),
      w('w4', 'lamp', 'GND', 'bat', 'GND'),
      w('w5', 'fan', 'GND', 'bat', 'GND'),
    ];
    const result = evaluateMission(mission, comps, wires, [], 0);
    expect(result.passed).toBe(true);
    expect(result.stars).toBe(3);
  });

  it('Mission 2: passes Automatic Night Light (LDR + LED) with 3 stars', () => {
    const mission = MISSIONS[1];
    const comps: PlacedComponent[] = [
      { id: 'mcu', type: 'microcontroller', position: [-3, 0, 0], rotation: 0 },
      { id: 'ldr', type: 'ldr_sensor', position: [4, 0, 2], rotation: 0 },
      { id: 'led', type: 'led', position: [4, 0, -2], rotation: 0 },
    ];
    const wires = [
      w('w1', 'mcu', '5V', 'ldr', 'VCC'),
      w('w2', 'mcu', 'GND1', 'ldr', 'GND'),
      w('w3', 'ldr', 'SIG', 'mcu', 'A0'),
      w('w4', 'mcu', 'D4', 'led', 'SIG'),
      w('w5', 'mcu', 'GND2', 'led', 'GND'),
    ];
    const rules: LogicBlockRule[] = [
      {
        id: 'r1',
        sensorPin: 'A0',
        operator: '<',
        threshold: 40,
        thenActions: [{ outputPin: 'D4', mode: 'DIGITAL', value: 1 }],
        elseActions: [{ outputPin: 'D4', mode: 'DIGITAL', value: 0 }],
        waitSeconds: 0,
        enabled: true,
      },
    ];
    const result = evaluateMission(mission, comps, wires, rules, 0);
    expect(result.passed).toBe(true);
    expect(result.stars).toBe(3);
  });

  it('Mission 3: passes Smart Plant Watering Prototype (Soil + Relay + Water Pump) with 3 stars', () => {
    const mission = MISSIONS[2];
    const comps: PlacedComponent[] = [
      { id: 'mcu', type: 'microcontroller', position: [-5, 0, 0], rotation: 0 },
      { id: 'soil', type: 'soil_sensor', position: [-5, 0, 6], rotation: 0 },
      { id: 'relay', type: 'relay', position: [1, 0, -1], rotation: 0 },
      { id: 'pump', type: 'water_pump', position: [6, 0, -1], rotation: 0 },
      { id: 'bat', type: 'battery_pack', position: [4, 0, 4], rotation: 0 },
    ];
    const wires = [
      w('w1', 'mcu', '5V', 'soil', 'VCC'),
      w('w2', 'mcu', 'GND1', 'soil', 'GND'),
      w('w3', 'soil', 'SIG', 'mcu', 'A0'),
      w('w4', 'mcu', '5V', 'relay', 'VCC'),
      w('w5', 'mcu', 'GND2', 'relay', 'GND'),
      w('w6', 'mcu', 'D4', 'relay', 'IN'),
      w('w7', 'bat', 'VCC', 'relay', 'COM'),
      w('w8', 'relay', 'NO', 'pump', 'SIG'),
      w('w9', 'pump', 'GND', 'bat', 'GND'),
    ];
    const rules: LogicBlockRule[] = [
      {
        id: 'r1',
        sensorPin: 'A0',
        operator: '<',
        threshold: 35,
        thenActions: [{ outputPin: 'D4', mode: 'DIGITAL', value: 1 }],
        elseActions: [{ outputPin: 'D4', mode: 'DIGITAL', value: 0 }],
        waitSeconds: 0,
        enabled: true,
      },
    ];
    const result = evaluateMission(mission, comps, wires, rules, 0);
    expect(result.passed).toBe(true);
    expect(result.stars).toBe(3);
  });

  it('Mission 4: passes Automated Parking Barrier Gate (Ultrasonic + Servo + Buzzer) with 3 stars', () => {
    const mission = MISSIONS[3];
    const comps: PlacedComponent[] = [
      { id: 'mcu', type: 'microcontroller', position: [-5, 0, -2], rotation: 0 },
      { id: 'bb', type: 'breadboard', position: [0, 0, 4], rotation: 0 },
      { id: 'us', type: 'ultrasonic_sensor', position: [-5, 0, -6], rotation: 0 },
      { id: 'srv', type: 'servo_motor', position: [5, 0, -2], rotation: 0 },
      { id: 'buz', type: 'buzzer', position: [5, 0, -6], rotation: 0 },
    ];
    const wires = [
      w('w1', 'mcu', '5V', 'bb', 'rail_tp_1'),
      w('w2', 'mcu', 'GND1', 'bb', 'rail_tn_1'),
      w('w3', 'bb', 'rail_tp_2', 'us', 'VCC'),
      w('w4', 'bb', 'rail_tn_2', 'us', 'GND'),
      w('w5', 'us', 'SIG', 'mcu', 'D2'),
      w('w6', 'bb', 'rail_tp_3', 'srv', 'VCC'),
      w('w7', 'bb', 'rail_tn_3', 'srv', 'GND'),
      w('w8', 'mcu', 'D5', 'srv', 'SIG'),
      w('w9', 'mcu', 'D7', 'buz', 'SIG'),
      w('w10', 'bb', 'rail_tn_4', 'buz', 'GND'),
    ];
    const rules: LogicBlockRule[] = [
      {
        id: 'r1',
        sensorPin: 'D2',
        operator: '<',
        threshold: 25,
        thenActions: [
          { outputPin: 'D5', mode: 'PWM', value: 90 },
          { outputPin: 'D7', mode: 'DIGITAL', value: 1 },
        ],
        elseActions: [
          { outputPin: 'D5', mode: 'PWM', value: 0 },
          { outputPin: 'D7', mode: 'DIGITAL', value: 0 },
        ],
        waitSeconds: 0,
        enabled: true,
      },
    ];
    const result = evaluateMission(mission, comps, wires, rules, 0);
    expect(result.passed).toBe(true);
    expect(result.stars).toBe(3);
  });

  it('Mission 5: passes Smart Object Sorting Conveyor (IR + DC Motor Gear Drive) with 3 stars', () => {
    const mission = MISSIONS[4];
    const comps: PlacedComponent[] = [
      { id: 'mcu', type: 'microcontroller', position: [-4, 0, 0], rotation: 0 },
      { id: 'ir', type: 'ir_sensor', position: [3, 0, 3], rotation: 0 },
      { id: 'motor', type: 'dc_motor_gear', position: [4, 0, -2], rotation: 0 },
    ];
    const wires = [
      w('w1', 'mcu', '5V', 'ir', 'VCC'),
      w('w2', 'mcu', 'GND1', 'ir', 'GND'),
      w('w3', 'ir', 'SIG', 'mcu', 'D2'),
      w('w4', 'mcu', 'D6', 'motor', 'SIG'),
      w('w5', 'mcu', 'GND2', 'motor', 'GND'),
    ];
    const rules: LogicBlockRule[] = [
      {
        id: 'r1',
        sensorPin: 'D2',
        operator: '=',
        threshold: 1,
        thenActions: [{ outputPin: 'D6', mode: 'DIGITAL', value: 1 }],
        elseActions: [{ outputPin: 'D6', mode: 'DIGITAL', value: 0 }],
        waitSeconds: 0,
        enabled: true,
      },
    ];
    const result = evaluateMission(mission, comps, wires, rules, 0);
    expect(result.passed).toBe(true);
    expect(result.stars).toBe(3);

    // Also verify live simulation step does not activate output if sensor is unpowered
    const unpoweredWires = wires.filter((wire) => wire.id !== 'w1');
    const step = evaluateSimulationStep(comps, unpoweredWires, rules, {
      ...DEFAULT_ENVIRONMENT,
      irDetected: true,
    });
    expect(step.outputs.actuatorStates['motor'] ?? 0).toBe(0);
  });
});
