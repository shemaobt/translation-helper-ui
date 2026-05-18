import { Fragment, type ReactNode } from 'react';

type Block =
  | { kind: 'h'; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'hr' };

const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const HR_RE = /^[\s]*([-*_])\1{2,}[\s]*$/;
const UL_RE = /^[\s]*[-*+]\s+(.*)$/;
const OL_RE = /^[\s]*\d+\.\s+(.*)$/;
const QUOTE_RE = /^>\s?(.*)$/;

function isBlockStart(line: string): boolean {
  return (
    HEADING_RE.test(line) ||
    HR_RE.test(line) ||
    UL_RE.test(line) ||
    OL_RE.test(line) ||
    QUOTE_RE.test(line) ||
    line.startsWith('```')
  );
}

function parseBlocks(input: string): Block[] {
  const lines = input.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      blocks.push({ kind: 'code', text: codeLines.join('\n') });
      continue;
    }

    if (HR_RE.test(line)) {
      blocks.push({ kind: 'hr' });
      i++;
      continue;
    }

    const h = HEADING_RE.exec(line);
    if (h) {
      blocks.push({
        kind: 'h',
        level: Math.min(6, h[1].length) as 1 | 2 | 3 | 4 | 5 | 6,
        text: h[2],
      });
      i++;
      continue;
    }

    if (QUOTE_RE.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length) {
        const m = QUOTE_RE.exec(lines[i]);
        if (!m) break;
        quoteLines.push(m[1]);
        i++;
      }
      blocks.push({ kind: 'quote', text: quoteLines.join('\n') });
      continue;
    }

    if (UL_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const m = UL_RE.exec(lines[i]);
        if (!m) break;
        items.push(m[1]);
        i++;
      }
      blocks.push({ kind: 'ul', items });
      continue;
    }

    if (OL_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const m = OL_RE.exec(lines[i]);
        if (!m) break;
        items.push(m[1]);
        i++;
      }
      blocks.push({ kind: 'ol', items });
      continue;
    }

    if (line.trim() === '') {
      i++;
      continue;
    }

    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !isBlockStart(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push({ kind: 'p', text: paraLines.join('\n') });
  }
  return blocks;
}

const INLINE_RE =
  /(`[^`\n]+`)|(\*\*[\s\S]+?\*\*)|(__[\s\S]+?__)|(\*[^*\n]+\*)|(_[^_\n]+_)|(\[[^\]]+\]\([^)\s]+\))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  if (!text) return [];
  const out: ReactNode[] = [];
  let lastIndex = 0;
  let k = 0;
  text.replace(INLINE_RE, (match, code, b1, b2, i1, i2, link, offset: number) => {
    if (offset > lastIndex) {
      out.push(...withSoftBreaks(text.slice(lastIndex, offset), `${keyPrefix}t${k++}`));
    }
    if (code) {
      out.push(
        <code
          key={`${keyPrefix}c${k++}`}
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 6,
            padding: '1px 6px',
            fontSize: '0.9em',
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          }}
        >
          {match.slice(1, -1)}
        </code>,
      );
    } else if (b1 || b2) {
      const inner = match.slice(2, -2);
      out.push(
        <strong key={`${keyPrefix}b${k++}`} style={{ fontWeight: 600, color: 'var(--text)' }}>
          {renderInline(inner, `${keyPrefix}b${k}.`)}
        </strong>,
      );
    } else if (i1 || i2) {
      const inner = match.slice(1, -1);
      out.push(
        <em key={`${keyPrefix}i${k++}`}>
          {renderInline(inner, `${keyPrefix}i${k}.`)}
        </em>,
      );
    } else if (link) {
      const closeBracket = match.indexOf(']');
      const linkText = match.slice(1, closeBracket);
      const url = match.slice(closeBracket + 2, -1);
      out.push(
        <a
          key={`${keyPrefix}l${k++}`}
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          style={{ color: 'var(--accent)', textDecoration: 'underline' }}
        >
          {renderInline(linkText, `${keyPrefix}l${k}.`)}
        </a>,
      );
    }
    lastIndex = offset + match.length;
    return match;
  });
  if (lastIndex < text.length) {
    out.push(...withSoftBreaks(text.slice(lastIndex), `${keyPrefix}t${k++}`));
  }
  return out;
}

function withSoftBreaks(text: string, keyPrefix: string): ReactNode[] {
  if (!text.includes('\n')) return [text];
  const parts = text.split('\n');
  const out: ReactNode[] = [];
  parts.forEach((part, idx) => {
    if (idx > 0) out.push(<br key={`${keyPrefix}br${idx}`} />);
    if (part) out.push(<Fragment key={`${keyPrefix}s${idx}`}>{part}</Fragment>);
  });
  return out;
}

interface MarkdownContentProps {
  text: string;
}

export function MarkdownContent({ text }: MarkdownContentProps) {
  const blocks = parseBlocks(text);
  return (
    <>
      {blocks.map((block, idx) => {
        const key = `b${idx}`;
        switch (block.kind) {
          case 'h': {
            const Tag = (`h${block.level}` as unknown) as keyof JSX.IntrinsicElements;
            const size = [1.5, 1.3, 1.15, 1.05, 1, 0.95][block.level - 1];
            return (
              <Tag
                key={key}
                style={{
                  fontSize: `${size}em`,
                  fontWeight: 600,
                  marginTop: idx === 0 ? 0 : '1.2em',
                  marginBottom: '0.6em',
                  lineHeight: 1.3,
                  color: 'var(--text)',
                }}
              >
                {renderInline(block.text, `${key}.`)}
              </Tag>
            );
          }
          case 'p':
            return (
              <p
                key={key}
                style={{ margin: idx === 0 ? '0 0 0.9em' : '0.9em 0', lineHeight: 1.7 }}
              >
                {renderInline(block.text, `${key}.`)}
              </p>
            );
          case 'ul':
            return (
              <ul
                key={key}
                style={{
                  margin: '0.9em 0',
                  paddingLeft: '1.5em',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35em',
                }}
              >
                {block.items.map((item, j) => (
                  <li key={`${key}.i${j}`} style={{ lineHeight: 1.6 }}>
                    {renderInline(item, `${key}.i${j}.`)}
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol
                key={key}
                style={{
                  margin: '0.9em 0',
                  paddingLeft: '1.6em',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35em',
                }}
              >
                {block.items.map((item, j) => (
                  <li key={`${key}.i${j}`} style={{ lineHeight: 1.6 }}>
                    {renderInline(item, `${key}.i${j}.`)}
                  </li>
                ))}
              </ol>
            );
          case 'quote':
            return (
              <blockquote
                key={key}
                style={{
                  margin: '0.9em 0',
                  padding: '0.4em 0.9em',
                  borderLeft: '3px solid var(--accent)',
                  background: 'var(--surface-2)',
                  borderRadius: '0 8px 8px 0',
                  color: 'var(--text-2)',
                  fontStyle: 'italic',
                }}
              >
                {renderInline(block.text, `${key}.`)}
              </blockquote>
            );
          case 'code':
            return (
              <pre
                key={key}
                style={{
                  margin: '0.9em 0',
                  padding: '0.8em 1em',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  overflowX: 'auto',
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                  fontSize: '0.9em',
                  lineHeight: 1.5,
                }}
              >
                <code>{block.text}</code>
              </pre>
            );
          case 'hr':
            return (
              <hr
                key={key}
                style={{
                  border: 0,
                  borderTop: '1px solid var(--border-subtle)',
                  margin: '1.2em 0',
                }}
              />
            );
        }
      })}
    </>
  );
}
