import { ETAPAS, type EtapaId } from "@/data/etapas";
import { cn } from "@/lib/utils";

type Props = {
  cartoes: Partial<Record<EtapaId, { texto: string; emocao: number }>>;
  className?: string;
  compacto?: boolean;
};

/* Curva emocional da jornada (−2 a +2) desenhada como uma trilha. */
export function CurvaEmocao({ valores, className, animar = false, cor = "var(--primary)" }: { valores: number[]; className?: string; animar?: boolean; cor?: string }) {
  const w = 400;
  const h = 90;
  const passo = w / (valores.length - 1);
  const y = (v: number) => h / 2 - v * (h / 5);
  const pts = valores.map((v, i) => [i * passo, y(v)] as const);
  const d = pts.reduce((acc, [x, yy], i) => {
    if (i === 0) return `M${x},${yy}`;
    const [px, py] = pts[i - 1];
    const cx = (px + x) / 2;
    return `${acc} C${cx},${py} ${cx},${yy} ${x},${yy}`;
  }, "");
  return (
    <svg viewBox={`-8 -8 ${w + 16} ${h + 16}`} className={cn("w-full overflow-visible", className)} aria-hidden="true">
      <line x1="0" x2={w} y1={h / 2} y2={h / 2} stroke="var(--border)" strokeDasharray="3 5" />
      <path
        d={d}
        fill="none"
        stroke={cor}
        strokeWidth="2.5"
        strokeLinecap="round"
        pathLength={1}
        style={animar ? { strokeDasharray: 1, strokeDashoffset: 1, animation: "trilha 2.4s 0.4s ease-out forwards" } : undefined}
      />
      {pts.map(([x, yy], i) => (
        <circle key={i} cx={x} cy={yy} r="4.5" fill="var(--card)" stroke={valores[i] >= 0 ? "var(--ouro)" : "var(--primary)"} strokeWidth="2.5" />
      ))}
      <style>{`@keyframes trilha{to{stroke-dashoffset:0}}`}</style>
    </svg>
  );
}

export function MiniJornada({ cartoes, className, compacto = false }: Props) {
  const valores = ETAPAS.map((e) => cartoes[e.id]?.emocao ?? e.emocaoTipica);
  return (
    <div className={cn("rounded-xl border border-border bg-card p-3", className)}>
      <CurvaEmocao valores={valores} className={compacto ? "h-10" : "h-14"} />
      <div className={cn("mt-2 grid grid-cols-4 gap-1.5", compacto ? "" : "gap-2")}>
        {ETAPAS.slice(0, compacto ? 4 : 8).map((e, i) => {
          const t = cartoes[e.id]?.texto ?? "";
          return (
            <div key={e.id} className="rounded-md border border-border/80 bg-background p-1.5">
              <p className="truncate text-[9px] font-semibold uppercase tracking-wider text-primary">
                {String(i + 1).padStart(2, "0")} · {e.nome}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground">{t || "—"}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
