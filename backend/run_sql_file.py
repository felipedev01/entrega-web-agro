from __future__ import annotations

import argparse
from pathlib import Path

import oracledb

from app.core.config import Settings

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Executa um arquivo SQL Oracle pelo terminal usando as credenciais do backend.",
    )
    parser.add_argument("sql_file", help="Caminho do arquivo SQL a ser executado.")
    return parser.parse_args()


def load_settings() -> Settings:
    if ENV_FILE.exists():
        return Settings(_env_file=ENV_FILE)
    return Settings()


def iter_statements(script: str) -> list[str]:
    statements: list[str] = []
    current: list[str] = []
    plsql_block = False

    for raw_line in script.splitlines():
        line = raw_line.rstrip()
        stripped = line.strip()

        if not stripped and not current:
            continue

        if not current and stripped.upper().startswith(("BEGIN", "DECLARE")):
            plsql_block = True

        if stripped == "/" and plsql_block:
            statement = "\n".join(current).strip()
            if statement:
                statements.append(statement)
            current = []
            plsql_block = False
            continue

        current.append(line)

        if not plsql_block and stripped.endswith(";"):
            statement = "\n".join(current).strip()
            if statement.endswith(";"):
                statement = statement[:-1].rstrip()
            if statement:
                statements.append(statement)
            current = []

    trailing = "\n".join(current).strip()
    if trailing:
        statements.append(trailing)

    return statements


def main() -> int:
    args = parse_args()
    sql_path = Path(args.sql_file).resolve()
    if not sql_path.exists():
        print(f"[ERRO] Arquivo SQL nao encontrado: {sql_path}")
        return 1

    settings = load_settings()
    dsn = settings.oracle_dsn
    statements = iter_statements(sql_path.read_text(encoding="utf-8"))

    if not statements:
        print(f"[ERRO] Nenhum comando SQL foi identificado em {sql_path}.")
        return 1

    connection: oracledb.Connection | None = None
    try:
        connection = oracledb.connect(
            user=settings.oracle_user,
            password=settings.oracle_password,
            dsn=dsn,
        )
        with connection.cursor() as cursor:
            for index, statement in enumerate(statements, start=1):
                cursor.execute(statement)
                print(f"[OK] Comando {index}/{len(statements)} executado.")
        connection.commit()
        print(f"[OK] Execucao concluida com sucesso para {sql_path.name}.")
        return 0
    except oracledb.DatabaseError as exc:
        if connection is not None:
            connection.rollback()
        print(f"[ERRO] Falha ao executar {sql_path.name}: {exc}")
        return 1
    finally:
        if connection is not None:
            connection.close()
            print("[INFO] Conexao encerrada.")


if __name__ == "__main__":
    raise SystemExit(main())
