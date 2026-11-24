import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HARDWARE_CATALOG } from '../../../engine/catalog';
import { PinAnchor } from '../PinAnchor';
import { SHARED_GEO, SHARED_MAT, createHousingMaterialProps } from '../sharedMaterials';
import type { PlacedComponent } from '../../../types/game';

interface ActuatorModelProps {
  component: PlacedComponent;
  activeLevel: number; // 0..1 for digital, 0..180 for servo
  xray: boolean;
}

/** Helper to render a toothed mechanical spur gear procedurally */
const SpurGear: React.FC<{
  radius: number;
  teeth: number;
  thickness?: number;
  material: THREE.Material;
}> = ({ radius, teeth, thickness = 0.16, material }) => {
  const angles = useMemo(
    () => Array.from({ length: teeth }, (_, i) => (i / teeth) * Math.PI * 2),
    [teeth]
  );
  return (
    <group>
      <mesh material={material} castShadow>
        <cylinderGeometry args={[radius, radius, thickness, 20]} />
      </mesh>
      {angles.map((a, idx) => (
        <mesh
          key={idx}
          position={[Math.cos(a) * (radius + 0.06), 0, Math.sin(a) * (radius + 0.06)]}
          rotation={[0, -a, 0]}
          material={material}
        >
          <boxGeometry args={[0.14, thickness * 0.92, 0.11]} />
        </mesh>
      ))}
    </group>
  );
};

export const LedModel: React.FC<ActuatorModelProps> = ({ component, activeLevel, xray }) => {
  const def = HARDWARE_CATALOG.led;
  const isOn = activeLevel >= 0.5;

  return (
    <group>
      {/* Breakout PCB */}
      <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.22, 1.9]} />
        <meshStandardMaterial {...createHousingMaterialProps('#27323b', xray, 0.5, 0.15)} />
      </mesh>

      {/* Protective inline SMD resistor visual */}
      <mesh position={[0, 0.28, 0.35]} material={SHARED_MAT.icBlack}>
        <boxGeometry args={[0.55, 0.1, 0.22]} />
      </mesh>

      {/* LED Collar */}
      <mesh position={[0, 0.36, -0.15]} material={SHARED_MAT.icBlack}>
        <cylinderGeometry args={[0.42, 0.45, 0.18, 18]} />
      </mesh>

      {/* Emissive LED Dome */}
      <mesh position={[0, 0.72, -0.15]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.48, 18]} />
        <meshStandardMaterial
          color={isOn ? '#fef08a' : '#f59e0b'}
          emissive={isOn ? '#fbbf24' : '#000000'}
          emissiveIntensity={isOn ? 2.8 : 0}
          roughness={0.18}
          transparent
          opacity={isOn ? 0.96 : 0.75}
        />
      </mesh>
      <mesh position={[0, 0.96, -0.15]}>
        <sphereGeometry args={[0.35, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={isOn ? '#fef08a' : '#f59e0b'}
          emissive={isOn ? '#fbbf24' : '#000000'}
          emissiveIntensity={isOn ? 2.8 : 0}
          roughness={0.15}
          transparent
          opacity={isOn ? 0.96 : 0.75}
        />
      </mesh>

      {/* Soft translucent glow halo when lit */}
      {isOn && (
        <mesh position={[0, 0.85, -0.15]}>
          <sphereGeometry args={[0.72, 14, 14]} />
          <meshBasicMaterial color="#fde047" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      )}

      {def.pins.map((pin) => (
        <PinAnchor key={pin.id} component={component} pin={pin} />
      ))}
    </group>
  );
};

export const DeskLampModel: React.FC<ActuatorModelProps> = ({ component, activeLevel, xray }) => {
  const def = HARDWARE_CATALOG.desk_lamp;
  const isOn = activeLevel >= 0.5;

  return (
    <group>
      {/* Weighted Lamp Base */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.15, 1.25, 0.4, 24]} />
        <meshStandardMaterial {...createHousingMaterialProps('#334155', xray, 0.45, 0.35)} />
      </mesh>

      {/* Articulated Brushed Aluminum Stand */}
      <mesh position={[0, 1.25, -0.35]} rotation={[0.18, 0, 0]} material={SHARED_MAT.metalSilver} castShadow>
        <cylinderGeometry args={[0.11, 0.13, 1.95, 12]} />
      </mesh>
      <mesh position={[0, 2.25, -0.05]} rotation={[-0.75, 0, 0]} material={SHARED_MAT.metalSilver} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.15, 12]} />
      </mesh>

      {/* Lamp Shade Cone */}
      <group position={[0, 2.38, 0.45]} rotation={[0.35, 0, 0]}>
        <mesh castShadow>
          <coneGeometry args={[0.85, 0.95, 22, 1, true]} />
          <meshStandardMaterial
            {...createHousingMaterialProps('#d97736', xray, 0.35, 0.3)}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Warm Filament Bulb */}
        <mesh position={[0, -0.25, 0]}>
          <sphereGeometry args={[0.3, 14, 14]} />
          <meshStandardMaterial
            color={isOn ? '#fef9c3' : '#e2e8f0'}
            emissive={isOn ? '#facc15' : '#000000'}
            emissiveIntensity={isOn ? 3.0 : 0}
            roughness={0.2}
          />
        </mesh>
        {/* Soft Downward Illumination Cone */}
        {isOn && (
          <mesh position={[0, -1.25, 0]}>
            <coneGeometry args={[1.45, 2.1, 18, 1, true]} />
            <meshBasicMaterial
              color="#fef08a"
              transparent
              opacity={0.14}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>

      {def.pins.map((pin) => (
        <PinAnchor key={pin.id} component={component} pin={pin} />
      ))}
    </group>
  );
};

