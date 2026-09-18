import { DetectedAction, Character } from '../types';

export interface ActionExtractionResult {
  detectedCharacters: Array<{
    name: string;
    description?: string;
    appearance?: string;
    clothing?: string;
    anchor?: string;
  }>;
  actions: DetectedAction[];
  motionInstructions: string;
  cameraMotion: string;
  motionAwarePrompt: string;
  characterConsistencyDirective: string;
  motionLevel: 'None' | 'Subtle' | 'Natural' | 'Dynamic';
}

interface ActionRule {
  type: string;
  pattern: RegExp;
  defaultDescription: string;
  bodyParts: string[];
  durationWeight: number; // relative time taken
}

export const KNOWN_ACTIONS: ActionRule[] = [
  {
    type: 'walk',
    pattern: /\b(walk|walking|walks|walked|stroll|strolling|stride|striding|marches|marching)\b/i,
    defaultDescription: 'Walks forward with a natural alternating leg stride and synchronized arm swings',
    bodyParts: ['legs', 'arms', 'torso', 'feet'],
    durationWeight: 3,
  },
  {
    type: 'run',
    pattern: /\b(run|running|runs|ran|sprint|sprinting|jog|jogging|dash|dashing)\b/i,
    defaultDescription: 'Runs at accelerated pace with rapid leg extension, bent elbows, and forward torso lean',
    bodyParts: ['legs', 'arms', 'torso', 'head'],
    durationWeight: 2.5,
  },
  {
    type: 'jump',
    pattern: /\b(jump|jumping|jumps|jumped|leap|leaping|hop|hopping|vault|vaulting)\b/i,
    defaultDescription: 'Crouches slightly to load momentum, springs upward off feet, and lands absorbing impact',
    bodyParts: ['legs', 'knees', 'feet', 'arms', 'torso'],
    durationWeight: 1.5,
  },
  {
    type: 'sit',
    pattern: /\b(sit|sitting|sits|sat|sit down|sits down|seating|take a seat)\b/i,
    defaultDescription: 'Approaches seat, bends knees smoothly, lowers hips, and settles into sitting posture',
    bodyParts: ['legs', 'hips', 'torso', 'hands'],
    durationWeight: 2,
  },
  {
    type: 'stand',
    pattern: /\b(stand|standing|stands|stood|stand up|stands up|rises|rising|rise up)\b/i,
    defaultDescription: 'Pushes upward through legs, straightens posture, and comes to balanced upright stance',
    bodyParts: ['legs', 'knees', 'torso', 'shoulders'],
    durationWeight: 2,
  },
  {
    type: 'talk',
    pattern: /\b(talk|talking|talks|talked|speak|speaking|speaks|spoke|say|saying|chat|chatting|conversing|whisper|whispering)\b/i,
    defaultDescription: 'Articulates mouth and lips with speech phonemes, accompanied by expressive brow and subtle head nodding',
    bodyParts: ['mouth', 'lips', 'jaw', 'eyes', 'head'],
    durationWeight: 3,
  },
  {
    type: 'look',
    pattern: /\b(look|looking|looks|looked|gaze|gazing|gazes|stare|staring|glance|glancing|scan|scanning)\b/i,
    defaultDescription: 'Shifts gaze direction with focused eye saccades and slight head realignment',
    bodyParts: ['eyes', 'head', 'neck'],
    durationWeight: 1.5,
  },
  {
    type: 'turn_head',
    pattern: /\b(turn head|turning head|turns head|turned head|look back|look around|looks over shoulder)\b/i,
    defaultDescription: 'Rotates neck and head smoothly to face a new focal point with tracking eye movement',
    bodyParts: ['neck', 'head', 'eyes'],
    durationWeight: 1.5,
  },
  {
    type: 'blink',
    pattern: /\b(blink|blinking|blinks|wink|winking|winks)\b/i,
    defaultDescription: 'Natural organic eyelid blinks to maintain lifelike consciousness and gaze hydration',
    bodyParts: ['eyelids', 'eyes'],
    durationWeight: 1,
  },
  {
    type: 'smile',
    pattern: /\b(smile|smiling|smiles|smiled|grin|grinning|grins|laugh|laughing|laughs|smirk|smirking)\b/i,
    defaultDescription: 'Zygomatic facial muscles contract, lifting mouth corners and creating natural crinkles near eye corners',
    bodyParts: ['mouth', 'cheeks', 'eyes', 'facial muscles'],
    durationWeight: 2,
  },
  {
    type: 'wave',
    pattern: /\b(wave|waving|waves|waved|wave hand|waving hand)\b/i,
    defaultDescription: 'Lifts forearm and hand to shoulder height, oscillating wrist and open palm side-to-side',
    bodyParts: ['arm', 'wrist', 'hand', 'fingers'],
    durationWeight: 2,
  },
  {
    type: 'point',
    pattern: /\b(point|pointing|points|pointed|gestures toward|indicating)\b/i,
    defaultDescription: 'Raises dominant arm, extends index finger toward target subject, and locks sightline',
    bodyParts: ['arm', 'index finger', 'hand', 'eyes'],
    durationWeight: 1.5,
  },
  {
    type: 'type',
    pattern: /\b(type|typing|types|typed|keyboard|computer|code|coding)\b/i,
    defaultDescription: 'Hovers hands over keyboard, articulates independent fingers striking keys with rapid dexterity',
    bodyParts: ['hands', 'fingers', 'wrists', 'eyes'],
    durationWeight: 3.5,
  },
  {
    type: 'write',
    pattern: /\b(write|writing|writes|wrote|pen|pencil|sketch|sketching|notes)\b/i,
    defaultDescription: 'Holds pen with precision grip, moving hand and nib across surface in micro-movements',
    bodyParts: ['fingers', 'hand', 'wrist', 'arm'],
    durationWeight: 2.5,
  },
  {
    type: 'drink',
    pattern: /\b(drink|drinking|drinks|drank|sip|sipping|sips|coffee|tea|water|cup|glass|mug)\b/i,
    defaultDescription: 'Extends arm toward cup, grips handle, raises container smoothly to lips, tilts, sips, and returns container',
    bodyParts: ['hand', 'arm', 'lips', 'neck', 'jaw'],
    durationWeight: 3,
  },
  {
    type: 'eat',
    pattern: /\b(eat|eating|eats|ate|bite|biting|bites|chew|chewing|snack)\b/i,
    defaultDescription: 'Brings food item toward mouth, opens jaw, takes bite, and chews with natural rhythmic jaw motion',
    bodyParts: ['hand', 'arm', 'mouth', 'jaw'],
    durationWeight: 3,
  },
  {
    type: 'open_door',
    pattern: /\b(open.*door|opening.*door|opens.*door|opened.*door|push.*door|pull.*door)\b/i,
    defaultDescription: 'Reaches toward door handle, grasps latch, turns or pulls handle, and swings door panel open',
    bodyParts: ['hand', 'arm', 'torso', 'legs'],
    durationWeight: 2.5,
  },
  {
    type: 'close_door',
    pattern: /\b(close.*door|closing.*door|closes.*door|shut.*door|shutting.*door)\b/i,
    defaultDescription: 'Catches door edge with palm, pushes door firmly into jamb until latch engages',
    bodyParts: ['hand', 'arm', 'torso'],
    durationWeight: 2,
  },
  {
    type: 'pick_up',
    pattern: /\b(pick up|picking up|picks up|picked up|grab|grabbing|grabs|lift|lifting|lifts|take|takes|hold|holds|holding)\b/i,
    defaultDescription: 'Reaches down toward object, closes fingers securely around surface, and lifts into carrying position',
    bodyParts: ['arm', 'hand', 'fingers', 'torso'],
    durationWeight: 2,
  },
  {
    type: 'put_down',
    pattern: /\b(put down|putting down|puts down|set down|sets down|place|placing|places|drop|dropping)\b/i,
    defaultDescription: 'Lowers carried item steadily onto surface, releases finger grip, and withdraws hand',
    bodyParts: ['arm', 'hand', 'fingers'],
    durationWeight: 2,
  },
  {
    type: 'use_phone',
    pattern: /\b(phone|smartphone|mobile|text|texting|texts|scroll|scrolling|call|calling|screen)\b/i,
    defaultDescription: 'Holds smartphone at chest height, thumb swipes across glass screen, eyes track illuminated display',
    bodyParts: ['hands', 'thumbs', 'fingers', 'eyes', 'head'],
    durationWeight: 3,
  },
  {
    type: 'drive',
    pattern: /\b(drive|driving|drives|drove|steering|steer|accelerate|accelerating|car|vehicle)\b/i,
    defaultDescription: 'Grips steering wheel with two hands, rotates wheel through turns, eyes monitor roadway reflections',
    bodyParts: ['hands', 'arms', 'shoulders', 'eyes', 'feet'],
    durationWeight: 3.5,
  },
  {
    type: 'dance',
    pattern: /\b(dance|dancing|dances|danced|twirl|twirling|groove|grooving|waltz|rhythm)\b/i,
    defaultDescription: 'Moves body in rhythmic tempo with shifting footwork, fluid arm extensions, and torso swaying',
    bodyParts: ['legs', 'feet', 'hips', 'torso', 'arms', 'head'],
    durationWeight: 3.5,
  },
  {
    type: 'fight',
    pattern: /\b(fight|fighting|fights|fought|punch|punching|punches|kick|kicking|kicks|block|blocking|dodge|dodging|strike|striking)\b/i,
    defaultDescription: 'Assumes combat stance, executes rapid dynamic strike or defensive block with balanced weight transfer',
    bodyParts: ['arms', 'fists', 'legs', 'torso', 'head'],
    durationWeight: 2.5,
  },
  {
    type: 'react',
    pattern: /\b(react|reacting|reacts|gasps|gasping|surprised|shocked|amazed|startled|astonished)\b/i,
    defaultDescription: 'Eyes widen suddenly, mouth opens in a sharp gasp, shoulders pull back in visceral reaction',
    bodyParts: ['eyes', 'mouth', 'shoulders', 'breath'],
    durationWeight: 1.5,
  },
  {
    type: 'breathe',
    pattern: /\b(breathe|breathing|breathes|exhale|exhaling|inhale|inhaling|sigh|sighing)\b/i,
    defaultDescription: 'Rhythmic expansion and descent of chest and shoulders conveying organic biological life',
    bodyParts: ['chest', 'shoulders', 'torso', 'lungs'],
    durationWeight: 2,
  },
  {
    type: 'gesture',
    pattern: /\b(gesture|gesturing|gestures|hand gesture|hands moving|shrug|shrugging|expressive hands)\b/i,
    defaultDescription: 'Expressive hand movements emphasizing narrative beats with open palms and articulated fingers',
    bodyParts: ['hands', 'wrists', 'arms', 'fingers'],
    durationWeight: 2,
  },
];

