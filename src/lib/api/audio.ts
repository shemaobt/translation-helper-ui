import { api } from './client';
import type { SpeakResponse, TranscribeResponse } from './types';

const UI_LOCALE_TO_TTS: Record<string, string> = {
  en: 'en-US',
  'pt-BR': 'pt-BR',
  es: 'es-ES',
  fr: 'fr-FR',
};

/** Resolve a UI i18n locale (e.g. "en", "pt-BR") to a Google TTS language code
 *  the backend's VOICE_MAP understands. Returns undefined if unknown so the
 *  backend can fall back to its own langdetect. */
export function ttsLanguageCode(uiLocale: string | null | undefined): string | undefined {
  if (!uiLocale) return undefined;
  return UI_LOCALE_TO_TTS[uiLocale] ?? UI_LOCALE_TO_TTS[uiLocale.split('-')[0]];
}

export async function transcribeAudio(
  blob: Blob,
  filename = 'recording.webm',
): Promise<TranscribeResponse> {
  const form = new FormData();
  form.append('file', blob, filename);
  if (blob.type) form.append('mime_type', blob.type);
  const { data } = await api.post<TranscribeResponse>(
    '/api/translation-helper/audio/transcribe',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

export async function speak(text: string, languageCode?: string): Promise<SpeakResponse> {
  const { data } = await api.post<SpeakResponse>('/api/translation-helper/audio/speak', {
    text,
    language_code: languageCode,
  });
  return data;
}
