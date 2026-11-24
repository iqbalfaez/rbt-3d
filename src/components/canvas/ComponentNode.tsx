import React from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { HARDWARE_CATALOG } from '../../engine/catalog';
import { useGameStore } from '../../store/useGameStore';
import {
  BatteryPackModel,
  BreadboardModel,
  MicrocontrollerModel,
  ResistorModel,
} from './CoreModels';
import {
  IrSensorModel,
  LdrSensorModel,
  PushButtonModel,
  SoilSensorModel,
  ToggleSwitchModel,
  UltrasonicSensorModel,
} from './sensors/SensorModels';
import {
  BuzzerModel,
  DcMotorGearModel,
  DeskLampModel,
  LedModel,
  RelayModel,
  ServoMotorModel,
  WaterPumpModel,
} from './actuators/ActuatorModels';
import type { PlacedComponent } from '../../types/game';

interface ComponentNodeProps {
  component: PlacedComponent;
}

export const ComponentNode: React.FC<ComponentNodeProps> = ({ component }) => {
  const selectedComponentId = useGameStore((s) => s.selectedComponentId);
  const selectComponent = useGameStore((s) => s.selectComponent);
  const deleteComponent = useGameStore((s) => s.deleteComponent);
  const isSimulating = useGameStore((s) => s.isSimulating);
  const xrayMode = useGameStore((s) => s.xrayMode);
  const env = useGameStore((s) => s.environment);
  const powered = useGameStore((s) => Boolean(s.analysis.componentPower[component.id]));
  const activeLevel = useGameStore((s) =>
    s.isSimulating ? (s.simOutputs.actuatorStates[component.id] ?? 0) : 0
  );

  const def = HARDWARE_CATALOG[component.type];
  const isSelected = selectedComponentId === component.id;
  const xray = xrayMode && isSimulating;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectComponent(component.id);
  };

  const handleContextMenu = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    deleteComponent(component.id);
  };

  const renderModel = () => {
    switch (component.type) {
      case 'microcontroller':
        return <MicrocontrollerModel component={component} powered={powered && isSimulating} xray={xray} />;
      case 'breadboard':
        return <BreadboardModel component={component} powered={powered} xray={xray} />;
      case 'battery_pack':
        return <BatteryPackModel component={component} powered={powered && isSimulating} xray={xray} />;
      case 'resistor':
        return <ResistorModel component={component} powered={powered} xray={xray} />;
      case 'push_button':
        return <PushButtonModel component={component} powered={powered && isSimulating} xray={xray} env={env} />;
      case 'toggle_switch':
        return <ToggleSwitchModel component={component} powered={powered} xray={xray} env={env} />;
      case 'ldr_sensor':
        return <LdrSensorModel component={component} powered={powered && isSimulating} xray={xray} env={env} />;
      case 'soil_sensor':
        return <SoilSensorModel component={component} powered={powered && isSimulating} xray={xray} env={env} />;
      case 'ultrasonic_sensor':
        return <UltrasonicSensorModel component={component} powered={powered && isSimulating} xray={xray} env={env} />;
      case 'ir_sensor':
        return <IrSensorModel component={component} powered={powered && isSimulating} xray={xray} env={env} />;
      case 'led':
        return <LedModel component={component} activeLevel={activeLevel} xray={xray} />;
      case 'desk_lamp':
        return <DeskLampModel component={component} activeLevel={activeLevel} xray={xray} />;
      case 'buzzer':
        return <BuzzerModel component={component} activeLevel={activeLevel} xray={xray} />;
      case 'relay':
        return <RelayModel component={component} activeLevel={activeLevel} xray={xray} />;
      case 'water_pump':
        return <WaterPumpModel component={component} activeLevel={activeLevel} xray={xray} />;
      case 'servo_motor':
        return <ServoMotorModel component={component} activeLevel={activeLevel} xray={xray} />;
      case 'dc_motor_gear':
        return <DcMotorGearModel component={component} activeLevel={activeLevel} xray={xray} />;
      default:
        return null;
    }
  };

  return (
    <group
      position={component.position}
      rotation={[0, component.rotation, 0]}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {renderModel()}

      {/* Selection Footprint Frame */}
      {isSelected && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry
            args={[
              Math.max(def.footprint[0], def.footprint[1]) * 0.56,
              Math.max(def.footprint[0], def.footprint[1]) * 0.61,
              32,
            ]}
          />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  );
};
