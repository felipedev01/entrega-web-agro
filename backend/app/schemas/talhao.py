from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TalhaoBase(BaseModel):
    fazenda_id: int
    codigo: str = Field(..., min_length=2, max_length=30)
    nome: str | None = Field(default=None, max_length=120)
    area_hectares: float = Field(..., gt=0)
    localizacao_descricao: str | None = Field(default=None, max_length=255)


class TalhaoCreate(TalhaoBase):
    pass


class TalhaoUpdate(TalhaoBase):
    pass


class TalhaoRead(TalhaoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    fazenda_nome: str
    created_at: datetime
    updated_at: datetime
