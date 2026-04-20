# Agro Analytics FIAP

Aplicacao web para monitorar a colheita de cana-de-acucar com `Next.js + React` no front-end, `FastAPI` no backend e `Oracle` como banco principal da solucao.

## Problema de agronegocio tratado

Esta entrega aborda o monitoramento operacional da colheita de cana-de-acucar. A proposta e reduzir a perda de visibilidade sobre fazendas, talhoes e registros de colheita, organizando os dados em uma solucao com consulta, cadastro, atualizacao, remocao e relatorios de apoio a decisao.

O foco da atividade e demonstrar, em um contexto do agronegocio, o uso integrado de Python, persistencia em Oracle, validacao de entrada e apresentacao clara dos dados gerados pela solucao.

## Solucao proposta

O projeto foi estruturado como um MVP web com:

- API Python em FastAPI
- persistencia principal em Oracle
- CRUD de fazendas, talhoes e registros de colheita
- relatorios consolidados por safra, fazenda e talhao
- interface web para operacao, consulta e exportacao

## Estrutura

- `frontend/`: interface web preparada para demonstracao e deploy
- `backend/`: API Python com regras de negocio e integracao Oracle
- `scripts/`: schema e carga inicial do banco
- `config/`: exemplos de variaveis de ambiente
- `data/`: arquivos auxiliares da entrega
- `document/`: apoio documental da atividade

## Como os requisitos da atividade aparecem neste projeto

### 1. Problema de agronegocio e relevancia

O README deixa explicito que o recorte da entrega e a colheita de cana-de-acucar e que a dor tratada e a organizacao de dados operacionais de fazendas, talhoes e perdas de colheita.

### 2. Uso de Python nos capitulos 3 a 6

O backend concentra a parte principal da disciplina:

- `backend/app/api/`: rotas da API
- `backend/app/services/`: regras de negocio e calculos
- `backend/app/repositories/`: acesso ao Oracle
- `backend/test_oracle_connection.py`: validacao minima de conexao
- `backend/run_sql_file.py`: execucao de arquivos SQL pelo terminal

### 3. Subalgoritmos com passagem de parametros

O projeto utiliza funcoes e metodos com parametros em toda a camada Python. Alguns exemplos estao em:

- `backend/app/services/agro_service.py`
- `backend/app/repositories/agro_repository.py`
- `backend/test_oracle_connection.py`
- `backend/run_sql_file.py`

### 4. Estruturas de dados

Os conteudos de estruturas de dados aparecem assim no projeto:

- `lista`: usada em listagens, filtros, consolidacoes e exportacoes
- `dicionario`: usado para payloads, respostas da API e organizacao intermediaria dos dados
- `tupla`: aparece nas linhas retornadas pelo cursor Oracle antes da normalizacao
- `tabela de memoria`: aparece no tratamento intermediario dos dados em memoria para consolidacao de relatorios e calculo de resumos operacionais

### 5. Manipulacao de arquivos e saidas da solucao

O projeto evidencia:

- execucao de arquivos SQL pelo Python para criacao e carga inicial do banco
- disponibilizacao de saida em JSON, TXT e Excel pela API
- arquivo auxiliar `data/seed_demo.json` como apoio documental da base de exemplo

Observacao importante:

- o Oracle continua sendo a base principal da solucao
- JSON, TXT e Excel aparecem como saidas complementares da entrega

### 6. Conexao com banco Oracle

O Oracle e a persistencia principal do projeto. A entrega inclui:

- configuracao por variaveis de ambiente
- pool de conexoes
- script minimo de teste de conexao
- schema SQL
- carga inicial SQL
- endpoint de healthcheck do banco

### 7. Validacao de entrada e usabilidade

O projeto contempla:

- validacao de entrada no backend com Pydantic e regras de negocio
- restricoes no schema Oracle
- formularios com campos obrigatorios, selecoes guiadas e feedback de erro no frontend
- apresentacao limpa dos dados em cards, tabelas, dashboards e relatorios

## Validacao tecnica ja executada

Durante a auditoria local deste workspace, os seguintes pontos passaram:

- compilacao do backend com `python -m compileall backend`
- import das dependencias Python do projeto
- import da aplicacao FastAPI com variaveis minimas
- `npm run lint` no frontend
- `npm run build` no frontend

Importante:

- a validacao completa com Oracle real depende das credenciais validas do ambiente FIAP
- sem essas credenciais, a implementacao Oracle pode ser considerada preparada, mas nao totalmente comprovada end-to-end

## Como rodar o backend

1. Crie e ative um ambiente virtual Python.
2. Instale as dependencias:

```bash
pip install -r backend/requirements.txt
```

3. Copie `config/backend.env.example` para `backend/.env` e preencha com as credenciais Oracle do seu ambiente.
4. Exemplo:

```env
ORACLE_HOST=seu_host_oracle
ORACLE_PORT=1521
ORACLE_SERVICE=seu_service_name
ORACLE_USER=seu_usuario
ORACLE_PASSWORD=sua_senha
```

5. Valide a conexao minima:

```bash
cd backend
python test_oracle_connection.py
```

6. Suba a API:

```bash
uvicorn main:app --reload --port 8010
```

7. Execute schema e carga inicial:

```bash
python run_sql_file.py ../scripts/schema.sql
python run_sql_file.py ../scripts/seed.sql
```

8. Valide o healthcheck Oracle:

```bash
curl http://127.0.0.1:8010/health/db
```

## Como rodar o front-end

1. Copie `config/frontend.env.example` para `frontend/.env.local`.
2. Ajuste `NEXT_PUBLIC_API_BASE_URL`.
3. Instale as dependencias e rode:

```bash
npm install
npm run dev
```

Execute os comandos dentro da pasta `frontend/`.

## Deploy do front na Vercel

- publicar apenas a pasta `frontend`
- definir `NEXT_PUBLIC_API_BASE_URL` com a URL publica do tunnel da API
- manter a API Python rodando localmente durante a demonstracao
- incluir a URL final do front em `FRONTEND_ORIGINS` no `backend/.env`
- usar `scripts/vercel-demo-deploy.ps1` se quiser automatizar a publicacao da demo
- consultar `document/vercel_frontend_deploy.md` para o passo a passo completo

## Observacoes finais

- a API exige Oracle real para operar com persistencia completa
- nenhuma credencial real deve ser versionada no repositorio
- esta entrega foi pensada como MVP funcional e demonstravel para o Capitulo 6