/**
 * Extracts characters from prompt and cross-references with consistency bank
 */
export function extractCharactersFromPrompt(
  prompt: string,
  existingCharacters: Character[] = []
): Array<{ name: string; appearance?: string; clothing?: string; anchor?: string }> {
  const result: Array<{ name: string; appearance?: string; clothing?: string; anchor?: string }> = [];

  // 1. Check existing characters by name match
  for (const char of existingCharacters) {
    const nameRegex = new RegExp(`\\b${char.name}\\b`, 'i');
    if (nameRegex.test(prompt)) {
      result.push({
        name: char.name,
        appearance: char.appearance,
        clothing: char.clothing,
        anchor: char.consistencyAnchor || char.description,
      });
    }
  }

  // 2. If no matched character from bank, extract generic subject descriptions
  if (result.length === 0) {
    const subjectPatterns = [
      /\b(a|an|the)?\s*([a-z]+(?:\s+[a-z]+)?)\s+(man|woman|person|girl|boy|detective|soldier|astronaut|scientist|warrior|robot|cyborg|creature|driver|runner|officer|pilot)\b/i,
      /\b(young|elderly|tall|mysterious|cyberpunk|athletic)?\s*(man|woman|person|individual|child)\b/i,
    ];

    for (const pat of subjectPatterns) {
      const match = prompt.match(pat);
      if (match) {
        const fullSubject = match[0].trim().replace(/^(a|an|the)\s+/i, '');
        result.push({
          name: fullSubject,
          appearance: `Consistent ${fullSubject} features, realistic anatomy and facial symmetry`,
          clothing: 'Cinematic wardrobe consistent across all frames',
          anchor: `Maintain identical biometric features, face shape, hair color and clothing for ${fullSubject}`,
        });
        break;
      }
    }
  }

  // Default subject if completely generic
  if (result.length === 0) {
    result.push({
      name: 'Primary Subject',
      appearance: 'Photorealistic character identity and proportional anatomy',
      clothing: 'Appropriate thematic attire',
      anchor: 'Preserve facial identity and physical proportions throughout the shot',
    });
  }

  return result;
}

