import { ETAPA_POR_ID } from "@/data/etapas";
import { Marca } from "@/components/marca";
import { CurvaEmocao } from "@/components/mini-jornada";
import { CORES_PERSONA, nomePersona, type Jornada, type Persona } from "@/lib/jornada";

/* A jornada pronta para leitura: usada na impressão/PDF e no link compartilhado. */
export function FolhaJornada({ j }: { j: Jornada }) {
  const varias = j.personas.length > 1;
  return (
    <article className="mx-auto max-w-4xl p-6 md:p-8">
      <Marca />
      <h1 className="mt-6 text-4xl font-medium md:text-5xl">{j.nome}</h1>
      <p className="mt-3 text-sm">
        <span className="text-muted-foreground">Marca (mentor): </span>
        <span className="font-medium">{j.marca || "—"}</span>
        {varias && <span className="text-muted-foreground"> · {j.personas.length} personas</span>}
      </p>
      {varias && (
        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <p className="mb-2 text-xs text-muted-foreground">Curvas emocionais das personas</p>
          <div className="relative h-24">
            {j.personas.map((p, i) => (
              <CurvaEmocao key={p.id} valores={p.ordem.map((id) => p.cartoes[id].emocao)} cor={CORES_PERSONA[i % CORES_PERSONA.length]} className="absolute inset-0 h-24" />
            ))}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {j.personas.map((p, i) => (
              <li key={p.id} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: CORES_PERSONA[i % CORES_PERSONA.length] }} />
                {nomePersona(p, i)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {j.personas.map((p, i) => (
        <SecaoPersona key={p.id} p={p} i={i} varias={varias} />
      ))}
    </article>
  );
}

function SecaoPersona({ p, i, varias }: { p: Persona; i: number; varias: boolean }) {
  const cor = CORES_PERSONA[i % CORES_PERSONA.length];
  return (
    <section className={varias ? "mt-10 break-before-page border-t border-border pt-8 first-of-type:break-before-auto" : ""}>
      {varias && (
        <h2 className="flex items-center gap-2 text-2xl font-medium">
          <span className="size-3 rounded-full" style={{ background: cor }} />
          Persona {i + 1}: {nomePersona(p, i)}
        </h2>
      )}
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-muted-foreground">Herói</dt><dd className="font-medium">{p.heroi || "—"}</dd></div>
        <div><dt className="text-muted-foreground">Transformação</dt><dd className="font-medium">{p.transformacao || "—"}</dd></div>
      </dl>
      <div className="mt-6 rounded-xl border border-border bg-card p-4">
        <p className="mb-1 text-xs text-muted-foreground">Curva emocional do herói</p>
        <CurvaEmocao valores={p.ordem.map((id) => p.cartoes[id].emocao)} cor={cor} className="h-20" />
      </div>
      <ol className="mt-6 grid gap-4 sm:grid-cols-2">
        {p.ordem.map((id, n) => {
          const e = ETAPA_POR_ID[id];
          const c = p.cartoes[id];
          return (
            <li key={id} className="break-inside-avoid rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                {String(n + 1).padStart(2, "0")} · {e.nome}
              </p>
              <p className="text-xs text-muted-foreground">{e.papel}</p>
              <p className="mt-2 text-sm leading-relaxed">{c.texto || "—"}</p>
              <p className="mt-2 text-xs text-muted-foreground">Canal: {c.canal}</p>
            </li>
          );
        })}
      </ol>
      {!!p.dores?.length && (
        <div className="mt-8 break-inside-avoid">
          <h3 className="text-xl font-medium">Dores, necessidades e público</h3>
          <p className="mt-1 text-sm"><span className="text-muted-foreground">Público atingido: </span>{p.publico?.trim() || p.heroi || "—"}</p>
          <div className="mt-3 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="bg-muted/60 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  {["Dor / necessidade", "Tipo", "Etapa", "Quem sente", "Como a marca atende", "Mensagem-chave"].map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.dores.map((d) => (
                  <tr key={d.id} className="break-inside-avoid border-t border-border align-top">
                    <td className="px-3 py-2"><p className="font-medium">{d.titulo || "—"}</p><p className="text-muted-foreground">{d.descricao}</p></td>
                    <td className="px-3 py-2">{d.tipo}<br /><span className="text-muted-foreground">{d.intensidade}</span></td>
                    <td className="px-3 py-2">{ETAPA_POR_ID[d.etapa]?.nome ?? "—"}</td>
                    <td className="px-3 py-2">{d.publico || "—"}</td>
                    <td className="px-3 py-2">{d.solucao || "—"}</td>
                    <td className="px-3 py-2 font-heading italic">{d.mensagem || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
