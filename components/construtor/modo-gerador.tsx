import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { gerarJornada, progresso, salvarJornada, useJornada, type EntradaGerador } from "@/lib/jornada";

const CAMPOS: { k: keyof EntradaGerador; rotulo: string; ex: string; longo?: boolean }[] = [
  { k: "marca", rotulo: "Nome da sua marca", ex: "Fluxa" },
  { k: "produto", rotulo: "O que você vende", ex: "um sistema de gestão financeira" },
  { k: "heroi", rotulo: "Quem é o cliente (o herói)", ex: "Rafael, dono de uma distribuidora" },
  { k: "problema", rotulo: "Qual problema ele vive hoje", ex: "o caixa desorganizado e nenhuma noção do lucro", longo: true },
  { k: "objecao", rotulo: "O que o faz hesitar em comprar", ex: "achar que sistema é caro e difícil de usar", longo: true },
  { k: "transformacao", rotulo: "Qual transformação ele conquista", ex: "decidir com números e fechar o caixa em 10 minutos", longo: true },
  { k: "primeiroPasso", rotulo: "Qual é o primeiro passo que você oferece", ex: "um teste grátis de 14 dias, sem cartão" },
];

export function ModoGerador({ aoGerar }: { aoGerar: () => void }) {
  const j = useJornada();
  const [dados, setDados] = useState<EntradaGerador>({
    marca: j.marca,
    produto: "",
    heroi: j.heroi,
    problema: "",
    objecao: "",
    transformacao: j.transformacao,
    primeiroPasso: "",
  });
  const [gerando, setGerando] = useState(false);
  const preenchidos = Object.values(dados).filter((v) => v.trim()).length;

  const gerar = () => {
    if (progresso(j).feitas > 0 && !confirm("O gerador vai substituir os textos das 8 etapas desta persona. Continuar?")) return;
    setGerando(true);
    setTimeout(() => {
      const g = gerarJornada(dados);
      salvarJornada((x) => ({
        ...x,
        modo: "ia",
        nome: x.personas.length > 1 ? x.nome : g.nome,
        marca: g.marca,
        heroi: g.heroi,
        transformacao: g.transformacao,
        cartoes: g.cartoes,
      }));
      setGerando(false);
      toast.success("Rascunho pronto! Ajuste os cartões no quadro.");
      aoGerar();
    }, 1400);
  };

  return (
    <div className="px-5 py-10 md:py-14">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Gerador automático</p>
          <h1 className="mt-2 text-3xl font-medium md:text-4xl">Conte o essencial. A gente escreve as 8 etapas.</h1>
          <p className="mt-3 text-muted-foreground">Quanto mais específico, melhor o rascunho. Campos vazios ganham um texto genérico para você completar.</p>
          <form
            className="mt-8 grid gap-5 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              gerar();
            }}
          >
            {CAMPOS.map((c) => (
              <div key={c.k} className={c.longo ? "sm:col-span-2" : ""}>
                <Label htmlFor={`ia-${c.k}`}>{c.rotulo}</Label>
                {c.longo ? (
                  <Textarea id={`ia-${c.k}`} rows={2} className="mt-2 bg-card" placeholder={`Ex.: ${c.ex}`} value={dados[c.k]} onChange={(e) => setDados({ ...dados, [c.k]: e.target.value })} />
                ) : (
                  <Input id={`ia-${c.k}`} className="mt-2 h-11 bg-card" placeholder={`Ex.: ${c.ex}`} value={dados[c.k]} onChange={(e) => setDados({ ...dados, [c.k]: e.target.value })} />
                )}
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
              <Button type="submit" size="lg" className="h-12 px-7" disabled={gerando}>
                {gerando ? <Loader2 className="animate-spin" /> : <Wand2 />}
                {gerando ? "Escrevendo a jornada…" : "Gerar minha jornada"}
              </Button>
              <span className="text-sm text-muted-foreground">{preenchidos} de {CAMPOS.length} respostas</span>
            </div>
          </form>
        </div>
        <aside className="h-fit rounded-2xl border border-border bg-tinta p-6 text-papel">
          <p className="font-heading text-xl">Como funciona</p>
          <ol className="mt-4 space-y-4 text-sm text-papel/75">
            <li><span className="font-semibold text-ouro">1.</span> Você responde às 7 perguntas sobre marca e cliente.</li>
            <li><span className="font-semibold text-ouro">2.</span> O gerador distribui as respostas nas 8 etapas da jornada, com canal e emoção sugeridos.</li>
            <li><span className="font-semibold text-ouro">3.</span> O rascunho abre no quadro para você editar, reordenar e exportar.</li>
          </ol>
          <p className="mt-6 border-t border-papel/15 pt-4 text-xs text-papel/55">Dica: depois de gerar, revise etapa por etapa no Passo a passo para deixar com a voz da sua marca.</p>
        </aside>
      </div>
    </div>
  );
}
