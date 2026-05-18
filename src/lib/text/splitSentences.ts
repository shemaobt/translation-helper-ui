/** Sentence splitter matched to the backend's algorithm in
 *  tripod-backend/app/services/translation_helper/synthesize_speech.py:split_sentences.
 *  Same input + same algorithm on both sides → identical sentence count + order,
 *  which is what lets the frontend match each TTS mark back to a text range. */
const SENTENCE_RE = /[^.!?]*[.!?]+|[^.!?]+$/gs;

export function splitSentences(text: string): string[] {
  if (!text) return [];
  const out: string[] = [];
  for (const match of text.matchAll(SENTENCE_RE)) {
    const chunk = match[0].trim();
    if (chunk) out.push(chunk);
  }
  return out;
}
