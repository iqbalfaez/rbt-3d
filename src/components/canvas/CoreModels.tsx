import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { HARDWARE_CATALOG } from '../../engine/catalog';
import { PinAnchor } from './PinAnchor';
import { SHARED_GEO, SHARED_MAT, createHousingMaterialProps } from './sharedMaterials';
import type { PlacedComponent } from '../../types/game';

interface ModelProps {
  component: PlacedComponent;
  powered: boolean;
  xray: boolean;
}

export const MicrocontrollerModel: React.FC<ModelProps> = ({ component, powered, xray }) => {
  const def = HARDWARE_CATALOG.microcontroller;
  const pcbProps = createHousingMaterialProps('#0c5c75', xray, 0.42, 0.18);

  return (
    <group>
      {/* Main PCB */}
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 0.24, 5.0]} />
        <meshStandardMaterial {...pcbProps} />
      </mesh>

      {/* Subtle gold edge trim / silkscreen border */}
      <mesh position={[0, 0.29, 0]}>
        <boxGeometry args={[6.45, 0.02, 4.65]} />
        <meshStandardMaterial color="#0f7490" roughness={0.5} transparent={xray} opacity={xray ? 0.2 : 1} />
      </mesh>

      {/* Metallic USB-B Connector */}
      <mesh position={[-3.05, 0.56, -0.75]} material={SHARED_MAT.metalSilver} castShadow>
        <boxGeometry args={[1.35, 0.62, 1.08]} />
      </mesh>
      <mesh position={[-3.73, 0.56, -0.75]} material={SHARED_MAT.icBlack}>
        <boxGeometry args={[0.04, 0.36, 0.72]} />
      </mesh>

      {/* DC Barrel Jack */}
      <mesh position={[-3.05, 0.52, 1.35]} material={SHARED_MAT.icBlack} castShadow>
        <boxGeometry args={[1.2, 0.56, 0.85]} />
      </mesh>

      {/* Main ATmega328P Microcontroller IC */}
      <mesh position={[0.45, 0.42, 0.25]} material={SHARED_MAT.icBlack} castShadow>
        <boxGeometry args={[2.75, 0.28, 0.95]} />
      </mesh>
      {/* IC silver leg strips */}
      <mesh position={[0.45, 0.33, 0.78]} material={SHARED_MAT.metalSilver}>
        <boxGeometry args={[2.55, 0.08, 0.14]} />
      </mesh>
      <mesh position={[0.45, 0.33, -0.28]} material={SHARED_MAT.metalSilver}>
        <boxGeometry args={[2.55, 0.08, 0.14]} />
      </mesh>

      {/* Crystal Oscillator */}
      <mesh position={[-1.4, 0.36, 0.2]} material={SHARED_MAT.metalSilver} castShadow>
        <boxGeometry args={[0.42, 0.18, 0.95]} />
      </mesh>

      {/* Tactile Reset Button */}
      <mesh position={[-2.15, 0.36, -1.55]} material={SHARED_MAT.metalSilver} castShadow>
        <boxGeometry args={[0.48, 0.16, 0.48]} />
      </mesh>
      <mesh position={[-2.15, 0.48, -1.55]}>
        <cylinderGeometry args={[0.14, 0.14, 0.14, 12]} />
        <meshStandardMaterial color="#dc2626" roughness={0.4} />
      </mesh>

      {/* Header Rail Housings (Top Digital & Bottom Power/Analog) */}
      <mesh position={[0, 0.44, -2.05]} material={SHARED_MAT.pinShroud} castShadow>
        <boxGeometry args={[5.4, 0.34, 0.46]} />
      </mesh>
      <mesh position={[0, 0.44, 2.05]} material={SHARED_MAT.pinShroud} castShadow>
        <boxGeometry args={[5.6, 0.34, 0.46]} />
      </mesh>

      {/* Power ON indicator LED */}
      <mesh geometry={SHARED_GEO.ledSmall} position={[2.5, 0.34, -0.7]}>
        <meshStandardMaterial
          color={powered ? '#22c55e' : '#14532d'}
          emissive={powered ? '#22c55e' : '#000000'}
          emissiveIntensity={powered ? 2.2 : 0}
        />
      </mesh>

      {/* Copper trace accent visible especially in X-Ray mode */}
      {xray && (
        <mesh position={[0, 0.22, 0]} material={SHARED_MAT.copper}>
          <boxGeometry args={[5.4, 0.03, 0.12]} />
        </mesh>
      )}

      {/* Interactive Pin Anchors */}
      {def.pins.map((pin) => (
        <PinAnchor key={pin.id} component={component} pin={pin} />
      ))}
    </group>
  );
};

