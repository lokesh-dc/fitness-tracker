import { Sparkles } from "lucide-react";

type Block = string | string[];

function parseSummary(text: string): Block[] {
  const blocks: Block[] = [];
  let list: string[] | null = null;

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) {
      list = null;
      continue;
    }

    const itemMatch = line.match(/^[-*•]\s+(.*)$/) || line.match(/^\d+[.)]\s+(.*)$/);
    if (itemMatch) {
      if (!list) {
        list = [];
        blocks.push(list);
      }
      list.push(itemMatch[1].replace(/\*\*/g, ""));
    } else {
      list = null;
      blocks.push(line.replace(/\*\*/g, ""));
    }
  }

  return blocks;
}

interface CoolDownStretchesProps {
  summary: string | null;
  loading?: boolean;
}

export function CoolDownStretches({
  summary,
  loading = false,
}: CoolDownStretchesProps) {
  const blocks = summary ? parseSummary(summary) : [];

  return (
    <div className="w-full bg-foreground/5 rounded-2xl p-5 text-left">
      <div className="flex items-center space-x-2 mb-3">
        <Sparkles className="w-4 h-4 text-brand-primary animate-pulse" />
        <p className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">
          Cool Down Stretches Recommendation
        </p>
      </div>

      {loading && !summary ? (
        <div className="space-y-2">
          <div className="h-3 rounded-full bg-foreground/10 animate-pulse" />
          <div className="h-3 rounded-full bg-foreground/10 animate-pulse w-5/6" />
          <div className="h-3 rounded-full bg-foreground/10 animate-pulse w-2/3" />
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, i) =>
            Array.isArray(block) ? (
              <ol key={i} className="space-y-2">
                {block.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <span className="mt-0.5 min-w-5 h-5 px-1.5 rounded-md bg-brand-primary/10 text-brand-primary text-[11px] font-black flex items-center justify-center">
                      {j + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground/80 leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p key={i} className="text-sm font-medium text-foreground/80 leading-relaxed">
                {block}
              </p>
            ),
          )}
        </div>
      )}
    </div>
  );
}
