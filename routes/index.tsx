import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Footprints, LayoutGrid, Wand2, Clock, Check, Quote, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ETAPAS } from "@/data/etapas";
import { MODELOS } from "@/data/modelos";
import { CurvaEmocao, MiniJornada } from "@/components/mini-jornada";
import { ListaEtapas } from "@/components/lista-etapas";
import { Planos } from "@/components/planos";
import { SecaoPersonas } from "@/components/secao-personas";
import { jornadaDoModelo, salvarJornada } from "@/lib/jornada";
import { cn } from "@/lib/utils";
const dep1 = "/assets/dep-1.webp";
const dep2 = "/assets/dep-2.webp";
const dep3 = "/assets/dep-3.webp";

export const Route = createFileRoute("/")({ component: Inicio });

function Inicio() {
  return (
    <main>
      <Topo />
      <Modos />
      <section id="etapas" className="scroll-mt-20 py-20 md:py-28">
        <div className="container">
          <ListaEtapas />
        </div>
      </section>
      <div className="border-t border-border bg-background">
        <SecaoPersonas />
      </div>
      <Modelos />
      <Depoimentos />
      <section id="planos" className="scroll-mt-20 py-20 md:py-28">
        <div className="container">
          <Planos />
        </div>
      </section>
      <Perguntas />
      <Chamada />
    </main>
  );
}

/* ───────── Topo ───────── */

