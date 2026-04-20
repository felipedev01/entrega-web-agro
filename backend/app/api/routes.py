from fastapi import APIRouter, Depends, Query, Response, status
from fastapi.responses import PlainTextResponse

from app.repositories.agro_repository import AgroRepository
from app.schemas.fazenda import FazendaCreate, FazendaRead, FazendaUpdate
from app.schemas.registro import RegistroCreate, RegistroRead, RegistroUpdate
from app.schemas.report import RelatorioEntidade, RelatorioSafra
from app.schemas.talhao import TalhaoCreate, TalhaoRead, TalhaoUpdate
from app.services.agro_service import AgroService

router = APIRouter()


def get_service() -> AgroService:
    return AgroService(AgroRepository())


@router.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/fazendas", response_model=list[FazendaRead])
def list_fazendas(service: AgroService = Depends(get_service)):
    return service.list_fazendas()


@router.post("/fazendas", response_model=FazendaRead, status_code=status.HTTP_201_CREATED)
def create_fazenda(payload: FazendaCreate, service: AgroService = Depends(get_service)):
    return service.create_fazenda(payload.nome)


@router.put("/fazendas/{fazenda_id}", response_model=FazendaRead)
def update_fazenda(fazenda_id: int, payload: FazendaUpdate, service: AgroService = Depends(get_service)):
    return service.update_fazenda(fazenda_id, payload.nome)


@router.delete("/fazendas/{fazenda_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fazenda(fazenda_id: int, service: AgroService = Depends(get_service)):
    service.delete_fazenda(fazenda_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/talhoes", response_model=list[TalhaoRead])
def list_talhoes(
    fazenda_id: int | None = Query(default=None),
    service: AgroService = Depends(get_service),
):
    return service.list_talhoes(fazenda_id)


@router.post("/talhoes", response_model=TalhaoRead, status_code=status.HTTP_201_CREATED)
def create_talhao(payload: TalhaoCreate, service: AgroService = Depends(get_service)):
    return service.create_talhao(payload.model_dump())


@router.put("/talhoes/{talhao_id}", response_model=TalhaoRead)
def update_talhao(talhao_id: int, payload: TalhaoUpdate, service: AgroService = Depends(get_service)):
    return service.update_talhao(talhao_id, payload.model_dump())


@router.delete("/talhoes/{talhao_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_talhao(talhao_id: int, service: AgroService = Depends(get_service)):
    service.delete_talhao(talhao_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/registros-colheita", response_model=list[RegistroRead])
def list_registros_colheita(
    safra: str | None = Query(default=None),
    fazenda_id: int | None = Query(default=None),
    talhao_id: int | None = Query(default=None),
    service: AgroService = Depends(get_service),
):
    return service.list_registros(safra=safra, fazenda_id=fazenda_id, talhao_id=talhao_id)


@router.post("/registros-colheita", response_model=RegistroRead, status_code=status.HTTP_201_CREATED)
def create_registro_colheita(payload: RegistroCreate, service: AgroService = Depends(get_service)):
    return service.create_registro(payload.model_dump())


@router.put("/registros-colheita/{registro_id}", response_model=RegistroRead)
def update_registro_colheita(
    registro_id: int,
    payload: RegistroUpdate,
    service: AgroService = Depends(get_service),
):
    return service.update_registro(registro_id, payload.model_dump())


@router.delete("/registros-colheita/{registro_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_registro_colheita(registro_id: int, service: AgroService = Depends(get_service)):
    service.delete_registro(registro_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/relatorios/safra/{safra:path}", response_model=RelatorioSafra)
def get_relatorio_safra(safra: str, service: AgroService = Depends(get_service)):
    return service.relatorio_safra(safra)


@router.get("/relatorios/fazenda/{fazenda_id}", response_model=RelatorioEntidade)
def get_relatorio_fazenda(
    fazenda_id: int,
    safra: str | None = Query(default=None),
    service: AgroService = Depends(get_service),
):
    return service.relatorio_fazenda(fazenda_id, safra)


@router.get("/relatorios/talhao/{talhao_id}", response_model=RelatorioEntidade)
def get_relatorio_talhao(
    talhao_id: int,
    safra: str | None = Query(default=None),
    service: AgroService = Depends(get_service),
):
    return service.relatorio_talhao(talhao_id, safra)


@router.get("/export/json")
def export_json(service: AgroService = Depends(get_service)):
    return service.export_snapshot()


@router.get("/export/txt", response_class=PlainTextResponse)
def export_txt(
    safra: str | None = Query(default=None),
    service: AgroService = Depends(get_service),
):
    return service.export_txt(safra)


@router.get("/export/xlsx")
def export_xlsx(service: AgroService = Depends(get_service)):
    filename = "relatorio-colheita-completo.xlsx"
    return Response(
        content=service.export_xlsx(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
