import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Lightbulb, Quote, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ETAPA_POR_ID } from "@/data/etapas";
import { CurvaEmocao } from "@/components/mini-jornada";
import { SeletorCanal, SeletorEmocao } from "./campos-emocao";
import { mudarCartao, salvarJornada, useJornada } from "@/lib/jornada";
import { cn } from "@/lib/utils";

/* Passo 0 = o elenco (marca, herói, transformação); 1..8 = as etapas. */
export function ModoGuiado() {
  const j = useJornada();
  const [passo, setPasso] = useState(0);
  const total = j.ordem.length;

  return (
    <div className="grid lg:grid-cols-[260px_1fr_300px]">
      {/* Barra lateral de etapas */}
      <aside className="border-b border-border bg-muted/40 p-3 lg:min-h-[calc(100dvh-6.5rem)] lg:border-b-0 lg:border-r">
        <p className="mb-2 hidden px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:block">Roteiro</p>
        <ol className="flex gap-1 overflow-x-auto lg:flex-col">
          <ItemRoteiro ativo={passo === 0} feito={!!j.heroi.trim()} n="★" nome="O elenco" onClick={() => setPasso(0)} />
          {j.ordem.map((id, i) => (
            <ItemRoteiro
              key={id}
              ativo={passo === i + 1}
              feito={!!j.cartoes[id].texto.trim()}
              n={String(i + 1)}
              nome={ETAPA_POR_ID[id].nome}
              onClick={() => setPasso(i + 1)}
            />
          ))}
        </ol>
      </aside>

      {/* Área central */}
      <section className="px-5 py-8 md:px-10 md:py-12">
        <div className="mx-auto max-w-2xl">
          {passo === 0 ? <Elenco /> : <EtapaGuiada idx={passo - 1} />}
          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <Button variant="ghost" disabled={passo === 0} onClick={() => setPasso((p) => p - 1)}>
              <ArrowLeft /> Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              {passo === 0 ? "Antes de começar" : `Etapa ${passo} de ${total}`}
            </span>
            {passo < total ? (
              <Button onClick={() => setPasso((p) => p + 1)}>
                Próxima <ArrowRight />
              </Button>
            ) : (
              <Button asChild>
                <Link to="/construtor" search={{ modo: "resultado" }}>
                  <Sparkles /> Gerar conteúdo
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Prévia */}
      <aside className="hidden border-l border-border bg-card/60 p-5 lg:block">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Prévia da história</p>
        <CurvaEmocao valores={j.ordem.map((id) => j.cartoes[id].emocao)} className="mt-3 h-16" />
        <div className="mt-5 space-y-3">
          {j.ordem.map((id, i) => {
            const t = j.cartoes[id].texto.trim();
            return (
              <button
                key={id}
                onClick={() => setPasso(i + 1)}
                className={cn("block w-full cursor-pointer text-left", passo === i + 1 && "rounded-md bg-accent/70 p-2 -m-2")}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{ETAPA_POR_ID[id].nome}</p>
                <p className={cn("line-clamp-2 text-xs leading-relaxed", t ? "text-foreground/80" : "italic text-muted-foreground/70")}>
                  {t || "Ainda não escrita"}
                </p>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

function ItemRoteiro({ ativo, feito, n, nome, onClick }: { ativo: boolean; feito: boolean; n: string; nome: string; onClick: () => void }) {
  return (
    <li className="shrink-0">
      <button
        onClick={onClick}
        aria-current={ativo ? "step" : undefined}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-md px-2.5 py-2 text-left text-sm transition-colors",
          ativo ? "bg-card font-medium shadow-sm" : "text-foreground/75 hover:bg-card/60",
        )}
      >
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
            feito ? "bg-primary text-primary-foreground" : "border border-border bg-background text-muted-foreground",
          )}
        >
          {feito ? <Check className="size-3" /> : n}
        </span>
        {nome}
      </button>
    </li>
  );
}

function Elenco() {
  const j = useJornada();
  const set = (k: "marca" | "heroi" | "transformacao", v: string) => salvarJornada((x) => ({ ...x, [k]: v }));
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Antes de começar</p>
      <h1 className="mt-2 text-3xl font-medium md:text-4xl">Quem está nesta história?</h1>
      <p className="mt-3 text-muted-foreground">Três respostas curtas guiam todas as etapas. Você pode mudar quando quiser.</p>
      <div className="mt-8 space-y-6">
        <div>
          <Label htmlFor="g-heroi">O herói: quem é o seu cliente ideal?</Label>
          <Input id="g-heroi" className="mt-2 h-11 bg-card" placeholder="Ex.: Ana, gerente de marketing de uma loja de cosméticos" value={j.heroi} onChange={(e) => set("heroi", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="g-marca">O mentor: qual é a sua marca?</Label>
          <Input id="g-marca" className="mt-2 h-11 bg-card" placeholder="Ex.: Fluxa" value={j.marca} onChange={(e) => set("marca", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="g-transf">A transformação: de onde para onde o herói vai?</Label>
          <Input id="g-transf" className="mt-2 h-11 bg-card" placeholder="Ex.: de apagar incêndios a decidir com números" value={j.transformacao} onChange={(e) => set("transformacao", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

function EtapaGuiada({ idx }: { idx: number }) {
  const j = useJornada();
  const id = j.ordem[idx];
  const e = ETAPA_POR_ID[id];
  const c = j.cartoes[id];
  const Icone = e.icone;
  return (
    <div key={id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3">
        <span className="font-heading text-5xl italic text-ouro">{String(idx + 1).padStart(2, "0")}</span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{e.papel}</p>
          <p className="font-heading text-xl font-semibold">{e.nome}</p>
        </div>
        <Icone className="ml-auto size-7 text-ouro" aria-hidden="true" />
      </div>
      <h1 className="mt-6 text-2xl font-medium md:text-3xl">{e.pergunta}</h1>

      <div className="mt-5 flex gap-3 rounded-lg bg-accent/60 p-4 text-sm">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-ouro" />
        <p className="text-foreground/80">{e.dica}</p>
      </div>

      <Label htmlFor={`t-${id}`} className="sr-only">Texto da etapa</Label>
      <Textarea
        id={`t-${id}`}
        value={c.texto}
        onChange={(ev) => mudarCartao(id, { texto: ev.target.value })}
        placeholder={j.heroi ? `Escreva como ${j.heroi.split(",")[0]} vive esta etapa…` : "Escreva como o seu herói vive esta etapa…"}
        className="mt-5 min-h-40 bg-card text-base leading-relaxed"
      />
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <button type="button" className="cursor-pointer underline-offset-4 hover:text-primary hover:underline" onClick={() => mudarCartao(id, { texto: e.exemplo })}>
          Usar o exemplo como ponto de partida
        </button>
        <span>{c.texto.length} caracteres</span>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor={`c-${id}`} className="mb-2 block">Onde acontece (canal)</Label>
          <SeletorCanal id={`c-${id}`} valor={c.canal} aoMudar={(v) => mudarCartao(id, { canal: v })} className="bg-card" />
        </div>
        <div>
          <Label className="mb-2 block">Como o herói se sente</Label>
          <SeletorEmocao valor={c.emocao} aoMudar={(v) => mudarCartao(id, { emocao: v })} />
        </div>
      </div>

      <figure className="mt-8 rounded-xl border border-border bg-card p-5">
        <Quote className="size-4 text-ouro" />
        <figcaption className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Exemplo</figcaption>
        <blockquote className="mt-1 font-heading italic leading-relaxed">{e.exemplo}</blockquote>
      </figure>
    </div>
  );
}
