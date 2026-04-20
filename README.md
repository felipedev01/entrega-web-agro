# Agro Analytics FIAP

Aplicacao web para monitorar colheita de cana-de-acucar com `Next.js + React` no front-end, `FastAPI` no backend e `Oracle` como banco principal da solucao.

## Problema de agronegocio tratado

Esta entrega aborda o monitoramento operacional da colheita de cana-de-acucar. A proposta central e reduzir perda de visibilidade sobre fazendas, talhoes e registros de colheita, organizando os dados em uma solucao web com consulta, cadastro, atualizacao, remocao e relatorios de apoio a decisao.

O foco da atividade e demonstrar, em um contexto do agronegocio, o uso integrado de aplicacao Python, manipulacao de arquivos e persistencia em Oracle.

## Estrutura

- `frontend/`: interface web preparada para deploy na Vercel
- `backend/`: API Python com CRUD real no Oracle
- `scripts/`: criacao e carga inicial do banco
- `config/`: exemplos de variaveis de ambiente
- `data/`: base JSON auxiliar para seed/export
- `document/`: apoio documental da entrega

## Requisitos atendidos

- CRUD real com Oracle
- exportacao JSON, TXT e Excel
- relatorios operacionais
- separacao entre front-end web e API Python
- uso de Python aplicado a um problema do agronegocio
- manipulacao de arquivos texto, JSON e planilha Excel

## Como rodar o backend

1. Crie e ative um ambiente virtual Python.
2. Instale as dependencias:

```bash
pip install -r backend/requirements.txt
```

3. Copie `config/backend.env.example` para `backend/.env` e preencha com suas credenciais Oracle fornecidas no seu ambiente FIAP.
4. Exemplo de estrutura do arquivo:

```env
ORACLE_HOST=seu_host_oracle
ORACLE_PORT=1521
ORACLE_SERVICE=seu_service_name
ORACLE_USER=seu_usuario
ORACLE_PASSWORD=sua_senha
```

5. Valide a conexao minima com Oracle via terminal antes de subir a API:

```bash
cd backend
python test_oracle_connection.py
```

6. Com a conexao minima validada, confirme que a API sobe sem erro:

```bash
uvicorn main:app --reload --port 8010
```

7. Depois execute o schema e a carga inicial inteiramente pelo terminal:

```bash
python run_sql_file.py ../scripts/schema.sql
python run_sql_file.py ../scripts/seed.sql
```

8. Valide o healthcheck Oracle:

```bash
curl http://127.0.0.1:8010/health/db
```

9. So depois avance para CRUD e frontend.

## Ordem recomendada de validacao

1. preparar `backend/.env`
2. validar conexao minima com `python test_oracle_connection.py`
3. subir o backend com `uvicorn main:app --reload`
4. executar `schema.sql` e `seed.sql`
5. validar `/health/db`
6. validar CRUD da API
7. validar frontend

## Script minimo de conexao

O arquivo `backend/test_oracle_connection.py` foi criado para validar rapidamente:

- se o ambiente Python esta pronto
- se `oracledb` esta instalado
- se `host`, `porta` e `service` estao corretos
- se a autenticacao com Oracle funciona antes do startup completo da API

O Oracle SQL Developer pode ser usado como apoio, mas nao e obrigatorio. Todo o fluxo principal pode ser executado via terminal.
Execute os comandos dentro da pasta `backend/`.

## Como rodar o front-end

1. Copie `config/frontend.env.example` para `frontend/.env.local`.
2. Ajuste `NEXT_PUBLIC_API_BASE_URL`.
3. Instale as dependencias e rode:

```bash
npm install
npm run dev
```

Execute dentro da pasta `frontend/`.

## Deploy do front na Vercel

- publicar apenas a pasta `frontend`
- definir `NEXT_PUBLIC_API_BASE_URL` com a URL publica do tunnel da API
- manter a API Python rodando localmente durante a demonstracao

## Observacoes

- A API exige Oracle real para funcionar.
- JSON, TXT e Excel sao complementares e nao substituem o banco Oracle.
- Nenhuma credencial real deve ser versionada no repositorio.
