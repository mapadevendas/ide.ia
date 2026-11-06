# Rotas (TanStack Router, por arquivo)

Cada arquivo nesta pasta é uma tela. A árvore de rotas (`routeTree.gen.ts`) é
gerada no build — nunca edite esse arquivo.

| Arquivo                     | Endereço               |
| --------------------------- | ---------------------- |
| `index.tsx`                 | `/`                    |
| `sobre.tsx`                 | `/sobre`               |
| `produtos/index.tsx`        | `/produtos`            |
| `produtos/$id.tsx`          | `/produtos/:id`        |
| `blog/{-$categoria}.tsx`    | `/blog` e `/blog/:categoria` |
| `arquivos/$.tsx`            | `/arquivos/*`          |
| `_app.tsx`                  | a casca do APLICATIVO (barra lateral + login) — vem pronta num sistema |
| `_app/painel.tsx`           | `/painel`, tela logada dentro da casca do app (`createFileRoute("/_app/painel")`) |
| `entrar.tsx`                | `/entrar`, login e cadastro — vem pronta num sistema |
| `__root.tsx`                | a casca do SITE (cabeçalho e rodapé); some sozinha nas rotas do app |

Modelo de tela:

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sobre")({ component: Sobre });

function Sobre() {
  return <section className="container py-16">…</section>;
}
```

Links: `<Link to="/produtos/$id" params={{ id }}>` (nunca `<a href>` para tela interna).
Parâmetro: `const { id } = Route.useParams()`.

Não crie `pages/`, `app/` nem `src/`: isto não é Next.js.
Peças que se repetem em várias telas vão para `components/`; dados de exemplo, para `data/`.

Num SISTEMA (área logada): cada entidade é um arquivo em `lib/dados/<entidade>.ts`
(`criarRepositorio<Tipo>("prefixo_tabela", EXEMPLOS)` de `@/lib/dados/repositorio`),
cada tela logada é `routes/_app/<tela>.tsx` (entra no menu por `LINKS_APP` em `_app.tsx`),
e `useLista(repo)` / `useItem(repo, id)` trazem os dados com os estados carregando/erro.
