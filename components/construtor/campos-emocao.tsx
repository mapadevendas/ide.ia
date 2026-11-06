import { CANAIS, EMOCOES } from "@/data/etapas";
import { cn } from "@/lib/utils";

export function SeletorEmocao({ valor, aoMudar, compacto = false }: { valor: number; aoMudar: (v: number) => void; compacto?: boolean }) {
  return (
    <div role="radiogroup" aria-label="Como o herói se sente" className="flex flex-wrap gap-1">
      {EMOCOES.map((e) => (
        <button
          key={e.valor}
          type="button"
          role="radio"
          aria-checked={valor === e.valor}
          onClick={() => aoMudar(e.valor)}
          className={cn(
            "cursor-pointer rounded-full border font-medium transition-colors",
            compacto ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
            valor === e.valor
              ? e.valor < 0
                ? "border-primary bg-primary text-primary-foreground"
                : "border-ouro bg-ouro text-tinta"
              : "border-border bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          {e.rotulo}
        </button>
      ))}
    </div>
  );
}

export function SeletorCanal({ valor, aoMudar, id, className }: { valor: string; aoMudar: (v: string) => void; id?: string; className?: string }) {
  return (
    <select
      id={id}
      value={valor}
      onChange={(e) => aoMudar(e.target.value)}
      className={cn("h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-ring", className)}
    >
      {CANAIS.map((c) => (
        <option key={c}>{c}</option>
      ))}
    </select>
  );
}
