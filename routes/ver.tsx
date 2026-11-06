import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FolhaJornada } from "@/components/folha-jornada";
import { decodificar, salvarJornada } from "@/lib/jornada";

export const Route = createFileRoute("/ver")({
  validateSearch: z.object({ j: z.string().optional().catch(undefined) }),
  component: Ver,
});

function Ver() {
  const { j } = Route.useSearch();
  const navegar = useNavigate();
  const jornada = j ? decodificar(j) : null;

  if (!jornada) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-3xl font-medium">Este link de jornada não abriu</h1>
        <p className="text-muted-foreground">Ele pode estar incompleto. Peça um novo link a quem compartilhou.</p>
        <Button asChild><Link to="/construtor">Criar a minha jornada</Link></Button>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background py-6">
      <div className="mx-auto flex max-w-4xl flex-wrap justify-end gap-2 px-6 print:hidden">
        <Button variant="outline" onClick={() => window.print()}>Imprimir ou PDF</Button>
        <Button
          onClick={() => {
            salvarJornada({ ...jornada, nome: `${jornada.nome} (cópia)` });
            navegar({ to: "/construtor", search: { modo: "quadro" } });
          }}
        >
          Fazer uma cópia para editar
        </Button>
      </div>
      <FolhaJornada j={jornada} />
    </main>
  );
}
