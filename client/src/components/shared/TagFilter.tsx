import { Filter } from "lucide-react";

interface TagFilterProps {
  tagFilter: Set<"need" | "want" | "neutral">;
  onToggleTag: (tag: "need" | "want" | "neutral") => void;
}

export function TagFilter({ tagFilter, onToggleTag }: TagFilterProps) {
  const tags: Array<{ value: "need" | "want" | "neutral"; emoji: string; label: string; activeClass: string; }> = [
    {
      value: "need",
      emoji: "🔴",
      label: "Need",
      activeClass: "bg-red-500/20 text-red-400 border-red-500/50",
    },
    {
      value: "want",
      emoji: "🟡",
      label: "Want",
      activeClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    },
    {
      value: "neutral",
      emoji: "⚪",
      label: "Neutral",
      activeClass: "bg-slate-500/20 text-slate-300 border-slate-500/50",
    },
  ];

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filter:</span>
      </div>
      <div className="flex gap-2">
        {tags.map((tag) => (
          <button
            key={tag.value}
            onClick={() => onToggleTag(tag.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              tagFilter.has(tag.value)
                ? `${tag.activeClass} shadow-sm`
                : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600 hover:text-slate-300"
            }`}
          >
            {tag.emoji} {tag.label}
            {tagFilter.has(tag.value) && (
              <span
                className={
                  tag.value === "need"
                    ? "text-red-400"
                    : tag.value === "want"
                    ? "text-yellow-400"
                    : "text-slate-300"
                }
              >
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

