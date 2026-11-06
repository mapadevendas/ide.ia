import { useState } from "react";
import { Columns3, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurvaEmocao } from "@/components/mini-jornada";
import { SeletorCanal, SeletorEmocao } from "@/components/construtor/campos-emocao";
import { ETAPAS, EMOCOES, type EtapaId } from "@/data/etapas";
import { CORES_PERSONA, mudarCartaoDe, nomePersona, trocarPersona, useJornada, type Persona } from "@/lib/jornada";
import { cn } from "@/lib/utils";

const rotuloEmocao = (v: number) => EMOCOES.find((e) => e.valor === v)?.rotulo ?? "";

/* Onde as personas vivem a mesma etapa de jeitos diferentes. */
function divergencias(personas: Persona[], id: EtapaId) {
  const emocoes = personas.map((p) => p.cartoes[id].emocao);
  const canais = new Set(personas.map((p) => p.cartoes[id].canal));
  return {
    emocao: Math.max(...emocoes) - Math.min(...emocoes) >= 2,
    canal: canais.size > 1,
    vazia: personas.some((p) => !p.cartoes[id].texto.trim()),
  };
}

/* Comparação das personas: as 8 etapas lado a lado, editáveis, e as curvas emocionais. */
export function CompararPersonas() {
  const j = useJornada();
  const [aberto, setAberto] = useState(false);
  const [ocultas, setOcultas] = useState<string[]>([]);
  const [soDiferencas, setSoDiferencas] = useState(false);

  const indice = (p: Persona) => j.personas.findIndex((x) => x.id === p.id);
  const visiveis = j.personas.filter((p) => !ocultas.includes(p.id));
  const linhas = ETAPAS.filter((e) => {
    if (!soDiferencas) return true;
    const d = divergencias(visiveis, e.id);
    return d.emocao || d.canal;
  });

  const alternar = (id: string) =>
    setOcultas((o) => (o.includes(id) ? o.filter((x) => x !== id) : visiveis.length > 2 ? [...o, id] : o));

  const editar = (id: string) => {
    trocarPersona(id);
    setAberto(false);
  };

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          <Columns3 /> <span className="hidden sm:inline">Comparar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[92dvh] max-w-[min(96vw,1400px)] flex-col gap-3 bg-card p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Comparar personas</DialogTitle>
          <DialogDescription>Veja como cada herói vive a mesma etapa. Dá para editar direto aqui.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="etapas" className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <TabsList>
              <TabsTrigger value="etapas">Etapas lado a lado</TabsTrigger>
              <TabsTrigger value="curvas">Curvas</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex flex-wrap items-center gap-1.5" aria-label="Personas na comparação">
              {j.personas.map((p, i) => {
                const ligada = !ocultas.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => alternar(p.id)}
                    aria-pressed={ligada}
                    title={ligada && visiveis.length <= 2 ? "Compare pelo menos duas personas" : undefined}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      ligada ? "border-primary/60 bg-background text-foreground" : "border-dashed border-border text-muted-foreground line-through",
                    )}
                  >
                    <span className="size-2 rounded-full" style={{ background: CORES_PERSONA[i % CORES_PERSONA.length] }} />
                    <span className="max-w-28 truncate">{nomePersona(p, i)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <TabsContent value="etapas" className="mt-3 flex min-h-0 flex-1 flex-col gap-2">
            <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={soDiferencas} onChange={(e) => setSoDiferencas(e.target.checked)} className="accent-primary" />
              Mostrar só as etapas em que as personas divergem
            </label>

            <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-background">
              <div
                className="grid min-w-max"
                style={{ gridTemplateColumns: `minmax(150px, 190px) repeat(${visiveis.length}, minmax(250px, 1fr))` }}
              >
                {/* Cabeçalho: uma coluna por persona */}
                <div className="sticky left-0 top-0 z-20 border-b border-r border-border bg-card p-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Etapa
                </div>
                {visiveis.map((p) => {
                  const i = indice(p);
                  const cor = CORES_PERSONA[i % CORES_PERSONA.length];
                  const feitas = p.ordem.filter((id) => p.cartoes[id].texto.trim()).length;
                  return (
                    <div key={p.id} className="sticky top-0 z-10 border-b border-r border-border bg-card p-3 last:border-r-0">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 shrink-0 rounded-full" style={{ background: cor }} />
                        <span className="truncate font-medium">{nomePersona(p, i)}</span>
                        {p.id === j.ativa && <span className="shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium">em edição</span>}
                        <Button variant="ghost" size="sm" className="ml-auto h-6 px-2 text-[11px]" onClick={() => editar(p.id)}>
                          <PencilLine /> Abrir
                        </Button>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{p.transformacao || "Transformação ainda não definida"}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <CurvaEmocao valores={ETAPAS.map((e) => p.cartoes[e.id].emocao)} cor={cor} className="h-8 flex-1" />
                        <span className="shrink-0 text-[11px] text-muted-foreground">{feitas}/8</span>
                      </div>
                    </div>
                  );
                })}

                {linhas.map((e) => {
                  const n = ETAPAS.indexOf(e);
                  const I = e.icone;
                  const d = divergencias(visiveis, e.id);
                  return (
                    <div key={e.id} className="contents">
                      <div className="sticky left-0 z-[5] border-b border-r border-border bg-card p-3">
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                          <I className="size-3.5" /> {String(n + 1).padStart(2, "0")}
                        </p>
                        <p className="mt-1 font-heading text-sm font-semibold leading-tight">{e.nome}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{e.papel}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {d.emocao && <span className="rounded-full bg-ouro/20 px-1.5 py-0.5 text-[10px] font-medium text-foreground">Sentimentos diferentes</span>}
                          {d.canal && <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-foreground">Canais diferentes</span>}
                        </div>
                      </div>
                      {visiveis.map((p) => {
                        const c = p.cartoes[e.id];
                        const pos = p.ordem.indexOf(e.id);
                        return (
                          <div key={p.id} className="flex flex-col gap-2 border-b border-r border-border p-3 last:border-r-0">
                            <textarea
                              value={c.texto}
                              onChange={(ev) => mudarCartaoDe(p.id, e.id, { texto: ev.target.value })}
                              placeholder={`Como ${nomePersona(p, indice(p))} vive esta etapa?`}
                              aria-label={`${e.nome} — ${nomePersona(p, indice(p))}`}
                              rows={4}
                              className={cn(
                                "w-full resize-y rounded-md border bg-card px-2.5 py-2 text-sm leading-relaxed outline-none focus:ring-1 focus:ring-ring",
                                c.texto.trim() ? "border-input" : "border-dashed border-border",
                              )}
                            />
                            <SeletorCanal
                              valor={c.canal}
                              aoMudar={(v) => mudarCartaoDe(p.id, e.id, { canal: v })}
                              className="h-8 text-xs"
                            />
                            <SeletorEmocao compacto valor={c.emocao} aoMudar={(v) => mudarCartaoDe(p.id, e.id, { emocao: v })} />
                            <p className="text-[11px] text-muted-foreground">
                              Sente-se <span className="font-medium text-foreground">{rotuloEmocao(c.emocao).toLowerCase()}</span>
                              {pos !== n && <> · posição {pos + 1} no quadro</>}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {linhas.length === 0 && (
                  <p className="col-span-full p-8 text-center text-sm text-muted-foreground">
                    Nenhuma divergência: as personas sentem e chegam pelos mesmos canais em todas as etapas.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="curvas" className="mt-3 min-h-0 flex-1 space-y-3 overflow-auto">
            {visiveis.map((p) => {
              const i = indice(p);
              const cor = CORES_PERSONA[i % CORES_PERSONA.length];
              const feitas = p.ordem.filter((id) => p.cartoes[id].texto.trim()).length;
              return (
                <button
                  key={p.id}
                  onClick={() => editar(p.id)}
                  className={cn(
                    "w-full cursor-pointer rounded-xl border bg-background p-3 text-left transition-colors hover:border-primary",
                    p.id === j.ativa ? "border-primary" : "border-border",
                  )}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="size-2.5 rounded-full" style={{ background: cor }} />
                    <span className="font-medium">{nomePersona(p, i)}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{feitas} de 8 etapas</span>
                  </div>
                  <CurvaEmocao valores={p.ordem.map((id) => p.cartoes[id].emocao)} cor={cor} className="mt-1 h-12" />
                </button>
              );
            })}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
