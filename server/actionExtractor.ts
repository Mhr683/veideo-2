import { GoogleGenAI } from '@google/genai';

export interface DetectedCharacterItem {
  id: string;
  name: string;
  description: string;
  appearance?: string;
  clothing?: string;
  anchor?: string;
}

export interface DetectedActionItem {
  action: string;
  type: string; // alias for backwards-compatibility with existing UI
  subject: string;
  description: string;
  order: number;
  start: number;
  end: number;
  bodyParts: string[];
}

export interface DetectedObjectItem {
  id: string;
  name: string;
  interaction?: string;
}

export interface ActionExtractionOutput {
  characters: DetectedCharacterItem[];
  detectedCharacters: DetectedCharacterItem[]; // alias for compatibility
  actions: DetectedActionItem[];
  objects: DetectedObjectItem[];
  environment: string;
  cameraMovement: string;
  cameraFraming: string;
  duration: number;
  motionIntensity: 'subtle' | 'natural' | 'dynamic';
  motionLevel: 'None' | 'Subtle' | 'Natural' | 'Dynamic'; // alias for compatibility
  motionInstructions: string;
  motionAwarePrompt: string;
}

interface ActionRule {
  type: string;
  pattern: RegExp;
  defaultDescription: string;
  bodyParts: string[];
  weight: number;
}

