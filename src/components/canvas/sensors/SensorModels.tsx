import React from 'react';
import { HARDWARE_CATALOG } from '../../../engine/catalog';
import { PinAnchor } from '../PinAnchor';
import { SHARED_GEO, SHARED_MAT, createHousingMaterialProps } from '../sharedMaterials';
import type { EnvironmentState, PlacedComponent } from '../../../types/game';

interface SensorModelProps {
  component: PlacedComponent;
  powered: boolean;
  xray: boolean;
  env: EnvironmentState;
}

export const PushButtonModel: React.FC<SensorModelProps> = ({ component, powered, xray, env }) => {
  const def = HARDWARE_CATALOG.push_button;
  const pressedOffset = env.pushButtonPressed ? -0.14 : 0;

  return (
    <group>
      {/* Breakout PCB */}
      <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.22, 2.2]} />
        <meshStandardMaterial {...createHousingMaterialProps('#1d4ed8', xray, 0.45, 0.15)} />
      </mesh>

      {/* Tactile switch housing */}
      <mesh position={[0, 0.42, -0.15]} material={SHARED_MAT.icBlack} castShadow>
        <boxGeometry args={[1.05, 0.34, 1.05]} />
      </mesh>

      {/* Depressible red cap */}
      <mesh position={[0, 0.72 + pressedOffset, -0.15]} castShadow>
        <cylinderGeometry args={[0.38, 0.42, 0.32, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.35} />
      </mesh>

      {/* Power indicator LED */}
      <mesh geometry={SHARED_GEO.ledSmall} position={[-0.72, 0.3, -0.7]}>
        <meshStandardMaterial
          color={powered ? '#22c55e' : '#14532d'}
          emissive={powered ? '#22c55e' : '#000000'}
          emissiveIntensity={powered ? 2.2 : 0}
        />
      </mesh>

      {def.pins.map((pin) => (
        <PinAnchor key={pin.id} component={component} pin={pin} />
      ))}
    </group>
  );
};

export const ToggleSwitchModel: React.FC<SensorModelProps> = ({ component, xray, env }) => {
  const def = HARDWARE_CATALOG.toggle_switch;
  const tiltAngle = env.toggleSwitchOn ? -0.32 : 0.32;

  return (
    <group>
      {/* Switch Base Plate */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.42, 2.2]} />
        <meshStandardMaterial {...createHousingMaterialProps('#27323b', xray, 0.55, 0.15)} />
      </mesh>

      {/* Rocker Bezel */}
      <mesh position={[0, 0.54, -0.15]} material={SHARED_MAT.icBlack} castShadow>
        <boxGeometry args={[1.25, 0.34, 1.45]} />
      </mesh>

      {/* Pivoting Rocker Paddle */}
      <group position={[0, 0.72, -0.15]} rotation={[tiltAngle, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.92, 0.26, 1.15]} />
          <meshStandardMaterial
            color={env.toggleSwitchOn ? '#ea580c' : '#64748b'}
            emissive={env.toggleSwitchOn ? '#9a3412' : '#000000'}
            emissiveIntensity={env.toggleSwitchOn ? 0.5 : 0}
            roughness={0.35}
          />
        </mesh>
      </group>

      {def.pins.map((pin) => (
        <PinAnchor key={pin.id} component={component} pin={pin} />
      ))}
    </group>
  );
};

export const LdrSensorModel: React.FC<SensorModelProps> = ({ component, powered, xray }) => {
  const def = HARDWARE_CATALOG.ldr_sensor;

  return (
    <group>
      {/* Sensor PCB */}
      <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.22, 2.4]} />
        <meshStandardMaterial {...createHousingMaterialProps('#1e40af', xray, 0.45, 0.15)} />
      </mesh>

      {/* Blue Trimpot Potentiometer */}
      <mesh position={[-0.55, 0.45, -0.35]} castShadow>
        <boxGeometry args={[0.72, 0.45, 0.72]} />
        <meshStandardMaterial color="#2563eb" roughness={0.4} />
      </mesh>
      <mesh position={[-0.55, 0.7, -0.35]} material={SHARED_MAT.metalSilver}>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 12]} />
      </mesh>

      {/* Photoresistor (LDR) Stalk & Ceramic Face */}
      <mesh position={[0.55, 0.42, -0.35]} material={SHARED_MAT.metalSilver}>
        <cylinderGeometry args={[0.04, 0.04, 0.45, 8]} />
      </mesh>
      <mesh position={[0.55, 0.7, -0.35]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.16, 18]} />
        <meshStandardMaterial color="#e7d3ad" roughness={0.4} />
      </mesh>
      <mesh position={[0.55, 0.79, -0.35]}>
        <cylinderGeometry args={[0.3, 0.3, 0.02, 16]} />
        <meshStandardMaterial color="#c2410c" roughness={0.35} />
      </mesh>

      {/* Power LED */}
      <mesh geometry={SHARED_GEO.ledSmall} position={[0.85, 0.3, 0.4]}>
        <meshStandardMaterial
          color={powered ? '#22c55e' : '#14532d'}
          emissive={powered ? '#22c55e' : '#000000'}
          emissiveIntensity={powered ? 2.2 : 0}
        />
      </mesh>

      {def.pins.map((pin) => (
        <PinAnchor key={pin.id} component={component} pin={pin} />
      ))}
    </group>
  );
};

