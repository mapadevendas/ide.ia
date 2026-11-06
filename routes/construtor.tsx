import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Footprints, LayoutGrid, Wand2, Sparkles, Download, Printer, Copy, Link2, RotateCcw, Library, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Marca } from "@/components/marca";
import { FolhaJornada } from "@/components/folha-jornada";
import { ModoGuiado } from "@/components/construtor/modo-guiado";
import { ModoQuadro } from "@/components/construtor/modo-quadro";
import { ModoGerador } from "@/components/construtor/modo-gerador";
import { BarraPersonas } from "@/components/construtor/barra-personas";
import { ModoResultado } from "@/components/construtor/modo-resultado";
import { MODELOS } from "@/data/modelos";
import { codificar, comoTexto, horaSalva, jornadaDoModelo, novaJornada, progresso, salvarJornada, useJornada } from "@/lib/jornada";
import { cn } from "@/lib/utils";

const busca = z.object({ modo: z.enum(["guiado", "quadro", "ia", "resultado"]).optional().catch(undefined) });

export const Route = createFileRoute("/construtor")({
  validateSearch: busca,
  component: Construtor,
});

const ABAS = [
  { id: "guiado" as const, rotulo: "Passo a passo", icone: Footprints },
  { id: "quadro" as const, rotulo: "Quadro visual", icone: LayoutGrid },
  { id: "ia" as const, rotulo: "Gerador", icone: Wand2 },
  { id: "resultado" as const, rotulo: "Conteúdo", icone: Sparkles },
];

function Construtor() {
  const { modo } = Route.useSearch();
  const navegar = useNavigate({ from: "/construtor" });
  const j = useJornada();
  const aba = modo ?? (j.modo === "quadro" || j.modo === "ia" ? j.modo : "guiado");
  const p = progresso(j);

  useEffect(() => {
    document.title = `${j.nome} · Cardume`;
  }, [j.nome]);

  const ir = (m: "guiado" | "quadro" | "ia" | "resultado") => navegar({ search: { modo: m } });

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card print:hidden">
        <div className="flex h-14 items-center gap-3 px-4 md:px-6">
          <Link to="/" aria-label="Voltar ao início" className="flex items-center gap-2">
            <ArrowLeft className="size-4 text-muted-foreground" />
            <Marca className="w-40" />
          </Link>
          <span className="mx-1 hidden h-6 w-px bg-border md:block" />
          <input
            value={j.nome}
            onChange={(e) => salvarJornada((x) => ({ ...x, nome: e.target.value }))}
            aria-label="Nome da jornada"
            className="hidden min-w-0 flex-1 rounded-md bg-transparent px-2 py-1 font-heading text-lg font-semibold outline-none hover:bg-muted focus:bg-muted md:block md:max-w-xs"
          />
          <span className="hidden text-xs text-success lg:inline">{horaSalva(j)}</span>
          <div className="ml-auto flex items-center gap-1">
            <Modelos />
            <Exportar />
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-border/60 px-4 py-2 md:px-6">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${p.pct}%` }} />
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {p.feitas} de {p.total} etapas escritas
          </span>
        </div>
        <BarraPersonas />
      </header>

      <div className="flex flex-1 flex-col md:flex-row print:hidden">
        <nav
          aria-label="Modo de criação"
          className="z-20 flex gap-1 overflow-x-auto border-b border-[#5b2fa0] bg-[#3a1670] p-2 md:sticky md:top-0 md:h-[calc(100dvh-3.5rem)] md:w-56 md:shrink-0 md:flex-col md:border-b-0 md:border-r md:p-3"
        >
          <span className="hidden px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-[#d9c6ff] md:block">Modo de criação</span>
          {ABAS.map((a) => {
            const I = a.icone;
            return (
              <button
                key={a.id}
                onClick={() => ir(a.id)}
                aria-current={aba === a.id ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  aba === a.id ? "bg-primary text-primary-foreground" : "text-[#e6dbff] hover:bg-[#4d2190] hover:text-white",
                )}
              >
                <I className="size-4" />
                {a.rotulo}
              </button>
            );
          })}
        </nav>
        <main className="min-w-0 flex-1">
          {aba === "guiado" && <ModoGuiado />}
          {aba === "quadro" && <ModoQuadro />}
          {aba === "ia" && <ModoGerador key={j.ativa} aoGerar={() => ir("quadro")} />}
          {aba === "resultado" && <ModoResultado />}
        </main>
      </div>

      <Impressao />
    </div>
  );
}

function Modelos() {
  const [aberto, setAberto] = useState(false);
  const navegar = useNavigate({ from: "/construtor" });
  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Modelos">
          <Library /> <span className="hidden lg:inline">Modelos</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Começar de um modelo</DialogTitle>
          <DialogDescription>O modelo substitui a jornada atual. Você pode editar tudo depois.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {MODELOS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                salvarJornada(jornadaDoModelo(m));
                setAberto(false);
                navegar({ search: { modo: "quadro" } });
                toast.success(`Modelo “${m.marca}” carregado`);
              }}
              className="cursor-pointer rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-primary"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">{m.setor}</span>
              <p className="mt-1 font-heading font-semibold">{m.nome}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.resumo}</p>
            </button>
          ))}
          <button
            onClick={() => {
              salvarJornada(novaJornada());
              setAberto(false);
              navegar({ search: { modo: "guiado" } });
              toast("Jornada em branco criada");
            }}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-sm font-medium text-muted-foreground hover:border-primary hover:text-foreground sm:col-span-2"
          >
            <RotateCcw className="size-4" /> Começar em branco
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Exportar() {
  const j = useJornada();
  const [link, setLink] = useState("");

  const copiar = async (texto: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success(msg);
    } catch {
      toast.error("Não foi possível copiar. Selecione e copie manualmente.");
    }
  };

  return (
    <Dialog onOpenChange={(o) => o && setLink(`${window.location.origin}/ver?j=${codificar(j)}`)}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Download /> <span className="hidden sm:inline">Exportar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Exportar “{j.nome}”</DialogTitle>
          <DialogDescription>Leve a jornada para a reunião, o time ou o cliente.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <button onClick={() => window.print()} className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border p-4 text-left hover:border-primary">
            <Printer className="size-5 text-primary" />
            <span>
              <span className="block font-medium">Imprimir ou salvar em PDF</span>
              <span className="text-xs text-muted-foreground">Uma folha organizada com as 8 etapas e a curva emocional</span>
            </span>
          </button>
          <button onClick={() => copiar(comoTexto(j), "Texto copiado")} className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border p-4 text-left hover:border-primary">
            <Copy className="size-5 text-primary" />
            <span>
              <span className="block font-medium">Copiar como texto</span>
              <span className="text-xs text-muted-foreground">Para colar em documento, e-mail ou apresentação</span>
            </span>
          </button>
          <div className="rounded-xl border border-border p-4">
            <Label htmlFor="link-jornada" className="mb-2 flex items-center gap-2 font-medium">
              <Link2 className="size-5 text-primary" /> Link para leitura
            </Label>
            <div className="flex gap-2">
              <Input id="link-jornada" readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="text-xs" />
              <Button variant="outline" onClick={() => copiar(link, "Link copiado")}>Copiar</Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Quem abrir vê a jornada pronta, sem poder alterar a sua.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* Versão para imprimir/PDF: só aparece na impressão. */
function Impressao() {
  const j = useJornada();
  return (
    <div className="hidden print:block">
      <FolhaJornada j={j} />
    </div>
  );
}
