from __future__ import annotations

import argparse
from pathlib import Path

import oracledb

from app.core.config import Settings

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Valida a conexao minima com Oracle antes do startup completo da API.",
    )
    parser.add_argument("--host", help="Sobrescreve ORACLE_HOST.")
    parser.add_argument("--port", type=int, help="Sobrescreve ORACLE_PORT.")
    parser.add_argument("--service", help="Sobrescreve ORACLE_SERVICE.")
    parser.add_argument("--user", help="Sobrescreve ORACLE_USER.")
    parser.add_argument("--password", help="Sobrescreve ORACLE_PASSWORD.")
    return parser.parse_args()


def load_settings() -> Settings:
    if ENV_FILE.exists():
        return Settings(_env_file=ENV_FILE)
    return Settings()


def build_connection_params(args: argparse.Namespace, settings: Settings) -> tuple[str, int, str, str, str]:
    host = args.host or settings.oracle_host
    port = args.port or settings.oracle_port
    service = args.service or settings.oracle_service
    user = args.user or settings.oracle_user
    password = args.password or settings.oracle_password
    return host, port, service, user, password


def main() -> int:
    args = parse_args()

    try:
        settings = load_settings()
    except Exception as exc:
        print(f"[ERRO] Nao foi possivel carregar as configuracoes Oracle: {exc}")
        print(
            "[DICA] Revise o arquivo backend/.env ou informe os valores via argumentos "
            "--host/--port/--service/--user/--password."
        )
        return 1

    host, port, service, user, password = build_connection_params(args, settings)
    dsn = f"{host}:{port}/{service}"

    connection: oracledb.Connection | None = None
    try:
        connection = oracledb.connect(
            user=user,
            password=password,
            dsn=dsn,
        )
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM dual")
            cursor.fetchone()

        print(f"[OK] Conexao Oracle estabelecida com sucesso em {dsn} usando o usuario {user}.")
        return 0
    except oracledb.DatabaseError as exc:
        print(f"[ERRO] Falha ao conectar ao Oracle em {dsn} com o usuario {user}.")
        print(f"[DETALHE] {exc}")
        print(
            "[DICA] Se a autenticacao falhar, revise as credenciais do backend/.env "
            "ou informe os valores corretos via argumentos de linha de comando."
        )
        return 1
    finally:
        if connection is not None:
            connection.close()
            print("[INFO] Conexao encerrada.")


if __name__ == "__main__":
    raise SystemExit(main())