export const BreadboardModel: React.FC<ModelProps> = ({ component, xray }) => {
  const def = HARDWARE_CATALOG.breadboard;
  const holesRef = useRef<THREE.InstancedMesh>(null);
  const bodyProps = createHousingMaterialProps('#efeae1', xray, 0.58, 0.04);

  const holeMatrices = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();
    // Decorative tie holes across terminal columns
    const xs = [-4.0, -3.5, -3.0, -2.5, -2.0, -1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
    const zs = [-0.88, -0.48, 0.48, 0.88];
    for (const x of xs) {
      for (const z of zs) {
        dummy.position.set(x, 0.45, z);
        dummy.updateMatrix();
        list.push(dummy.matrix.clone());
      }
    }
    return list;
  }, []);

  useEffect(() => {
    const mesh = holesRef.current;
    if (!mesh) return;
    holeMatrices.forEach((mat, i) => mesh.setMatrixAt(i, mat));
    mesh.instanceMatrix.needsUpdate = true;
  }, [holeMatrices]);

  return (
    <group>
      {/* Main ABS Cream Breadboard Body */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[9.8, 0.44, 4.3]} />
        <meshStandardMaterial {...bodyProps} />
      </mesh>

      {/* Center IC Ravine Channel */}
      <mesh position={[0, 0.43, 0]}>
        <boxGeometry args={[9.6, 0.06, 0.22]} />
        <meshStandardMaterial color="#d6cfc2" roughness={0.8} transparent={xray} opacity={xray ? 0.25 : 1} />
      </mesh>

      {/* Power Rail Silkscreen Stripes (+ Red / - Blue) */}
      <mesh position={[0, 0.445, -1.9]}>
        <boxGeometry args={[9.2, 0.015, 0.08]} />
        <meshBasicMaterial color="#dc2626" />
      </mesh>
      <mesh position={[0, 0.445, -0.98]}>
        <boxGeometry args={[9.2, 0.015, 0.08]} />
        <meshBasicMaterial color="#2563eb" />
      </mesh>
      <mesh position={[0, 0.445, 0.98]}>
        <boxGeometry args={[9.2, 0.015, 0.08]} />
        <meshBasicMaterial color="#dc2626" />
      </mesh>
      <mesh position={[0, 0.445, 1.9]}>
        <boxGeometry args={[9.2, 0.015, 0.08]} />
        <meshBasicMaterial color="#2563eb" />
      </mesh>

      {/* Internal metallic contact strips revealed in X-Ray mode */}
      {xray && (
        <group>
          <mesh position={[0, 0.22, -1.65]} material={SHARED_MAT.copper}>
            <boxGeometry args={[8.6, 0.04, 0.16]} />
          </mesh>
          <mesh position={[0, 0.22, -1.2]} material={SHARED_MAT.metalSilver}>
            <boxGeometry args={[8.6, 0.04, 0.16]} />
          </mesh>
          <mesh position={[0, 0.22, 1.2]} material={SHARED_MAT.copper}>
            <boxGeometry args={[8.6, 0.04, 0.16]} />
          </mesh>
          <mesh position={[0, 0.22, 1.65]} material={SHARED_MAT.metalSilver}>
            <boxGeometry args={[8.6, 0.04, 0.16]} />
          </mesh>
        </group>
      )}

      {/* Instanced Breadboard Socket Holes */}
      <instancedMesh
        ref={holesRef}
        args={[SHARED_GEO.breadboardHole, SHARED_MAT.breadboardHole, holeMatrices.length]}
      />

      {/* Interactive Rail & Strip Pin Anchors */}
      {def.pins.map((pin) => (
        <PinAnchor key={pin.id} component={component} pin={pin} compact />
      ))}
    </group>
  );
};

