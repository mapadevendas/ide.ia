import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

/*
 * O prefixo vem do <base> que o servidor injeta: /api/preview/<id>/t~<ficha>/
 * na prévia, /site/<slug>/ publicado, a raiz em domínio próprio. O MESMO build
 * serve os três.
 */
const basepath = new URL(document.baseURI).pathname;

const router = createRouter({ routeTree, basepath });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const raiz = createRoot(document.getElementById("root")!);

/* Se algo estourar na montagem, mostre ALGO — sem isto a página fica em branco, sem pista. */
try {
  raiz.render(<RouterProvider router={router} />);
} catch (e) {
  raiz.render(
    <div className="container py-10">
      <h1>Não consegui montar esta tela</h1>
      <p className="text-muted-foreground">{e instanceof Error ? e.message : String(e)}</p>
    </div>,
  );
}
