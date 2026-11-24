import React, { useEffect, useState } from 'react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { Environment, Grid, Html, Lightformer, OrbitControls } from '@react-three/drei';
import { HARDWARE_CATALOG } from '../../engine/catalog';
import { useGameStore } from '../../store/useGameStore';
import { ComponentNode } from './ComponentNode';
import { JumperWire } from './JumperWire';
import { FaultEffect } from './FaultEffect';

const SimulationTicker: React.FC = () => {
  const isSimulating = useGameStore((s) => s.isSimulating);
  const tickSimulation = useGameStore((s) => s.tickSimulation);

  useEffect(() => {
    if (!isSimulating) return;
    // 30 ticks per second logic interpreter cadence
    const interval = window.setInterval(() => {
      tickSimulation();
    }, 33);
    return () => window.clearInterval(interval);
  }, [isSimulating, tickSimulation]);

  return null;
};

const WorkbenchSurface: React.FC = () => {
  const [ghostPos, setGhostPos] = useState<[number, number, number] | null>(null);

  const placingType = useGameStore((s) => s.placingType);
  const placementRotation = useGameStore((s) => s.placementRotation);
  const placeComponentAt = useGameStore((s) => s.placeComponentAt);
  const toolMode = useGameStore((s) => s.toolMode);
  const selectedComponentId = useGameStore((s) => s.selectedComponentId);
  const moveComponentTo = useGameStore((s) => s.moveComponentTo);
  const selectComponent = useGameStore((s) => s.selectComponent);

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!placingType && !(toolMode === 'move' && selectedComponentId)) {
      if (ghostPos) setGhostPos(null);
      return;
    }
    const x = Math.max(-13, Math.min(13, Math.round(e.point.x)));
    const z = Math.max(-8, Math.min(8, Math.round(e.point.z)));
    setGhostPos([x, 0.05, z]);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (placingType) {
      placeComponentAt(e.point.x, e.point.z);
      setGhostPos(null);
      return;
    }
    if (toolMode === 'move' && selectedComponentId) {
      moveComponentTo(selectedComponentId, e.point.x, e.point.z);
      setGhostPos(null);
      return;
    }
    selectComponent(null);
  };

  const ghostFootprint = placingType
    ? HARDWARE_CATALOG[placingType].footprint
    : [3, 3];

  return (
    <group>
      {/* Solid Oak Wooden Workbench Frame */}
      <mesh position={[0, -0.65, 0]} receiveShadow>
        <boxGeometry args={[34, 1.15, 23]} />
        <meshStandardMaterial color="#5c4028" roughness={0.78} metalness={0.04} />
      </mesh>
      {/* Beveled Timber Edge Trim */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[34.2, 0.14, 23.2]} />
        <meshStandardMaterial color="#7c5636" roughness={0.68} metalness={0.05} />
      </mesh>

      {/* Anti-Static Green ESD Cutting Mat (1 unit = 1 cm) */}
      <mesh
        position={[0, -0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onPointerMove={handlePointerMove}
        onPointerOut={() => setGhostPos(null)}
        onClick={handleClick}
      >
        <planeGeometry args={[28, 18]} />
        <meshStandardMaterial color="#194438" roughness={0.86} metalness={0.05} />
      </mesh>

      {/* Crisp ESD Mat Border Frame */}
      <mesh position={[0, 0.004, -8.85]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[27.5, 0.08]} />
        <meshBasicMaterial color="#6ee7b7" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, 0.004, 8.85]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[27.5, 0.08]} />
        <meshBasicMaterial color="#6ee7b7" transparent opacity={0.35} />
      </mesh>

      {/* Subtle 1cm Snap Grid */}
      <Grid
        position={[0, 0.008, 0]}
        args={[27.4, 17.4]}
        cellSize={1}
        cellThickness={0.55}
        cellColor="#2c6b58"
        sectionSize={5}
        sectionThickness={1.0}
        sectionColor="#47967d"
        fadeDistance={42}
        fadeStrength={0.6}
      />

      {/* Translucent Placement / Move Ghost Preview */}
      {ghostPos && (placingType || (toolMode === 'move' && selectedComponentId)) && (
        <mesh
          position={[ghostPos[0], 0.25, ghostPos[2]]}
          rotation={[0, placingType ? placementRotation : 0, 0]}
        >
          <boxGeometry args={[ghostFootprint[0], 0.5, ghostFootprint[1]]} />
          <meshStandardMaterial
            color="#f59e0b"
            transparent
            opacity={0.38}
            roughness={0.3}
          />
        </mesh>
      )}
    </group>
  );
};

