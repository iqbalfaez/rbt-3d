import { HARDWARE_CATALOG } from './catalog';
import { evaluateSimulationStep } from './blockRunner';
import type {
  EnvironmentState,
  LogicBlockRule,
  MissionDefinition,
  MissionEvaluation,
  PlacedComponent,
  WireConnection,
} from '../types/game';

export const DEFAULT_ENVIRONMENT: EnvironmentState = {
  lightLevel: 65,
  soilMoisture: 55,
  obstacleDistance: 45,
  irDetected: false,
  pushButtonPressed: false,
  toggleSwitchOn: false,
};

function hasActiveComponentOfType(
  components: PlacedComponent[],
  actuatorStates: Record<string, number>,
  type: PlacedComponent['type'],
  minVal = 0.5
): boolean {
  return components.some((c) => c.type === type && (actuatorStates[c.id] ?? 0) >= minVal);
}

function allOfTypeInactive(
  components: PlacedComponent[],
  actuatorStates: Record<string, number>,
  type: PlacedComponent['type'],
  maxVal = 0.4
): boolean {
  const matching = components.filter((c) => c.type === type);
  return matching.length > 0 && matching.every((c) => (actuatorStates[c.id] ?? 0) <= maxVal);
}

export const MISSIONS: MissionDefinition[] = [
  // =========================================================================
  // MISSION 1 — Form 2 Bab 2.3: Electrical Design
  // =========================================================================
  {
    id: 'mission-1-lamp-fan',
    number: 1,
    title: 'Study Desk Lamp & Fan Switch Circuit',
    titleBm: 'Litar Suis Lampu Meja & Kipas Belajar',
    kssmRef: 'Form 2 • Bab 2.3 Reka Bentuk Elektrik',
    formLevel: 'Form 2',
    requiresCoding: false,
    budget: 50,
    description:
      'Build a safe parallel electrical circuit using a 5V Battery Pack, an SPST Rocker Switch, a Study Desk Lamp, and a DC Motor Fan. Toggling the switch must power both loads ON and OFF cleanly with zero short circuits.',
    descriptionBm:
      'Bina litar elektrik selari yang selamat menggunakan Pek Bateri 5V, Suis Togel, Lampu Meja Belajar, dan Motor DC Kipas. Menghidupkan dan mematikan suis mesti mengawal kedua-dua beban tanpa litar pintas.',
    objectives: [
      'Place a 5V Battery Pack (Sumber), SPST Rocker Switch (Kawalan), Study Desk Lamp, and DC Motor (Beban).',
      'Wire a closed loop from Battery +5V → Switch IN → Switch OUT → Lamp (+) and Motor (+).',
      'Return both Lamp (−) and Motor (−) back to Battery GND (−) (parallel connection).',
      'Run Simulation and test Switch ON (both active) and Switch OFF (both off).',
    ],
    objectivesBm: [
      'Letakkan Pek Bateri 5V (Sumber), Suis Togel (Kawalan), Lampu Meja, dan Motor DC (Beban).',
      'Sediakan sambungan dari Bateri +5V → Suis IN → Suis OUT → Lampu (+) dan Motor (+).',
      'Sambungkan Lampu (−) dan Motor (−) kembali ke Bateri GND (−) secara selari.',
      'Jalankan Simulasi dan uji Suis HIDUP (kedua-dua aktif) serta Suis MATI (kedua-dua padam).',
    ],
    ipo: {
      input: ['5V Battery Pack (Electrical Source)', 'SPST Rocker Switch (Manual Control)'],
      inputBm: ['Pek Bateri 5V (Sumber Kuasa)', 'Suis Togel (Kawalan Manual)'],
      process: ['Closed / Open Parallel Electrical Pathway (Medium)'],
      processBm: ['Laluan Litar Elektrik Selari Tertutup / Terbuka (Medium)'],
      output: ['Study Desk Lamp (Light Energy)', 'DC Motor Fan (Kinetic Energy)'],
      outputBm: ['Lampu Meja Belajar (Tenaga Cahaya)', 'Kipas Motor DC (Tenaga Kinetik)'],
    },
    hints: [
      'Check the IPO Diagram: Form 2 Bab 2.3 needs 4 electrical elements — Sumber (Battery), Medium (Wires), Kawalan (Rocker Switch), and Beban (Lamp + DC Motor).',
      'Wire Battery +5V to Switch COM In, then connect Switch LOAD Out to BOTH Lamp (+) and Motor (+). Connect both (−) pins back to Battery GND.',
      'No block coding is needed! Press Run Simulation and flip the Toggle Switch in the Environment Controls panel.',
    ],
    hintsBm: [
      'Semak Rajah IPO: Tingkatan 2 Bab 2.3 memerlukan 4 elemen — Sumber (Bateri), Medium (Wayar), Kawalan (Suis Togel), dan Beban (Lampu + Motor DC).',
      'Sambung Bateri +5V ke Suis IN, kemudian Suis OUT ke Lampu (+) dan Motor (+). Sambung kedua-dua pin (−) ke Bateri GND.',
      'Tiada kod blok diperlukan! Tekan Jalankan Simulasi dan ubah Suis Togel di panel Kawalan Persekitaran.',
    ],
    starterComponents: [
      { id: 'bat-1', type: 'battery_pack', position: [-6, 0, 2], rotation: 0 },
      { id: 'sw-1', type: 'toggle_switch', position: [-1, 0, 2], rotation: 0 },
      { id: 'lamp-1', type: 'desk_lamp', position: [4, 0, -2], rotation: 0 },
      { id: 'fan-1', type: 'dc_motor_gear', position: [4, 0, 3], rotation: 0 },
    ],
    testCases: [
      {
        id: 'm1-switch-on',
        label: 'Switch ON powers both Desk Lamp & DC Motor Fan',
        labelBm: 'Suis HIDUP menghidupkan Lampu Meja & Kipas Motor DC',
        envOverride: { toggleSwitchOn: true },
        check: ({ components, outputs }) =>
          hasActiveComponentOfType(components, outputs.actuatorStates, 'desk_lamp') &&
          hasActiveComponentOfType(components, outputs.actuatorStates, 'dc_motor_gear'),
      },
      {
        id: 'm1-switch-off',
        label: 'Switch OFF turns both Desk Lamp & DC Motor Fan off',
        labelBm: 'Suis MATI memadamkan Lampu Meja & Kipas Motor DC',
        envOverride: { toggleSwitchOn: false },
        check: ({ components, outputs }) =>
          allOfTypeInactive(components, outputs.actuatorStates, 'desk_lamp') &&
          allOfTypeInactive(components, outputs.actuatorStates, 'dc_motor_gear'),
      },
    ],
  },

  // =========================================================================
  // MISSION 2 — Form 2 Bab 2.4: Automatic Night Light
  // =========================================================================
  {
    id: 'mission-2-night-light',
    number: 2,
    title: 'Automatic Night Light (LDR + LED)',
    titleBm: 'Lampu Malam Automatik (LDR + LED)',
    kssmRef: 'Form 2 • Bab 2.4 Reka Bentuk Elektronik',
    formLevel: 'Form 2',
    requiresCoding: true,
    budget: 50,
    description:
      'Design a microcontroller-based automatic night light. When ambient light drops below 40%, the LED must automatically switch ON; in bright daylight, it must switch OFF.',
    descriptionBm:
      'Reka bentuk lampu malam automatik berasaskan mikropengawal. Apabila cahaya persekitaran jatuh di bawah 40%, LED mesti menyala secara automatik dan padam apabila cerah.',
    objectives: [
      'Power the LDR Light Sensor from Microcontroller 5V & GND, and wire its AO pin to A0.',
      'Wire an LED Module Anode (+) to digital pin D4 (or D2–D7) and Cathode (−) to GND.',
      'Program a Block Rule: IF A0 < 40 THEN SET D4 HIGH ELSE SET D4 LOW.',
      'Verify with Ambient Light slider at dark (15%) and bright (80%).',
    ],
    objectivesBm: [
      'Bekalkan kuasa 5V & GND ke Penderia Cahaya LDR, dan sambung pin AO ke A0.',
      'Sambung Anod (+) Modul LED ke pin digital D4 (atau D2–D7) dan Katod (−) ke GND.',
      'Atur cara Blok Logik: JIKA A0 < 40 MAKA TETAPKAN D4 TINGGI LAIN D4 RENDAH.',
      'Sahkan menggunakan pelungsur Cahaya Persekitaran pada gelap (15%) dan cerah (80%).',
    ],
    ipo: {
      input: ['LDR Light Sensor (Analog Ambient Light 0–100%)'],
      inputBm: ['Penderia Cahaya LDR (Cahaya Analog 0–100%)'],
      process: ['RBT Microcontroller (Compare Light Level < 40%)'],
      processBm: ['Mikropengawal RBT (Bandingkan Tahap Cahaya < 40%)'],
      output: ['LED Module (Night Illumination)'],
      outputBm: ['Modul LED (Pencahayaan Malam)'],
    },
    hints: [
      'Check IPO: Input is the LDR Light Sensor on analog pin A0; Process is the Microcontroller; Output is the LED Module on a digital pin like D4.',
      'Verify the LDR has 3 wires (VCC→5V, GND→GND, AO→A0) and the LED has 2 wires (Anode+→D4, Cathode−→GND).',
      'In the Block Coding drawer, add a rule: IF [A0] [<] [40] THEN SET [D4] [HIGH] ELSE SET [D4] [LOW].',
    ],
    hintsBm: [
      'Semak IPO: Input ialah Penderia LDR pada pin analog A0; Proses ialah Mikropengawal; Output ialah Modul LED pada pin digital seperti D4.',
      'Pastikan LDR mempunyai 3 wayar (VCC→5V, GND→GND, AO→A0) dan LED mempunyai 2 wayar (Anod+→D4, Katod−→GND).',
      'Dalam laci Kod Blok, tambah peraturan: JIKA [A0] [<] [40] MAKA TETAPKAN [D4] [HIGH] LAIN [D4] [LOW].',
    ],
    starterComponents: [
      { id: 'mcu-1', type: 'microcontroller', position: [-3, 0, 0], rotation: 0 },
      { id: 'ldr-1', type: 'ldr_sensor', position: [4, 0, 2], rotation: 0 },
      { id: 'led-1', type: 'led', position: [4, 0, -2], rotation: 0 },
    ],
    testCases: [
      {
        id: 'm2-dark-on',
        label: 'Turns LED ON in darkness (Light = 15%)',
        labelBm: 'Menyalakan LED dalam gelap (Cahaya = 15%)',
        envOverride: { lightLevel: 15 },
        check: ({ components, outputs }) =>
          hasActiveComponentOfType(components, outputs.actuatorStates, 'led'),
      },
      {
        id: 'm2-bright-off',
        label: 'Turns LED OFF in bright daylight (Light = 80%)',
        labelBm: 'Memadamkan LED dalam cahaya cerah (Cahaya = 80%)',
        envOverride: { lightLevel: 80 },
        check: ({ components, outputs }) =>
          allOfTypeInactive(components, outputs.actuatorStates, 'led'),
      },
    ],
  },

  // =========================================================================
  // MISSION 3 — Form 2 Bab 2.4: Smart Plant Watering Prototype
  // =========================================================================
  {
    id: 'mission-3-smart-watering',
    number: 3,
    title: 'Smart Plant Watering Prototype',
    titleBm: 'Prototaip Penyiraman Tanaman Pintar',
    kssmRef: 'Form 2 • Bab 2.4 Reka Bentuk Elektronik',
    formLevel: 'Form 2',
    requiresCoding: true,
    budget: 80,
    description:
      'Automate plant irrigation using a Soil Moisture Sensor, a 5V Relay Module, and a Mini DC Water Pump. When soil moisture falls below 35%, energize the relay to start the water pump.',
    descriptionBm:
      'Automatikkan penyiraman tanaman menggunakan Penderia Kelembapan Tanah, Modul Geganti 5V, dan Pam Air Mini DC. Apabila kelembapan tanah kurang daripada 35%, geganti mengaktifkan pam air.',
    objectives: [
      'Wire Soil Moisture Sensor (VCC→5V, GND→GND, AO→A0).',
      'Wire 5V Relay control pins (VCC→5V, GND→GND, IN→D4) and connect Relay COM to 5V (or Battery +5V).',
      'Wire Relay NO to Water Pump (+) and Water Pump (−) to GND.',
      'Code Block Rule: IF A0 < 35 THEN SET D4 HIGH ELSE SET D4 LOW.',
    ],
    objectivesBm: [
      'Sambungkan Penderia Kelembapan Tanah (VCC→5V, GND→GND, AO→A0).',
      'Sambungkan pin kawalan Geganti 5V (VCC→5V, GND→GND, IN→D4) dan sambung Relay COM ke 5V (atau Bateri +5V).',
      'Sambungkan Relay NO ke Pam Air (+) dan Pam Air (−) ke GND.',
      'Atur cara Blok Logik: JIKA A0 < 35 MAKA TETAPKAN D4 HIGH LAIN D4 LOW.',
    ],
    ipo: {
      input: ['Soil Moisture Sensor (0–100% Soil Humidity)'],
      inputBm: ['Penderia Kelembapan Tanah (0–100% Kelembapan)'],
      process: ['RBT Microcontroller + 5V Relay Switching Module'],
      processBm: ['Mikropengawal RBT + Modul Suis Geganti 5V'],
      output: ['Mini DC Water Pump (Automated Irrigation)'],
      outputBm: ['Pam Air Mini DC (Penyiraman Automatik)'],
    },
    hints: [
      'Check IPO: The Microcontroller switches the 5V Relay coil (IN pin), and the Relay COM→NO contacts switch 5V power into the Mini DC Water Pump.',
      'Make sure BOTH the Relay control side (VCC, GND, IN→D4) AND the load side (5V→COM, NO→Pump+, Pump−→GND) are wired (use a Breadboard or Battery Pack for extra 5V/GND tie points).',
      'In Block Coding, set: IF [A0] [<] [35] THEN SET [D4] [HIGH] ELSE SET [D4] [LOW].',
    ],
    hintsBm: [
      'Semak IPO: Mikropengawal mengawal gegelung Geganti 5V (pin IN), manakala sesentuh COM→NO menyalurkan kuasa 5V ke Pam Air Mini DC.',
      'Pastikan bahagian kawalan Geganti (VCC, GND, IN→D4) DAN bahagian beban (5V→COM, NO→Pam+, Pam−→GND) disambungkan dengan lengkap.',
      'Dalam Kod Blok, tetapkan: JIKA [A0] [<] [35] MAKA TETAPKAN [D4] [HIGH] LAIN [D4] [LOW].',
    ],
    starterComponents: [
      { id: 'mcu-1', type: 'microcontroller', position: [-5, 0, 0], rotation: 0 },
      { id: 'soil-1', type: 'soil_sensor', position: [-5, 0, 6], rotation: 0 },
      { id: 'relay-1', type: 'relay', position: [1, 0, -1], rotation: 0 },
      { id: 'pump-1', type: 'water_pump', position: [6, 0, -1], rotation: 0 },
      { id: 'bat-1', type: 'battery_pack', position: [4, 0, 4], rotation: 0 },
    ],
    testCases: [
      {
        id: 'm3-dry-pump-on',
        label: 'Activates Relay & Water Pump on dry soil (Moisture = 20%)',
        labelBm: 'Mengaktifkan Geganti & Pam Air pada tanah kering (Kelembapan = 20%)',
        envOverride: { soilMoisture: 20 },
        check: ({ components, outputs }) =>
          hasActiveComponentOfType(components, outputs.actuatorStates, 'relay') &&
          hasActiveComponentOfType(components, outputs.actuatorStates, 'water_pump'),
      },
      {
        id: 'm3-wet-pump-off',
        label: 'Stops Water Pump when soil is moist (Moisture = 75%)',
        labelBm: 'Menghentikan Pam Air apabila tanah lembap (Kelembapan = 75%)',
        envOverride: { soilMoisture: 75 },
        check: ({ components, outputs }) =>
          allOfTypeInactive(components, outputs.actuatorStates, 'water_pump'),
      },
    ],
  },

  // =========================================================================
  // MISSION 4 — Form 3 Bab 2.1: Automated Parking Barrier Gate
  // =========================================================================
  {
    id: 'mission-4-parking-gate',
    number: 4,
    title: 'Automated Parking Barrier Gate',
    titleBm: 'Palang Parkir Automatik Mekatronik',
    kssmRef: 'Form 3 • Bab 2.1 Reka Bentuk Mekatronik',
    formLevel: 'Form 3',
    requiresCoding: true,
    budget: 80,
    description:
      'Build a mechatronic parking barrier combining an Ultrasonic Distance Sensor, a Servo Barrier Gate, and a Piezo Buzzer. When a vehicle approaches within 25 cm, raise the barrier to 90° and sound the alert buzzer.',
    descriptionBm:
      'Bina palang parkir mekatronik menggabungkan Penderia Ultrasonik, Motor Servo Palang, dan Pembaz Piezo. Apabila kenderaan menghampiri kurang daripada 25 cm, angkat palang ke 90° dan bunyikan pembaz.',
    objectives: [
      'Wire Ultrasonic Sensor (VCC→5V, GND→GND, ECHO/SIG→D2).',
      'Wire Servo Barrier Gate (VCC→5V, GND→GND, PWM→D5) and Piezo Buzzer (SIG→D7, GND→GND).',
      'Program a multi-output Block Rule: IF D2 < 25 THEN SET Servo D5 = 90° & Buzzer D7 = HIGH, ELSE Servo D5 = 0° & Buzzer D7 = LOW.',
      'Use a Breadboard if you need extra 5V and GND power distribution pins.',
    ],
    objectivesBm: [
      'Sambungkan Penderia Ultrasonik (VCC→5V, GND→GND, ECHO/SIG→D2).',
      'Sambungkan Motor Servo Palang (VCC→5V, GND→GND, PWM→D5) dan Pembaz Piezo (SIG→D7, GND→GND).',
      'Atur cara Blok Logik pelbagai output: JIKA D2 < 25 MAKA Servo D5 = 90° & Pembaz D7 = HIGH, LAIN Servo D5 = 0° & Pembaz D7 = LOW.',
      'Gunakan Papan Projek (Breadboard) untuk mengagihkan rel kuasa 5V dan GND.',
    ],
    ipo: {
      input: ['Ultrasonic Sensor HC-SR04 (Vehicle Distance 2–100 cm)'],
      inputBm: ['Penderia Ultrasonik HC-SR04 (Jarak Kenderaan 2–100 cm)'],
      process: ['RBT Microcontroller (Distance Threshold + PWM Control)'],
      processBm: ['Mikropengawal RBT (Ambang Jarak + Kawalan PWM)'],
      output: ['Servo Motor + Meshing Gears (0°–90° Barrier Arm)', 'Piezo Buzzer (Audio Warning)'],
      outputBm: ['Motor Servo + Gear (Lengan Palang 0°–90°)', 'Pembaz Piezo (Amaran Audio)'],
    },
    hints: [
      'Check IPO: Ultrasonic Sensor is the Input (D2), Microcontroller is the Process, and BOTH Servo Motor (PWM D5) and Piezo Buzzer (D7) are Outputs.',
      'Use the Breadboard +5V and GND rails to cleanly supply 5V and GND to the Ultrasonic Sensor, Servo Motor, and Buzzer simultaneously.',
      'In Block Coding, click "+ Output" inside THEN and ELSE so the single rule controls both Servo D5 (PWM 90° / 0°) and Buzzer D7 (HIGH / LOW).',
    ],
    hintsBm: [
      'Semak IPO: Penderia Ultrasonik ialah Input (D2), Mikropengawal ialah Proses, dan KEDUA-DUA Motor Servo (PWM D5) serta Pembaz Piezo (D7) ialah Output.',
      'Gunakan rel +5V dan GND pada Breadboard untuk membekalkan kuasa kepada Penderia Ultrasonik, Motor Servo, dan Pembaz serentak.',
      'Dalam Kod Blok, klik "+ Output" di bahagian MAKA dan LAIN supaya satu peraturan mengawal Servo D5 (PWM 90° / 0°) dan Pembaz D7 (HIGH / LOW).',
    ],
    starterComponents: [
      { id: 'mcu-1', type: 'microcontroller', position: [-5, 0, -2], rotation: 0 },
      { id: 'bb-1', type: 'breadboard', position: [0, 0, 4], rotation: 0 },
      { id: 'us-1', type: 'ultrasonic_sensor', position: [-5, 0, -6], rotation: 0 },
      { id: 'srv-1', type: 'servo_motor', position: [5, 0, -2], rotation: 0 },
      { id: 'buz-1', type: 'buzzer', position: [5, 0, -6], rotation: 0 },
    ],
    testCases: [
      {
        id: 'm4-car-near',
        label: 'Vehicle near (15 cm): Barrier opens ≥ 75° & Buzzer sounds',
        labelBm: 'Kenderaan dekat (15 cm): Palang dibuka ≥ 75° & Pembaz berbunyi',
        envOverride: { obstacleDistance: 15 },
        check: ({ components, outputs }) =>
          hasActiveComponentOfType(components, outputs.actuatorStates, 'servo_motor', 75) &&
          hasActiveComponentOfType(components, outputs.actuatorStates, 'buzzer', 0.5),
      },
      {
        id: 'm4-car-far',
        label: 'Lane clear (70 cm): Barrier closes ≤ 15° & Buzzer stops',
        labelBm: 'Laluan kosong (70 cm): Palang ditutup ≤ 15° & Pembaz berhenti',
        envOverride: { obstacleDistance: 70 },
        check: ({ components, outputs }) =>
          allOfTypeInactive(components, outputs.actuatorStates, 'servo_motor', 15) &&
          allOfTypeInactive(components, outputs.actuatorStates, 'buzzer', 0.4),
      },
    ],
  },

  // =========================================================================
  // MISSION 5 — Form 3 Bab 2.1: Smart Object Sorting Conveyor System
  // =========================================================================
  {
    id: 'mission-5-sorting-conveyor',
    number: 5,
    title: 'Smart Object Sorting Conveyor System',
    titleBm: 'Sistem Konveyor Pengisihan Objek Pintar',
    kssmRef: 'Form 3 • Bab 2.1 Reka Bentuk Mekatronik',
    formLevel: 'Form 3',
    requiresCoding: true,
    budget: 75,
    description:
      'Construct an industrial sorting conveyor line with an IR Object Sensor and a DC Motor Gear Drive. When an object arrives on the belt (IR = 1), spin the DC Motor Gear Drive; when clear (IR = 0), halt the belt.',
    descriptionBm:
      'Bina sistem konveyor pengisihan industri menggunakan Penderia Objek IR dan Motor DC Pacuan Gear. Apabila objek dikesan (IR = 1), pacuan gear berputar; apabila kosong (IR = 0), konveyor berhenti.',
    objectives: [
      'Wire IR Object Sensor (VCC→5V, GND→GND, OUT→D2).',
      'Wire DC Motor & Gear Drive (Motor+→D6, Motor−→GND) — optionally add an LED status indicator.',
      'Program Block Rule: IF D2 = 1 THEN SET D6 HIGH ELSE SET D6 LOW.',
      'Test both Object Present (IR = 1) and Path Clear (IR = 0) in Simulation.',
    ],
    objectivesBm: [
      'Sambungkan Penderia Objek IR (VCC→5V, GND→GND, OUT→D2).',
      'Sambungkan Motor DC & Pacuan Gear (Motor+→D6, Motor−→GND) — boleh tambah LED penunjuk status.',
      'Atur cara Blok Logik: JIKA D2 = 1 MAKA TETAPKAN D6 HIGH LAIN D6 LOW.',
      'Uji kedua-dua keadaan Objek Dikesan (IR = 1) dan Laluan Kosong (IR = 0) dalam Simulasi.',
    ],
    ipo: {
      input: ['IR Object Sensor (Digital Presence Detection 0/1)'],
      inputBm: ['Penderia Objek IR (Pengesanan Kehadiran Digital 0/1)'],
      process: ['RBT Microcontroller (Sorting Logic Controller)'],
      processBm: ['Mikropengawal RBT (Pengawal Logik Pengisihan)'],
      output: ['DC Motor + Meshing Gear Drive (Conveyor Motion)'],
      outputBm: ['Motor DC + Pacuan Gear (Pergerakan Konveyor)'],
    },
    hints: [
      'Check IPO: IR Object Sensor is the Input (wired to D2), Microcontroller is Process, and DC Motor & Gear Drive is the Mechanical Output (wired to D6).',
      'Check that IR Sensor has 5V + GND power and OUT→D2, and DC Motor has Motor(+)→D6 and Motor(−)→GND.',
      'In Block Coding, add rule: IF [D2] [=] [1] THEN SET [D6] [HIGH] ELSE SET [D6] [LOW].',
    ],
    hintsBm: [
      'Semak IPO: Penderia Objek IR ialah Input (D2), Mikropengawal ialah Proses, dan Motor DC & Pacuan Gear ialah Output Mekanikal (D6).',
      'Pastikan Penderia IR mempunyai kuasa 5V + GND dan OUT→D2, manakala Motor DC mempunyai Motor(+)→D6 dan Motor(−)→GND.',
      'Dalam Kod Blok, tambah peraturan: JIKA [D2] [=] [1] MAKA TETAPKAN [D6] [HIGH] LAIN [D6] [LOW].',
    ],
    starterComponents: [
      { id: 'mcu-1', type: 'microcontroller', position: [-4, 0, 0], rotation: 0 },
      { id: 'ir-1', type: 'ir_sensor', position: [3, 0, 3], rotation: 0 },
      { id: 'motor-1', type: 'dc_motor_gear', position: [4, 0, -2], rotation: 0 },
    ],
    testCases: [
      {
        id: 'm5-object-detected',
        label: 'Object Detected (IR = 1): DC Motor Gear Drive spins',
        labelBm: 'Objek Dikesan (IR = 1): Motor DC Pacuan Gear berputar',
        envOverride: { irDetected: true },
        check: ({ components, outputs }) =>
          hasActiveComponentOfType(components, outputs.actuatorStates, 'dc_motor_gear'),
      },
      {
        id: 'm5-path-clear',
        label: 'Path Clear (IR = 0): Conveyor Motor stops',
        labelBm: 'Laluan Kosong (IR = 0): Motor Konveyor berhenti',
        envOverride: { irDetected: false },
        check: ({ components, outputs }) =>
          allOfTypeInactive(components, outputs.actuatorStates, 'dc_motor_gear'),
      },
    ],
  },

  // =========================================================================
  // SANDBOX MODE — Projek Inovasi RBT
  // =========================================================================
  {
    id: 'sandbox',
    number: 0,
    title: 'Open Sandbox Mode (Projek Inovasi RBT)',
    titleBm: 'Mod Kotak Pasir (Projek Inovasi RBT)',
    kssmRef: 'KSSM Form 2 & Form 3 • Free Innovation Lab',
    formLevel: 'Sandbox',
    requiresCoding: true,
    budget: Infinity,
    description:
      'Unlimited RM budget with every Form 2 and Form 3 electronic & mechatronic component unlocked. Prototype your own RBT innovation project and save/load it as a .json file.',
    descriptionBm:
      'Bajet RM tanpa had dengan semua komponen elektronik & mekatronik Tingkatan 2 dan 3 dibuka. Bina prototaip inovasi RBT anda sendiri dan simpan/muat sebagai fail .json.',
    objectives: [
      'Combine any sensors, actuators, breadboards, and block-coding rules freely.',
      'Use X-Ray Flow and the Virtual Multimeter to inspect live voltages and current paths.',
      'Export your finished prototype as a .json file to share with teachers or classmates.',
    ],
    objectivesBm: [
      'Gabungkan mana-mana penderia, penggerak, breadboard, dan kod blok secara bebas.',
      'Gunakan Mod X-Ray dan Multimeter Maya untuk memeriksa voltan dan aliran arus.',
      'Eksport prototaip anda sebagai fail .json untuk dikongsi bersama guru atau rakan.',
    ],
    ipo: {
      input: ['Any Form 2 / Form 3 Sensor or Switch'],
      inputBm: ['Sebarang Penderia atau Suis Tingkatan 2 / 3'],
      process: ['Microcontroller Logic / Relay / Direct Circuit'],
      processBm: ['Logik Mikropengawal / Geganti / Litar Terus'],
      output: ['LED, Desk Lamp, Buzzer, Water Pump, Servo, or DC Motor Gear Drive'],
      outputBm: ['LED, Lampu Meja, Pembaz, Pam Air, Servo, atau Motor DC Pacuan Gear'],
    },
    hints: [
      'Click any component in the bottom tray to place it on the 1 cm workbench grid. Press R to rotate.',
      'Use the Wire tool (or simply click any metallic header pin) to connect components with auto-colored jumper cables.',
      'Save your circuit + block code anytime with the Save JSON button in the Mission panel.',
    ],
    hintsBm: [
      'Klik mana-mana komponen di dulang bawah untuk meletakkannya di grid 1 cm. Tekan R untuk pusing.',
      'Gunakan alat Wayar (atau klik terus mana-mana pin logam) untuk menyambung wayar pelompat.',
      'Simpan litar dan kod blok anda pada bila-bila masa menggunakan butang Simpan JSON.',
    ],
    starterComponents: [
      { id: 'mcu-1', type: 'microcontroller', position: [-5, 0, -2], rotation: 0 },
      { id: 'bb-1', type: 'breadboard', position: [0, 0, 4], rotation: 0 },
    ],
    testCases: [],
  },
];

