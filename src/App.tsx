import { useEffect } from 'react';
import { WorkshopScene } from './components/canvas/WorkshopScene';
import { TopBar } from './components/ui/TopBar';
import { MissionBriefPanel } from './components/ui/MissionBriefPanel';
import { ComponentDock } from './components/ui/ComponentDock';
import { BlockEditor } from './components/ui/BlockEditor';
import { EnvironmentControls } from './components/ui/EnvironmentControls';
import { MultimeterWidget } from './components/ui/MultimeterWidget';
import { IpoDiagramModal } from './components/ui/IpoDiagramModal';
import { HintDrawer } from './components/ui/HintDrawer';
import { EvaluationModal } from './components/ui/EvaluationModal';
import { MissionSelectorModal } from './components/ui/MissionSelectorModal';
import { SafetyBanner } from './components/ui/SafetyBanner';
import { useGameStore } from './store/useGameStore';

export function App() {
  const rotatePlacementOrSelected = useGameStore((s) => s.rotatePlacementOrSelected);
  const cancelActiveAction = useGameStore((s) => s.cancelActiveAction);
  const selectedComponentId = useGameStore((s) => s.selectedComponentId);
  const deleteComponent = useGameStore((s) => s.deleteComponent);
  const undo = useGameStore((s) => s.undo);
  const redo = useGameStore((s) => s.redo);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        rotatePlacementOrSelected();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelActiveAction();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponentId) {
        e.preventDefault();
        deleteComponent(selectedComponentId);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [rotatePlacementOrSelected, cancelActiveAction, selectedComponentId, deleteComponent, undo, redo]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#11171b] select-none">
      {/* Full-Screen 3D Interactive Workbench Canvas */}
      <WorkshopScene />

      {/* Non-Intrusive Workshop HUD Overlay */}
      <div className="pointer-events-none fixed inset-0 flex flex-col">
        <TopBar />
        <SafetyBanner />
        <MissionBriefPanel />
        <BlockEditor />
        <EnvironmentControls />
        <MultimeterWidget />
        <ComponentDock />
      </div>

      {/* Syllabus & Assessment Modals */}
      <MissionSelectorModal />
      <IpoDiagramModal />
      <HintDrawer />
      <EvaluationModal />
    </div>
  );
}

export default App;