export const BuzzerModel: React.FC<ActuatorModelProps> = ({ component, activeLevel, xray }) => {
  const def = HARDWARE_CATALOG.buzzer;
  const isOn = activeLevel >= 0.5;
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!isOn) return;
    const t = state.clock.elapsedTime * 2.4;
    [ring1Ref.current, ring2Ref.current].forEach((mesh, idx) => {
      if (!mesh) return;
      const phase = (t + idx * 0.5) % 1;
      const scale = 0.6 + phase * 1.85;
      mesh.scale.set(scale, scale, 1);
      mesh.position.y = 1.05 + phase * 1.1;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - phase) * 0.65;
    });
  });

  return (
    <group>
      {/* Breakout PCB */}
      <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.1, 0.22, 2.1]} />
        <meshStandardMaterial {...createHousingMaterialProps('#27323b', xray, 0.5, 0.15)} />
      </mesh>

      {/* Piezo Cylinder */}
      <mesh position={[0, 0.58, -0.1]} castShadow>
        <cylinderGeometry args={[0.72, 0.72, 0.68, 22]} />
        <meshStandardMaterial {...createHousingMaterialProps('#18181b', xray, 0.45, 0.15)} />
      </mesh>

      {/* Brass piezo diaphragm visible inside aperture */}
      <mesh position={[0, 0.93, -0.1]} material={SHARED_MAT.brassGear}>
        <cylinderGeometry args={[0.24, 0.24, 0.03, 16]} />
      </mesh>

      {/* Animated Expanding Acoustic Sound-Wave Rings */}
      {isOn && (
        <group>
          <mesh ref={ring1Ref} position={[0, 1.1, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.55, 0.04, 8, 24]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} depthWrite={false} />
          </mesh>
          <mesh ref={ring2Ref} position={[0, 1.1, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.55, 0.04, 8, 24]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} depthWrite={false} />
          </mesh>
        </group>
      )}

      {def.pins.map((pin) => (
        <PinAnchor key={pin.id} component={component} pin={pin} />
      ))}
    </group>
  );
};

export const RelayModel: React.FC<ActuatorModelProps> = ({ component, activeLevel, xray }) => {
  const def = HARDWARE_CATALOG.relay;
  const energized = activeLevel >= 0.5;

  return (
    <group>
      {/* Green Relay Breakout PCB */}
      <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.22, 2.6]} />
        <meshStandardMaterial {...createHousingMaterialProps('#166534', xray, 0.45, 0.12)} />
      </mesh>

      {/* Signature Blue Songle Electromagnetic Relay Cube */}
      <mesh position={[-0.1, 0.72, 0]} castShadow>
        <boxGeometry args={[1.65, 0.96, 1.4]} />
        <meshStandardMaterial {...createHousingMaterialProps('#2563eb', xray, 0.38, 0.12)} />
      </mesh>

      {/* Internal copper coil visible during X-Ray */}
      {xray && (
        <mesh position={[-0.1, 0.72, 0]} rotation={[0, 0, Math.PI / 2]} material={SHARED_MAT.copper}>
          <cylinderGeometry args={[0.32, 0.32, 0.95, 14]} />
        </mesh>
      )}

      {/* Green Screw Terminal Block for COM/NO */}
      <mesh position={[1.25, 0.48, 0]} castShadow>
        <boxGeometry args={[0.75, 0.54, 1.65]} />
        <meshStandardMaterial color="#15803d" roughness={0.5} />
      </mesh>

      {/* Energized Status LED */}
      <mesh geometry={SHARED_GEO.ledSmall} position={[-1.05, 0.32, 0.95]}>
        <meshStandardMaterial
          color={energized ? '#22c55e' : '#14532d'}
          emissive={energized ? '#22c55e' : '#000000'}
          emissiveIntensity={energized ? 2.5 : 0}
        />
      </mesh>

      {def.pins.map((pin) => (
        <PinAnchor key={pin.id} component={component} pin={pin} />
      ))}
    </group>
  );
};

