export type Fazenda = {
  id: number;
  nome: string;
  created_at: string;
  updated_at: string;
};

export type Talhao = {
  id: number;
  fazenda_id: number;
  fazenda_nome: string;
  codigo: string;
  nome: string | null;
  area_hectares: number;
  localizacao_descricao: string | null;
  created_at: string;
  updated_at: string;
};

export type RegistroColheita = {
  id: number;
  fazenda_id: number;
  fazenda_nome: string;
  talhao_id: number;
  talhao_codigo: string;
  safra: string;
  data_fechamento: string;
  tipo_colheita: "manual" | "semimecanizada" | "mecanizada";
  producao_prevista_ton: number;
  producao_real_ton: number;
  perda_ton: number;
  perda_percentual: number;
  equipe_responsavel: string;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export type RankingItem = {
  talhao_id: number;
  talhao_codigo: string;
  fazenda_nome: string;
  perda_ton: number;
  perda_percentual: number;
};

export type FazendaResumo = {
  fazenda_id: number;
  fazenda_nome: string;
  total_previsto_ton: number;
  total_realizado_ton: number;
  perda_total_ton: number;
  perda_percentual_medio: number;
};

export type RelatorioSafra = {
  safra: string;
  total_registros: number;
  total_previsto_ton: number;
  total_realizado_ton: number;
  perda_total_ton: number;
  perda_percentual_medio: number;
  ranking_maiores_perdas: RankingItem[];
  consolidado_por_fazenda: FazendaResumo[];
};

export type RelatorioEntidade = {
  titulo: string;
  identificador: string;
  safra: string | null;
  total_registros: number;
  total_previsto_ton: number;
  total_realizado_ton: number;
  perda_total_ton: number;
  perda_percentual_medio: number;
};
