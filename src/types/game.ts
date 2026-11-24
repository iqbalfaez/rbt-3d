export type Language = 'en' | 'bm';

export type PinType =
  | 'VCC'
  | 'GND'
  | 'DIGITAL_IN'
  | 'DIGITAL_OUT'
  | 'ANALOG_IN'
  | 'PWM'
  | 'SWITCH'
  | 'RELAY_COM'
  | 'RELAY_NO'
  | 'RELAY_NC'
  | 'PASSIVE'
  | 'BREADBOARD';

export type ComponentCategory = 'core' | 'power' | 'sensor' | 'actuator' | 'passive';

export type ComponentType =
  | 'microcontroller'
  | 'breadboard'
  | 'battery_pack'
  | 'resistor'
  | 'push_button'
  | 'toggle_switch'
  | 'ldr_sensor'
  | 'soil_sensor'
  | 'ultrasonic_sensor'
  | 'ir_sensor'
  | 'led'
  | 'desk_lamp'
  | 'buzzer'
  | 'relay'
  | 'water_pump'
  | 'servo_motor'
  | 'dc_motor_gear';

export type ToolMode = 'select' | 'wire' | 'move' | 'delete' | 'multimeter';

export interface ComponentPin {
  id: string;
  label: string;
  type: PinType;
  localPos: [number, number, number];
  /** Internal electrical continuity group (e.g. breadboard strips) */
  group?: string;
  polarity?: 'positive' | 'negative' | 'neutral';
}

export interface HardwareComponentDef {
  type: ComponentType;
  name: string;
  nameBm: string;
  category: ComponentCategory;
  kssmTag: string;
  cost: number;
  description: string;
  descriptionBm: string;
  /** Width (X) and Depth (Z) in workbench units (1 unit = 1 cm) */
  footprint: [number, number];
  pins: ComponentPin[];
  polarized?: boolean;
}

export interface PlacedComponent {
  id: string;
  type: ComponentType;
  position: [number, number, number];
  /** Y-axis rotation in radians (multiples of Math.PI / 2) */
  rotation: number;
}

export interface WireConnection {
  id: string;
  fromComponentId: string;
  fromPinId: string;
  toComponentId: string;
  toPinId: string;
  color: string;
}

export type ComparisonOperator = '<' | '>' | '=' | '<=' | '>=';

export interface BlockAction {
  outputPin: string;
  mode: 'DIGITAL' | 'PWM';
  /** 0 or 1 for DIGITAL; 0..180 degrees for PWM */
  value: number;
}

export interface LogicBlockRule {
  id: string;
  sensorPin: string;
  operator: ComparisonOperator;
  threshold: number;
  thenActions: BlockAction[];
  elseActions: BlockAction[];
  waitSeconds: number;
  enabled: boolean;
}

export interface EnvironmentState {
  lightLevel: number; // 0 - 100 (%)
  soilMoisture: number; // 0 - 100 (%)
  obstacleDistance: number; // 2 - 100 (cm)
  irDetected: boolean;
  pushButtonPressed: boolean;
  toggleSwitchOn: boolean;
}

export interface SafetyFault {
  id: string;
  severity: 'critical' | 'warning';
  code: 'SHORT_CIRCUIT' | 'REVERSED_POLARITY' | 'INCOMPATIBLE_PIN' | 'NO_GROUND' | 'OPEN_CIRCUIT';
  title: string;
  titleBm: string;
  message: string;
  messageBm: string;
  componentId?: string;
  pinId?: string;
  worldPos?: [number, number, number];
}

export interface ConnectedSensorInfo {
  componentId: string;
  type: ComponentType;
  mcuPin: string;
  powered: boolean;
}

export interface ConnectedOutputInfo {
  componentId: string;
  type: ComponentType;
  mcuPin: string;
  powered: boolean;
  viaRelay?: boolean;
}

export interface CircuitAnalysis {
  /** Maps "componentId::pinId" -> electrical net ID */
  pinNetMap: Record<string, number>;
  vccNetIds: number[];
  gndNetIds: number[];
  /** Live estimated voltage for each "componentId::pinId" */
  pinVoltages: Record<string, number>;
  /** Whether a component has a valid power path */
  componentPower: Record<string, boolean>;
  /** Active electrical faults detected */
  faults: SafetyFault[];
  /** Sensors wired to microcontroller pins */
  connectedSensors: ConnectedSensorInfo[];
  /** Outputs controlled by microcontroller pins (direct or via relay) */
  connectedOutputs: ConnectedOutputInfo[];
  /** Direct electrical loads powered purely via battery/switch (no MCU needed) */
  directPoweredOutputs: Record<string, boolean>;
  /** Wire current type for X-Ray animation */
  wireFlow: Record<string, 'vcc' | 'gnd' | 'signal_high' | 'signal_low' | 'inactive'>;
}

export interface SimulationOutputs {
  /** MCU pin -> value (0/1 for digital, 0-180 for servo PWM) */
  mcuPinOutputs: Record<string, number>;
  /** Component ID -> active drive level (0..1 for LED/lamp/pump/motor/buzzer, 0..180 for servo) */
  actuatorStates: Record<string, number>;
  /** Sensor pin -> live numeric reading */
  sensorReadings: Record<string, number>;
}

export interface MissionIPO {
  input: string[];
  inputBm: string[];
  process: string[];
  processBm: string[];
  output: string[];
  outputBm: string[];
}

export interface MissionValidationContext {
  components: PlacedComponent[];
  wires: WireConnection[];
  rules: LogicBlockRule[];
  analysis: CircuitAnalysis;
  outputs: SimulationOutputs;
  env: EnvironmentState;
}

export interface MissionTestCase {
  id: string;
  label: string;
  labelBm: string;
  envOverride: Partial<EnvironmentState>;
  check: (ctx: MissionValidationContext) => boolean;
}

export interface MissionDefinition {
  id: string;
  number: number;
  title: string;
  titleBm: string;
  kssmRef: string;
  formLevel: 'Form 2' | 'Form 3' | 'Sandbox';
  requiresCoding: boolean;
  budget: number;
  description: string;
  descriptionBm: string;
  objectives: string[];
  objectivesBm: string[];
  ipo: MissionIPO;
  hints: [string, string, string];
  hintsBm: [string, string, string];
  starterComponents?: PlacedComponent[];
  starterWires?: WireConnection[];
  starterRules?: LogicBlockRule[];
  testCases: MissionTestCase[];
}

export interface MissionEvaluation {
  missionId: string;
  passed: boolean;
  stars: number; // 0 - 3
  functionalityOk: boolean;
  safetyOk: boolean;
  budgetOk: boolean;
  totalCost: number;
  budgetLimit: number;
  hintsUsed: number;
  passedTestIds: string[];
  failedTestIds: string[];
  tpLevel: string;
}

export interface MultimeterProbe {
  componentId: string;
  pinId: string;
  label: string;
}

export interface WorkbenchSnapshot {
  components: PlacedComponent[];
  wires: WireConnection[];
  rules: LogicBlockRule[];
}

export interface SandboxSaveFile {
  version: 1;
  app: 'rbt-workshop-3d';
  savedAt: string;
  missionId: string;
  components: PlacedComponent[];
  wires: WireConnection[];
  rules: LogicBlockRule[];
}
