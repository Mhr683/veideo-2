import React from 'react';
import { StudioProvider, useStudio } from './context/StudioContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { WorkspaceCanvas } from './components/WorkspaceCanvas';
import { PromptComposer } from './components/PromptComposer';
import { ContextualPanel } from './components/ContextualPanel';
import { DashboardView } from './components/DashboardView';
import { AllMediaView } from './components/AllMediaView';
import { CharactersView } from './components/CharactersView';
import { ScenesView } from './components/ScenesView';
import { StoryboardView } from './components/StoryboardView';
import { ToolsView } from './components/ToolsView';
import { ProjectsView } from './components/ProjectsView';
import { FavoritesView } from './components/FavoritesView';
import { TrashView } from './components/TrashView';
import { MediaViewerModal } from './components/MediaViewerModal';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { UploadModal } from './components/UploadModal';
import { NewEntityModals } from './components/NewEntityModals';
import { ToastContainer } from './components/ToastContainer';

const MainLayout: React.FC = () => {
  const { activeTab } = useStudio();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090a0f] text-zinc-100 font-sans">
      {/* 1. Left Navigation Sidebar */}
      <Sidebar />

      {/* 2. Main Center & Right Work Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <TopBar />

        {/* Dynamic Studio Body Area */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          {/* Primary View Area */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            {activeTab === 'canvas' && (
              <>
                <WorkspaceCanvas />
                <PromptComposer />
              </>
            )}
            {activeTab === 'home' && <DashboardView />}
            {activeTab === 'media' && <AllMediaView />}
            {activeTab === 'characters' && <CharactersView />}
            {activeTab === 'scenes' && <ScenesView />}
            {activeTab === 'storyboard' && <StoryboardView />}
            {activeTab === 'tools' && <ToolsView />}
            {activeTab === 'projects' && <ProjectsView />}
            {activeTab === 'favorites' && <FavoritesView />}
            {activeTab === 'trash' && <TrashView />}
          </main>

          {/* Right Contextual Drawer (Settings, AI Assistant, AI Agent) */}
          <ContextualPanel />
        </div>
      </div>

      {/* Interactive Overlays & Modals */}
      <MediaViewerModal />
      <AuthModal />
      <SettingsModal />
      <AdminPanelModal />
      <UploadModal />
      <NewEntityModals />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <StudioProvider>
      <MainLayout />
    </StudioProvider>
  );
}
