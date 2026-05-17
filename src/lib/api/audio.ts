import { api } from './client';
import type { SpeakResponse, TranscribeResponse } from './types';

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

export async function speak(text: string, voiceName?: string): Promise<SpeakResponse> {
  const { data } = await api.post<SpeakResponse>('/api/translation-helper/audio/speak', {
    text,
    voice_name: voiceName,
  });
  return data;
}