export function getMissionById(id: string): MissionDefinition {
  return MISSIONS.find((m) => m.id === id) ?? MISSIONS[0];
}

export function calculateTotalCost(components: PlacedComponent[]): number {
  return components.reduce((sum, c) => sum + (HARDWARE_CATALOG[c.type]?.cost ?? 0), 0);
}

export function evaluateMission(
  mission: MissionDefinition,
  components: PlacedComponent[],
  wires: WireConnection[],
  rules: LogicBlockRule[],
  hintsUsed: number
): MissionEvaluation {
  const totalCost = calculateTotalCost(components);
  const budgetOk = mission.budget === Infinity || totalCost <= mission.budget;

  const passedTestIds: string[] = [];
  const failedTestIds: string[] = [];
  let anyCriticalFault = false;

  for (const tc of mission.testCases) {
    const testEnv: EnvironmentState = { ...DEFAULT_ENVIRONMENT, ...tc.envOverride };
    const { analysis, outputs } = evaluateSimulationStep(components, wires, rules, testEnv);
    if (analysis.faults.some((f) => f.severity === 'critical')) {
      anyCriticalFault = true;
    }
    const ok =
      !analysis.faults.some((f) => f.severity === 'critical') &&
      tc.check({ components, wires, rules, analysis, outputs, env: testEnv });

    if (ok) passedTestIds.push(tc.id);
    else failedTestIds.push(tc.id);
  }

  // Also check baseline circuit safety even if no test cases
  if (mission.testCases.length === 0) {
    const { analysis } = evaluateSimulationStep(components, wires, rules, DEFAULT_ENVIRONMENT);
    anyCriticalFault = analysis.faults.some((f) => f.severity === 'critical');
  }

  const safetyOk = !anyCriticalFault;
  const functionalityOk = mission.testCases.length > 0 && failedTestIds.length === 0;
  const passed = functionalityOk && safetyOk;

  let stars = 0;
  if (functionalityOk) stars += 1;
  if (functionalityOk && safetyOk) stars += 1;
  if (functionalityOk && safetyOk && budgetOk && hintsUsed < 3) stars += 1;

  let tpLevel = 'TP 2 (Asas / Developing)';
  if (stars === 3) tpLevel = 'TP 6 (Cemerlang / Exemplary Innovation)';
  else if (stars === 2) tpLevel = 'TP 5 (Terpuji / Proficient)';
  else if (stars === 1) tpLevel = 'TP 4 (Baik / Competent)';
  else if (components.length > 0 && wires.length > 0) tpLevel = 'TP 3 (Memuaskan / Progressing)';

  return {
    missionId: mission.id,
    passed,
    stars,
    functionalityOk,
    safetyOk,
    budgetOk,
    totalCost,
    budgetLimit: mission.budget,
    hintsUsed,
    passedTestIds,
    failedTestIds,
    tpLevel,
  };
}