function Topo() {
  const exemplo = MODELOS[0];
  return (
    <section className="papel-textura relative overflow-hidden border-b border-border">
      <div className="container pb-0 pt-16 text-center md:pt-24">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Badge variant="outline" className="mb-6 border-primary/50 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            <span className="mr-1.5 inline-block size-1.5 rounded-full bg-primary" /> Storytelling para marketing
          </Badge>
          <h1 className="mx-auto max-w-4xl text-5xl font-medium tracking-tight sm:text-6xl md:text-7xl">
            Seu cliente é o herói.
            <br />
            <em className="font-normal text-primary">Escreva a jornada dele.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Monte a jornada do herói da sua marca em 8 etapas: do problema à transformação. Siga o passo a passo, arraste
            cartões num quadro ou deixe o gerador escrever o primeiro rascunho.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-12 px-7 text-base" asChild>
              <Link to="/construtor">
                Criar minha jornada <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 bg-card/70 px-7 text-base" asChild>
              <a href="#modelos">Ver exemplos prontos</a>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Grátis para começar · sem cartão · seu rascunho fica salvo</p>
        </motion.div>

        {/* Prévia do editor */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mx-auto mt-14 max-w-5xl"
        >
          <div className="absolute -inset-x-6 -top-6 bottom-0 rounded-t-[2rem] bg-gradient-to-b from-primary/20 via-ouro/10 to-transparent" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-t-2xl border border-b-0 border-border bg-card text-left shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="font-heading text-base font-semibold">{`Jornada — ${exemplo.marca}`}</span>
                <span className="hidden rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success sm:inline">
                  Salvo automaticamente
                </span>
              </div>
              <div className="flex gap-1.5 text-[11px]">
                {["Guiado", "Quadro", "Gerador"].map((t, i) => (
                  <span key={t} className={cn("rounded-md px-2.5 py-1", i === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid md:grid-cols-[180px_1fr]">
              <aside className="hidden border-r border-border bg-muted/50 p-3 md:block">
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Etapas</p>
                {ETAPAS.map((e, i) => (
                  <div key={e.id} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-xs", i === 3 && "bg-card font-medium shadow-sm")}>
                    <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground">
                      <Check className="size-2.5" />
                    </span>
                    {e.nome}
                  </div>
                ))}
              </aside>
              <div className="p-5">
                <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Curva emocional do herói</span>
                  <span>8 de 8 etapas</span>
                </div>
                <CurvaEmocao valores={ETAPAS.map((e) => exemplo.cartoes[e.id].emocao)} className="h-20" animar />
                <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {ETAPAS.slice(0, 4).map((e, i) => (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + i * 0.18 }}
                      className="rounded-lg border border-border bg-background p-3"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                        {String(i + 1).padStart(2, "0")} · {e.nome}
                      </p>
                      <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-foreground/80">{exemplo.cartoes[e.id].texto}</p>
                      <p className="mt-2 text-[10px] text-muted-foreground">{exemplo.cartoes[e.id].canal}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────── Escolha do modo ───────── */

const MODOS = [
  {
    id: "guiado" as const,
    icone: Footprints,
    nome: "Passo a passo guiado",
    tempo: "15 min",
    para: "Para quem nunca montou uma jornada",
    texto: "Uma pergunta por etapa, com dica e exemplo ao lado. Você responde e a história se forma.",
    recomendado: true,
  },
  {
    id: "quadro" as const,
    icone: LayoutGrid,
    nome: "Quadro visual editável",
    tempo: "Livre",
    para: "Para times e oficinas de estratégia",
    texto: "As 8 etapas em colunas. Edite cartões, reordene arrastando e veja a curva emocional mudar.",
    recomendado: false,
  },
  {
    id: "ia" as const,
    icone: Wand2,
    nome: "Gerador automático",
    tempo: "2 min",
    para: "Para quem quer um primeiro rascunho já",
    texto: "Conte a sua marca, o cliente e a transformação. O gerador escreve as 8 etapas para você ajustar.",
    recomendado: false,
  },
];

function Modos() {
  const [sobre, setSobre] = useState<string | null>(null);
  return (
    <section id="modos" className="scroll-mt-20 bg-secondary/50 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Três caminhos, uma história</span>
          <h2 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">Escolha como quer escrever</h2>
          <p className="mt-4 text-muted-foreground">
            Os três modos editam a mesma jornada. Comece no gerador, refine no guiado e apresente no quadro.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {MODOS.map((m) => {
            const Icone = m.icone;
            const ativo = sobre === m.id;
            return (
              <Link
                key={m.id}
                to="/construtor"
                search={{ modo: m.id }}
                onMouseEnter={() => setSobre(m.id)}
                onMouseLeave={() => setSobre(null)}
                className={cn(
                  "group relative flex flex-col rounded-2xl border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                  m.recomendado ? "border-primary/60" : "border-border",
                )}
              >
                {m.recomendado && (
                  <span className="absolute -top-3 left-7 rounded-full bg-ouro px-3 py-0.5 text-xs font-semibold text-tinta">
                    Recomendado para começar
                  </span>
                )}
                <div className="flex items-start justify-between">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary">
                    <Icone className="size-6" />
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                    <Clock className="size-3" /> {m.tempo}
                  </span>
                </div>
                <h3 className="mt-6 text-2xl font-medium">{m.nome}</h3>
                <p className="mt-1 text-sm font-medium text-primary">{m.para}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.texto}</p>
                <PreviaModo id={m.id} ativo={ativo} />
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  Começar por aqui <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Prefere partir de algo pronto?{" "}
          <a href="#modelos" className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline">
            <Library className="size-4" /> Use um modelo por setor
          </a>
        </p>
      </div>
    </section>
  );
}

function PreviaModo({ id, ativo }: { id: "guiado" | "quadro" | "ia"; ativo: boolean }) {
  return (
    <div className="mt-5 h-28 overflow-hidden rounded-lg border border-border bg-background p-3" aria-hidden="true">
      {id === "guiado" && (
        <div className="space-y-2">
          <div className="flex gap-1">
            {ETAPAS.map((e, i) => (
              <span key={e.id} className={cn("h-1 flex-1 rounded-full transition-colors duration-500", i < (ativo ? 4 : 2) ? "bg-primary" : "bg-border")} />
            ))}
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Etapa {ativo ? 4 : 2} de 8</p>
          <p className="font-heading text-sm leading-snug">{ativo ? ETAPAS[3].pergunta : ETAPAS[1].pergunta}</p>
          <div className="h-5 rounded border border-border bg-card" />
        </div>
      )}
      {id === "quadro" && (
        <div className="grid h-full grid-cols-4 gap-1.5">
          {ETAPAS.slice(0, 4).map((e, i) => (
            <div key={e.id} className="space-y-1">
              <div className="truncate rounded bg-accent px-1 py-0.5 text-[8px] font-semibold text-foreground/80">{e.nome}</div>
              <div
                className={cn(
                  "h-9 rounded border border-border bg-card transition-transform duration-500",
                  ativo && i === 1 && "translate-x-3 -rotate-3 border-primary shadow-md",
                )}
              />
              {i % 2 === 0 && <div className="h-6 rounded border border-border bg-card" />}
            </div>
          ))}
        </div>
      )}
      {id === "ia" && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground">Marca: Fluxa · Herói: dono de distribuidora</p>
          {[92, 78, 85, 60].map((w, i) => (
            <div
              key={i}
              className="h-2 rounded-full bg-muted transition-all duration-700"
              style={{ width: ativo ? `${w}%` : `${w * 0.35}%`, transitionDelay: `${i * 120}ms` }}
            />
          ))}
          <p className="inline-flex items-center gap-1 pt-1 text-[10px] font-medium text-primary">
            <Wand2 className="size-3" /> {ativo ? "Escrevendo as 8 etapas…" : "Pronto para gerar"}
          </p>
        </div>
      )}
    </div>
  );
}

/* ───────── Modelos ───────── */

function Modelos() {
  const setores = ["Todos", ...Array.from(new Set(MODELOS.map((m) => m.setor)))];
  const [filtro, setFiltro] = useState("Todos");
  const navegar = useNavigate();
  const lista = filtro === "Todos" ? MODELOS : MODELOS.filter((m) => m.setor === filtro);

  return (
    <section id="modelos" className="scroll-mt-20 border-y border-border bg-secondary/50 py-20 md:py-28">
      <div className="container">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Modelos prontos</span>
            <h2 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">Jornadas já escritas, para adaptar</h2>
            <p className="mt-4 text-muted-foreground">Cada modelo traz as 8 etapas preenchidas com uma história real de setor. Abra, troque os nomes e é seu.</p>
          </div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por setor">
            {setores.map((s) => (
              <button
                key={s}
                role="tab"
                aria-selected={filtro === s}
                onClick={() => setFiltro(s)}
                className={cn(
                  "cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  filtro === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-foreground/30",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {lista.map((m) => (
            <article key={m.id} className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-lg">
              <MiniJornada cartoes={m.cartoes} compacto className="bg-background" />
              <div className="mt-5 flex items-center gap-2">
                <Badge variant="secondary">{m.setor}</Badge>
                <span className="text-xs text-muted-foreground">{m.marca}</span>
              </div>
              <h3 className="mt-2 text-xl font-medium">{m.nome}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{m.resumo}</p>
              <p className="mt-3 text-sm">
                <span className="font-medium">Herói:</span> <span className="text-muted-foreground">{m.heroi}</span>
              </p>
              <div className="mt-5 flex gap-2">
                <Button
                  onClick={() => {
                    salvarJornada(jornadaDoModelo(m));
                    navegar({ to: "/construtor", search: { modo: "quadro" } });
                  }}
                >
                  Usar este modelo
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Depoimentos ───────── */

const DEPOIMENTOS = [
  {
    foto: dep1,
    nome: "Patrícia Moura",
    cargo: "Gerente de marketing, rede de óticas",
    texto: "Levamos a jornada para a reunião com a diretoria em formato de quadro. Pela primeira vez, todo mundo entendeu por que o cliente desistia na etapa de orçamento.",
  },
  {
    foto: dep2,
    nome: "Diego Albuquerque",
    cargo: "Fundador de uma escola de programação",
    texto: "O gerador escreveu um rascunho em dois minutos. Ajustei no passo a passo e virou o roteiro dos nossos anúncios. O custo por matrícula caiu bastante.",
  },
  {
    foto: dep3,
    nome: "Larissa Teles",
    cargo: "Sócia de agência de conteúdo",
    texto: "Uso com cada cliente novo, na primeira oficina. Em uma hora saímos com o herói, o vilão e a promessa da marca definidos.",
  },
];

function Depoimentos() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Quem já contou a sua história</span>
          <h2 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">Marcas que viraram mentoras</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {DEPOIMENTOS.map((d) => (
            <figure key={d.nome} className="flex flex-col rounded-2xl border border-border bg-card p-7">
              <Quote className="size-7 text-ouro" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 font-heading text-lg leading-relaxed">{d.texto}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <img src={d.foto} alt={d.nome} className="size-11 rounded-full object-cover" loading="lazy" />
                <div>
                  <p className="text-sm font-semibold">{d.nome}</p>
                  <p className="text-xs text-muted-foreground">{d.cargo}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-tinta p-8 text-papel md:grid-cols-4">
          {[
            ["8", "etapas com pergunta, dica e exemplo"],
            ["3", "modos para criar do seu jeito"],
            ["2 min", "para o primeiro rascunho"],
            ["4", "modelos prontos por setor"],
          ].map(([n, t]) => (
            <div key={t}>
              <p className="font-heading text-4xl font-semibold text-ouro">{n}</p>
              <p className="mt-1 text-sm text-papel/70">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Perguntas ───────── */

function Perguntas() {
  const itens = [
    ["O que é a jornada do herói no marketing?", "É uma estrutura narrativa em que o cliente é o protagonista: ele vive um problema, hesita, encontra um guia (a sua marca), enfrenta obstáculos e conquista uma transformação. Serve para planejar campanhas, páginas de venda, roteiros de vídeo e o funil inteiro."],
    ["Posso trocar de modo no meio do caminho?", "Pode. Os três modos editam a mesma jornada. É comum gerar um rascunho no gerador, revisar etapa por etapa no guiado e reorganizar no quadro."],
    ["Meu trabalho fica salvo?", "Sim, o rascunho é salvo automaticamente neste aparelho a cada alteração. Para guardar várias jornadas na nuvem e trabalhar em equipe, é só criar a sua conta quando ela estiver disponível."],
    ["Como compartilho com o time ou o cliente?", "No construtor, use Exportar: você pode imprimir ou salvar em PDF, copiar o texto completo ou gerar um link que abre a jornada pronta para leitura."],
  ];
  return (
    <section id="perguntas" className="scroll-mt-20 border-t border-border bg-secondary/50 py-20 md:py-28">
      <div className="container grid gap-10 md:grid-cols-[1fr_1.4fr]">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Dúvidas</span>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Perguntas frequentes</h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {itens.map(([p, r]) => (
            <AccordionItem key={p} value={p}>
              <AccordionTrigger className="text-left font-heading text-lg">{p}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{r}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function Chamada() {
  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground md:px-16">
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(var(--papel) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <h2 className="relative mx-auto max-w-2xl text-4xl font-medium tracking-tight sm:text-5xl">Toda grande marca começou com uma boa história.</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-primary-foreground/85">A do seu cliente começa agora. Leva 15 minutos.</p>
          <Button size="lg" variant="secondary" className="relative mt-8 h-12 px-8 text-base" asChild>
            <Link to="/construtor">
              Começar minha jornada <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