export const SoilSensorModel: React.FC<SensorModelProps> = ({ component, powered, xray }) => {
  const def = HARDWARE_CATALOG.soil_sensor;

  return (
    <group>
      {/* Comparator PCB */}
      <mesh position={[0, 0.14, 0.95]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 0.22, 1.9]} />
        <meshStandardMaterial {...createHousingMaterialProps('#0f5132', xray, 0.45, 0.15)} />
      </mesh>

      {/* Forked Gold-Plated Moisture Prongs */}
      <mesh position={[-0.45, 0.14, -0.95]} castShadow>
        <boxGeometry args={[0.42, 0.14, 2.25]} />
        <meshStandardMaterial color="#d4a644" metalness={0.82} roughness={0.28} />
      </mesh>
      <mesh position={[0.45, 0.14, -0.95]} castShadow>
        <boxGeometry args={[0.42, 0.14, 2.25]} />
        <meshStandardMaterial color="#d4a644" metalness={0.82} roughness={0.28} />
      </mesh>

      {/* Comparator Trimpot */}
      <mesh position={[0, 0.44, 0.85]} castShadow>
        <boxGeometry args={[0.7, 0.42, 0.7]} />
        <meshStandardMaterial color="#2563eb" roughness={0.4} />
      </mesh>

      {/* Power LED */}
      <mesh geometry={SHARED_GEO.ledSmall} position={[-0.78, 0.3, 0.85]}>
        <meshStandardMaterial
          color={powered ? '#22c55e' : '#14532d'}
          emissive={powered ? '#22c55e' : '#000000'}
          emissiveIntensity={powered ? 2.2 : 0}
        />
      </mesh>

      {def.pins.map((pin) => (
        <PinAnchor key={pin.id} component={component} pin={pin} />
      ))}
    </group>
  );
};

export const UltrasonicSensorModel: React.FC<SensorModelProps> = ({ component, powered, xray }) => {
  const def = HARDWARE_CATALOG.ultrasonic_sensor;

  return (
    <group>
      {/* Horizontal base PCB mount */}
      <mesh position={[0, 0.14, 0.15]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.22, 1.85]} />
        <meshStandardMaterial {...createHousingMaterialProps('#1d4ed8', xray, 0.45, 0.18)} />
      </mesh>

      {/* Vertical HC-SR04 Faceplate PCB */}
      <mesh position={[0, 1.05, -0.45]} castShadow>
        <boxGeometry args={[4.1, 1.7, 0.18]} />
        <meshStandardMaterial {...createHousingMaterialProps('#1d4ed8', xray, 0.45, 0.18)} />
      </mesh>

      {/* Twin Ultrasonic Transducer Barrels (T & R) */}
      {[-1.12, 1.12].map((x, idx) => (
        <group key={idx} position={[x, 1.05, -0.82]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={SHARED_MAT.metalSilver} castShadow>
            <cylinderGeometry args={[0.68, 0.68, 0.72, 20]} />
          </mesh>
          <mesh position={[0, -0.37, 0]}>
            <cylinderGeometry args={[0.56, 0.56, 0.03, 18]} />
            <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Top Metallic Crystal */}
      <mesh position={[0, 1.62, -0.62]} material={SHARED_MAT.metalSilver}>
        <boxGeometry args={[0.62, 0.22, 0.22]} />
      </mesh>

      {/* Power Indicator LED */}
      <mesh geometry={SHARED_GEO.ledSmall} position={[0, 0.34, 0.15]}>
        <meshStandardMaterial
          color={powered ? '#22c55e' : '#14532d'}
          emissive={powered ? '#22c55e' : '#000000'}
          emissiveIntensity={powered ? 2.2 : 0}
        />
      </mesh>

      {def.pins.map((pin) => (
        <PinAnchor key={pin.id} component={component} pin={pin} />
      ))}
    </group>
  );
};

export const IrSensorModel: React.FC<SensorModelProps> = ({ component, powered, xray, env }) => {
  const def = HARDWARE_CATALOG.ir_sensor;
  const detectActive = powered && env.irDetected;

  return (
    <group>
      {/* Module PCB */}
      <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.0, 0.22, 2.0]} />
        <meshStandardMaterial {...createHousingMaterialProps('#1e3a5f', xray, 0.45, 0.15)} />
      </mesh>

      {/* IR Emitter (clear/blue-tint) & IR Photodiode Receiver (dark black) */}
      <mesh position={[-0.45, 0.38, -0.82]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.65, 14]} />
        <meshStandardMaterial color="#93c5fd" transparent opacity={0.8} roughness={0.15} />
      </mesh>
      <mesh position={[0.45, 0.38, -0.82]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.65, 14]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.3} />
      </mesh>

      {/* Blue Sensitivity Trimpot */}
      <mesh position={[0, 0.44, 0.05]} castShadow>
        <boxGeometry args={[0.7, 0.42, 0.7]} />
        <meshStandardMaterial color="#2563eb" roughness={0.4} />
      </mesh>

      {/* Power LED & Object Detection LED */}
      <mesh geometry={SHARED_GEO.ledSmall} position={[-1.0, 0.3, 0.2]}>
        <meshStandardMaterial
          color={powered ? '#22c55e' : '#14532d'}
          emissive={powered ? '#22c55e' : '#000000'}
          emissiveIntensity={powered ? 2.2 : 0}
        />
      </mesh>
      <mesh geometry={SHARED_GEO.ledSmall} position={[1.0, 0.3, 0.2]}>
        <meshStandardMaterial
          color={detectActive ? '#f59e0b' : '#451a03'}
          emissive={detectActive ? '#f59e0b' : '#000000'}
          emissiveIntensity={detectActive ? 2.6 : 0}
        />
      </mesh>

      {def.pins.map((pin) => (
        <PinAnchor key={pin.id} component={component} pin={pin} />
      ))}
    </group>
  );
};