const ACTION_RULES: ActionRule[] = [
  {
    type: 'walk',
    pattern: /\b(walk|walking|walks|walked|stroll|strolling|stride|striding|approach|approaching|approaches)\b/i,
    defaultDescription: 'Walks forward with natural alternating leg strides, foot-to-ground contact, and synchronized arm swings',
    bodyParts: ['legs', 'feet', 'arms', 'torso'],
    weight: 2.5,
  },
  {
    type: 'stop',
    pattern: /\b(stop|stops|stopped|stopping|halt|halts|halted|halting|pause|pauses|paused|pausing|freeze|freezes)\b/i,
    defaultDescription: 'Decelerates forward stride, plants both feet firmly on ground, and stabilizes core posture in resting stance',
    bodyParts: ['legs', 'feet', 'torso', 'knees'],
    weight: 1.5,
  },
  {
    type: 'raise_hand',
    pattern: /\b(raise.*hand|raises.*hand|raising.*hand|raised.*hand|lift.*hand|lifts.*hand|lifting.*hand|lifted.*hand)\b/i,
    defaultDescription: 'Elevates arm from side, flexing shoulder and elbow smoothly, extending hand upward in front of torso',
    bodyParts: ['shoulder', 'arm', 'elbow', 'hand', 'fingers'],
    weight: 1.5,
  },
  {
    type: 'wave',
    pattern: /\b(wave|waves|waving|waved|wave.*hand|waving.*hand)\b/i,
    defaultDescription: 'Oscillates wrist and hand in a welcoming side-to-side cadence with relaxed fingers',
    bodyParts: ['wrist', 'hand', 'fingers', 'forearm'],
    weight: 2,
  },
  {
    type: 'smile',
    pattern: /\b(smile|smiles|smiling|smiled|grin|grins|grinning|grinned|laugh|laughs|laughing|smirk)\b/i,
    defaultDescription: 'Contraction of zygomatic muscles elevates lip corners, engaging cheeks and eyes in a warm genuine expression',
    bodyParts: ['lips', 'mouth', 'cheeks', 'eyes'],
    weight: 1.5,
  },
  {
    type: 'sit',
    pattern: /\b(sit|sitting|sits|sat|sit down|sits down|seating|take a seat)\b/i,
    defaultDescription: 'Shifts center of gravity backward, smoothly flexes knees and hips, and lowers torso into seated posture',
    bodyParts: ['legs', 'hips', 'knees', 'torso', 'hands'],
    weight: 2,
  },
  {
    type: 'open_laptop',
    pattern: /\b(open.*laptop|opens.*laptop|opening.*laptop|opened.*laptop)\b/i,
    defaultDescription: 'Positions hands at screen edge, grips top bevel of clamshell lid, and lifts screen smoothly into upright operating position',
    bodyParts: ['hands', 'fingers', 'wrists', 'arms'],
    weight: 2,
  },
  {
    type: 'type',
    pattern: /\b(type|typing|types|typed|keyboard|code|coding)\b/i,
    defaultDescription: 'Hovers hands over keyboard keys, fingers articulating independently and rhythmically striking keys with tactile precision',
    bodyParts: ['hands', 'fingers', 'wrists', 'eyes'],
    weight: 2.5,
  },
  {
    type: 'drink',
    pattern: /\b(drink|drinking|drinks|drank|sip|sipping|sips|sipped)\b/i,
    defaultDescription: 'Reaches toward cup, clasps handle with fingers, raises vessel smoothly to lips, tilts rim, swallows, and returns cup to table',
    bodyParts: ['hand', 'fingers', 'arm', 'lips', 'neck', 'jaw'],
    weight: 3,
  },
  {
    type: 'open_umbrella',
    pattern: /\b(open.*umbrella|opens.*umbrella|opening.*umbrella|opened.*umbrella)\b/i,
    defaultDescription: 'Reaches toward umbrella handle, slides runner upward along shaft until canopy locks fully open overhead, and holds umbrella steady',
    bodyParts: ['hands', 'fingers', 'arms', 'shoulders'],
    weight: 2.5,
  },
  {
    type: 'run',
    pattern: /\b(run|running|runs|ran|sprint|sprinting|jog|jogging|dash|dashing)\b/i,
    defaultDescription: 'Accelerates into running gait with rapid knee drive, aggressive arm pumping, and slight forward torso lean',
    bodyParts: ['legs', 'arms', 'torso', 'head'],
    weight: 2.5,
  },
  {
    type: 'talk',
    pattern: /\b(talk|talking|talks|talked|speak|speaking|speaks|spoke|say|saying|chat|chatting|whisper)\b/i,
    defaultDescription: 'Articulates lips and jaw with realistic speech phonemes, accompanied by eyebrow micro-expressions and subtle head nodding',
    bodyParts: ['lips', 'mouth', 'jaw', 'eyes', 'head'],
    weight: 2.5,
  },
  {
    type: 'look',
    pattern: /\b(look|looking|looks|looked|gaze|gazing|gazes|stare|staring|glance|glancing|scan|scanning)\b/i,
    defaultDescription: 'Shifts focal gaze direction with natural eye saccades and calibrated neck tilt',
    bodyParts: ['eyes', 'head', 'neck'],
    weight: 1.5,
  },
  {
    type: 'turn_head',
    pattern: /\b(turn.*head|turning.*head|turns.*head|turned.*head|look back|look around|looks over shoulder)\b/i,
    defaultDescription: 'Rotates cervical spine and neck smoothly to orient face toward focal subject or ambient sound',
    bodyParts: ['neck', 'head', 'eyes'],
    weight: 1.5,
  },
  {
    type: 'point',
    pattern: /\b(point|pointing|points|pointed|gestures toward|indicating)\b/i,
    defaultDescription: 'Raises arm forward, extends index finger firmly toward focal object, locking eye gaze along line of sight',
    bodyParts: ['arm', 'index finger', 'hand', 'eyes'],
    weight: 1.5,
  },
  {
    type: 'open_door',
    pattern: /\b(open.*door|opening.*door|opens.*door|opened.*door|push.*door|pull.*door)\b/i,
    defaultDescription: 'Extends arm toward door handle, depresses latch, and pushes or pulls door frame open while stepping through',
    bodyParts: ['hand', 'arm', 'torso', 'legs'],
    weight: 2,
  },
  {
    type: 'use_phone',
    pattern: /\b(phone|smartphone|mobile|text|texting|texts|scroll|scrolling|call|calling)\b/i,
    defaultDescription: 'Elevates smartphone to chest height, thumb swipes and taps across capacitive glass, eyes tracking screen glow',
    bodyParts: ['hands', 'thumbs', 'fingers', 'eyes', 'head'],
    weight: 2.5,
  },
  {
    type: 'drive',
    pattern: /\b(drive|driving|drives|drove|steering|steer|accelerate|accelerating)\b/i,
    defaultDescription: 'Hands grip steering wheel at 9 and 3 o-clock positions, turning through bends, head scanning mirrors and road ahead',
    bodyParts: ['hands', 'arms', 'shoulders', 'eyes', 'feet'],
    weight: 3,
  },
  {
    type: 'fight',
    pattern: /\b(fight|fighting|fights|punch|punching|punches|kick|kicking|kicks|block|dodge)\b/i,
    defaultDescription: 'Engages combat posture, executes decisive kinetic martial strike, and rotates hips into defensive guard',
    bodyParts: ['arms', 'fists', 'legs', 'torso', 'head'],
    weight: 2.5,
  },
  {
    type: 'react',
    pattern: /\b(react|reacting|reacts|gasps|gasping|surprised|shocked|amazed|startled)\b/i,
    defaultDescription: 'Pupils dilate, eyebrows raise sharply, mouth opens in genuine shock, and shoulders tense backward',
    bodyParts: ['eyes', 'mouth', 'shoulders', 'torso'],
    weight: 1.5,
  },
  {
    type: 'breathe',
    pattern: /\b(breathe|breathing|breathes|exhale|exhaling|inhale|inhaling|sigh)\b/i,
    defaultDescription: 'Steady expansion of chest ribcage and subtle shoulder rise on inhalation, relaxing downward on exhalation',
    bodyParts: ['chest', 'shoulders', 'torso'],
    weight: 1.5,
  },
];

