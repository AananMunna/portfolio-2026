import type { ReactNode } from "react";

const TOKEN =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(const|let|await|async|if|throw|new|return|import|from|export|function|type|interface|try|catch|model|name|on|jobs|runs-on|steps|uses|run|with)\b|\b(true|false|null)\b/g;

function highlightLine(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const cls = m[1]
      ? "text-muted/70 italic"
      : m[2]
      ? "text-(color:--amber)"
      : m[3]
      ? "text-accent"
      : "text-(color:--cyan)";
    out.push(
      <span key={m.index} className={cls}>
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

export default function CodeBlock({ file, text }: { file?: string; text: string }) {
  const lines = text.split("\n");
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-surface">
      {file && (
        <div className="border-b border-white/10 px-4 py-2 font-mono text-xs text-muted">
          {file}
        </div>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-fg/85">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="mr-4 w-5 shrink-0 select-none text-right text-muted/40">
              {i + 1}
            </span>
            <code className="whitespace-pre">{line ? highlightLine(line) : " "}</code>
          </div>
        ))}
      </pre>
    </div>
  );
}
