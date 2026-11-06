import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Columns3, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CurvaEmocao } from "@/components/mini-jornada";
import { ETAPAS, EMOCOES } from "@/data/etapas";
import { MARCA_EXEMPLO, PERSONAS_EXEMPLO } from "@/data/personas-exemplo";
import { CORES_PERSONA, jornadaComPersonas, nomePersona, progresso, salvarJornada, trocarPersona, useJornada } from "@/lib/jornada";
import { cn } from "@/lib/utils";

const rotulo = (v: number) => EMOCOES.find((e) => e.valor === v)?.rotulo ?? "";

/* Uma marca, vários heróis: as personas do exemplo com as curvas sobrepostas. */
export function SecaoPersonas() {
  const [sel, setSel] = useState(0);
  const navegar = useNavigate();
  const p = PERSONAS_EXEMPLO[sel];

  const abrir = () => {
    salvarJornada(jornadaComPersonas(MARCA_EXEMPLO, PERSONAS_EXEMPLO));
    navegar({ to: "/construtor", search: { modo: "quadro" } });
  };

  return (
    <section id="personas" className="scroll-mt-20 py-20 md:py-28">
      <div className="container">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.35fr]">
          <div className="lg:sticky lg:top-28">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Várias personas</span>
            <h2 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
              Uma marca. <em className="font-normal text-primary">Vários heróis.</em>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Quem decide a compra não vive a mesma história de quem usa o produto no dia a dia. Crie até 5 personas na
              mesma jornada, dê um nome a cada uma e compare as etapas lado a lado.
            </p>

            <div className="mt-8 space-y-2" role="tablist" aria-label="Personas do exemplo">
              {PERSONAS_EXEMPLO.map((x, i) => {
                const ativa = i === sel;
                const cor = CORES_PERSONA[i % CORES_PERSONA.length];
                return (
                  <button
                    key={x.nome}
                    role="tab"
                    aria-selected={ativa}
                    onClick={() => setSel(i)}
                    onMouseEnter={() => setSel(i)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-4 rounded-xl border p-4 text-left transition-all",
                      ativa ? "border-primary/70 bg-card shadow-md" : "border-border bg-transparent hover:bg-card/60",
                    )}
                  >
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-full font-heading text-lg font-semibold text-tinta"
                      style={{ background: cor }}
                    >
                      {x.nome[0]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{x.nome}</span>
                      <span className="block truncate text-sm text-muted-foreground">{x.papel}</span>
                    </span>
                    <CurvaEmocao valores={ETAPAS.map((e) => x.cartoes[e.id].emocao)} cor={cor} className="h-8 w-24 shrink-0" />
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={abrir}>
                Abrir este exemplo <ArrowRight />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/construtor">Criar com as minhas personas</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xl shadow-tinta/5 md:p-7">
            <div className="flex items-center justify-between gap-3">
              <p className="font-heading text-lg font-semibold">Jornada — {MARCA_EXEMPLO}</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium">
                <UsersRound className="size-3.5" /> {PERSONAS_EXEMPLO.length} personas
              </span>
            </div>

            {/* Curvas sobrepostas: a selecionada em destaque */}
            <div className="relative mt-5 h-32 rounded-xl border border-border bg-background px-3 py-2">
              {PERSONAS_EXEMPLO.map((x, i) => (
                <div
                  key={x.nome}
                  className={cn("absolute inset-x-3 inset-y-2 transition-opacity duration-300", i === sel ? "z-10 opacity-100" : "opacity-25")}
                >
                  <CurvaEmocao valores={ETAPAS.map((e) => x.cartoes[e.id].emocao)} cor={CORES_PERSONA[i % CORES_PERSONA.length]} className="h-full" />
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-8 text-center text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
              {ETAPAS.map((e, i) => (
                <span key={e.id} className="truncate px-0.5" title={e.nome}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={sel}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mt-6"
              >
                <p className="text-sm">
                  <span className="font-medium">{p.nome}:</span> <span className="text-muted-foreground">{p.transformacao}</span>
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(["chamado", "recusa", "mentor", "recompensa"] as const).map((id) => {
                    const e = ETAPAS.find((x) => x.id === id)!;
                    const c = p.cartoes[id];
                    return (
                      <div key={id} className="rounded-lg border border-border bg-background p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-primary">
                            {String(ETAPAS.indexOf(e) + 1).padStart(2, "0")} · {e.nome}
                          </p>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                              c.emocao < 0 ? "bg-primary/10 text-primary" : "bg-ouro/20 text-foreground",
                            )}
                          >
                            {rotulo(c.emocao)}
                          </span>
                        </div>
                        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-foreground/80">{c.texto}</p>
                        <p className="mt-2 text-[10px] text-muted-foreground">{c.canal}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <SuasPersonas />
      </div>
    </section>
  );
}

/* Se a pessoa já tem um rascunho com personas, mostra para retomar de onde parou. */
function SuasPersonas() {
  const j = useJornada();
  const navegar = useNavigate();
  const comConteudo = j.atualizadoEm > 0 && j.personas.some((p) => p.heroi.trim() || p.nome?.trim() || p.ordem.some((id) => p.cartoes[id].texto.trim()));
  if (!comConteudo) return null;

  const ir = (id: string) => {
    trocarPersona(id);
    navegar({ to: "/construtor" });
  };

  return (
    <div className="mt-14 rounded-2xl border border-dashed border-ouro/70 bg-accent/40 p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Seu rascunho</p>
          <p className="mt-1 font-heading text-xl font-semibold">{j.nome}</p>
        </div>
        <Button variant="outline" size="sm" className="bg-card" asChild>
          <Link to="/construtor" search={{ modo: "quadro" }}>
            <Columns3 /> Continuar no construtor
          </Link>
        </Button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {j.personas.map((p, i) => {
          const cor = CORES_PERSONA[i % CORES_PERSONA.length];
          const feitas = progresso({ ...j, ordem: p.ordem, cartoes: p.cartoes }).feitas;
          return (
            <button
              key={p.id}
              onClick={() => ir(p.id)}
              className="cursor-pointer rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary"
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="size-2.5 rounded-full" style={{ background: cor }} />
                <span className="truncate font-medium">{nomePersona(p, i)}</span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">{feitas} de 8</span>
              </div>
              <CurvaEmocao valores={p.ordem.map((id) => p.cartoes[id].emocao)} cor={cor} className="mt-1 h-9" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
