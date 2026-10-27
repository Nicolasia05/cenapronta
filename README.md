# Cena Pronta

Galeria de cenas prontas para gerar vídeos de produto com modelo de IA no **Google Flow**.
Você escolhe a cena ("Mexendo no cabelo", "Giro no espelho", "Passando batom"…), e o app entrega o prompt exato
de 8 ou 10 segundos, pensado para usar com as fotos de referência da modelo e do produto (frente e costas).

## Funcionalidades

- **31 cenas** em 6 grupos (Espelho, Look em movimento, Detalhes do produto, Acessórios & beleza, Falando com a câmera, Dancinha & trend)
- Prompt montado na hora: produto, cenário, duração e fala em PT-BR opcionais
- Prévia animada (silhueta em SVG) em cada cena; o admin pode subir o vídeo real que substitui a animação
- Criador de avatar (retrato, ficha de referência em 4 ângulos e foto lifestyle)
- Acesso só por convite, com validade configurável, e painel de admin para gerar/revogar convites e liberar/bloquear membros

## Stack

- Next.js 16 (App Router, Server Actions, `proxy.ts`) + React 19
- Tailwind CSS 4
- Supabase (Auth, Postgres com RLS, Storage privado)
- Deploy na Vercel

## Segurança

- Cadastro só com código de convite, validado e consumido dentro do banco (trigger em `auth.users`)
- Row Level Security em todas as tabelas; funções de admin checam o papel dentro do próprio banco
- Prompts e vídeos só são entregues depois do login (renderizados no servidor, fora dos arquivos públicos)
- Vídeos de prévia em bucket privado com URLs assinadas e temporárias
- CSP com nonce por requisição, HSTS, `frame-ancestors 'none'`, `X-Content-Type-Options`, `Referrer-Policy`
- Entrada do usuário sanitizada antes de entrar no prompt; limite diário de gerações por conta

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com os dados do seu Supabase
npm run dev
```

No Supabase:

1. Rode `supabase/schema.sql` no SQL Editor.
2. Crie o primeiro convite de admin (instrução no topo do arquivo) e cadastre-se em `/cadastro`.
3. Em **Authentication → URL Configuration**, coloque a URL do site e `https://SEU-DOMINIO/auth/confirm` nos redirects.

## Estrutura

```
app/
  app/            área logada (cenas, criar avatar, convites)
  login/ cadastro/ auth/confirm/
components/       UI compartilhada, animações das cenas
lib/prompts/      cenas, cenários e montagem do prompt
lib/avatar.ts     prompts do criador de avatar
lib/supabase/     clientes Supabase (browser e servidor)
proxy.ts          sessão, proteção de rotas e CSP
supabase/         schema do banco
```
