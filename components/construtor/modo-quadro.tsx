import { useState } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "@tanstack/react-router";
import { GripVertical, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ETAPAS, ETAPA_POR_ID, type EtapaId } from "@/data/etapas";
import { CurvaEmocao } from "@/components/mini-jornada";
import { SeletorCanal, SeletorEmocao } from "./campos-emocao";
import { mudarCartao, salvarJornada, useJornada } from "@/lib/jornada";
import { cn } from "@/lib/utils";

export function ModoQuadro() {
  const j = useJornada();
  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const aoSoltar = (ev: DragEndEvent) => {
    const { active, over } = ev;
    if (!over || active.id === over.id) return;
    salvarJornada((x) => {
      const de = x.ordem.indexOf(active.id as EtapaId);
      const para = x.ordem.indexOf(over.id as EtapaId);
      return { ...x, ordem: arrayMove(x.ordem, de, para) };
    });
  };

  const fora = j.ordem.some((id, i) => id !== ETAPAS[i].id);

  return (
    <div className="papel-textura min-h-[calc(100dvh-6.5rem)] px-4 py-6 md:px-6">
      <div className="mb-5 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center">
        <div className="md:w-56">
          <p className="font-heading text-lg font-semibold">Curva emocional</p>
          <p className="text-xs text-muted-foreground">Arraste as colunas pela alça para mudar a ordem da história.</p>
        </div>
        <CurvaEmocao valores={j.ordem.map((id) => j.cartoes[id].emocao)} className="h-16 flex-1" />
        <Button size="sm" asChild>
          <Link to="/construtor" search={{ modo: "resultado" }}>
            <Sparkles /> Dores e prompts
          </Link>
        </Button>
        {fora && (
          <Button variant="outline" size="sm" onClick={() => salvarJornada((x) => ({ ...x, ordem: ETAPAS.map((e) => e.id) }))}>
            <RotateCcw /> Ordem clássica
          </Button>
        )}
      </div>

      <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={aoSoltar}>
        <SortableContext items={j.ordem} strategy={horizontalListSortingStrategy}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {j.ordem.map((id, i) => (
              <Coluna key={id} id={id} i={i} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function Coluna({ id, i }: { id: EtapaId; i: number }) {
  const j = useJornada();
  const e = ETAPA_POR_ID[id];
  const c = j.cartoes[id];
  const [foco, setFoco] = useState(false);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const Icone = e.icone;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-coluna={id}
      className={cn("flex w-64 shrink-0 flex-col rounded-xl border border-border bg-muted/70", isDragging && "z-10 rotate-1 opacity-90 shadow-2xl")}
    >
      <div className="flex items-center gap-2 rounded-t-xl border-b border-border bg-accent px-3 py-2.5">
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Arrastar ${e.nome}`}
          className="-ml-1 cursor-grab touch-none rounded p-0.5 text-muted-foreground hover:bg-card active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
        <span className="font-heading text-sm italic text-primary">{String(i + 1).padStart(2, "0")}</span>
        <span className="truncate text-sm font-semibold">{e.nome}</span>
        <Icone className="ml-auto size-4 shrink-0 text-ouro" aria-hidden="true" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3">
        <p className="text-[11px] text-muted-foreground">{e.papel}</p>
        <div className={cn("rounded-lg border bg-card p-3 shadow-sm transition-colors", foco ? "border-primary" : "border-border")}>
          <textarea
            value={c.texto}
            onFocus={() => setFoco(true)}
            onBlur={() => setFoco(false)}
            onChange={(ev) => mudarCartao(id, { texto: ev.target.value })}
            placeholder={e.pergunta}
            aria-label={`Texto de ${e.nome}`}
            rows={7}
            className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground/70"
          />
        </div>
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Canal</p>
          <SeletorCanal valor={c.canal} aoMudar={(v) => mudarCartao(id, { canal: v })} className="h-8 bg-card text-xs" />
        </div>
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Emoção</p>
          <SeletorEmocao compacto valor={c.emocao} aoMudar={(v) => mudarCartao(id, { emocao: v })} />
        </div>
      </div>
    </div>
  );
}
