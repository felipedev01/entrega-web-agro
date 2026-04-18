import type {
  Fazenda,
  RegistroColheita,
  RelatorioEntidade,
  RelatorioSafra,
  Talhao,
} from "./types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function ensureApiBaseUrl() {
  if (!apiBaseUrl) {
    throw new ApiError("NEXT_PUBLIC_API_BASE_URL nao foi configurada.");
  }
  return apiBaseUrl;
}

function buildUrl(path: string, searchParams?: URLSearchParams) {
  const base = ensureApiBaseUrl();
  const url = new URL(`${base}${path}`);
  if (searchParams) {
    url.search = searchParams.toString();
  }
  return url.toString();
}

async function request<T>(path: string, init?: RequestInit, searchParams?: URLSearchParams): Promise<T> {
  const url = buildUrl(path, searchParams);

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Nao foi possivel alcancar a API. Verifique o tunnel e o backend.");
  }

  if (!response.ok) {
    try {
      const payload = (await response.json()) as { detail?: string };
      throw new ApiError(payload.detail ?? "A API retornou um erro inesperado.");
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("A API retornou um erro inesperado.");
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getExportUrl(path: "/export/json" | "/export/txt", safra?: string) {
  if (!apiBaseUrl) {
    return null;
  }
  const params = new URLSearchParams();
  if (safra) {
    params.set("safra", safra);
  }
  return buildUrl(path, params);
}

export async function getHealth() {
  return request<{ status: string; database: string }>("/health/db");
}

export async function listFazendas() {
  return request<Fazenda[]>("/fazendas");
}

export async function createFazenda(payload: { nome: string }) {
  return request<Fazenda>("/fazendas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateFazenda(id: number, payload: { nome: string }) {
  return request<Fazenda>(`/fazendas/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteFazenda(id: number) {
  return request<void>(`/fazendas/${id}`, { method: "DELETE" });
}

export async function listTalhoes(filters?: { fazendaId?: number }) {
  const params = new URLSearchParams();
  if (filters?.fazendaId) {
    params.set("fazenda_id", String(filters.fazendaId));
  }
  return request<Talhao[]>("/talhoes", undefined, params);
}

export async function createTalhao(payload: {
  fazenda_id: number;
  codigo: string;
  nome: string | null;
  area_hectares: number;
  localizacao_descricao: string | null;
}) {
  return request<Talhao>("/talhoes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTalhao(
  id: number,
  payload: {
    fazenda_id: number;
    codigo: string;
    nome: string | null;
    area_hectares: number;
    localizacao_descricao: string | null;
  },
) {
  return request<Talhao>(`/talhoes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteTalhao(id: number) {
  return request<void>(`/talhoes/${id}`, { method: "DELETE" });
}

export async function listRegistros(filters?: {
  safra?: string;
  fazendaId?: number;
  talhaoId?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.safra) {
    params.set("safra", filters.safra);
  }
  if (filters?.fazendaId) {
    params.set("fazenda_id", String(filters.fazendaId));
  }
  if (filters?.talhaoId) {
    params.set("talhao_id", String(filters.talhaoId));
  }
  return request<RegistroColheita[]>("/registros-colheita", undefined, params);
}

export async function createRegistro(payload: {
  fazenda_id: number;
  talhao_id: number;
  safra: string;
  data_fechamento: string;
  tipo_colheita: "manual" | "semimecanizada" | "mecanizada";
  producao_prevista_ton: number;
  producao_real_ton: number;
  equipe_responsavel: string;
  observacoes: string | null;
}) {
  return request<RegistroColheita>("/registros-colheita", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateRegistro(
  id: number,
  payload: {
    fazenda_id: number;
    talhao_id: number;
    safra: string;
    data_fechamento: string;
    tipo_colheita: "manual" | "semimecanizada" | "mecanizada";
    producao_prevista_ton: number;
    producao_real_ton: number;
    equipe_responsavel: string;
    observacoes: string | null;
  },
) {
  return request<RegistroColheita>(`/registros-colheita/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteRegistro(id: number) {
  return request<void>(`/registros-colheita/${id}`, { method: "DELETE" });
}

export async function getRelatorioSafra(safra: string) {
  return request<RelatorioSafra>(`/relatorios/safra/${encodeURIComponent(safra)}`);
}

export async function getRelatorioFazenda(fazendaId: number, safra?: string) {
  const params = new URLSearchParams();
  if (safra) {
    params.set("safra", safra);
  }
  return request<RelatorioEntidade>(`/relatorios/fazenda/${fazendaId}`, undefined, params);
}

export async function getRelatorioTalhao(talhaoId: number, safra?: string) {
  const params = new URLSearchParams();
  if (safra) {
    params.set("safra", safra);
  }
  return request<RelatorioEntidade>(`/relatorios/talhao/${talhaoId}`, undefined, params);
}
