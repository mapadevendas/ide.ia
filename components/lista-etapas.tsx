import * as React from "react";
import { ChevronRight } from "lucide-react";
import { ETAPAS } from "@/data/etapas";

/* Lista editorial numerada das 8 etapas, com o exemplo de marketing ao abrir. */
export function ListaEtapas() {
  const [aberta, setAberta] = React.useState(0);
  const id = React.useId();

  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-10">
      <header className="mb-8 flex flex-col justify-between gap-6 pb-2 sm:flex-row sm:items-end">
        <div>
          <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            O método · 8 etapas
          </span>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl md:text-[44px]">
            Toda boa venda é
            <br />
            <em className="text-primary">uma boa história.</em>
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          A jornada do herói, adaptada ao marketing: o cliente é o protagonista e a sua marca é o mentor que o ajuda a vencer.
        </p>
      </header>

      <div className="flex flex-col">
        {ETAPAS.map((e, i) => {
          const open = aberta === i;
          const Icone = e.icone;
          return (
            <div key={e.id} className="border-t border-border">
              <button
                type="button"
                id={`${id}-b-${i}`}
                aria-expanded={open}
                aria-controls={`${id}-p-${i}`}
                onClick={() => setAberta(open ? -1 : i)}
                className="group flex w-full cursor-pointer items-center rounded-sm py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="w-12 shrink-0 font-heading text-sm italic text-ouro sm:w-16 sm:text-lg">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`font-heading text-xl font-medium tracking-tight transition-all duration-200 sm:text-2xl md:text-3xl ${
                    open ? "translate-x-2 text-primary" : "group-hover:translate-x-2"
                  }`}
                >
                  {e.nome}
                </span>
                <span className="ml-auto mr-6 hidden text-xs text-muted-foreground sm:inline-block">{e.papel}</span>
                <span
                  className={`ml-auto flex size-6 shrink-0 items-center justify-center text-muted-foreground transition-transform duration-200 group-hover:text-foreground sm:ml-0 ${
                    open ? "rotate-90 text-primary" : ""
                  }`}
                  aria-hidden="true"
                >
                  <ChevronRight className="size-4" />
                </span>
              </button>
              <div
                id={`${id}-p-${i}`}
                role="region"
                aria-labelledby={`${id}-b-${i}`}
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                  open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="grid gap-5 pb-7 pl-12 pt-1 sm:pl-16 md:grid-cols-[1fr_1.1fr]">
                    <div>
                      <p className="text-sm font-medium text-foreground">{e.pergunta}</p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.dica}</p>
                    </div>
                    <figure className="relative rounded-lg border border-ouro/40 bg-accent/60 p-4">
                      <Icone className="absolute right-3 top-3 size-4 text-ouro" aria-hidden="true" />
                      <figcaption className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                        Exemplo no marketing
                      </figcaption>
                      <blockquote className="font-heading text-[15px] italic leading-relaxed">{e.exemplo}</blockquote>
                    </figure>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <span>Baseado no monomito de Joseph Campbell, simplificado para marcas.</span>
        <span className="font-medium text-foreground/80">Problema → Mentor → Transformação</span>
      </footer>
    </div>
  );
}
