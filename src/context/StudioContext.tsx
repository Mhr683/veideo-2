import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Project,
  Character,
  Scene,
  MediaItem,
  GenerationSettings,
  ActiveJob,
  ActiveNavTab,
  AgentMode,
  AIProviderConfig,
  CreditTransaction,
} from '../types';
import {
  initialUser,
  initialProjects,
  initialCharacters,
  initialScenes,
  initialMedia,
  initialProviders,
  initialTransactions,
} from '../data/initialData';

interface StudioContextType {
  // Auth & Profile
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (email: string, pass: string) => boolean;
  signup: (name: string, email: string, pass: string) => boolean;
  logout: () => void;
  updateUser: (fields: Partial<UserProfile>) => void;
  credits: number;
  transactions: CreditTransaction[];

  // Navigation
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;

  // Projects
  projects: Project[];
  activeProjectId: string;
  activeProject: Project | undefined;
  setActiveProjectId: (id: string) => void;
  createProject: (name: string, description: string) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Characters & Consistency
  characters: Character[];
  selectedCharacterIds: string[];
  toggleCharacterSelection: (id: string) => void;
  createCharacter: (char: Omit<Character, 'id' | 'createdAt' | 'characterIdCode'>) => Character;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;

  // Scenes & Storyboard
  scenes: Scene[];
  activeSceneId: string | null;
  setActiveSceneId: (id: string | null) => void;
  createScene: (scene: Partial<Scene>) => Scene;
  updateScene: (id: string, updates: Partial<Scene>) => void;
  deleteScene: (id: string) => void;
  reorderScenes: (startIndex: number, endIndex: number) => void;

  // Media Library
  mediaList: MediaItem[];
  viewingMedia: MediaItem | null;
  setViewingMedia: (item: MediaItem | null) => void;
  activeCanvasMedia: MediaItem | null;
  setActiveCanvasMedia: (item: MediaItem | null) => void;
  addMediaItem: (item: Omit<MediaItem, 'id' | 'createdAt'>) => MediaItem;
  toggleFavorite: (id: string) => void;
  trashMedia: (id: string) => void;
  restoreMedia: (id: string) => void;
  permanentlyDeleteMedia: (id: string) => void;
  emptyTrash: () => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Generation Settings & Composer
  settings: GenerationSettings;
  updateSettings: (updates: Partial<GenerationSettings>) => void;
  promptText: string;
  setPromptText: (text: string) => void;
  negativePrompt: string;
  setNegativePrompt: (text: string) => void;
  referenceMediaUrl: string | null;
  setReferenceMediaUrl: (url: string | null) => void;
  isEnhancingPrompt: boolean;
  enhancePrompt: () => Promise<void>;
  agentMode: AgentMode;
  setAgentMode: (mode: AgentMode) => void;

  // Right Contextual Drawer
  rightPanelTab: 'settings' | 'assistant' | 'agent' | null;
  setRightPanelTab: (tab: 'settings' | 'assistant' | 'agent' | null) => void;

  // Jobs
  activeJobs: ActiveJob[];
  startGeneration: () => Promise<void>;
  cancelJob: (id: string) => void;
  extractActionsFromPrompt: (promptOverride?: string) => Promise<any>;

  // Providers & Admin
  providers: AIProviderConfig[];
  updateProvider: (id: string, updates: Partial<AIProviderConfig>) => void;

  // Modals
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup' | 'forgot' | 'reset';
  setAuthModalMode: (mode: 'login' | 'signup' | 'forgot' | 'reset') => void;
  settingsModalOpen: boolean;
  setSettingsModalOpen: (open: boolean) => void;
  settingsModalSection: 'account' | 'appearance' | 'generation' | 'credits' | 'api' | 'notifications';
  setSettingsModalSection: (section: 'account' | 'appearance' | 'generation' | 'credits' | 'api' | 'notifications') => void;
  adminModalOpen: boolean;
  setAdminModalOpen: (open: boolean) => void;
  uploadModalOpen: boolean;
  setUploadModalOpen: (open: boolean) => void;
  newProjectModalOpen: boolean;
  setNewProjectModalOpen: (open: boolean) => void;
  newCharacterModalOpen: boolean;
  setNewCharacterModalOpen: (open: boolean) => void;
  newSceneModalOpen: boolean;
  setNewSceneModalOpen: (open: boolean) => void;

