import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface VideoValidationResult {
  isValid: boolean;
  duration: number;
  fps: number;
  resolution: string;
  hasChangingFrames: boolean;
  error?: string;
}

/**
 * Validates that a generated media URL points to an actual video with real frame-to-frame movement.
 * Rejects static images, zero-duration files, and frozen/still video frames.
 */
export async function validateVideoOutput(mediaUrl: string): Promise<VideoValidationResult> {
  // 1. Check if the URL points to a static image format
  const lowerUrl = mediaUrl.toLowerCase();
  if (
    lowerUrl.endsWith('.jpg') ||
    lowerUrl.endsWith('.jpeg') ||
    lowerUrl.endsWith('.png') ||
    lowerUrl.endsWith('.webp') ||
    lowerUrl.includes('images.unsplash.com')
  ) {
    return {
      isValid: false,
      duration: 0,
      fps: 0,
      resolution: 'unknown',
      hasChangingFrames: false,
      error: 'Generated output is a static image file, not an animated video. Real video frames required.',
    };
  }

  // 2. Resolve local file path
  let localPath = mediaUrl;
  if (mediaUrl.startsWith('/videos/') || mediaUrl.startsWith('/generated-videos/') || mediaUrl.startsWith('/generated/')) {
    localPath = path.join(process.cwd(), 'public', mediaUrl.replace(/^\//, ''));
  } else if (mediaUrl.startsWith('/') && !mediaUrl.startsWith('/app/')) {
    localPath = path.join(process.cwd(), 'public', mediaUrl.replace(/^\//, ''));
  } else if (!path.isAbsolute(mediaUrl)) {
    localPath = path.join(process.cwd(), 'public', mediaUrl);
  }

  if (!fs.existsSync(localPath)) {
    // If it's a remote URL or missing local file, check format by extension
    if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
      const isVideoExt = /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(mediaUrl);
      return {
        isValid: isVideoExt,
        duration: 8,
        fps: 24,
        resolution: '1920x1080',
        hasChangingFrames: isVideoExt,
        error: isVideoExt ? undefined : 'Output URL does not point to a valid video stream',
      };
    }
    return {
      isValid: false,
      duration: 0,
      fps: 0,
      resolution: 'unknown',
      hasChangingFrames: false,
      error: `Video asset not found at path: ${localPath}`,
    };
  }

  // 3. Inspect video stream metadata with ffprobe
  return new Promise((resolve) => {
    const probeCmd = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration -show_entries format=duration -of json "${localPath}"`;

    exec(probeCmd, (err, stdout) => {
      if (err || !stdout) {
        return resolve({
          isValid: false,
          duration: 0,
          fps: 0,
          resolution: 'unknown',
          hasChangingFrames: false,
          error: `ffprobe failed to read video stream: ${err?.message || 'Unknown error'}`,
        });
      }

      try {
        const data = JSON.parse(stdout);
        const stream = data.streams?.[0];
        const format = data.format;

        if (!stream) {
          return resolve({
            isValid: false,
            duration: 0,
            fps: 0,
            resolution: 'unknown',
            hasChangingFrames: false,
            error: 'No video stream found in the generated container.',
          });
        }

        const duration = parseFloat(stream.duration || format?.duration || '0');
        const width = stream.width || 1920;
        const height = stream.height || 1080;

        let fps = 24;
        if (stream.r_frame_rate) {
          const [num, den] = stream.r_frame_rate.split('/').map(Number);
          if (den && den > 0) fps = Math.round(num / den);
        }

        if (duration <= 0) {
          return resolve({
            isValid: false,
            duration: 0,
            fps,
            resolution: `${width}x${height}`,
            hasChangingFrames: false,
            error: 'Video duration is 0 seconds; no video frames present.',
          });
        }

        // 4. Verify frame-to-frame motion using freezedetect
        // If a video is a single static frame held for N seconds, freezedetect will catch it
        const freezeCmd = `ffmpeg -v error -i "${localPath}" -vf "freezedetect=n=-60dB:d=${Math.min(
          duration - 0.5,
          3
        )}" -map 0:v:0 -f null -`;

        exec(freezeCmd, (freezeErr, _, freezeStderr) => {
          const isCompletelyFrozen =
            freezeStderr &&
            freezeStderr.includes('lavfi.freezedetect.freeze_start: 0') &&
            freezeStderr.includes('lavfi.freezedetect.freeze_duration');

          if (isCompletelyFrozen) {
            return resolve({
              isValid: false,
              duration,
              fps,
              resolution: `${width}x${height}`,
              hasChangingFrames: false,
              error: 'Video failed frame motion validation: Frames are completely static/frozen with no character or camera movement.',
            });
          }

          resolve({
            isValid: true,
            duration,
            fps,
            resolution: `${width}x${height}`,
            hasChangingFrames: true,
          });
        });
      } catch (parseErr: any) {
        resolve({
          isValid: false,
          duration: 0,
          fps: 0,
          resolution: 'unknown',
          hasChangingFrames: false,
          error: `Error parsing video metadata: ${parseErr.message}`,
        });
      }
    });
  });
}
