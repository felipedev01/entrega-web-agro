from pydantic import BaseModel


class RankingItem(BaseModel):
    talhao_id: int
    talhao_codigo: str
    fazenda_nome: str
    perda_ton: float
    perda_percentual: float


class FazendaResumo(BaseModel):
    fazenda_id: int
    fazenda_nome: str
    total_previsto_ton: float
    total_realizado_ton: float
    perda_total_ton: float
    perda_percentual_medio: float


class RelatorioSafra(BaseModel):
    safra: str
    total_registros: int
    total_previsto_ton: float
    total_realizado_ton: float
    perda_total_ton: float
    perda_percentual_medio: float
    ranking_maiores_perdas: list[RankingItem]
    consolidado_por_fazenda: list[FazendaResumo]


class RelatorioEntidade(BaseModel):
    titulo: str
    identificador: str
    safra: str | None
    total_registros: int
    total_previsto_ton: float
    total_realizado_ton: float
    perda_total_ton: float
    perda_percentual_medio: float
