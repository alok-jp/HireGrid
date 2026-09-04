import type React from "react";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Parses inline markdown elements such as bold, italic, and inline code.
 */
function parseInline(text: string): React.ReactNode[] {
  // Matches bold (**text** or __text__), inline code (`code`), and italic (*text* or _text_)
  const regex = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  const matches = Array.from(text.matchAll(regex));
  for (const match of matches) {
    const matchIndex = match.index ?? 0;
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }

    const token = match[0];
    const key = `inline-${matchIndex}-${token}`;

    if (
      (token.startsWith("**") && token.endsWith("**")) ||
      (token.startsWith("__") && token.endsWith("__"))
    ) {
      parts.push(
        <strong key={key} className="font-semibold text-[var(--text-primary)]">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={key}
          className="font-mono text-[11px] px-1.5 py-0.5 rounded-sm bg-[var(--surface-2)] text-[var(--accent)]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (
      (token.startsWith("*") && token.endsWith("*")) ||
      (token.startsWith("_") && token.endsWith("_"))
    ) {
      parts.push(
        <em key={key} className="italic text-[var(--text-primary)]">
          {token.slice(1, -1)}
        </em>,
      );
    } else {
      parts.push(token);
    }

    lastIndex = matchIndex + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

type Block =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "h4"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "p"; text: string };

function getListItem(line: string): { type: "ul" | "ol"; text: string } | null {
  const trimmed = line.trim();
  const unicodeMatch = trimmed.match(
    /^[•⁃◦▪▫\u2022\u2023\u2043\u25E6\u25AA\u25AB\u00B7►✓✔]\s*(.*)$/,
  );
  if (unicodeMatch && unicodeMatch[1].trim().length > 0) {
    return { type: "ul", text: unicodeMatch[1].trim() };
  }

  const asciiMatch = trimmed.match(/^[*+\u2013\u2014-]\s+(.*)$/);
  if (asciiMatch && asciiMatch[1].trim().length > 0) {
    return { type: "ul", text: asciiMatch[1].trim() };
  }

  const olMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
  if (olMatch && olMatch[2].trim().length > 0) {
    return { type: "ol", text: olMatch[2].trim() };
  }

  return null;
}

function parseBlocks(content: string): Block[] {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  const blocks: Block[] = [];

  let currentListType: "ul" | "ol" | null = null;
  let currentListItems: string[] = [];
  let currentParagraph: string[] = [];
  let hasPendingBlankLine = false;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({
        type: "p",
        text: currentParagraph.join("\n"),
      });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentListType && currentListItems.length > 0) {
      blocks.push({
        type: currentListType,
        items: currentListItems,
      });
      currentListType = null;
      currentListItems = [];
    }
    hasPendingBlankLine = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushParagraph();
      if (currentListType) {
        hasPendingBlankLine = true;
      }
      continue;
    }

    // Headings (#, ##, ###, ####, #####, ######)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      if (level === 1) blocks.push({ type: "h1", text });
      else if (level === 2) blocks.push({ type: "h2", text });
      else if (level === 3) blocks.push({ type: "h3", text });
      else blocks.push({ type: "h4", text });
      continue;
    }

    // List item (bullets or ordered numbers)
    const listItem = getListItem(rawLine);
    if (listItem) {
      flushParagraph();
      if (currentListType !== listItem.type) {
        flushList();
        currentListType = listItem.type;
      }
      currentListItems.push(listItem.text);
      hasPendingBlankLine = false;
      continue;
    }

    // Indented continuation line for current list item
    if (
      currentListType !== null &&
      !hasPendingBlankLine &&
      currentListItems.length > 0 &&
      (rawLine.startsWith("  ") || rawLine.startsWith("\t"))
    ) {
      const lastIndex = currentListItems.length - 1;
      currentListItems[lastIndex] =
        `${currentListItems[lastIndex]}\n${trimmed}`;
      continue;
    }

    // Regular paragraph text: if we were previously in a list, close it
    if (currentListType !== null) {
      flushList();
    }

    currentParagraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  return blocks;
}

export function MarkdownContent({
  content,
  className = "",
}: MarkdownContentProps) {
  if (!content || !content.trim()) {
    return null;
  }

  const blocks = parseBlocks(content);

  return (
    <div className={`space-y-3 ${className}`}>
      {blocks.map((block, idx) => {
        const key = `block-${idx}-${block.type}`;
        switch (block.type) {
          case "h1":
            return (
              <h2
                key={key}
                className="text-base font-bold text-[var(--text-primary)] pt-2 pb-1 border-b border-[var(--border-subtle)]"
              >
                {parseInline(block.text)}
              </h2>
            );
          case "h2":
            return (
              <h3
                key={key}
                className="text-sm font-bold text-[var(--text-primary)] pt-2 pb-0.5"
              >
                {parseInline(block.text)}
              </h3>
            );
          case "h3":
          case "h4":
            return (
              <h4
                key={key}
                className="text-xs font-bold text-[var(--text-primary)] tracking-wide uppercase pt-2 pb-0.5 text-[var(--accent)]"
              >
                {parseInline(block.text)}
              </h4>
            );
          case "ul":
            return (
              <ul
                key={key}
                className="list-disc pl-5 space-y-1.5 text-xs text-[var(--text-secondary)] leading-relaxed my-1.5"
              >
                {block.items.map((item, itemIdx) => (
                  <li
                    key={`ul-item-${itemIdx}-${item.slice(0, 20)}`}
                    className="whitespace-pre-wrap"
                  >
                    {parseInline(item)}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol
                key={key}
                className="list-decimal pl-5 space-y-1.5 text-xs text-[var(--text-secondary)] leading-relaxed my-1.5"
              >
                {block.items.map((item, itemIdx) => (
                  <li
                    key={`ol-item-${itemIdx}-${item.slice(0, 20)}`}
                    className="whitespace-pre-wrap"
                  >
                    {parseInline(item)}
                  </li>
                ))}
              </ol>
            );
          case "p":
            return (
              <p
                key={key}
                className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap"
              >
                {parseInline(block.text)}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