export async function extractActionPipeline(
  prompt: string,
  duration = 8,
  aiClient: GoogleGenAI | null = null,
  options: {
    motionLevel?: 'None' | 'Subtle' | 'Natural' | 'Dynamic';
    cameraMotion?: 'Auto' | 'Static' | 'Cinematic' | 'Dynamic';
    characterAnimation?: 'Auto' | 'Enabled' | 'Disabled';
    characters?: any[];
  } = {}
): Promise<ActionExtractionOutput> {
  const motionLevel = options.motionLevel || 'Natural';
  const cameraSetting = options.cameraMotion || 'Cinematic';

  // 1. Attempt AI-driven structured semantic action extraction
  if (aiClient) {
    for (const model of ['gemini-3.8-flash', 'gemini-3.6-flash']) {
      try {
        const charContext = options.characters?.length
          ? `Known characters in project: ${options.characters.map((c) => `${c.name} (${c.appearance || ''}, ${c.clothing || ''})`).join('; ')}`
          : 'No predefined character.';

        const systemPrompt = `You are an elite Action & Kinetic Motion Extraction Engine for an AI Video Studio.
Analyze the user's video prompt. Break down the scene into:
1. "characters": array of { "id": string, "name": string, "description": string, "appearance": string, "clothing": string, "anchor": string }
2. "objects": array of { "id": string, "name": string, "interaction": string }
3. "environment": string describing background, lighting, and ambient setting
4. "cameraMovement": string describing ONLY camera motion (dolly, pan, tracking, static) - NEVER replacing character motion
5. "cameraFraming": string (e.g. "Medium Shot", "Eye-Level Close-Up", "Full Body Wide Shot")
6. "motionIntensity": "subtle" | "natural" | "dynamic"
7. "actions": array of sequential actions: { "action": string, "subject": string, "description": string, "order": number, "start": number, "end": number, "bodyParts": string[] }
8. "motionInstructions": step-by-step frame-by-frame physical breakdown for each second
9. "motionAwarePrompt": highly detailed sequential prompt optimized for video generation models, specifying exact character movements, limb positions, object interactions, and continuous kinetics from second 0 to end. Do not use generic phrases alone.

Return valid JSON matching this schema exactly.`;

        const res = await aiClient.models.generateContent({
          model,
          contents: `User Prompt: "${prompt}". Total Duration: ${duration} seconds. Desired Motion: ${motionLevel}. Camera: ${cameraSetting}. ${charContext}`,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          },
        });

        if (res.text) {
          const parsed = JSON.parse(res.text);
          if (Array.isArray(parsed.actions) && parsed.actions.length > 0) {
            const mappedActions: DetectedActionItem[] = parsed.actions.map((a: any, i: number) => ({
              action: a.action || a.type || 'motion',
              type: a.action || a.type || 'motion',
              subject: a.subject || parsed.characters?.[0]?.name || 'Primary Character',
              description: a.description || 'Natural physical motion',
              order: a.order || i + 1,
              start: Number(a.start) || 0,
              end: Number(a.end) || duration,
              bodyParts: Array.isArray(a.bodyParts) ? a.bodyParts : ['body'],
            }));

            const mappedChars: DetectedCharacterItem[] = (parsed.characters || []).map((c: any, i: number) => ({
              id: c.id || `char_${i + 1}`,
              name: c.name || 'Primary Character',
              description: c.description || 'Subject of the scene',
              appearance: c.appearance || 'Photorealistic human subject',
              clothing: c.clothing || 'Cinematic wardrobe',
              anchor: c.anchor || `Preserve identical biometric facial structure, hairstyle, and wardrobe of ${c.name || 'character'} across all frames`,
            }));

            if (mappedChars.length === 0) {
              mappedChars.push({
                id: 'char_1',
                name: 'Primary Subject',
                description: 'Main protagonist',
                anchor: 'Preserve identical facial features and clothing across all frames',
              });
            }

            return {
              characters: mappedChars,
              detectedCharacters: mappedChars,
              actions: mappedActions,
              objects: Array.isArray(parsed.objects) ? parsed.objects : [],
              environment: parsed.environment || 'Cinematic atmosphere with natural lighting',
              cameraMovement: parsed.cameraMovement || (cameraSetting === 'Static' ? 'Locked tripod shot at eye level' : 'Smooth tracking dolly shot'),
              cameraFraming: parsed.cameraFraming || 'Medium Shot framing character action',
              duration,
              motionIntensity: (parsed.motionIntensity?.toLowerCase() as any) || (motionLevel.toLowerCase() as any) || 'natural',
              motionLevel,
              motionInstructions: parsed.motionInstructions || '',
              motionAwarePrompt: parsed.motionAwarePrompt || prompt,
            };
          }
        }
      } catch (err: any) {
        // Continue to next model or fallback
      }
    }
  }

  // 2. High-precision deterministic fallback parser
  return ruleBasedActionExtraction(prompt, duration, motionLevel, cameraSetting, options.characters);
}

