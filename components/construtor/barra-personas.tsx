import { useRef, useState } from "react";
import { toast } from "sonner";
import { Copy, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompararPersonas } from "@/components/construtor/comparar-personas";
import { CORES_PERSONA, adicionarPersona, nomePersona, removerPersona, renomearPersona, trocarPersona, useJornada } from "@/lib/jornada";
import { cn } from "@/lib/utils";

export const MAX_PERSONAS = 5;

/* Abas das personas da jornada: troca, renomeia, cria, duplica e remove. */
export function BarraPersonas() {
  const j = useJornada();
  const [editando, setEditando] = useState<string | null>(null);
  const cheia = j.personas.length >= MAX_PERSONAS;
  const ativaIdx = j.personas.findIndex((p) => p.id === j.ativa);

  const remover = () => {
    const p = j.personas[ativaIdx];
    if (!confirm(`Remover a persona “${nomePersona(p, ativaIdx)}” e as 8 etapas dela?`)) return;
    removerPersona(p.id);
    toast("Persona removida");
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-t border-border/60 px-4 py-2 md:px-6" role="tablist" aria-label="Personas da jornada">
      <UserRound className="size-4 shrink-0 text-muted-foreground" />
      {j.personas.map((p, i) => {
        const ativa = p.id === j.ativa;
        const cor = CORES_PERSONA[i % CORES_PERSONA.length];
        if (editando === p.id) {
          return (
            <NomeEditavel
              key={p.id}
              cor={cor}
              inicial={nomePersona(p, i)}
              aoTerminar={(nome) => {
                if (nome !== null) renomearPersona(p.id, nome);
                setEditando(null);
              }}
            />
          );
        }
        return (
          <button
            key={p.id}
            role="tab"
            aria-selected={ativa}
            onClick={() => trocarPersona(p.id)}
            onDoubleClick={() => setEditando(p.id)}
            title="Clique duas vezes para renomear"
            className={cn(
              "inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              ativa ? "border-primary/60 bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="size-2.5 rounded-full" style={{ background: cor }} />
            <span className="max-w-36 truncate">{nomePersona(p, i)}</span>
          </button>
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 shrink-0 text-xs"
        disabled={cheia}
        title={cheia ? `Até ${MAX_PERSONAS} personas por jornada` : undefined}
        onClick={() => {
          adicionarPersona();
          toast.success("Nova persona criada. Comece pelo herói.");
        }}
      >
        <Plus /> Nova persona
      </Button>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditando(j.ativa)} aria-label="Renomear persona">
          <Pencil /> <span className="hidden sm:inline">Renomear</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          disabled={cheia}
          onClick={() => {
            adicionarPersona(j.ativa);
            toast.success("Persona duplicada");
          }}
        >
          <Copy /> <span className="hidden sm:inline">Duplicar</span>
        </Button>
        {j.personas.length > 1 && (
          <>
            <CompararPersonas />
            <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={remover} aria-label="Remover persona">
              <Trash2 />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

/* Campo no lugar da aba: Enter ou sair do campo salva, Esc cancela. Vazio volta ao nome automático. */
function NomeEditavel({ cor, inicial, aoTerminar }: { cor: string; inicial: string; aoTerminar: (nome: string | null) => void }) {
  const [valor, setValor] = useState(inicial);
  const cancelado = useRef(false);
  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary bg-card px-3 py-0.5">
      <span className="size-2.5 rounded-full" style={{ background: cor }} />
      <input
        autoFocus
        value={valor}
        maxLength={40}
        onChange={(e) => setValor(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={() => aoTerminar(cancelado.current ? null : valor)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            cancelado.current = true;
            e.currentTarget.blur();
          }
        }}
        placeholder="Nome da persona"
        aria-label="Nome da persona"
        className="w-36 bg-transparent text-xs font-medium outline-none"
      />
    </span>
  );
}
