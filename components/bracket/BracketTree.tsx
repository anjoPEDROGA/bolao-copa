import type { BracketRound } from "@/types";
import { BracketMatch } from "./BracketMatch";

type BracketTreeProps = {
  rounds: BracketRound[];
  className?: string;
};

export function BracketTree({ rounds, className = "" }: BracketTreeProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="flex min-w-max gap-4 pb-2">
        {rounds.map((round) => (
          <section
            key={round.id}
            className="min-w-[280px] space-y-4 rounded-3xl border border-white/10 bg-white/3 p-4"
          >
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-sky-300/80">
                Rodada
              </p>
              <h2 className="text-xl font-semibold text-white">{round.name}</h2>
            </div>

            {round.matches.length > 0 ? (
              <div className="space-y-3">
                {round.matches.map((match) => (
                  <BracketMatch key={match.id} match={match} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                Aguardando classificados.
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
