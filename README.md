# Bolão Copa 2026

App familiar para acompanhar a Copa do Mundo 2026, com jogos, favoritos, grupos, mata-mata, fallback manual e exportação PDF.

## Status

Em desenvolvimento.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Firebase Auth
- Firestore
- Firebase Admin SDK
- SWR
- Zustand
- date-fns
- date-fns-tz
- Framer Motion
- Cloudflare R2
- `@react-pdf/renderer`
- Vercel

## Fonte de Dados

A fonte principal prevista é o repositório/API:

- [https://github.com/rezarahiminia/worldcup2026](https://github.com/rezarahiminia/worldcup2026)

Base pública esperada:

- [https://worldcup26.ir](https://worldcup26.ir)

Endpoints previstos:

- `GET /get/games`
- `GET /get/groups`
- `GET /get/teams`
- `GET /get/stadiums`

Os dados externos são normalizados em [`lib/api/normalizers.ts`](./lib/api/normalizers.ts) antes de chegar à UI.

## Arquitetura

- `app/`
- `components/`
- `components/ui/`
- `components/match/`
- `components/groups/`
- `components/bracket/`
- `components/admin/`
- `components/pdf/`
- `hooks/`
- `stores/`
- `lib/api/`
- `lib/classification/`
- `lib/datetime/`
- `lib/firebase/`
- `lib/r2/`
- `lib/translations/`
- `types/`

## Regras Arquiteturais

- Componentes públicos não fazem fetch direto.
- Hooks são a camada consumida pela UI.
- `lib/api` concentra API pública e fallback Firestore.
- `lib/datetime` é o único ponto de manipulação e formatação de datas.
- `firebase/admin.ts` só pode ser usado dentro de `app/api/`.
- `types/` é a fonte de verdade dos tipos internos.
- Assets devem vir do Cloudflare R2 via `NEXT_PUBLIC_R2_URL`.
- Componentes não acessam `localStorage` diretamente.
- O PDF usa layout próprio com `@react-pdf/renderer`.

## Funcionalidades Implementadas

- Onboarding local do torcedor
- Seleções favoritas
- Integração com a API `worldcup2026` via camada normalizada
- Fallback Firestore
- Polling adaptativo com SWR
- Página `/grupos` com filtros
- Cards de partidas
- Classificação de grupos
- Bracket inicial de mata-mata
- Banner global de modo fallback
- API routes admin para placar e fallback
- Painel admin básico com Firebase Auth client-side
- Página dinâmica `/jogo/[id]` com metadata e Open Graph
- Navegação básica
- PDF de teste estável com `@react-pdf/renderer`

## Funcionalidades Planejadas e Refinamentos

- Validação server-side de Firebase Auth ID token nas API routes admin
- Regras oficiais completas do bracket da Copa 2026
- Refinamento de melhores terceiros, se necessário
- Exportação PDF ligada aos jogos reais
- Upload real de assets para R2
- Ajustes conforme o formato real da API `worldcup2026`
- Melhorias de UX e responsividade
- Possível módulo futuro de palpites e ranking familiar

## Variáveis de Ambiente

```bash
NEXT_PUBLIC_WORLDCUP_API_BASE_URL

NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY

NEXT_PUBLIC_R2_URL
```

## Como Rodar Localmente

```bash
npm install
```

Copie `.env.example` para `.env.local` e preencha as variáveis necessárias.

```bash
npm run dev
```

## Comandos de Validação

```bash
npm run lint
npm run build
```

## Deploy na Vercel

- Repositório no GitHub
- Projeto conectado na Vercel
- Configurar variáveis de ambiente na Vercel
- Conferir build
- Configurar Firebase Auth
- Configurar Firestore
- Configurar Cloudflare R2 e `NEXT_PUBLIC_R2_URL`
- Conferir `/grupos`, `/mata-mata`, `/admin`, `/pdf-test`

## Segurança

- Firebase Admin fica restrito a `app/api/`.
- As API routes admin ainda precisam validar ID token no servidor antes de produção.
- Credenciais não devem ser commitadas.
- `.env.local` deve permanecer fora do Git.

## Observações sobre PDF

- `html2canvas` + `jspdf` foi descartado porque a captura do dark mode ficou instável.
- `@react-pdf/renderer` foi adotado por gerar PDF real e estável.
- O app mantém visual dark premium, enquanto o PDF usa layout branco próprio.