function ruleBasedActionExtraction(
  prompt: string,
  duration: number,
  motionLevel: 'None' | 'Subtle' | 'Natural' | 'Dynamic',
  cameraSetting: 'Auto' | 'Static' | 'Cinematic' | 'Dynamic',
  existingCharacters: any[] = []
): ActionExtractionOutput {
  // 1. Detect Character & Identity
  const characters: DetectedCharacterItem[] = [];
  for (const c of existingCharacters) {
    if (new RegExp(`\\b${c.name}\\b`, 'i').test(prompt)) {
      characters.push({
        id: c.id || `char_${characters.length + 1}`,
        name: c.name,
        description: c.description || c.name,
        appearance: c.appearance,
        clothing: c.clothing,
        anchor: c.consistencyAnchor || `Preserve identical facial features, hairstyle, and clothing of ${c.name} across all frames`,
      });
    }
  }

  if (characters.length === 0) {
    const subMatch = prompt.match(/\b(young|elderly|tall|short)?\s*(man|woman|person|girl|boy|detective|operative|astronaut|driver|doctor|engineer|artist)\b/i);
    const subjectName = subMatch ? subMatch[0].trim() : 'young man';
    characters.push({
      id: 'char_1',
      name: subjectName,
      description: `A ${subjectName} appearing as the primary focal subject`,
      appearance: `Photorealistic ${subjectName}, symmetrical facial structure, natural eye color and skin texture`,
      clothing: 'Clean cinematic contemporary wardrobe, high fabric detail',
      anchor: `Preserve identical biometric facial structure, hairstyle, and wardrobe of ${subjectName} continuously across all video frames without morphing`,
    });
  }

  const primaryChar = characters[0].name;

  // 2. Detect Objects
  const objects: DetectedObjectItem[] = [];
  if (/\bumbrella\b/i.test(prompt)) {
    objects.push({ id: 'obj_umbrella', name: 'umbrella', interaction: 'gripped by handle, runner slid upward, canopy opened overhead' });
  }
  if (/\b(laptop|computer|macbook)\b/i.test(prompt)) {
    objects.push({ id: 'obj_laptop', name: 'laptop', interaction: 'clamshell opened upward, keys articulated by typing fingers' });
  }
  if (/\b(desk|table)\b/i.test(prompt)) {
    objects.push({ id: 'obj_desk', name: 'desk', interaction: 'workspace approached and used' });
  }
  if (/\b(chair|seat)\b/i.test(prompt)) {
    objects.push({ id: 'obj_chair', name: 'chair', interaction: 'sat upon with controlled center of gravity' });
  }
  if (/\b(coffee|cup|mug|tea|drink|glass)\b/i.test(prompt)) {
    objects.push({ id: 'obj_cup', name: 'beverage cup', interaction: 'held by handle, lifted to lips, sipped, and lowered' });
  }
  if (/\b(phone|smartphone)\b/i.test(prompt)) {
    objects.push({ id: 'obj_phone', name: 'smartphone', interaction: 'held in hand, swiped by thumb' });
  }
  if (/\bdoor\b/i.test(prompt)) {
    objects.push({ id: 'obj_door', name: 'door', interaction: 'handle unlatched and pushed or pulled open' });
  }

  // 3. Match Actions and sort them by appearance in the prompt
  interface MatchedAction {
    rule: ActionRule;
    index: number;
  }

  const matched: MatchedAction[] = [];
  for (const rule of ACTION_RULES) {
    const match = prompt.match(rule.pattern);
    if (match && match.index !== undefined) {
      matched.push({ rule, index: match.index });
    }
  }

  // Sort by sentence order
  matched.sort((a, b) => a.index - b.index);

  // If no action matched, provide sensible contextual actions
  if (matched.length === 0) {
    if (/desk|office|chair|seat/i.test(prompt)) {
      matched.push({ rule: ACTION_RULES.find((a) => a.type === 'sit')!, index: 0 });
      matched.push({ rule: ACTION_RULES.find((a) => a.type === 'type')!, index: 1 });
    } else if (/drink|coffee|tea|mug|cup/i.test(prompt)) {
      matched.push({ rule: ACTION_RULES.find((a) => a.type === 'drink')!, index: 0 });
    } else {
      matched.push({ rule: ACTION_RULES.find((a) => a.type === 'walk')!, index: 0 });
      matched.push({ rule: ACTION_RULES.find((a) => a.type === 'look')!, index: 1 });
    }
  }

  // 4. Build sequential action timeline
  const totalWeight = matched.reduce((sum, m) => sum + m.rule.weight, 0);
  let cur = 0;
  const actions: DetectedActionItem[] = matched.map((m, i) => {
    const isLast = i === matched.length - 1;
    const dur = isLast
      ? Math.max(1, duration - cur)
      : Math.round(((m.rule.weight / totalWeight) * duration) * 10) / 10;
    const start = cur;
    const end = Math.min(duration, Math.round((cur + dur) * 10) / 10);
    cur = end;

    return {
      action: m.rule.type,
      type: m.rule.type,
      subject: primaryChar,
      description: `${primaryChar}: ${m.rule.defaultDescription}`,
      order: i + 1,
      start,
      end,
      bodyParts: m.rule.bodyParts,
    };
  });

  // 5. Build Environment
  let environment = 'Photorealistic setting with cinematic atmospheric lighting';
  if (/rain|wet|puddle/i.test(prompt)) {
    environment = 'Rainy outdoor environment with continuous falling rain, reflective wet asphalt, and soft ambient misty haze';
  } else if (/office|desk|room|indoor/i.test(prompt)) {
    environment = 'Modern interior room with balanced architectural lighting, clean desk setup, and natural window illumination';
  } else if (/neon|cyberpunk|night/i.test(prompt)) {
    environment = 'Atmospheric night city with vibrant neon signs casting colorful specular reflections on surfaces';
  }

  // 6. Camera Movement & Framing
  let cameraMovement = 'Smooth 35mm anamorphic tracking dolly following character kinematics';
  let cameraFraming = 'Medium Full Shot framing subject actions clearly';
  switch (cameraSetting) {
    case 'Static':
      cameraMovement = 'Locked camera position on solid tripod framing subject at eye-level with pristine optical stability';
      cameraFraming = 'Eye-Level Medium Shot';
      break;
    case 'Dynamic':
      cameraMovement = 'Kinetic tracking shot maintaining focal distance with natural cinematic parallax and momentum';
      cameraFraming = 'Low-Angle Medium Shot';
      break;
    case 'Cinematic':
    default:
      cameraMovement = 'Smooth 35mm anamorphic dolly tracking following character kinematics with subtle depth-of-field separation';
      cameraFraming = 'Eye-Level Medium Shot';
      break;
  }

  // 7. Motion Instructions
  const motionLines = actions.map(
    (a) =>
      `Phase ${a.order} [${a.start}s - ${a.end}s] ${a.action.toUpperCase()}: ${a.description}. Continuous motion in ${a.bodyParts.join(', ')}.`
  );
  const motionInstructions = `CHOREOGRAPHY & FRAME-BY-FRAME ACTION TIMELINE (${duration}s):\n${motionLines.join('\n')}\nSecondary kinetics: Natural organic breathing cycle, rhythmic blinking, and lifelike physics throughout the entire shot.`;

  // 8. Motion-Aware Prompt (Strictly preserving sequence and physical actions)
  const actionSequenceText = actions
    .map((a) => `(Step ${a.order}) ${a.action.replace('_', ' ')} from ${a.start}s to ${a.end}s: ${a.description}`)
    .join('. ');

  const motionAwarePrompt = `Cinematic video shot (${duration} seconds).
Character: "${primaryChar}". Maintain exact biometric facial structure, hairstyle, and clothing consistently across all frames without visual drifting.
Action Sequence: ${actionSequenceText}.
Kinematics: Realistic continuous human body and limb movements across every single second. As ${primaryChar} performs each action, ensure natural physics, foot contact, arm articulation, and subtle facial micro-expressions. Do not generate a still or frozen frame.
Environment: ${environment}.
Camera: ${cameraMovement}. ${cameraFraming}. Masterpiece cinematography, natural temporal coherence, 24fps motion cadence.`;

  return {
    characters,
    detectedCharacters: characters,
    actions,
    objects,
    environment,
    cameraMovement,
    cameraFraming,
    duration,
    motionIntensity: (motionLevel.toLowerCase() as any) || 'natural',
    motionLevel,
    motionInstructions,
    motionAwarePrompt,
  };
}
