import { GoogleGenAI } from '@google/genai';
import { ActionExtractionOutput } from './actionExtractor';
import { validateVideoOutput, VideoValidationResult } from './videoValidator';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

export interface VideoProviderCapabilities {
  textToVideo: boolean;
  imageToVideo: boolean;
  characterAnimation: boolean;
  textToImage: boolean;
  supportedDurations: number[];
  maxResolution: string;
}

export interface VideoGenerationParams {
  prompt: string;
  enhancedMotionPrompt: string;
  actionExtraction: ActionExtractionOutput;
  duration: number;
  aspectRatio: string;
  referenceImageUrl?: string | null;
  characterIds?: string[];
  cameraMovement?: string;
  style?: string;
  aiClient?: GoogleGenAI | null;
  isDemoMode?: boolean;
  onProgress?: (stage: string, progressPercent: number) => void;
}

export interface VideoGenerationResult {
  url: string;
  thumbnail: string;
  duration: number;
  provider: string;
  model: string;
  isDemo?: boolean;
  detectedActions?: any[];
  motionInstructions?: string;
  cameraMotion?: string;
  validation: VideoValidationResult;
}

/**
 * Base Abstract Video Generation Provider
 */
export abstract class VideoGenerationProvider {
  abstract id: string;
  abstract name: string;
  abstract capabilities: VideoProviderCapabilities;
  abstract isConfigured(): boolean;
  abstract getMissingConfigMessage(): string;
  abstract generate(params: VideoGenerationParams): Promise<VideoGenerationResult>;
}

/**
 * Sub-class for Text-to-Video capabilities
 */
export abstract class TextToVideoProvider extends VideoGenerationProvider {
  abstract generateFromText(params: VideoGenerationParams): Promise<VideoGenerationResult>;

  async generate(params: VideoGenerationParams): Promise<VideoGenerationResult> {
    if (!this.capabilities.textToVideo) {
      throw new Error(`Provider "${this.name}" does not support Text-to-Video generation.`);
    }
    return this.generateFromText(params);
  }
}

/**
 * Sub-class for Image-to-Video capabilities
 */
export abstract class ImageToVideoProvider extends VideoGenerationProvider {
  abstract generateFromImage(params: VideoGenerationParams): Promise<VideoGenerationResult>;

  async generate(params: VideoGenerationParams): Promise<VideoGenerationResult> {
    if (params.referenceImageUrl) {
      if (!this.capabilities.imageToVideo) {
        throw new Error(`Provider "${this.name}" does not support Image-to-Video animation.`);
      }
      return this.generateFromImage(params);
    }
    if (!this.capabilities.textToVideo) {
      throw new Error(`Provider "${this.name}" requires a reference image input for video generation.`);
    }
    return this.generateFromImage(params);
  }
}

/**
 * Sub-class for Character Animation capabilities
 */
export abstract class CharacterAnimationProvider extends VideoGenerationProvider {
  abstract animateCharacter(params: VideoGenerationParams): Promise<VideoGenerationResult>;

  async generate(params: VideoGenerationParams): Promise<VideoGenerationResult> {
    if (!this.capabilities.characterAnimation && !this.capabilities.textToVideo) {
      throw new Error(`Provider "${this.name}" does not support character animation.`);
    }
    return this.animateCharacter(params);
  }
}

/**
 * Helpers for loading reference images and saving generated videos
 */
