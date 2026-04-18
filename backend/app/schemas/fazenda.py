from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FazendaBase(BaseModel):
    nome: str = Field(..., min_length=3, max_length=120)


class FazendaCreate(FazendaBase):
    pass


class FazendaUpdate(FazendaBase):
    pass


class FazendaRead(FazendaBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
