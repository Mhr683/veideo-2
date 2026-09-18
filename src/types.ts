export type SubscriptionPlan = 'Free' | 'Basic' | 'Pro' | 'Business' | 'Studio';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  creditsBalance: number;
  subscriptionPlan: SubscriptionPlan;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface CreditTransaction {
  id: string;
  date: string;
  amount: number;
  type: 'deduction' | 'addition' | 'bonus';
  description: string;
  service: string;
}

export type MediaType = 'image' | 'video' | 'audio';
export type MediaSource = 'generated' | 'uploaded';

export interface DetectedAction {
  type: string;
  action?: string;
  description?: string;
  start: number;
  end: number;
  startTime?: number;
  endTime?: number;
  character?: string;
  bodyParts?: string[];
  intensity?: string;
}

export type GenerationStage =
  | 'analyzing_prompt'
  | 'detecting_characters'
  | 'detecting_actions'
  | 'building_motion_instructions'
  | 'submitting_video_generation'
  | 'generating_video'
  | 'retrieving_video'
  | 'validating_video'
  | 'complete'
  | 'generating_animation'
  | 'rendering_scene'
  | 'finalizing_video';

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  source: MediaSource;
  url: string;
  thumbnail: string;
  createdAt: string;
  prompt?: string;
  negativePrompt?: string;
  model?: string;
  aspectRatio: '16:9' | '4:3' | '1:1' | '3:4' | '9:16';
  resolution?: string;
  duration?: number;
  cost?: number;
  status: 'completed' | 'processing' | 'failed';
  favorite: boolean;
  trashed: boolean;
  projectId?: string;
  characterIds?: string[];
  cameraMovement?: string;
  style?: string;
  detectedActions?: DetectedAction[];
  motionInstructions?: string;
  motionIntensity?: string;
  validationStatus?: 'passed' | 'failed';
}

export interface Character {
  id: string;
  name: string;
  description: string;
  age?: string;
  appearance?: string;
  clothing?: string;
  hair?: string;
  skinTone?: string;
  personality?: string;
  voiceDescription?: string;
  referenceImages: string[];
  avatarUrl: string;
  characterIdCode: string;
  projectId?: string;
  consistencyAnchor?: string;
  faceEmbedding?: string;
  animationInstructions?: string;
  createdAt: string;
}

export interface SceneAction {
  type: string;
  description?: string;
  start: number;
  end: number;
  bodyParts?: string[];
}

export interface Scene {
  id: string;
  projectId: string;
  name: string;
  description: string;
  location: string;
  timeOfDay: string;
  characterIds: string[];
  environment: string;
  camera: string;
  lighting: string;
  dialogue?: string;
  action: string;
  actions?: SceneAction[];
  motionIntensity?: 'None' | 'Subtle' | 'Natural' | 'Dynamic';
  animationStatus?: 'draft' | 'analyzing' | 'animating' | 'rendered' | 'failed';
  referenceMediaUrl?: string;
  duration: number;
  prompt: string;
  generatedImageUrl?: string;
  generatedVideoUrl?: string;
  order: number;
  status: 'draft' | 'rendered' | 'generating';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  lastEdited: string;
  createdAt: string;
  sceneCount: number;
  generationCount: number;
  tags?: string[];
}

export interface AIProviderConfig {
  id: string;
  name: string;
  description: string;
  apiKeySet: boolean;
  endpoint: string;
  enabled: boolean;
  status?: 'active' | 'disabled' | 'error';
  models: {
    id: string;
    name: string;
    type: 'image' | 'video' | 'text';
    costCredits: number;
    enabled: boolean;
    description: string;
  }[];
}

export interface GenerationSettings {
  mediaType: 'image' | 'video';
  model: string;
  aspectRatio: '16:9' | '4:3' | '1:1' | '3:4' | '9:16';
  outputsCount: 1 | 2 | 3 | 4;
  quality: 'Standard 720p' | 'High 1080p' | 'Ultra 4K';
  style: string;
  duration: number; // 4, 8, 12, 16 seconds (default 8)
  motionLevel: number; // 1 to 10
  motion?: 'Subtle' | 'Natural' | 'Dynamic';
  characterAnimation?: 'Auto' | 'On' | 'Off' | 'Enabled' | 'Disabled';
  cameraMotion?: 'Auto' | 'Static' | 'Cinematic' | 'Dynamic';
  actionDetection?: 'Automatic';
  fps?: 24 | 30 | 60;
  cameraMovement: string;
  cameraAngle?: string;
  lens?: string;
  lighting?: string;
  environment?: string;
  seed?: number;
  autoGenerate: boolean;
  creditConfirmation: boolean;
  safetyLevel: 'Standard' | 'Strict' | 'Relaxed';
  demoMode?: boolean;
}

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  iconName: string;
  requiredCredits: number;
  supportedModels: string[];
  category: 'Creation' | 'Enhancement' | 'Post-Production' | 'Audio & Voice';
}

export interface ActiveJob {
  id: string;
  type: 'image' | 'video';
  prompt: string;
  model: string;
  status: 'queued' | 'waiting' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  stage?: GenerationStage;
  stageMessage?: string;
  detectedActions?: DetectedAction[];
  detectedCharacters?: string[];
  motionInstructions?: string;
  motionAwarePrompt?: string;
  cameraMotion?: string;
  characterAnimation?: string;
  motionLevel?: string;
  validationStatus?: 'passed' | 'failed';
  error?: string;
  createdAt: number;
  aspectRatio: string;
  duration?: number;
  resultUrl?: string;
  thumbnailUrl?: string;
  cost: number;
}

export type ActiveNavTab =
  | 'home'
  | 'canvas'
  | 'media'
  | 'characters'
  | 'scenes'
  | 'storyboard'
  | 'tools'
  | 'projects'
  | 'favorites'
  | 'trash';

export type AgentMode = 'manual' | 'assisted' | 'automatic';
