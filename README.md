# RBT Workshop 3D

**Browser-Based 3D Interactive Electronics & Mechatronics Educational Game** aligned with Malaysia's **KSSM Secondary School RBT (Reka Bentuk dan Teknologi)** syllabus for **Form 2** and **Form 3**.

Built with **Vite, React 18, TypeScript, Three.js (`@react-three/fiber`, `@react-three/drei`), Zustand, Tailwind CSS, and Lucide React** — optimized for school Chromebooks and low-spec PCs, and automatically deployed via **GitHub Pages**.

---

## Key Features

- **3D Interactive Workbench:** Textured oak tabletop with an anti-static green ESD cutting mat, 1 cm snap grid, constrained `OrbitControls`, and local procedural studio lighting (zero external HDRI fetches).
- **17 Procedural 3D Hardware Models:**
  - *Core & Power:* RBT Microcontroller (5V, GND, A0–A2, D2–D7), Solderless Breadboard (instanced holes + live rail/row continuity), 5V Battery Pack, 220Ω Axial Resistor.
  - *Input Sensors:* SPST Rocker Switch, Push Button, LDR Light Sensor, Soil Moisture Probe, HC-SR04 Ultrasonic Sensor, IR Object Sensor.
  - *Output Actuators:* Glowing LED Module, Articulated Study Desk Lamp, Piezo Buzzer (sound-wave rings + Web Audio tone), 5V Electromagnetic Relay, Mini DC Water Pump (animated water droplets), Servo Barrier Gate (0°–90° + meshing gears), and DC Motor & Spur Gear Drive.
- **Electrical Netlist & Safety Diagnostics:** Real connectivity graph validating power/ground paths, breadboard strip continuity, relay switching, short-circuit (`VCC ↔ GND`) spark/smoke alerts, reversed polarity, and incompatible pin diagnostics.
- **X-Ray Current Flow & Virtual Multimeter:** Semi-transparent component housings with animated directional current pulses (Red 5V, Blue GND, Green Active HIGH) plus a 2-probe digital multimeter for live Voltage & Continuity debugging.
- **Visual Block Coding (30 TPS):** Scratch/mBlock-style `WHEN Start → FOREVER → IF / THEN / ELSE / WAIT` editor supporting multi-output actions and PWM servo angles.
- **Bilingual (EN / BM) & Classroom Assessment:** English / Bahasa Melayu toggle, KSSM IPO Block Diagram modal, 3-tier Socratic mentor hints, multi-state prototype verification, 3-star KSSM Report Card export (with embedded 3D canvas snapshot), and **Open Sandbox Mode** with `.json` save/load.

---

## KSSM Syllabus Mapping

| Mission | KSSM Topic | Key Hardware | Core Concept |
| :--- | :--- | :--- | :--- |
| **Mission 1** | Form 2 • Bab 2.3 Reka Bentuk Elektrik | Battery Pack, Rocker Switch, Desk Lamp, DC Motor Fan | Sumber–Medium–Beban–Kawalan, Parallel Circuit |
| **Mission 2** | Form 2 • Bab 2.4 Reka Bentuk Elektronik | Microcontroller, LDR Sensor, LED Module | Analog Input (`A0`), Threshold Logic |
| **Mission 3** | Form 2 • Bab 2.4 Reka Bentuk Elektronik | Microcontroller, Soil Moisture Sensor, 5V Relay, Water Pump | Relay Load Switching (`COM → NO`) |
| **Mission 4** | Form 3 • Bab 2.1 Reka Bentuk Mekatronik | Microcontroller, Breadboard, Ultrasonic Sensor, Servo Gate, Buzzer | Multi-Output Mechatronic Control + PWM Angle |
| **Mission 5** | Form 3 • Bab 2.1 Reka Bentuk Mekatronik | Microcontroller, IR Object Sensor, DC Motor & Gear Drive | Automated Sorting & Gear Transmission |
| **Sandbox** | Projek Inovasi RBT (F2 & F3) | All 17 components unlocked, unlimited RM budget | Open Prototyping + `.json` Save/Load |

---

## Controls Guide

| Action | Control |
| :--- | :--- |
| **Orbit / Pan / Zoom** | Left-drag / Right-drag / Scroll wheel |
| **Place Component** | Click part in bottom dock → Click workbench grid |
| **Rotate Part** | Press `R` (while placing or with a part selected) |
| **Connect Jumper Wire** | Click any metallic pin → Click destination pin |
| **Delete Wire** | Click directly on a jumper wire |
| **Delete Component** | Right-click part, press `Delete`/`Backspace`, or use Delete tool |
| **Undo / Redo** | `Ctrl+Z` / `Ctrl+Y` |
| **Cancel Active Tool** | `Esc` |

---

## Local Development

```bash
npm install
npm run dev
```

### Run Unit Tests & Production Build

```bash
npm test
npm run build
```

---

## Automated GitHub Pages Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which installs dependencies, runs the Vitest circuit engine suite, builds the static Vite bundle (`base: './'`), and publishes `./dist` to GitHub Pages. Enable **Settings → Pages → Source: GitHub Actions** in your repository.
