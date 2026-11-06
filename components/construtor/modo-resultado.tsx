import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BookOpenText, Check, Copy, Download, Film, GalleryHorizontalEnd, Handshake, ImageIcon, Plus, RotateCcw, Sparkles, Trash2, Type, Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ETAPAS, ETAPA_POR_ID } from "@/data/etapas";
import { mudarPersona, nomePersona, progresso, useJornada, type Dor } from "@/lib/jornada";
import { FORMATOS, INTENSIDADES, PLATAFORMAS, TIPOS_DOR, TONS, dorVazia, gerarPrompt, sugerirDores, type Formato } from "@/lib/conteudo";
import { cn } from "@/lib/utils";

const ICONES: Record<Formato, LucideIcon> = {
  narrativa: BookOpenText,
  textos: Type,
  imagens: ImageIcon,
  reels: Film,
  abordagem: Handshake,
  carrossel: GalleryHorizontalEnd,
};

const COR_INTENSIDADE = { Alta: "bg-primary/15 text-primary", Média: "bg-ouro/20 text-ouro", Baixa: "bg-muted text-muted-foreground" };

const campo = "w-full rounded-md border border-input bg-background px-2.5 py-2 text-sm outline-none focus:border-primary [field-sizing:content]";

/* Depois da jornada: quem é atingido, quais dores e os prompts para criar o conteúdo. */
export function ModoResultado() {
  const j = useJornada();
  const i = Math.max(0, j.personas.findIndex((p) => p.id === j.ativa));
  const p = j.personas[i];
  const prog = progresso(j);

  return (
    <div className="papel-textura min-h-[calc(100dvh-6.5rem)]">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Depois da jornada</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-medium md:text-4xl">
          {prog.feitas === prog.total ? "A história de " : "Da história de "}
          <span className="text-primary">{nomePersona(p, i)}</span>
          {prog.feitas === prog.total ? " está escrita. Agora, o conteúdo." : " ao conteúdo que vende."}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Primeiro, defina o público e as dores que a comunicação precisa atingir. Depois, copie os prompts prontos e cole na sua IA favorita para criar narrativa, textos, imagens, reels, abordagem e carrossel.
        </p>
        {prog.feitas < prog.total && (
          <p className="mt-4 inline-flex rounded-lg border border-ouro/40 bg-ouro/10 px-3 py-2 text-sm text-foreground/85">
            {prog.feitas} de {prog.total} etapas escritas. Quanto mais completa a jornada, melhores ficam a tabela e os prompts.
          </p>
        )}

        <nav className="mt-8 flex gap-2 text-sm" aria-label="Partes do resultado">
          <a href="#dores" className="rounded-full border border-border bg-card px-4 py-1.5 hover:border-primary">1 · Dores e público</a>
          <a href="#prompts" className="rounded-full border border-border bg-card px-4 py-1.5 hover:border-primary">2 · Prompts de conteúdo</a>
        </nav>

        <TabelaDores key={`d-${p.id}`} />
        <GeradorPrompts key={`p-${p.id}`} />
      </div>
    </div>
  );
}