export const WaterPumpModel: React.FC<ActuatorModelProps> = ({ component, activeLevel, xray }) => {
  const def = HARDWARE_CATALOG.water_pump;
  const isOn = activeLevel >= 0.5;
  const dropletsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!isOn || !dropletsRef.current) return;
    const t = state.clock.elapsedTime * 3.0;
    dropletsRef.current.children.forEach((child, idx) => {
      const p = (t + idx * 0.16) % 1;
      // Parabolic water arc spraying out of nozzle
      child.position.set(
        0.95 + p * 2.1,
        1.25 + p * 0.65 - p * p * 1.75,
        -0.15 + Math.sin(idx * 2.1) * 0.12 * p
      );
      const s = 0.75 + Math.sin(p * Math.PI) * 0.5;
      child.scale.setScalar(s);
    });
  });

  return (
    <group>
      {/* Pump Mounting Base */}
      <mesh position={[0, 0.14, 0.15]} castShadow receiveShadow>
        <boxGeometry args={[3.0, 0.22, 2.7]} />
        <meshStandardMaterial {...createHousingMaterialProps('#27323b', xray, 0.55, 0.15)} />
      </mesh>

      {/* White/Teal Submersible Cylinder Body */}
      <mesh position={[-0.25, 0.85, -0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.62, 0.62, 1.85, 20]} />
        <meshStandardMaterial {...createHousingMaterialProps('#e2e8f0', xray, 0.35, 0.1)} />
      </mesh>

      {/* Intake Grille Cap */}
      <mesh position={[-1.22, 0.85, -0.15]} rotation={[0, 0, Math.PI / 2]} material={SHARED_MAT.metalDark}>
        <cylinderGeometry args={[0.54, 0.54, 0.15, 16]} />
      </mesh>

      {/* Outlet Nozzle */}
      <mesh position={[0.45, 1.25, -0.15]} rotation={[0, 0, -Math.PI / 3]} material={SHARED_MAT.brassGear} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 0.85, 12]} />
      </mesh>

      {/* Animated Blue Water Droplet Stream */}
      {isOn && (
        <group ref={dropletsRef}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={i} geometry={SHARED_GEO.waterDroplet} material={SHARED_MAT.waterDrop} />
          ))}
        </group>
      )}

      {def.pins.map((pin) => (
        <PinAnchor key={pin.id} component={component} pin={pin} />
      ))}
    </group>
  );
};

export const ServoMotorModel: React.FC<ActuatorModelProps> = ({ component, activeLevel, xray }) => {
  const def = HARDWARE_CATALOG.servo_motor;
  const armGroupRef = useRef<THREE.Group>(null);
  const driveGearRef = useRef<THREE.Group>(null);
  const drivenGearRef = useRef<THREE.Group>(null);
  const currentAngleRef = useRef(0);

  useFrame((_, delta) => {
    const targetRad = THREE.MathUtils.degToRad(Math.max(0, Math.min(90, activeLevel)));
    currentAngleRef.current = THREE.MathUtils.lerp(
      currentAngleRef.current,
      targetRad,
      Math.min(1, delta * 7.5)
    );

    if (armGroupRef.current) {
      armGroupRef.current.rotation.z = currentAngleRef.current;
    }
    if (driveGearRef.current) {
      driveGearRef.current.rotation.y = currentAngleRef.current * 2.2;
    }
    if (drivenGearRef.current) {
      drivenGearRef.current.rotation.y = -currentAngleRef.current * 1.45;
    }
  });

  return (
    <group>
      {/* Heavy Barrier Pedestal Base */}
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.9, 0.28, 2.7]} />
        <meshStandardMaterial {...createHousingMaterialProps('#27323b', xray, 0.55, 0.18)} />
      </mesh>

      {/* SG90/MG996 Servo Housing */}
      <mesh position={[-0.85, 0.88, -0.2]} castShadow>
        <boxGeometry args={[1.45, 1.25, 1.1]} />
        <meshStandardMaterial {...createHousingMaterialProps('#1d4ed8', xray, 0.42, 0.15)} />
      </mesh>

      {/* Meshing Mechatronic Gear Set */}
      <group ref={driveGearRef} position={[-0.85, 1.62, -0.2]}>
        <SpurGear radius={0.34} teeth={10} material={SHARED_MAT.brassGear} />
      </group>
      <group ref={drivenGearRef} position={[-0.1, 1.62, -0.2]}>
        <SpurGear radius={0.44} teeth={12} material={SHARED_MAT.nylonGear} />
      </group>

      {/* Rotating Parking Barrier Arm (0° horizontal -> 90° raised) */}
      <group position={[0.4, 1.25, -0.2]}>
        {/* Pivot Post */}
        <mesh position={[0, -0.5, 0]} material={SHARED_MAT.metalDark} castShadow>
          <boxGeometry args={[0.55, 1.2, 0.55]} />
        </mesh>
        <group ref={armGroupRef}>
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={SHARED_MAT.metalSilver}>
            <cylinderGeometry args={[0.22, 0.22, 0.65, 14]} />
          </mesh>
          {/* Red & White Striped Barrier Boom */}
          {[0, 1, 2, 3, 4].map((seg) => (
            <mesh key={seg} position={[0.45 + seg * 0.62, 0, 0.24]} castShadow>
              <boxGeometry args={[0.6, 0.22, 0.1]} />
              <meshStandardMaterial
                color={seg % 2 === 0 ? '#dc2626' : '#f8fafc'}
                roughness={0.35}
              />
            </mesh>
          ))}
        </group>
      </group>

      {def.pins.map((pin) => (
        <PinAnchor key={pin.id} component={component} pin={pin} />
      ))}
    </group>
  );
};

