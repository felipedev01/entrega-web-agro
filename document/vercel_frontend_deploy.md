# Deploy do Front na Vercel

## Objetivo

Publicar apenas o diretorio `frontend/` na Vercel e manter o backend FastAPI + Oracle rodando localmente durante a demonstracao, exposto por uma URL HTTPS publica.

## Configuracao inicial do projeto Vercel

1. Importe o repositorio `felipedev01/entrega-web-agro` na Vercel.
2. Defina `frontend` como `Root Directory`.
3. Mantenha a deteccao automatica de framework para `Next.js`.
4. Use os defaults:
   - `Install Command`: `npm install`
   - `Build Command`: `npm run build`
5. Conclua a criacao do projeto.

Depois do primeiro vinculo, rode `npx vercel link` dentro de `frontend/` se quiser operar pelo terminal nesta maquina.

## Preparacao da API para a demo

1. Suba o backend localmente com Oracle funcionando.
2. Exponha a API com um tunnel HTTPS publico.
3. Confirme pelo menos:
   - `GET /health/db`
   - um endpoint de listagem usado pela interface
4. Atualize `backend/.env` em `FRONTEND_ORIGINS` para incluir a URL final do front publicado na Vercel.

## Variaveis de ambiente

Na Vercel, configure:

```env
NEXT_PUBLIC_API_BASE_URL=https://seu-tunnel-publico.exemplo.dev
```

Localmente, o arquivo de referencia continua em `config/frontend.env.example`.

## Fluxo recomendado pelo terminal

Execute dentro de `frontend/`:

```bash
npm run vercel:pull
npx vercel deploy --prod --public --yes --build-env NEXT_PUBLIC_API_BASE_URL=https://seu-tunnel-publico.exemplo.dev --env NEXT_PUBLIC_API_BASE_URL=https://seu-tunnel-publico.exemplo.dev
```

Se voce optar por redeploy manual pelo painel da Vercel, revise a env `NEXT_PUBLIC_API_BASE_URL` no Dashboard antes de publicar.

## Automacao de demo

O script `scripts/vercel-demo-deploy.ps1` automatiza o fluxo de:

- validacao de autenticacao/link com a Vercel
- build local para Vercel
- deploy publico de producao com `NEXT_PUBLIC_API_BASE_URL` injetada em `build-env` e `env`

Exemplo:

```powershell
.\scripts\vercel-demo-deploy.ps1 -ApiBaseUrl "https://seu-tunnel-publico.exemplo.dev"
```

## Validacao final

Depois do deploy:

1. Abra a home publicada.
2. Verifique o status da API.
3. Valide listagem de entidades.
4. Execute pelo menos um CRUD simples.
5. Verifique exportacoes, se forem parte da demonstracao.
6. Confirme no navegador que nao ha erro de CORS.