  // Notifications
  notify: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  toasts: { id: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }[];
  removeToast: (id: string) => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state (starts logged in with demo user)
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('visionforge_user');
    return saved ? JSON.parse(saved) : { ...initialUser, creditsBalance: 1250 };
  });
  const [credits, setCredits] = useState<number>(user?.creditsBalance ?? 1250);
  const [transactions, setTransactions] = useState<CreditTransaction[]>(initialTransactions);

  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('canvas');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Projects
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activeProjectId, setActiveProjectId] = useState<string>('proj_cinematic_ad');

  // Characters
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);

  // Scenes
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);
  const [activeSceneId, setActiveSceneId] = useState<string | null>('scene_city_night');

  // Media
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia);
  const [viewingMedia, setViewingMedia] = useState<MediaItem | null>(null);
  const [activeCanvasMedia, setActiveCanvasMedia] = useState<MediaItem | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Generation Settings
  const [settings, setSettings] = useState<GenerationSettings>({
    mediaType: 'video',
    model: 'Veo 3.1 Pro',
    aspectRatio: '16:9',
    outputsCount: 1,
    quality: 'High 1080p',
    style: 'Cinematic Film',
    duration: 8,
    motionLevel: 7,
    motion: 'Natural',
    characterAnimation: 'Auto',
    cameraMotion: 'Auto',
    cameraMovement: 'Cinematic',
    actionDetection: 'Automatic',
    autoGenerate: false,
    creditConfirmation: true,
    safetyLevel: 'Standard',
    demoMode: false,
  });

  // Composer
  const [promptText, setPromptText] = useState<string>(
    'A young man walking through a rainy city at night, cinematic lighting, realistic camera movement.'
  );
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [referenceMediaUrl, setReferenceMediaUrl] = useState<string | null>(null);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState<boolean>(false);
  const [agentMode, setAgentMode] = useState<AgentMode>('assisted');

  // Right Drawer
  const [rightPanelTab, setRightPanelTab] = useState<'settings' | 'assistant' | 'agent' | null>('settings');

  // Jobs
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);

  // Providers & Admin
  const [providers, setProviders] = useState<AIProviderConfig[]>(initialProviders);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [settingsModalSection, setSettingsModalSection] = useState<'account' | 'appearance' | 'generation' | 'credits' | 'api' | 'notifications'>('account');
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState<boolean>(false);
  const [newCharacterModalOpen, setNewCharacterModalOpen] = useState<boolean>(false);
  const [newSceneModalOpen, setNewSceneModalOpen] = useState<boolean>(false);

  // Notifications
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }[]>([]);

  const notify = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth operations
  const login = (email: string) => {
    const loggedUser: UserProfile = {
      ...initialUser,
      email,
      name: email.split('@')[0] || 'Studio Director',
    };
    setUser(loggedUser);
    localStorage.setItem('visionforge_user', JSON.stringify(loggedUser));
    notify(`Welcome back, ${loggedUser.name}!`, 'success');
    setAuthModalOpen(false);
    return true;
  };

  const signup = (name: string, email: string) => {
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name,
      email,
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      creditsBalance: 250,
      subscriptionPlan: 'Basic',
      role: 'user',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUser(newUser);
    setCredits(250);
    localStorage.setItem('visionforge_user', JSON.stringify(newUser));
    notify(`Account created with 250 welcome credits!`, 'success');
    setAuthModalOpen(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('visionforge_user');
    notify('Logged out successfully', 'info');
  };

  const updateUser = (fields: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...fields };
    setUser(updated);
    localStorage.setItem('visionforge_user', JSON.stringify(updated));
    notify('Profile updated', 'success');
  };

  // Project operations
  const activeProject = projects.find((p) => p.id === activeProjectId);

  const createProject = (name: string, description: string) => {
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      name,
      description,
      coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      lastEdited: 'Just now',
      createdAt: new Date().toISOString().split('T')[0],
      sceneCount: 0,
      generationCount: 0,
      tags: ['New'],
    };
    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    notify(`Project "${name}" created!`, 'success');
    return newProj;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates, lastEdited: 'Just now' } : p)));
    notify('Project saved', 'info');
  };

  const deleteProject = (id: string) => {
    if (projects.length <= 1) {
      notify('Cannot delete the last remaining project', 'warning');
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(projects.find((p) => p.id !== id)!.id);
    }
    notify('Project deleted', 'info');
  };

  // Character operations
  const toggleCharacterSelection = (id: string) => {
    const char = characters.find((c) => c.id === id);
    const willSelect = !selectedCharacterIds.includes(id);
    setSelectedCharacterIds((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
    notify(
      willSelect
        ? `Locked character consistency for "${char?.name || 'Character'}"`
        : `Unlocked character consistency for "${char?.name || 'Character'}"`,
      'info'
    );
  };

  const createCharacter = (charData: Omit<Character, 'id' | 'createdAt' | 'characterIdCode'>) => {
    const newChar: Character = {
      ...charData,
      id: `char_${Date.now()}`,
      characterIdCode: `VF-CHAR-${String(characters.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCharacters((prev) => [newChar, ...prev]);
    notify(`Character "${newChar.name}" saved to bank!`, 'success');
    return newChar;
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    setCharacters((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    notify('Character updated', 'info');
  };

  const deleteCharacter = (id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
    setSelectedCharacterIds((prev) => prev.filter((cId) => cId !== id));
    notify('Character removed', 'info');
  };

  // Scene operations
  const createScene = (sceneData: Partial<Scene>) => {
    const newScene: Scene = {
      id: `scene_${Date.now()}`,
      projectId: activeProjectId,
      name: sceneData.name || `Scene ${scenes.length + 1}`,
      description: sceneData.description || 'New cinematic sequence',
      location: sceneData.location || 'Studio Set',
      timeOfDay: sceneData.timeOfDay || 'Dusk',
      characterIds: sceneData.characterIds || selectedCharacterIds,
      environment: sceneData.environment || 'Atmospheric volumetric lighting',
      camera: sceneData.camera || '35mm anamorphic prime',
      lighting: sceneData.lighting || 'Chiaroscuro contrast',
      action: sceneData.action || 'Characters enter frame',
      duration: sceneData.duration || 5,
      prompt: sceneData.prompt || promptText,
      order: scenes.length + 1,
      status: 'draft',
      ...sceneData,
    };
    setScenes((prev) => [...prev, newScene]);
    setActiveSceneId(newScene.id);
    notify(`Scene "${newScene.name}" added to timeline!`, 'success');
    return newScene;
  };

  const updateScene = (id: string, updates: Partial<Scene>) => {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    notify('Scene updated', 'info');
  };

  const deleteScene = (id: string) => {
    setScenes((prev) => prev.filter((s) => s.id !== id));
    if (activeSceneId === id) {
      setActiveSceneId(scenes.find((s) => s.id !== id)?.id || null);
    }
    notify('Scene deleted', 'info');
  };

  const reorderScenes = (startIndex: number, endIndex: number) => {
    setScenes((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result.map((item, index) => ({ ...item, order: index + 1 }));
    });
  };

  // Media operations
  const addMediaItem = (itemData: Omit<MediaItem, 'id' | 'createdAt'>) => {
    const newItem: MediaItem = {
      ...itemData,
      id: `med_${Date.now()}`,
      createdAt: 'Just now',
    };
    setMediaList((prev) => [newItem, ...prev]);
    return newItem;
  };

  const toggleFavorite = (id: string) => {
    const item = mediaList.find((m) => m.id === id);
    const willBeFavorite = item ? !item.favorite : true;
    setMediaList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, favorite: !m.favorite } : m))
    );
    notify(willBeFavorite ? 'Added to Starred Favorites' : 'Removed from Favorites', 'info');
  };

  const trashMedia = (id: string) => {
    setMediaList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, trashed: true } : item))
    );
    notify('Item moved to Trash', 'info');
  };

  const restoreMedia = (id: string) => {
    setMediaList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, trashed: false } : item))
    );
    notify('Item restored', 'success');
  };

  const permanentlyDeleteMedia = (id: string) => {
    setMediaList((prev) => prev.filter((item) => item.id !== id));
    notify('Permanently deleted', 'info');
  };

  const emptyTrash = () => {
    setMediaList((prev) => prev.filter((item) => !item.trashed));
    notify('Trash emptied', 'info');
  };

  const updateSettings = (updates: Partial<GenerationSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const updateProvider = (id: string, updates: Partial<AIProviderConfig>) => {
    setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    notify('Provider settings updated', 'success');
  };

  // Prompt Enhancement via backend API
  const enhancePrompt = async () => {
    if (!promptText.trim()) return;
    setIsEnhancingPrompt(true);
    try {
      const activeChars = characters.filter((c) => selectedCharacterIds.includes(c.id));
      const res = await fetch('/api/prompt/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          mediaType: settings.mediaType,
          style: settings.style,
          camera: settings.cameraMovement,
          characters: activeChars,
        }),
      });

      if (!res.ok) throw new Error('Failed to enhance prompt');
      const data = await res.json();
      if (data.enhancedPrompt) {
        setPromptText(data.enhancedPrompt);
      }
      if (data.negativePrompt) {
        setNegativePrompt(data.negativePrompt);
      }
      if (data.cameraMovement) {
        setSettings((prev) => ({ ...prev, cameraMovement: data.cameraMovement }));
      }
      notify('Prompt enhanced with cinematic parameters!', 'success');
    } catch (err: any) {
      console.warn('Enhance fallback:', err);
      // Local fallback enhancement
      const enhanced = `Cinematic 35mm anamorphic: ${promptText}. Masterpiece lighting, soft volumetric atmosphere, authentic 8k texture, Kodak 5219 color grade.`;
      setPromptText(enhanced);
      notify('Prompt refined with director aesthetic presets', 'info');
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // Generation Job Execution
  const startGeneration = async () => {
    if (!promptText.trim()) {
      notify('Please enter a prompt to generate', 'warning');
      return;
    }

    const estimatedCost =
      settings.demoMode
        ? 0
        : settings.mediaType === 'video'
        ? settings.duration >= 16
          ? 50
          : settings.duration >= 12
          ? 40
          : 30
        : 5;

    if (estimatedCost > 0 && credits < estimatedCost) {
      notify(`Insufficient credits (${credits}/${estimatedCost} needed). Please recharge or upgrade plan.`, 'error');
      setSettingsModalOpen(true);
      setSettingsModalSection('credits');
      return;
    }

    // Deduct credits if cost > 0
    if (estimatedCost > 0) {
      const newCreditBalance = credits - estimatedCost;
      setCredits(newCreditBalance);
      if (user) {
        setUser({ ...user, creditsBalance: newCreditBalance });
      }

      const newTx: CreditTransaction = {
        id: `tx_${Date.now()}`,
        date: 'Just now',
        amount: -estimatedCost,
        type: 'deduction',
        description: `${settings.model} (${settings.mediaType.toUpperCase()}) Generation`,
        service: `${settings.mediaType === 'video' ? 'Video' : 'Image'} Studio`,
      };
      setTransactions((prev) => [newTx, ...prev]);
    }

    // Character consistency injection
    let finalPrompt = promptText;
    const activeChars = characters.filter((c) => selectedCharacterIds.includes(c.id));
    if (activeChars.length > 0) {
      const charAnchors = activeChars.map((c) => `[Character: ${c.name}, ${c.consistencyAnchor || c.appearance}]`).join(' ');
      finalPrompt = `${charAnchors} ${finalPrompt}`;
    }

    try {
      const res = await fetch('/api/generate/job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: settings.mediaType,
          prompt: finalPrompt,
          model: settings.model,
          aspectRatio: settings.aspectRatio,
          duration: settings.mediaType === 'video' ? settings.duration : undefined,
          settings,
        }),
      });

      const data = await res.json();
      const job: ActiveJob = data.job || {
        id: `job_${Date.now()}`,
        type: settings.mediaType,
        prompt: finalPrompt,
        model: settings.model,
        status: 'queued',
        progress: 5,
        createdAt: Date.now(),
        aspectRatio: settings.aspectRatio,
        duration: settings.mediaType === 'video' ? settings.duration : undefined,
        cost: estimatedCost,
      };

      setActiveJobs((prev) => [job, ...prev]);
      notify(`${settings.mediaType === 'video' ? `Video (${settings.duration}s)` : 'Image'} generation started!`, 'info');

      // Poll job progress
      pollJob(job.id, estimatedCost);
    } catch (err: any) {
      notify('Generation error: ' + err.message, 'error');
    }
  };

  const cancelJob = async (jobId: string) => {
    try {
      await fetch(`/api/generate/job/${jobId}/cancel`, { method: 'POST' });
    } catch (e) {
      // ignore
    }
    setActiveJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'cancelled' } : j))
    );
    notify('Generation cancelled', 'warning');
  };

  const extractActionsFromPrompt = async (promptOverride?: string) => {
    const textToAnalyze = (promptOverride !== undefined ? promptOverride : promptText).trim();
    if (!textToAnalyze) return null;
    try {
      const activeChars = characters.filter((c) => selectedCharacterIds.includes(c.id));
      const res = await fetch('/api/action/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToAnalyze,
          duration: settings.duration || 8,
          motionLevel: settings.motion || 'Natural',
          cameraMotion: settings.cameraMotion || settings.cameraMovement || 'Cinematic',
          characterAnimation: settings.characterAnimation || 'Auto',
          characters: activeChars,
        }),
      });
      if (!res.ok) throw new Error('Failed to extract actions');
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Action extraction error:', err);
      return null;
    }
  };

  const pollJob = (jobId: string, cost: number) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/generate/job/${jobId}`);
        if (!res.ok) {
          clearInterval(interval);
          return;
        }
        const updatedJob = await res.json();
        setActiveJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, ...updatedJob } : j))
        );

        if (updatedJob.status === 'completed') {
          clearInterval(interval);

          if (!updatedJob.resultUrl) {
            setCredits((prev) => prev + cost);
            notify('Video generation completed without valid output media. Credits refunded.', 'error');
            return;
          }

          const newMedia = addMediaItem({
            title: promptText.slice(0, 36) || 'Untitled Creation',
            type: updatedJob.type,
            source: 'generated',
            url: updatedJob.resultUrl,
            thumbnail: updatedJob.thumbnailUrl || updatedJob.resultUrl,
            prompt: updatedJob.prompt,
            negativePrompt,
            model: updatedJob.model,
            aspectRatio: (updatedJob.aspectRatio as any) || '16:9',
            resolution: settings.quality.split(' ')[1] || '1080p',
            duration: updatedJob.type === 'video' ? (updatedJob.duration || settings.duration || 8) : undefined,
            cost,
            status: 'completed',
            favorite: false,
            trashed: false,
            projectId: activeProjectId,
            characterIds: selectedCharacterIds,
            cameraMovement: settings.cameraMovement,
            style: settings.style,
            detectedActions: updatedJob.detectedActions,
            motionInstructions: updatedJob.motionInstructions,
            motionIntensity: updatedJob.motionLevel,
            validationStatus: updatedJob.validationStatus,
          });

          // Set active canvas media and switch to canvas tab so it immediately plays in the Canvas viewport
          setActiveCanvasMedia(newMedia);
          setViewingMedia(null);
          setActiveTab('canvas');

          // If active scene exists, update its thumbnail and action choreography
          if (activeSceneId) {
            updateScene(activeSceneId, {
              generatedImageUrl: newMedia.thumbnail || newMedia.url,
              generatedVideoUrl: newMedia.type === 'video' ? newMedia.url : undefined,
              status: 'rendered',
              actions: updatedJob.detectedActions,
              motionIntensity: (updatedJob.motionLevel as any) || 'Natural',
            });
          }

          notify(`${updatedJob.type === 'video' ? 'Video' : 'Image'} rendered successfully! Playing in Studio Canvas.`, 'success');
        } else if (updatedJob.status === 'failed') {
          clearInterval(interval);
          setCredits((prev) => prev + cost);
          notify(`Generation failed: ${updatedJob.error || 'Video generation error'}. Credits refunded.`, 'error');
        } else if (updatedJob.status === 'cancelled') {
          clearInterval(interval);
          setCredits((prev) => prev + cost);
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 600);
  };

  return (
    <StudioContext.Provider
      value={{
        user,
        isLoggedIn: Boolean(user),
        login,
        signup,
        logout,
        updateUser,
        credits,
        transactions,

        activeTab,
        setActiveTab,
        sidebarCollapsed,
        setSidebarCollapsed,

        projects,
        activeProjectId,
        activeProject,
        setActiveProjectId,
        createProject,
        updateProject,
        deleteProject,

        characters,
        selectedCharacterIds,
        toggleCharacterSelection,
        createCharacter,
        updateCharacter,
        deleteCharacter,

        scenes,
        activeSceneId,
        setActiveSceneId,
        createScene,
        updateScene,
        deleteScene,
        reorderScenes,

        mediaList,
        viewingMedia,
        setViewingMedia,
        activeCanvasMedia,
        setActiveCanvasMedia,
        addMediaItem,
        toggleFavorite,
        trashMedia,
        restoreMedia,
        permanentlyDeleteMedia,
        emptyTrash,

        searchQuery,
        setSearchQuery,

        settings,
        updateSettings,
        promptText,
        setPromptText,
        negativePrompt,
        setNegativePrompt,
        referenceMediaUrl,
        setReferenceMediaUrl,
        isEnhancingPrompt,
        enhancePrompt,
        agentMode,
        setAgentMode,

        rightPanelTab,
        setRightPanelTab,

        activeJobs,
        startGeneration,
        cancelJob,
        extractActionsFromPrompt,

        providers,
        updateProvider,

        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        settingsModalOpen,
        setSettingsModalOpen,
        settingsModalSection,
        setSettingsModalSection,
        adminModalOpen,
        setAdminModalOpen,
        uploadModalOpen,
        setUploadModalOpen,
        newProjectModalOpen,
        setNewProjectModalOpen,
        newCharacterModalOpen,
        setNewCharacterModalOpen,
        newSceneModalOpen,
        setNewSceneModalOpen,

        notify,
        toasts,
        removeToast,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};
