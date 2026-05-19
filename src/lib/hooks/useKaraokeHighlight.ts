import { useEffect, useRef, type RefObject } from 'react';
import type { Timepoint } from '../api/types';
import { splitSentences } from '../text/splitSentences';

interface UseKaraokeHighlightArgs {
  containerRef: RefObject<HTMLElement | null>;
  spokenText: string;
  timepoints: Timepoint[];
  audio: HTMLAudioElement | null;
  autoScroll?: boolean;
}

const HIGHLIGHT_NAME = 'th-spoken';

interface NodeSpan {
  node: Text;
  start: number;
  end: number;
}

function supportsCustomHighlights(): boolean {
  return typeof CSS !== 'undefined' && 'highlights' in CSS && typeof Highlight !== 'undefined';
}

function collectTextSpans(container: HTMLElement): NodeSpan[] {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const spans: NodeSpan[] = [];
  let offset = 0;
  let node = walker.nextNode();
  while (node) {
    const text = node.textContent ?? '';
    spans.push({ node: node as Text, start: offset, end: offset + text.length });
    offset += text.length;
    node = walker.nextNode();
  }
  return spans;
}

function findSpanContaining(spans: NodeSpan[], pos: number): NodeSpan | null {
  for (const span of spans) {
    if (pos >= span.start && pos <= span.end) return span;
  }
  return null;
}

function buildRange(spans: NodeSpan[], start: number, end: number): Range | null {
  const startSpan = findSpanContaining(spans, start);
  const endSpan = findSpanContaining(spans, end);
  if (!startSpan || !endSpan) return null;
  try {
    const range = document.createRange();
    range.setStart(startSpan.node, start - startSpan.start);
    range.setEnd(endSpan.node, end - endSpan.start);
    return range;
  } catch {
    return null;
  }
}

const WORD_RE = /[\p{L}\p{N}]+(?:['’\-_][\p{L}\p{N}]+)*/gu;

interface WordHit {
  start: number;
  end: number;
}

function findWordFrom(fullText: string, word: string, from: number): WordHit | null {
  const target = word.toLowerCase();
  WORD_RE.lastIndex = from;
  let m: RegExpExecArray | null;
  while ((m = WORD_RE.exec(fullText)) !== null) {
    if (m[0].toLowerCase() === target) {
      return { start: m.index, end: m.index + m[0].length };
    }
  }
  return null;
}

// Match each sentence to a DOM range by walking its word tokens in order,
// tolerating arbitrary non-word characters between them (markdown punctuation,
// whitespace, list bullets, link brackets, etc.). The spoken text fed to TTS
// is markdown-stripped, but the DOM still contains the original markdown —
// substring matching breaks as soon as any formatting is present.
function buildSentenceRanges(container: HTMLElement, sentences: string[]): (Range | null)[] {
  const spans = collectTextSpans(container);
  if (spans.length === 0) return sentences.map(() => null);
  const fullText = spans.map((s) => s.node.textContent ?? '').join('');
  const ranges: (Range | null)[] = [];
  let cursor = 0;
  for (const sentence of sentences) {
    const words = sentence.match(WORD_RE);
    if (!words || words.length === 0) {
      ranges.push(null);
      continue;
    }
    let scan = cursor;
    let firstStart = -1;
    let lastEnd = -1;
    let matched = true;
    for (const w of words) {
      const hit = findWordFrom(fullText, w, scan);
      if (!hit) {
        matched = false;
        break;
      }
      if (firstStart < 0) firstStart = hit.start;
      lastEnd = hit.end;
      scan = hit.end;
    }
    if (!matched || firstStart < 0 || lastEnd < 0) {
      ranges.push(null);
      continue;
    }
    cursor = lastEnd;
    ranges.push(buildRange(spans, firstStart, lastEnd));
  }
  return ranges;
}

function activeIndexFor(timepoints: Timepoint[], currentTime: number): number {
  let lo = 0;
  let hi = timepoints.length - 1;
  let best = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (timepoints[mid].time_sec <= currentTime) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

function sentenceIndexFromMark(mark: string): number {
  const n = Number(mark.slice(1));
  return Number.isFinite(n) ? n : -1;
}

function isOffscreen(range: Range, viewport: { top: number; bottom: number }): boolean {
  const rect = range.getBoundingClientRect();
  if (rect.height === 0 && rect.width === 0) return false;
  return rect.top < viewport.top + 40 || rect.bottom > viewport.bottom - 40;
}

export function useKaraokeHighlight({
  containerRef,
  spokenText,
  timepoints,
  audio,
  autoScroll = true,
}: UseKaraokeHighlightArgs): void {
  const lastActiveRef = useRef<number>(-1);

  useEffect(() => {
    if (!audio || !containerRef.current) return;
    if (!supportsCustomHighlights()) return;
    if (!spokenText || timepoints.length === 0) return;

    const sentences = splitSentences(spokenText);
    if (sentences.length === 0) return;

    const ranges = buildSentenceRanges(containerRef.current, sentences);
    if (ranges.every((r) => r === null)) return;

    const highlight = new Highlight();
    CSS.highlights.set(HIGHLIGHT_NAME, highlight);
    lastActiveRef.current = -1;

    const onTimeUpdate = () => {
      const tpIdx = activeIndexFor(timepoints, audio.currentTime);
      if (tpIdx < 0 || tpIdx === lastActiveRef.current) return;
      const sIdx = sentenceIndexFromMark(timepoints[tpIdx].mark);
      const range = ranges[sIdx];
      if (!range) {
        lastActiveRef.current = tpIdx;
        return;
      }
      lastActiveRef.current = tpIdx;
      highlight.clear();
      highlight.add(range);
      if (autoScroll) {
        const viewport = { top: 0, bottom: window.innerHeight };
        if (isOffscreen(range, viewport)) {
          const target = range.startContainer.parentElement;
          target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    const clear = () => {
      highlight.clear();
      CSS.highlights.delete(HIGHLIGHT_NAME);
      lastActiveRef.current = -1;
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', clear);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', clear);
      clear();
    };
  }, [audio, containerRef, spokenText, timepoints, autoScroll]);
}
