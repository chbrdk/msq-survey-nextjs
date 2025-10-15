/**
 * Voice Parser Utilities
 * Handles parsing of voice input for different component types
 */

// Levenshtein Distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Normalize text for comparison
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim();
}

// Extract numbers from text
export function extractNumbers(text: string): number[] {
  const matches = text.match(/\d+/g);
  return matches ? matches.map(Number) : [];
}

// Extract percentage from text (handles "forty percent", "40%", "40 percent", etc.)
export function extractPercentage(text: string): number | null {
  const normalized = normalizeText(text);
  
  // Check for numeric percentages
  const numMatch = text.match(/(\d+)\s*%?/);
  if (numMatch) {
    return parseInt(numMatch[1]);
  }
  
  // Word to number mapping
  const wordToNumber: Record<string, number> = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
    'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
    'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90
  };
  
  // Check for word numbers
  const words = normalized.split(/\s+/);
  let total = 0;
  let current = 0;
  
  for (const word of words) {
    if (wordToNumber[word] !== undefined) {
      const value = wordToNumber[word];
      if (value >= 20) {
        current += value;
      } else if (value >= 10) {
        current = value;
      } else {
        current += value;
      }
    }
  }
  
  if (current > 0) {
    total += current;
  }
  
  return total > 0 ? total : null;
}