/**
 * Main Action/Motion Extraction Layer
 * Converts natural language prompts into structured action sequences,
 * motion instructions, and enhanced animation prompts.
 */
export function extractActionsFromPrompt(
  prompt: string,
  duration = 8,
  existingCharacters: Character[] = [],
  motionLevel: 'None' | 'Subtle' | 'Natural' | 'Dynamic' = 'Natural',
  cameraMotion: 'Auto' | 'Static' | 'Cinematic' | 'Dynamic' = 'Cinematic'
): ActionExtractionResult {
  const characters = extractCharactersFromPrompt(prompt, existingCharacters);
  const primaryChar = characters[0]?.name || 'character';

  // Detect which known actions are mentioned in the prompt
  const matchedActions: ActionRule[] = [];
  for (const rule of KNOWN_ACTIONS) {
    if (rule.pattern.test(prompt)) {
      matchedActions.push(rule);
    }
  }

  // If no specific action detected, extract fallback action based on general keywords or default to breathing/gaze
  if (matchedActions.length === 0) {
    if (/\b(look|watch|see|facing|view)\b/i.test(prompt)) {
      matchedActions.push(KNOWN_ACTIONS.find((a) => a.type === 'look')!);
      matchedActions.push(KNOWN_ACTIONS.find((a) => a.type === 'breathe')!);
    } else if (/\b(sit|sitting|desk|chair|table)\b/i.test(prompt)) {
      matchedActions.push(KNOWN_ACTIONS.find((a) => a.type === 'sit')!);
      matchedActions.push(KNOWN_ACTIONS.find((a) => a.type === 'type')!);
    } else {
      matchedActions.push(KNOWN_ACTIONS.find((a) => a.type === 'walk')!);
      matchedActions.push(KNOWN_ACTIONS.find((a) => a.type === 'look')!);
    }
  }

  // Always append natural breathing / subtle life to character if not already present
  if (!matchedActions.some((a) => a.type === 'breathe') && motionLevel !== 'None') {
    const breatheRule = KNOWN_ACTIONS.find((a) => a.type === 'breathe');
    if (breatheRule) {
      // Keep in mind breathing happens concurrently
    }
  }

  // Calculate timeline slices across duration
  const totalWeight = matchedActions.reduce((acc, a) => acc + a.durationWeight, 0);
  let currentStart = 0;

  const actions: DetectedAction[] = matchedActions.map((rule, idx) => {
    const isLast = idx === matchedActions.length - 1;
    const actionDuration = isLast
      ? Math.max(1, duration - currentStart)
      : Math.round(((rule.durationWeight / totalWeight) * duration) * 10) / 10;

    const end = Math.min(duration, Math.round((currentStart + actionDuration) * 10) / 10);
    const start = currentStart;
    currentStart = end;

    return {
      type: rule.type,
      description: `${primaryChar}: ${rule.defaultDescription}`,
      start,
      end,
      bodyParts: rule.bodyParts,
    };
  });

  // Build step-by-step choreographic motion instructions
  const motionSteps = actions
    .map(
      (a, i) =>
        `${i + 1}. [${a.start}s - ${a.end}s] ${a.type.toUpperCase()}: ${a.description}. Key movement: ${a.bodyParts?.join(
          ', '
        )}.`
    )
    .join('\n');

  const motionInstructions = `CHOREOGRAPHY & MOTION TIMELINE (${duration}s total):\n${motionSteps}\n- Secondary Dynamics: Organic breathing cycles, lifelike gaze tracking, and physical weight shifts throughout.`;

  // Determine Camera Motion directives
  let cameraDirective = '';
  switch (cameraMotion) {
    case 'Static':
      cameraDirective = 'Camera remains securely locked on tripod at eye level, capturing the character motion cleanly.';
      break;
    case 'Dynamic':
      cameraDirective = 'Dynamic continuous camera tracking following the subject with kinetic momentum, slight handheld parallax, and depth shifts.';
      break;
    case 'Cinematic':
    default:
      cameraDirective = 'Smooth cinematic dolly tracking shot at 35mm focal length, maintaining continuous focus on the character with subtle depth-of-field separation.';
      break;
  }

  // Build character consistency directive
  const charDetails = characters
    .map(
      (c) =>
        `Identity Lock for "${c.name}": Preserve identical facial structure, eyes, hairstyle, bone proportions, and wardrobe (${c.clothing || 'specified clothing'}) without drift across all ${duration} seconds.`
    )
    .join(' ');

  // Build Enhanced Motion-Aware Prompt
  const actionSummary = actions
    .map((a) => `${a.type} (${a.start}s-${a.end}s: ${a.description})`)
    .join(', then ');

  const motionIntensityDesc =
    motionLevel === 'Dynamic'
      ? 'High-energy, pronounced bodily kinematic range with bold movements.'
      : motionLevel === 'Subtle'
      ? 'Understated, delicate physical movements and micro-expressions.'
      : 'Natural, realistic human kinetics with organic momentum and fluid weight transfer.';

  const motionAwarePrompt = `Cinematic video sequence (${duration} seconds). ${charDetails} Character executes sequential physical motion: ${actionSummary}. Motion Style: ${motionIntensityDesc}. The character's body, limbs, and facial features physically move frame-to-frame with continuous temporal momentum. Never generate a static freeze-frame. ${cameraDirective} High production value, photorealistic temporal coherence.`;

  return {
    detectedCharacters: characters,
    actions,
    motionInstructions,
    cameraMotion: cameraDirective,
    motionAwarePrompt,
    characterConsistencyDirective: charDetails,
    motionLevel,
  };
}