export const BatteryPackModel: React.FC<ModelProps> = ({ component, powered, xray }) => {
  const def = HARDWARE_CATALOG.battery_pack;
  const casingProps = createHousingMaterialProps('#1f2937', xray, 0.65, 0.1);

  return (
    <group>
      {/* Battery Tray */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.0, 0.84, 2.6]} />
        <meshStandardMaterial {...casingProps} />
      </mesh>

      {/* Two AA Cells nestled inside */}
      <group position={[-0.25, 0.56, -0.58]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.42, 0.42, 2.9, 16]} />
          <meshStandardMaterial color="#b45309" metalness={0.35} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.43, 0.43, 1.3, 16]} />
          <meshStandardMaterial color="#18181b" metalness={0.25} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.5, 0]} material={SHARED_MAT.metalSilver}>
          <cylinderGeometry args={[0.16, 0.16, 0.14, 12]} />
        </mesh>
      </group>

      <group position={[-0.25, 0.56, 0.58]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.42, 0.42, 2.9, 16]} />
          <meshStandardMaterial color="#b45309" metalness={0.35} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.75, 0]}>
          <cylinderGeometry args={[0.43, 0.43, 1.3, 16]} />
          <meshStandardMaterial color="#18181b" metalness={0.25} roughness={0.4} />
        </mesh>
        <mesh position={[0, -1.5, 0]} material={SHARED_MAT.metalSilver}>
          <cylinderGeometry args={[0.16, 0.16, 0.14, 12]} />
        </mesh>
      </group>

      {/* Positive Red & Negative Black Terminal Indicators */}
      <mesh position={[1.4, 0.86, -0.55]}>
        <boxGeometry args={[0.35, 0.06, 0.35]} />
        <meshBasicMaterial color="#dc2626" />
      </mesh>
      <mesh position={[1.4, 0.86, 0.55]}>
        <boxGeometry args={[0.35, 0.06, 0.35]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>

      {/* Power indicator */}
      <mesh geometry={SHARED_GEO.ledSmall} position={[1.35, 0.88, 0]}>
        <meshStandardMaterial
          color={powered ? '#22c55e' : '#374151'}
          emissive={powered ? '#22c55e' : '#000000'}
          emissiveIntensity={powered ? 1.8 : 0}
        />
      </mesh>

      {def.pins.map((pin) => (
        <PinAnchor key={pin.id} component={component} pin={pin} />
      ))}
    </group>
  );
};

export const ResistorModel: React.FC<ModelProps> = ({ component, xray }) => {
  const def = HARDWARE_CATALOG.resistor;
  return (
    <group>
      {/* Low profile mount */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.1, 0.18, 1.0]} />
        <meshStandardMaterial {...createHousingMaterialProps('#27323b', xray, 0.7, 0.1)} />
      </mesh>

      {/* Copper leads */}
      <mesh position={[0, 0.46, 0]} rotation={[0, 0, Math.PI / 2]} material={SHARED_MAT.metalSilver}>
        <cylinderGeometry args={[0.05, 0.05, 2.55, 8]} />
      </mesh>

      {/* Beige Ceramic Resistor Body */}
      <mesh position={[0, 0.46, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 1.25, 14]} />
        <meshStandardMaterial color="#e7d3ad" roughness={0.45} />
      </mesh>

      {/* 220 Ohm Bands: Red - Red - Brown - Gold */}
      {[
        { x: -0.36, color: '#dc2626' },
        { x: -0.14, color: '#dc2626' },
        { x: 0.08, color: '#78350f' },
        { x: 0.38, color: '#d4a644' },
      ].map((band, i) => (
        <mesh key={i} position={[band.x, 0.46, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.248, 0.248, 0.1, 14]} />
          <meshStandardMaterial color={band.color} roughness={0.4} />
        </mesh>
      ))}

      {def.pins.map((pin) => (
        <PinAnchor key={pin.id} component={component} pin={pin} />
      ))}
    </group>
  );
};