// Split text by conjunctions
export function splitByConjunctions(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized
    .split(/\s+and\s+|\s*,\s*/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

// Find best match using Levenshtein distance
export function findBestMatch(
  input: string, 
  candidates: string[], 
  threshold: number = 0.7
): { value: string; confidence: number } | null {
  const normalized = normalizeText(input);
  let bestMatch: string | null = null;
  let bestDistance = Infinity;
  
  for (const candidate of candidates) {
    const candidateNormalized = normalizeText(candidate);
    const distance = levenshteinDistance(normalized, candidateNormalized);
    const maxLength = Math.max(normalized.length, candidateNormalized.length);
    const similarity = 1 - (distance / maxLength);
    
    if (similarity >= threshold && distance < bestDistance) {
      bestDistance = distance;
      bestMatch = candidate;
    }
  }
  
  if (bestMatch) {
    const maxLength = Math.max(normalized.length, normalizeText(bestMatch).length);
    const confidence = 1 - (bestDistance / maxLength);
    return { value: bestMatch, confidence };
  }
  
  return null;
}

// Parse button choice (single selection)
export function parseButtonChoice(
  transcript: string, 
  options: Array<{ label: string; value: string }>
): { value: string; label: string; confidence: number } | null {
  const labels = options.map(o => o.label);
  const match = findBestMatch(transcript, labels, 0.6);
  
  if (match) {
    const option = options.find(o => o.label === match.value);
    if (option) {
      return {
        value: option.value,
        label: option.label,
        confidence: match.confidence
      };
    }
  }
  
  return null;
}

// Parse multi-select (multiple selections)
export function parseMultiSelect(
  transcript: string,
  options: Array<{ label: string; value: string }>
): Array<{ value: string; label: string; confidence: number }> {
  const parts = splitByConjunctions(transcript);
  const results: Array<{ value: string; label: string; confidence: number }> = [];
  
  for (const part of parts) {
    const match = parseButtonChoice(part, options);
    if (match && !results.find(r => r.value === match.value)) {
      results.push(match);
    }
  }
  
  return results;
}

// Parse percentages from natural language
export function parsePercentages(
  transcript: string,
  phases: Array<{ label: string; key: string }>
): Record<string, number> {
  const result: Record<string, number> = {};
  
  // Split by comma or "and"
  const parts = splitByConjunctions(transcript);
  
  for (const part of parts) {
    // Try to find phase name and percentage
    const percentage = extractPercentage(part);
    if (percentage !== null) {
      // Find which phase this refers to
      const phaseMatch = findBestMatch(
        part,
        phases.map(p => p.label),
        0.5
      );
      
      if (phaseMatch) {
        const phase = phases.find(p => p.label === phaseMatch.value);
        if (phase) {
          result[phase.key] = percentage;
        }
      }
    }
  }
  
  return result;
}

// Parse text input (direct transcription)
export function parseTextInput(transcript: string): string {
  return transcript.trim();
}

// Check if user said "done" or "finish"
export function isDoneCommand(transcript: string): boolean {
  const normalized = normalizeText(transcript);
  return /\b(done|finish|finished|complete|completed|that's all|that's it)\b/.test(normalized);
}

// Check if user said "yes" or "no"
export function parseConfirmation(transcript: string): boolean | null {
  const normalized = normalizeText(transcript);
  
  if (/\b(yes|yeah|yep|sure|correct|right|okay|ok)\b/.test(normalized)) {
    return true;
  }
  
  if (/\b(no|nope|wrong|incorrect|not right)\b/.test(normalized)) {
    return false;
  }
  
  return null;
}

/**
 * Universal Voice Response Parser
 * Parses transcript based on component type and returns structured data
 */
export interface ParsedVoiceResponse {
  data: any;
  confidence: number;
  requiresConfirmation: boolean;
  transcript: string;
}

export function parseVoiceResponse(
  transcript: string,
  componentType: string,
  componentProps: any
): ParsedVoiceResponse | null {
  if (!transcript || !transcript.trim()) {
    return null;
  }

  const cleanTranscript = transcript.trim();

  switch (componentType) {
    case 'button-group': {
      const options = componentProps.options || [];
      const isMultiple = componentProps.multiple === true;

      if (isMultiple) {
        // Multi-select
        const matches = parseMultiSelect(cleanTranscript, options);
        if (matches.length > 0) {
          const avgConfidence = matches.reduce((sum, m) => sum + m.confidence, 0) / matches.length;
          return {
            data: matches.map(m => m.value),
            confidence: avgConfidence,
            requiresConfirmation: avgConfidence < 0.8,
            transcript: cleanTranscript
          };
        }
      } else {
        // Single select
        const match = parseButtonChoice(cleanTranscript, options);
        if (match) {
          return {
            data: match.value,
            confidence: match.confidence,
            requiresConfirmation: match.confidence < 0.8,
            transcript: cleanTranscript
          };
        }
      }
      break;
    }

    case 'info-message': {
      // For info-message with acknowledgement, check if user said yes/ok
      if (componentProps.requiresAcknowledgement) {
        const confirmed = parseConfirmation(cleanTranscript);
        if (confirmed === true) {
          return {
            data: 'acknowledged',
            confidence: 1.0,
            requiresConfirmation: false,
            transcript: cleanTranscript
          };
        }
      }
      break;
    }

    case 'input':
    case 'guided-input': {
      // Direct text input
      return {
        data: parseTextInput(cleanTranscript),
        confidence: 1.0,
        requiresConfirmation: true, // Always confirm text input
        transcript: cleanTranscript
      };
    }

    case 'multi-select':
    case 'smart-multi-select': {
      const options = componentProps.options || [];
      const matches = parseMultiSelect(cleanTranscript, options);
      
      if (matches.length > 0) {
        const avgConfidence = matches.reduce((sum, m) => sum + m.confidence, 0) / matches.length;
        return {
          data: matches.map(m => m.value),
          confidence: avgConfidence,
          requiresConfirmation: avgConfidence < 0.8,
          transcript: cleanTranscript
        };
      }
      break;
    }

    case 'percentage-table': {
      // For percentage allocation
      const items = componentProps.items || componentProps.rows || [];
      const percentages = parsePercentages(cleanTranscript, items);
      
      if (Object.keys(percentages).length > 0) {
        return {
          data: Object.entries(percentages).map(([key, percentage]) => ({
            phase: items.find((i: any) => i.key === key)?.label || key,
            percentage
          })),
          confidence: 0.7, // Lower confidence for complex data
          requiresConfirmation: true, // Always confirm percentages
          transcript: cleanTranscript
        };
      }
      break;
    }

    default:
      // Fallback: return raw transcript
      return {
        data: cleanTranscript,
        confidence: 0.5,
        requiresConfirmation: true,
        transcript: cleanTranscript
      };
  }

  return null;
}

