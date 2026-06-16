"use client";

export type MatchFilter = "all" | "today" | "live" | "finished";

type MatchFiltersProps = {
  activeFilter: MatchFilter;
  onChange: (filter: MatchFilter) => void;
  counts?: Partial<Record<MatchFilter, number>>;
  className?: string;
};

const filterLabels: Record<MatchFilter, string> = {
  all: "Todos",
  today: "Jogos do Dia",
  live: "Ao Vivo",
  finished: "Encerrados"
};

const filterClasses: Record<MatchFilter, string> = {
  all: "border-white/10 bg-white/5 text-white",
  today: "border-white/10 bg-white/5 text-white",
  live: "border-white/10 bg-white/5 text-white",
  finished: "border-white/10 bg-white/5 text-white"
};

export function MatchFilters({
  activeFilter,
  onChange,
  counts,
  className = ""
}: MatchFiltersProps) {
  const filters: MatchFilter[] = ["all", "today", "live", "finished"];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {filters.map((filter) => {
        const isActive = filter === activeFilter;
        const count = counts?.[filter];

        return (
          <button
            key={filter}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
              isActive
                ? "border-sky-300/40 bg-sky-300/15 text-sky-100 shadow-[0_0_0_1px_rgba(125,211,252,0.12)]"
                : filterClasses[filter]
            }`}
            onClick={() => onChange(filter)}
            type="button"
          >
            <span>{filterLabels[filter]}</span>
            {typeof count === "number" ? (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/80">
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
