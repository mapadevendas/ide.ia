import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Marca, Slogan } from "@/components/marca";

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    app?: boolean;
  }
}

const LINKS = [
  { href: "/#modos", rotulo: "Como funciona" },
  { href: "/#etapas", rotulo: "As 8 etapas" },
  { href: "/#personas", rotulo: "Personas" },
  { href: "/#modelos", rotulo: "Modelos" },
  { href: "/#planos", rotulo: "Planos" },
];

function Cabecalho() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-tinta">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link to="/" className="shrink-0" aria-label="Cardume — início">
          <Marca className="w-44 md:w-48" />
        </Link>
        <nav aria-label="Menu" className="hidden items-center gap-7 text-sm md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-foreground/75 transition-colors hover:text-foreground">
              {l.rotulo}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <a href="/#modelos">Ver exemplos</a>
          </Button>
          <Button size="sm" asChild>
            <Link to="/construtor">Criar minha jornada</Link>
          </Button>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-background">
            <SheetTitle className="sr-only">Cardume</SheetTitle>
            <Marca className="w-48" />
            <nav aria-label="Menu" className="mt-6 flex flex-col gap-4 px-1">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} className="text-lg">
                  {l.rotulo}
                </a>
              ))}
              <Button asChild className="mt-4">
                <Link to="/construtor">Criar minha jornada</Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

function Rodape() {
  return (
    <footer className="border-t border-border bg-tinta text-papel">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Marca className="w-64" />
          <Slogan className="mt-4 max-w-sm text-xl md:text-2xl" />
          <p className="mt-3 max-w-sm text-sm text-papel/65">
            Transforme o caminho do seu cliente numa história que vende. O cliente é o herói; a sua marca, o mentor.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold text-ouro">Produto</p>
          <ul className="space-y-2 text-papel/70">
            <li><Link to="/construtor" search={{ modo: "guiado" }} className="hover:text-papel">Passo a passo guiado</Link></li>
            <li><Link to="/construtor" search={{ modo: "quadro" }} className="hover:text-papel">Quadro visual</Link></li>
            <li><Link to="/construtor" search={{ modo: "ia" }} className="hover:text-papel">Gerador automático</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold text-ouro">Aprenda</p>
          <ul className="space-y-2 text-papel/70">
            <li><a href="/#etapas" className="hover:text-papel">As 8 etapas</a></li>
            <li><a href="/#modelos" className="hover:text-papel">Modelos por setor</a></li>
            <li><a href="/#perguntas" className="hover:text-papel">Perguntas frequentes</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-papel/10">
        <div className="container flex flex-col gap-2 py-5 text-xs text-papel/50 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Cardume · Bread &amp; Fish Co. Todos os direitos reservados.</span>
          <span>Feito para quem conta histórias que vendem.</span>
        </div>
      </div>
    </footer>
  );
}

function Moldura() {
  const caminho = useRouterState({ select: (s) => s.location.pathname });
  const app = caminho.startsWith("/construtor") || caminho.startsWith("/ver");
  return (
    <>
      {!app && <Cabecalho />}
      <Outlet />
      {!app && <Rodape />}
      <Toaster />
    </>
  );
}

export const Route = createRootRoute({ component: Moldura });
