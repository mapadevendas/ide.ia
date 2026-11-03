# Sala Secreta I.D.E.ia — Landing + CRM

## O que inclui
- Landing page de inscrição com identidade visual roxo/magenta/laranja.
- Formulário com perfil, uso de IA, ferramentas, sistemas, site e investimento em melhorias.
- Limite transacional de 20 inscrições no banco.
- Painel da tutora com login Supabase, busca, status, link WhatsApp, consulta de respostas e exportação CSV.
- O convite para o grupo de WhatsApp é manual; a página não adiciona ninguém automaticamente.
- Consentimento no formulário e RLS no banco.

## 1. Criar o Supabase
Crie um projeto novo e exclusivo para a Sala Secreta I.D.E.ia. Não reutilize projetos existentes.
No SQL Editor, execute todo o conteúdo de `supabase/schema.sql`.
Em Authentication > Users, crie um usuário com seu e-mail e senha. Depois execute a instrução comentada no final do SQL para atribuir `app_metadata.role = admin` ao usuário.
Faça login uma vez no painel com esse usuário. Se o token já tiver sido emitido antes de alterar a claim, saia e entre novamente.

## 2. Variáveis de ambiente
Copie `.env.example` para `.env.local` e preencha:
- `VITE_SUPABASE_URL`: URL do projeto.
- `VITE_SUPABASE_ANON_KEY`: publishable key (ou anon legacy) do projeto. Nunca use `service_role`/secret no frontend.
- `VITE_ADMIN_EMAIL`: e-mail do usuário que poderá entrar no painel.

## 3. Testar localmente
Requer Node.js 20+.
```bash
npm install
npm run dev
```
Abra a URL exibida pelo Vite. Teste primeiro uma inscrição de teste e confira o painel.

## 4. Publicar na Vercel
Suba estes arquivos para um repositório GitHub novo ou uma branch de trabalho. Na Vercel, importe o repositório.
Framework: Vite; Build Command: `npm run build`; Output Directory: `dist`.
Configure as mesmas três variáveis de ambiente no projeto da Vercel e faça deploy.

## 5. Cuidados antes de divulgar
- Faça uma inscrição de teste e confirme que aparece no CRM.
- Confirme que o usuário admin consegue entrar e que um usuário comum não consegue consultar dados.
- Teste o bloqueio após 20 inscrições em ambiente controlado.
- Atualize o texto de privacidade conforme o uso real dos dados e informe finalidade/contato para solicitações LGPD.
- O CRM não cria grupo nem envia convite automaticamente: a tutora confere, confirma e envia o convite manualmente.
- Configure proteção contra spam/rate limiting antes de campanha pública com alto volume.