function TabelaDores() {
  const j = useJornada();
  const p = j.personas.find((x) => x.id === j.ativa)!;
  const dores = p.dores;

  const set = (lista: Dor[]) => mudarPersona(p.id, { dores: lista });
  const mudar = (id: string, patch: Partial<Dor>) => set((dores ?? []).map((d) => (d.id === id ? { ...d, ...patch } : d)));

  return (
    <section id="dores" className="mt-10 scroll-mt-40 rounded-2xl border border-border bg-card p-5 md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-medium">
            <Users className="size-5 text-ouro" /> Dores, necessidades e público
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">O que o herói sente, quem é atingido e como a sua marca responde a cada ponto.</p>
        </div>
        {dores && dores.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!confirm("Refazer a tabela a partir da jornada? As linhas atuais serão substituídas.")) return;
                set(sugerirDores(j, p));
                toast.success("Tabela refeita a partir da jornada");
              }}
            >
              <RotateCcw /> Refazer pela jornada
            </Button>
            <Button size="sm" onClick={() => set([...dores, dorVazia()])}>
              <Plus /> Nova linha
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Label htmlFor="publico" className="mb-2 block">Público atingido</Label>
        <textarea
          id="publico"
          value={p.publico ?? ""}
          onChange={(e) => mudarPersona(p.id, { publico: e.target.value })}
          placeholder={p.heroi ? `Ex.: ${p.heroi} — idade, região, cargo, momento de vida, onde passa o tempo online` : "Quem é, onde está, momento de vida, onde passa o tempo online"}
          className={cn(campo, "min-h-16")}
        />
      </div>

      {!dores || dores.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <Sparkles className="size-7 text-primary" />
          <p className="mt-3 font-heading text-xl">Monte a tabela em um clique</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            A partir das etapas da jornada, criamos 5 linhas — necessidade, dor, objeção, obstáculo e desejo — para você ajustar.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button onClick={() => set(sugerirDores(j, p))}>
              <Sparkles /> Montar a partir da jornada
            </Button>
            <Button variant="outline" onClick={() => set([dorVazia()])}>
              Começar em branco
            </Button>
          </div>
        </div>
      ) : (
        <div className="-mx-5 mt-6 overflow-x-auto px-5 md:-mx-7 md:px-7">
          <table className="w-full min-w-[1080px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {["Dor / necessidade", "Tipo e intensidade", "Etapa", "Quem sente (público)", "Como a marca atende", "Mensagem-chave", ""].map((h) => (
                  <th key={h} className="border-b border-border px-2 pb-2 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dores.map((d) => (
                <tr key={d.id} className="align-top">
                  <td className="w-[22%] border-b border-border/60 p-2">
                    <input value={d.titulo} onChange={(e) => mudar(d.id, { titulo: e.target.value })} placeholder="Nome curto da dor" aria-label="Nome da dor" className={cn(campo, "mb-1.5 font-medium")} />
                    <textarea value={d.descricao} onChange={(e) => mudar(d.id, { descricao: e.target.value })} placeholder="Como ela aparece no dia a dia" aria-label="Descrição da dor" className={cn(campo, "min-h-20 text-muted-foreground")} />
                  </td>
                  <td className="w-[12%] border-b border-border/60 p-2">
                    <select value={d.tipo} onChange={(e) => mudar(d.id, { tipo: e.target.value as Dor["tipo"] })} aria-label="Tipo" className={cn(campo, "mb-1.5")}>
                      {TIPOS_DOR.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <div className="flex gap-1" role="radiogroup" aria-label="Intensidade">
                      {INTENSIDADES.map((n) => (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={d.intensidade === n}
                          onClick={() => mudar(d.id, { intensidade: n })}
                          className={cn(
                            "cursor-pointer rounded-full px-2 py-0.5 text-[11px] font-medium transition-opacity",
                            COR_INTENSIDADE[n],
                            d.intensidade === n ? "ring-1 ring-current" : "opacity-45 hover:opacity-80",
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="w-[12%] border-b border-border/60 p-2">
                    <select value={d.etapa} onChange={(e) => mudar(d.id, { etapa: e.target.value as Dor["etapa"] })} aria-label="Etapa da jornada" className={campo}>
                      {ETAPAS.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
                    </select>
                  </td>
                  <td className="w-[16%] border-b border-border/60 p-2">
                    <textarea value={d.publico} onChange={(e) => mudar(d.id, { publico: e.target.value })} placeholder="Quem sente mais esta dor" aria-label="Público" className={cn(campo, "min-h-20")} />
                  </td>
                  <td className="w-[18%] border-b border-border/60 p-2">
                    <textarea value={d.solucao} onChange={(e) => mudar(d.id, { solucao: e.target.value })} placeholder="Como o produto ou serviço resolve" aria-label="Como a marca atende" className={cn(campo, "min-h-20")} />
                  </td>
                  <td className="w-[16%] border-b border-border/60 p-2">
                    <textarea value={d.mensagem} onChange={(e) => mudar(d.id, { mensagem: e.target.value })} placeholder="A frase que a comunicação usa" aria-label="Mensagem-chave" className={cn(campo, "min-h-20 font-heading italic")} />
                  </td>
                  <td className="border-b border-border/60 p-2">
                    <Button variant="ghost" size="icon" aria-label="Remover linha" onClick={() => set(dores.filter((x) => x.id !== d.id))}>
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function GeradorPrompts() {
  const j = useJornada();
  const i = Math.max(0, j.personas.findIndex((p) => p.id === j.ativa));
  const p = j.personas[i];
  const [formato, setFormato] = useState<Formato>("narrativa");
  const [tom, setTom] = useState(TONS[0]);
  const [plataforma, setPlataforma] = useState(PLATAFORMAS[0]);
  const [dorId, setDorId] = useState<string>("todas");
  const [copiado, setCopiado] = useState(false);

  const opcoes = { tom, plataforma, dorId: p.dores?.some((d) => d.id === dorId) ? dorId : "todas" };
  const prompt = useMemo(() => gerarPrompt(formato, j, p, i, opcoes), [formato, j, p, i, opcoes.tom, opcoes.plataforma, opcoes.dorId]);

  const copiar = async (texto: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success(msg);
      return true;
    } catch {
      toast.error("Não foi possível copiar. Selecione o texto e copie manualmente.");
      return false;
    }
  };

  const todos = () =>
    FORMATOS.map((f) => `==================== ${f.nome.toUpperCase()} ====================\n\n${gerarPrompt(f.id, j, p, i, opcoes)}`).join("\n\n\n");

  const baixar = () => {
    const blob = new Blob([todos()], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `prompts-${nomePersona(p, i).toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const atual = FORMATOS.find((f) => f.id === formato)!;

  return (
    <section id="prompts" className="mt-8 scroll-mt-40 rounded-2xl border border-border bg-card p-5 md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-medium">
            <Sparkles className="size-5 text-ouro" /> Prompts de conteúdo
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Cada prompt já leva a jornada, o público e a tabela de dores. É só copiar e colar.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => copiar(todos(), "Os 6 prompts foram copiados")}>
            <Copy /> Copiar os 6
          </Button>
          <Button variant="outline" size="sm" onClick={baixar}>
            <Download /> Baixar .txt
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" role="tablist" aria-label="Tipo de conteúdo">
        {FORMATOS.map((f) => {
          const I = ICONES[f.id];
          const ativo = f.id === formato;
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={ativo}
              onClick={() => setFormato(f.id)}
              className={cn(
                "flex cursor-pointer flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors",
                ativo ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/50",
              )}
            >
              <I className={cn("size-5", ativo ? "text-primary" : "text-ouro")} />
              <span className="text-sm font-semibold">{f.nome}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{atual.resumo}</p>
          <div>
            <Label htmlFor="tom" className="mb-1.5 block">Tom de voz</Label>
            <select id="tom" value={tom} onChange={(e) => setTom(e.target.value)} className={campo}>
              {TONS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="plataforma" className="mb-1.5 block">Plataforma</Label>
            <select id="plataforma" value={plataforma} onChange={(e) => setPlataforma(e.target.value)} className={campo}>
              {PLATAFORMAS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="foco" className="mb-1.5 block">Foco</Label>
            <select id="foco" value={opcoes.dorId} onChange={(e) => setDorId(e.target.value)} className={campo}>
              <option value="todas">Todas as dores da tabela</option>
              {(p.dores ?? []).map((d) => (
                <option key={d.id} value={d.id}>{d.titulo || d.tipo} · {ETAPA_POR_ID[d.etapa].nome}</option>
              ))}
            </select>
            {!p.dores?.length && (
              <a href="#dores" className="mt-1.5 block text-xs text-primary underline-offset-4 hover:underline">
                Monte a tabela de dores para prompts mais certeiros
              </a>
            )}
          </div>
        </div>

        <div className="relative min-w-0">
          <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-tinta p-5 pr-28 font-mono text-[13px] leading-relaxed text-papel/85">
            {prompt}
          </pre>
          <Button
            size="sm"
            className="absolute right-3 top-3"
            onClick={async () => {
              if (await copiar(prompt, `Prompt de ${atual.nome.toLowerCase()} copiado`)) {
                setCopiado(true);
                setTimeout(() => setCopiado(false), 1600);
              }
            }}
          >
            {copiado ? <Check /> : <Copy />} {copiado ? "Copiado" : "Copiar"}
          </Button>
        </div>
      </div>
    </section>
  );
}