export const DcMotorGearModel: React.FC<ActuatorModelProps> = ({ component, activeLevel, xray }) => {
  const def = HARDWARE_CATALOG.dc_motor_gear;
  const isOn = activeLevel >= 0.5;
  const rotorRef = useRef<THREE.Group>(null);
  const gearARef = useRef<THREE.Group>(null);
  const gearBRef = useRef<THREE.Group>(null);
  const speedRef = useRef(0);

  useFrame((_, delta) => {
    const targetSpeed = isOn ? 8.5 : 0;
    speedRef.current = THREE.MathUtils.lerp(speedRef.current, targetSpeed, Math.min(1, delta * 5));
    const step = speedRef.current * delta;
    if (rotorRef.current) rotorRef.current.rotation.z -= step;
    if (gearARef.current) gearARef.current.rotation.y += step * 1.4;
    if (gearBRef.current) gearBRef.current.rotation.y -= step * 0.95;
  });

  return (
    <group>
      {/* Motor Chassis Base */}
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.9, 0.28, 2.7]} />
        <meshStandardMaterial {...createHousingMaterialProps('#27323b', xray, 0.55, 0.18)} />
      </mesh>

      {/* Brushed Aluminum Cylindrical DC Motor */}
      <mesh position={[-0.8, 0.85, -0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.56, 0.56, 1.7, 20]} />
        <meshStandardMaterial {...createHousingMaterialProps('#94a3b8', xray, 0.3, 0.72)} />
      </mesh>

      {/* Yellow Gearbox Housing */}
      <mesh position={[0.45, 0.82, -0.15]} castShadow>
        <boxGeometry args={[0.95, 0.92, 0.95]} />
        <meshStandardMaterial {...createHousingMaterialProps('#d97706', xray, 0.45, 0.12)} />
      </mesh>

      {/* Top Visible Meshing Spur Gears */}
      <group ref={gearARef} position={[0.25, 1.38, -0.15]}>
        <SpurGear radius={0.32} teeth={10} material={SHARED_MAT.brassGear} />
      </group>
      <group ref={gearBRef} position={[0.95, 1.38, -0.15]}>
        <SpurGear radius={0.42} teeth={12} material={SHARED_MAT.nylonGear} />
      </group>

      {/* Rotating Fan / Conveyor Drive Wheel */}
      <group ref={rotorRef} position={[1.2, 0.85, -0.15]}>
        <mesh rotation={[0, 0, Math.PI / 2]} material={SHARED_MAT.metalSilver}>
          <cylinderGeometry args={[0.14, 0.14, 0.65, 12]} />
        </mesh>
        {[0, 1, 2, 3].map((b) => (
          <mesh
            key={b}
            position={[0.28, Math.sin((b * Math.PI) / 2) * 0.45, Math.cos((b * Math.PI) / 2) * 0.45]}
            rotation={[b * (Math.PI / 2), 0.25, 0]}
            castShadow
          >
            <boxGeometry args={[0.08, 0.72, 0.24]} />
            <meshStandardMaterial color="#0ea5e9" roughness={0.32} />
          </mesh>
        ))}
      </group>

      {def.pins.map((pin) => (
        <PinAnchor key={pin.id} component={component} pin={pin} />
      ))}
    </group>
  );
};