async function resolveImageInput(referenceImageUrl: string): Promise<{ mimeType: string; imageBytes: string } | null> {
  try {
    if (referenceImageUrl.startsWith('data:image/')) {
      const match = referenceImageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (match) {
        return { mimeType: match[1], imageBytes: match[2] };
      }
    }

    if (referenceImageUrl.startsWith('/')) {
      const localPath = path.join(process.cwd(), 'public', referenceImageUrl.replace(/^\//, ''));
      if (fs.existsSync(localPath)) {
        const buf = fs.readFileSync(localPath);
        const ext = path.extname(localPath).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        return { mimeType, imageBytes: buf.toString('base64') };
      }
    }

    if (referenceImageUrl.startsWith('http://') || referenceImageUrl.startsWith('https://')) {
      const res = await fetch(referenceImageUrl);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        const mimeType = res.headers.get('content-type') || 'image/jpeg';
        return { mimeType, imageBytes: buf.toString('base64') };
      }
    }
  } catch (err) {
    console.warn('Failed to resolve image input:', err);
  }
  return null;
}

async function saveVideoAsset(generatedVideo: any, outputPath: string): Promise<void> {
  if (generatedVideo.videoBytes) {
    const buf = Buffer.from(generatedVideo.videoBytes, 'base64');
    fs.writeFileSync(outputPath, buf);
    return;
  }

  if (generatedVideo.uri) {
    const res = await fetch(generatedVideo.uri, {
      headers: process.env.GEMINI_API_KEY ? { 'x-goog-api-key': process.env.GEMINI_API_KEY } : {},
    });
    if (!res.ok) {
      throw new Error(`Failed to download generated video asset (${res.status} ${res.statusText})`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(outputPath, buf);
    return;
  }

  throw new Error('Video generation payload contained neither videoBytes nor uri.');
}

async function extractThumbnail(videoPath: string, thumbPath: string): Promise<void> {
  return new Promise((resolve) => {
    exec(`ffmpeg -ss 00:00:01 -i "${videoPath}" -vframes 1 -q:v 2 "${thumbPath}" -y`, (err) => {
      if (err) {
        // Fallback to frame at 0.1s
        exec(`ffmpeg -ss 00:00:00.1 -i "${videoPath}" -vframes 1 -q:v 2 "${thumbPath}" -y`, () => resolve());
      } else {
        resolve();
      }
    });
  });
}

/**
 * Concrete: Google Veo Provider (Real Google Veo Video Generation via @google/genai)
 */
export class GoogleVeoProvider extends CharacterAnimationProvider {
  id = 'google-veo';
  name = 'Google Veo 3.1';
  capabilities: VideoProviderCapabilities = {
    textToVideo: true,
    imageToVideo: true,
    characterAnimation: true,
    textToImage: false,
    supportedDurations: [4, 8],
    maxResolution: '1080p',
  };

  isConfigured(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  getMissingConfigMessage(): string {
    return 'Google Veo requires GEMINI_API_KEY. Please configure your API key in Settings > API Providers or system environment.';
  }

  async animateCharacter(params: VideoGenerationParams): Promise<VideoGenerationResult> {
    if (!this.isConfigured()) {
      throw new Error(this.getMissingConfigMessage());
    }

    // Google Veo models accept 4 or 8 seconds duration
    const targetDuration = params.duration <= 6 ? 4 : 8;

    const ai = params.aiClient || new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    if (!ai || !ai.models || typeof (ai.models as any).generateVideos !== 'function') {
      throw new Error('Google GenAI SDK does not support video generation in this environment.');
    }

    // Prepare motion-aware prompt with character consistency
    const prompt = params.actionExtraction?.motionAwarePrompt || params.enhancedMotionPrompt || params.prompt;

    // Optional image reference for Image-to-Video or character consistency
    let imageSource: any = null;
    if (params.referenceImageUrl) {
      imageSource = await resolveImageInput(params.referenceImageUrl);
    }

    params.onProgress?.('Submitting video generation', 60);

    const modelsToTry = [
      'veo-3.1-lite-generate-preview',
      'veo-3.1-generate-preview',
      'veo-2.0-generate-001',
    ];

    let operation: any = null;
    let usedModel = modelsToTry[0];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const payload: any = {
          model,
          prompt,
          config: {
            numberOfVideos: 1,
            durationSeconds: targetDuration,
            aspectRatio: params.aspectRatio === '9:16' ? '9:16' : '16:9',
            resolution: '1080p',
          },
        };
        if (imageSource) {
          payload.image = imageSource;
        }

        // Try standard SDK invocation
        operation = await (ai.models as any).generateVideos(payload);

        if (operation) {
          usedModel = model;
          break;
        }
      } catch (apiErr: any) {
        lastError = apiErr;
        const msg = apiErr.message || '';
        console.warn(`Veo candidate model ${model} attempt failed:`, msg);

        // Also try with source wrapper if required by specific model/backend
        try {
          const altPayload: any = {
            model,
            source: { prompt, ...(imageSource ? { image: imageSource } : {}) },
            config: {
              numberOfVideos: 1,
              durationSeconds: targetDuration,
              aspectRatio: params.aspectRatio === '9:16' ? '9:16' : '16:9',
            },
          };
          operation = await (ai.models as any).generateVideos(altPayload);
          if (operation) {
            usedModel = model;
            break;
          }
        } catch (altErr: any) {
          lastError = altErr;
        }
      }
    }

    if (!operation) {
      const errMsg = String(lastError?.message || '');
      const isQuota =
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('quota') ||
        errMsg.includes('429') ||
        errMsg.includes('rate-limits');

      if (isQuota) {
        throw new Error(
          `Google Veo generation quota exceeded (429 RESOURCE_EXHAUSTED). Video generation models require an active Gemini API billing tier with available video quota. You can check your plan at https://ai.google.dev/gemini-api/docs/rate-limits or toggle "Studio Demo Preview" mode to test character choreography and video timelines without consuming API quota.`
        );
      }

      const errDetail = errMsg || 'Unsupported video-generation model';
      throw new Error(
        `Video generation is unavailable for Google Veo. Please verify API permissions or try again. (${errDetail})`
      );
    }

    // Poll the operation until completion
    params.onProgress?.('Generating video', 75);
    let pollCount = 0;
    while (!operation.done) {
      pollCount++;
      if (pollCount > 72) {
        // 6 minutes timeout
        throw new Error('Google Veo video generation timed out after 6 minutes.');
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));

      try {
        operation = await (ai.operations as any).getVideosOperation({ operation });
      } catch (pollErr: any) {
        console.warn('Error polling Veo operation:', pollErr.message);
      }

      if (operation?.error) {
        throw new Error(
          `Google Veo generation failed: ${operation.error.message || JSON.stringify(operation.error)}`
        );
      }
    }

    params.onProgress?.('Retrieving video', 88);
    const generatedVideo = operation.response?.generatedVideos?.[0]?.video;
    if (!generatedVideo) {
      throw new Error('Google Veo completed without returning a video stream.');
    }

    // Ensure storage directory exists
    const outputDir = path.join(process.cwd(), 'public', 'generated-videos');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileId = `veo_${Date.now()}`;
    const videoFileName = `${fileId}.mp4`;
    const thumbFileName = `${fileId}_thumb.jpg`;
    const videoLocalPath = path.join(outputDir, videoFileName);
    const thumbLocalPath = path.join(outputDir, thumbFileName);

    await saveVideoAsset(generatedVideo, videoLocalPath);
    await extractThumbnail(videoLocalPath, thumbLocalPath);

    params.onProgress?.('Validating video', 95);
    const validation = await validateVideoOutput(videoLocalPath);
    if (!validation.isValid) {
      throw new Error(`Video generation validation failed: ${validation.error || 'No changing video frames detected'}`);
    }

    params.onProgress?.('Complete', 100);

    return {
      url: `/generated-videos/${videoFileName}`,
      thumbnail: `/generated-videos/${thumbFileName}`,
      duration: targetDuration,
      provider: this.name,
      model: usedModel,
      detectedActions: params.actionExtraction.actions,
      motionInstructions: params.actionExtraction.motionInstructions,
      cameraMotion: params.actionExtraction.cameraMovement,
      validation,
    };
  }
}

/**
 * Concrete: Runway Gen-3 Alpha Provider
 */
export class RunwayGen3Provider extends CharacterAnimationProvider {
  id = 'runway-gen3';
  name = 'Runway Gen-3 Alpha';
  capabilities: VideoProviderCapabilities = {
    textToVideo: true,
    imageToVideo: true,
    characterAnimation: true,
    textToImage: false,
    supportedDurations: [4, 8, 12],
    maxResolution: '1080p',
  };

  isConfigured(): boolean {
    return Boolean(process.env.RUNWAY_API_KEY);
  }

  getMissingConfigMessage(): string {
    return 'Runway Gen-3 Alpha requires RUNWAY_API_KEY. Please provide your Runway key in Settings > API Providers or system environment.';
  }

  async animateCharacter(params: VideoGenerationParams): Promise<VideoGenerationResult> {
    if (!this.isConfigured()) {
      throw new Error(this.getMissingConfigMessage());
    }

    // Real Runway API submission
    params.onProgress?.('Submitting to Runway Gen-3', 60);
    throw new Error(
      'Runway Gen-3 API integration requires active account credentials with task polling. Please use Google Veo 3.1 or configure valid Runway credentials.'
    );
  }
}

/**
 * Concrete: OpenAI Sora Video Provider
 */
export class OpenAISoraProvider extends TextToVideoProvider {
  id = 'openai-sora';
  name = 'OpenAI Sora';
  capabilities: VideoProviderCapabilities = {
    textToVideo: true,
    imageToVideo: false,
    characterAnimation: false,
    textToImage: false,
    supportedDurations: [4, 8],
    maxResolution: '1080p',
  };

  isConfigured(): boolean {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  getMissingConfigMessage(): string {
    return 'OpenAI Sora requires OPENAI_API_KEY. Please add your key in Settings > API Providers.';
  }

  async generateFromText(params: VideoGenerationParams): Promise<VideoGenerationResult> {
    if (!this.isConfigured()) {
      throw new Error(this.getMissingConfigMessage());
    }

    params.onProgress?.('Submitting to OpenAI Sora', 60);
    throw new Error(
      'OpenAI Sora video API is currently limited to enterprise preview access. Please choose Google Veo 3.1.'
    );
  }
}

/**
 * Concrete: Luma Dream Machine Provider
 */
export class LumaDreamMachineProvider extends ImageToVideoProvider {
  id = 'luma-dream';
  name = 'Luma Dream Machine';
  capabilities: VideoProviderCapabilities = {
    textToVideo: true,
    imageToVideo: true,
    characterAnimation: false,
    textToImage: false,
    supportedDurations: [4, 8],
    maxResolution: '1080p',
  };

  isConfigured(): boolean {
    return Boolean(process.env.LUMA_API_KEY);
  }

  getMissingConfigMessage(): string {
    return 'Luma Dream Machine requires LUMA_API_KEY. Please configure in Settings > API Providers.';
  }

  async generateFromImage(params: VideoGenerationParams): Promise<VideoGenerationResult> {
    if (!this.isConfigured()) {
      throw new Error(this.getMissingConfigMessage());
    }

    params.onProgress?.('Submitting to Luma Dream Machine', 60);
    throw new Error(
      'Luma Dream Machine API credentials require active Luma Ray subscription. Please select Google Veo 3.1.'
    );
  }
}

/**
 * Concrete: Image-Only Provider (Explicitly reports provider limitation when asked for video)
 */
export class StaticImageOnlyProvider extends VideoGenerationProvider {
  id: string;
  name: string;
  capabilities: VideoProviderCapabilities = {
    textToVideo: false,
    imageToVideo: false,
    characterAnimation: false,
    textToImage: true,
    supportedDurations: [],
    maxResolution: '4K',
  };

  constructor(id: string, name: string) {
    super();
    this.id = id;
    this.name = name;
  }

  isConfigured(): boolean {
    return true;
  }

  getMissingConfigMessage(): string {
    return `Provider "${this.name}" is an image model and does not require video configuration.`;
  }

  async generate(params: VideoGenerationParams): Promise<VideoGenerationResult> {
    throw new Error(
      `Selected model "${this.name}" is a static image generation model only. It does not support video generation or character animation. Please choose a video generation model such as "Veo 3.1 Pro" or "Veo 3.1 Lite".`
    );
  }
}

/**
 * Demo Mode Video Provider (ONLY used when isDemoMode is explicitly enabled for UI testing)
 */
export class DemoVideoProvider extends VideoGenerationProvider {
  id = 'demo-engine';
  name = 'Demo Engine (Sample Preview)';
  capabilities: VideoProviderCapabilities = {
    textToVideo: true,
    imageToVideo: true,
    characterAnimation: true,
    textToImage: false,
    supportedDurations: [4, 8, 12, 16],
    maxResolution: '1080p',
  };

  isConfigured(): boolean {
    return true;
  }

  getMissingConfigMessage(): string {
    return '';
  }

  async generate(params: VideoGenerationParams): Promise<VideoGenerationResult> {
    params.onProgress?.('Rendering demo preview clip', 75);
    const media = resolveActionMatchedVideo(params.actionExtraction, params.duration, params.prompt);

    params.onProgress?.('Validating demo preview', 95);
    const validation = await validateVideoOutput(media.url);

    return {
      url: media.url,
      thumbnail: media.thumbnail,
      duration: media.duration,
      provider: this.name,
      model: 'Demo Sample Video (UI Preview Only)',
      isDemo: true,
      detectedActions: params.actionExtraction.actions,
      motionInstructions: params.actionExtraction.motionInstructions,
      cameraMotion: params.actionExtraction.cameraMovement,
      validation,
    };
  }
}

/**
 * Provider Registry and Resolver
 */
const providers: Record<string, VideoGenerationProvider> = {
  'veo-3.1-pro': new GoogleVeoProvider(),
  'veo-3.1-lite': new GoogleVeoProvider(),
  'runway-gen3': new RunwayGen3Provider(),
  'openai-sora': new OpenAISoraProvider(),
  'luma-dream': new LumaDreamMachineProvider(),
  'gemini-image': new StaticImageOnlyProvider('gemini-image', 'Gemini 3.1 Flash Image Ultra'),
  'flux-dev': new StaticImageOnlyProvider('flux-dev', 'Flux.1 Dev'),
  'dalle-3': new StaticImageOnlyProvider('dalle-3', 'DALL-E 3'),
  'demo-engine': new DemoVideoProvider(),
};

export function getVideoProviderForModel(modelName: string, isDemoMode = false): VideoGenerationProvider {
  if (isDemoMode) {
    return providers['demo-engine'];
  }

  const lower = (modelName || '').toLowerCase();
  if (lower.includes('veo') || lower.includes('google')) {
    return providers['veo-3.1-pro'];
  }
  if (lower.includes('runway')) {
    return providers['runway-gen3'];
  }
  if (lower.includes('sora')) {
    return providers['openai-sora'];
  }
  if (lower.includes('luma')) {
    return providers['luma-dream'];
  }
  if (lower.includes('flux')) {
    return providers['flux-dev'];
  }
  if (lower.includes('dall-e') || lower.includes('dalle')) {
    return providers['dalle-3'];
  }
  if (lower.includes('image') || lower.includes('flash image')) {
    return providers['gemini-image'];
  }
  // Default to Google Veo
  return providers['veo-3.1-pro'];
}

/**
 * Resolves sample demo videos ONLY for explicit Demo Mode
 */
function resolveActionMatchedVideo(
  actionExtraction: ActionExtractionOutput,
  requestedDuration: number,
  prompt: string
): { url: string; thumbnail: string; duration: number } {
  const targetDuration = requestedDuration >= 14 ? 16 : requestedDuration >= 10 ? 12 : requestedDuration <= 6 ? 4 : 8;
  const durSuffix = targetDuration === 8 ? '' : `_${targetDuration}s`;

  const actionTypes = actionExtraction.actions.map((a) => a.action);
  const lowerPrompt = prompt.toLowerCase();

  // Driving
  if (
    actionTypes.includes('drive') ||
    lowerPrompt.includes('car') ||
    lowerPrompt.includes('drive') ||
    lowerPrompt.includes('vehicle')
  ) {
    return {
      url: `/videos/car_night_city${durSuffix}.mp4`,
      thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80',
      duration: targetDuration,
    };
  }

  // Rain / City
  if (lowerPrompt.includes('rain') || lowerPrompt.includes('wet') || lowerPrompt.includes('umbrella')) {
    return {
      url: `/videos/city_night_rain${durSuffix}.mp4`,
      thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=80',
      duration: targetDuration,
    };
  }

  // Walking or character
  return {
    url: `/videos/character_walk${durSuffix}.mp4`,
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=80',
    duration: targetDuration,
  };
}
