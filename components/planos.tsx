import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Check, Star, FileText, Presentation, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Plano = {
  nome: string;
  mensal: number;
  anual: number;
  descricao: string;
  recursos: string[];
  botao: string;
  popular: boolean;
};

const PLANOS: Plano[] = [
  {
    nome: "Aprendiz",
    mensal: 0,
    anual: 0,
    descricao: "Para criar a primeira jornada, sem cartão.",
    recursos: ["1 jornada ativa", "Os 3 modos de criação", "4 modelos por setor", "Exportar em texto e PDF"],
    botao: "Começar grátis",
    popular: false,
  },
  {
    nome: "Narrador",
    mensal: 49,
    anual: 39,
    descricao: "Para quem cria campanhas todo mês.",
    recursos: [
      "Jornadas ilimitadas",
      "Gerador automático sem limite",
      "Exportar em slides",
      "Link compartilhável",
      "Várias personas por jornada",
      "Biblioteca completa de modelos",
    ],
    botao: "Testar 14 dias grátis",
    popular: true,
  },
  {
    nome: "Saga",
    mensal: 149,
    anual: 119,
    descricao: "Para agências e times de marketing.",
    recursos: [
      "Tudo do Narrador",
      "Até 10 pessoas no time",
      "Marca própria nas exportações",
      "Pastas por cliente",
      "Suporte prioritário",
    ],
    botao: "Falar com a equipe",
    popular: false,
  },
];

export function Planos() {
  const [anual, setAnual] = useState(true);
  const [sobre, setSobre] = useState<number | null>(null);

  return (
    <div>
      <div className="mb-12 space-y-4 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Planos</span>
        <h2 className="text-4xl font-medium tracking-tight sm:text-5xl">Comece grátis. Cresça quando a história pedir.</h2>
        <p className="text-lg text-muted-foreground">Sem fidelidade. Cancele quando quiser.</p>
        <div role="radiogroup" aria-label="Período de cobrança" className="mx-auto inline-flex rounded-full border border-border bg-card p-1 text-sm">
          {[
            { v: false, r: "Mensal" },
            { v: true, r: "Anual" },
          ].map((o) => (
            <button
              key={o.r}
              role="radio"
              aria-checked={anual === o.v}
              onClick={() => setAnual(o.v)}
              className={cn(
                "cursor-pointer rounded-full px-4 py-1.5 font-medium transition-colors",
                anual === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {o.r}
              {o.v && <span className={cn("ml-1.5 text-xs", anual ? "text-primary-foreground/70" : "text-primary")}>−20%</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        {PLANOS.map((p, i) => {
          const preco = anual ? p.anual : p.mensal;
          return (
            <motion.div
              key={p.nome}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onHoverStart={() => setSobre(i)}
              onHoverEnd={() => setSobre(null)}
              className="relative"
            >
              <motion.div
                animate={{ y: sobre === i ? -8 : 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border-2 p-8 transition-shadow duration-300",
                  p.popular ? "border-primary bg-card shadow-lg shadow-primary/15" : "border-border bg-card/60",
                  sobre === i && "shadow-xl",
                )}
              >
                {p.popular && (
                  <div className="absolute -top-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                    <Star className="size-4 fill-current" />
                    Mais escolhido
                  </div>
                )}
                <p className="mb-4 font-heading text-xl font-semibold">{p.nome}</p>
                <div className="mb-2">
                  <span className="font-heading text-5xl font-semibold tracking-tight">
                    {preco === 0 ? "Grátis" : `R$ ${preco}`}
                  </span>
                  {preco > 0 && <span className="ml-2 text-sm text-muted-foreground">/ mês</span>}
                </div>
                <p className="mb-6 h-5 text-xs text-muted-foreground">
                  {preco > 0 && anual ? `Cobrado R$ ${preco * 12} por ano` : ""}
                </p>
                <p className="mb-6 text-sm text-muted-foreground">{p.descricao}</p>
                <ul className="mb-8 space-y-3">
                  {p.recursos.map((r) => (
                    <li key={r} className="flex items-start gap-3">
                      <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                      <span className="text-sm">{r}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <Button className="w-full" size="lg" variant={p.popular ? "default" : "outline"} asChild>
                    <Link to="/construtor">{p.botao}</Link>
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Exporte do seu jeito:</span>
        <span className="inline-flex items-center gap-2"><FileText className="size-4 text-ouro" /> PDF</span>
        <span className="inline-flex items-center gap-2"><Presentation className="size-4 text-ouro" /> Slides</span>
        <span className="inline-flex items-center gap-2"><Link2 className="size-4 text-ouro" /> Link compartilhável</span>
      </div>
    </div>
  );
}
