from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


TipoColheita = Literal["manual", "semimecanizada", "mecanizada"]


class RegistroBase(BaseModel):
    fazenda_id: int
    talhao_id: int
    safra: str = Field(..., min_length=4, max_length=9)
    data_fechamento: date
    tipo_colheita: TipoColheita
    producao_prevista_ton: float = Field(..., gt=0)
    producao_real_ton: float = Field(..., ge=0)
    equipe_responsavel: str = Field(..., min_length=2, max_length=120)
    observacoes: str | None = Field(default=None, max_length=1200)

    @field_validator("safra")
    @classmethod
    def normalize_safra(cls, value: str) -> str:
        return value.strip()


class RegistroCreate(RegistroBase):
    pass


class RegistroUpdate(RegistroBase):
    pass


class RegistroRead(RegistroBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    fazenda_nome: str
    talhao_codigo: str
    perda_ton: float
    perda_percentual: float
    created_at: datetime
    updated_at: datetime