const SceneContents: React.FC = () => {
  const components = useGameStore((s) => s.components);
  const wires = useGameStore((s) => s.wires);
  const analysis = useGameStore((s) => s.analysis);
  const xrayMode = useGameStore((s) => s.xrayMode);
  const isSimulating = useGameStore((s) => s.isSimulating);
  const hoveredPin = useGameStore((s) => s.hoveredPin);

  const criticalFaults = analysis.faults.filter(
    (f) => f.severity === 'critical' && f.worldPos
  );

  return (
    <>
      <color attach="background" args={['#141c21']} />
      <fog attach="fog" args={['#141c21', 36, 72]} />

      {/* Workshop Studio Lighting */}
      <ambientLight intensity={0.42} color="#f8fafc" />
      <hemisphereLight args={['#e2e8f0', '#2b241c', 0.55]} />
      <directionalLight
        position={[11, 20, 12]}
        intensity={1.35}
        color="#fffbeb"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-10, 12, -9]} intensity={0.4} color="#bae6fd" />

      {/* Local Procedural Studio Environment (No External HDRI Network Required) */}
      <Environment resolution={128}>
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[0, 10, 2]}
          scale={[18, 8, 1]}
          rotation={[Math.PI / 2, 0, 0]}
          color="#fff7ed"
        />
        <Lightformer
          form="rect"
          intensity={1.1}
          position={[-10, 6, -6]}
          scale={[10, 6, 1]}
          rotation={[0, Math.PI / 3, 0]}
          color="#e0f2fe"
        />
        <Lightformer
          form="rect"
          intensity={0.9}
          position={[10, 5, 6]}
          scale={[8, 5, 1]}
          rotation={[0, -Math.PI / 3, 0]}
          color="#fef3c7"
        />
      </Environment>

      <WorkbenchSurface />

      {/* Placed 3D Electronic & Mechatronic Components */}
      {components.map((comp) => (
        <ComponentNode key={comp.id} component={comp} />
      ))}

      {/* Arched 3D Jumper Wires */}
      {wires.map((wire) => (
        <JumperWire
          key={wire.id}
          wire={wire}
          components={components}
          flow={analysis.wireFlow[wire.id] ?? 'inactive'}
          xray={xrayMode}
          isSimulating={isSimulating}
        />
      ))}

      {/* 3D Spark & Smoke Fault Effects */}
      {criticalFaults.map((fault) => (
        <FaultEffect key={fault.id} position={fault.worldPos!} />
      ))}

      {/* Singleton Global Pin Tooltip (Chromebook-Optimized: Only 1 DOM Node) */}
      {hoveredPin && (
        <Html
          position={[
            hoveredPin.worldPos[0],
            hoveredPin.worldPos[1] + 0.75,
            hoveredPin.worldPos[2],
          ]}
          center
          zIndexRange={[40, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="px-2.5 py-1 rounded bg-[#0f1418]/95 border border-amber-400/60 shadow-lg whitespace-nowrap text-xs font-mono">
            <span className="text-amber-300 font-semibold">{hoveredPin.label}</span>
            <span className="text-slate-400 ml-1.5">· {hoveredPin.componentName}</span>
          </div>
        </Html>
      )}

      {/* Constrained OrbitControls — never clips below the workbench */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0.18}
        maxPolarAngle={Math.PI / 2.18}
        minDistance={7}
        maxDistance={32}
        target={[0, 0.2, 0.5]}
      />

      <SimulationTicker />
    </>
  );
};

export const WorkshopScene: React.FC = () => {
  return (
    <div className="w-full h-full relative" id="rbt-canvas-container">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 15.5, 16.5], fov: 40, near: 0.1, far: 120 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        <SceneContents />
      </Canvas>
    </div>
  );
};
