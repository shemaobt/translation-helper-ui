export function stripMarkdownForSpeech(input: string): string {
  if (!input) return '';
  return input
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/(\*{1,3}|_{1,3})(\S(?:.*?\S)?)\1/g, '$2')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/^[\s]*([-*_])\1{2,}[\s]*$/gm, '')
    .replace(/(?<!\w)\*+(?!\w)|(?<!\w)_+(?!\w)/g, '')
    .replace(/—|–/g, ' — ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[^\S\n]{2,}/g, ' ')
    .trim();
}
