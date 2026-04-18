INSERT INTO fazendas (nome) VALUES ('Fazenda Sao Jose');
INSERT INTO fazendas (nome) VALUES ('Fazenda Boa Esperanca');

INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T01', 'Baixada Norte', 12.50, 'Setor proximo a estrada principal'
FROM fazendas WHERE nome = 'Fazenda Sao Jose';
INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T02', 'Ponte Alta', 14.20, 'Faixa de transicao do solo'
FROM fazendas WHERE nome = 'Fazenda Sao Jose';
INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T03', 'Colina 1', 11.80, 'Area mais seca do bloco sul'
FROM fazendas WHERE nome = 'Fazenda Sao Jose';
INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T04', 'Colina 2', 15.10, 'Trecho com maior declive'
FROM fazendas WHERE nome = 'Fazenda Sao Jose';
INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T05', 'Vale Verde', 13.40, 'Regiao com irrigacao complementar'
FROM fazendas WHERE nome = 'Fazenda Sao Jose';
INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T06', 'Retiro', 16.30, 'Talhao de acesso mais longo'
FROM fazendas WHERE nome = 'Fazenda Sao Jose';
INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T07', 'Curva Leste', 10.70, 'Borda com maior incidencia de vento'
FROM fazendas WHERE nome = 'Fazenda Sao Jose';
INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T08', 'Matinha', 17.00, 'Setor perto da reserva interna'
FROM fazendas WHERE nome = 'Fazenda Sao Jose';
INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T09', 'Patamar', 18.10, 'Bloco de maior area continua'
FROM fazendas WHERE nome = 'Fazenda Sao Jose';
INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T10', 'Cedro', 12.90, 'Faixa sombreada no extremo oeste'
FROM fazendas WHERE nome = 'Fazenda Sao Jose';

INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T01', 'Aurora', 11.30, 'Area plana na entrada da fazenda'
FROM fazendas WHERE nome = 'Fazenda Boa Esperanca';
INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T02', 'Horizonte', 14.80, 'Faixa com historico estavel de corte'
FROM fazendas WHERE nome = 'Fazenda Boa Esperanca';
INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T03', 'Lago Azul', 12.10, 'Setor proximo ao reservatorio'
FROM fazendas WHERE nome = 'Fazenda Boa Esperanca';
INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T04', 'Paineira', 19.20, 'Maior talhao da fazenda'
FROM fazendas WHERE nome = 'Fazenda Boa Esperanca';
INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T05', 'Morro Alto', 13.00, 'Area com maior compactacao do solo'
FROM fazendas WHERE nome = 'Fazenda Boa Esperanca';
INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T06', 'Campo Novo', 15.60, 'Bloco implantado na ultima renovacao'
FROM fazendas WHERE nome = 'Fazenda Boa Esperanca';
INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T07', 'Pedra Branca', 10.90, 'Trecho mais pedregoso'
FROM fazendas WHERE nome = 'Fazenda Boa Esperanca';
INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T08', 'Estrela', 16.40, 'Faixa central da propriedade'
FROM fazendas WHERE nome = 'Fazenda Boa Esperanca';
INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T09', 'Serra Baixa', 17.30, 'Setor com colheita mais lenta'
FROM fazendas WHERE nome = 'Fazenda Boa Esperanca';
INSERT INTO talhoes (fazenda_id, codigo, nome, area_hectares, localizacao_descricao)
SELECT id, 'T10', 'Jatoba', 12.70, 'Borda norte com estrada interna'
FROM fazendas WHERE nome = 'Fazenda Boa Esperanca';

INSERT INTO registros_colheita (
    fazenda_id, talhao_id, safra, data_fechamento, tipo_colheita,
    producao_prevista_ton, producao_real_ton, perda_ton, perda_percentual,
    equipe_responsavel, observacoes
)
SELECT f.id, t.id, '2025/2026', DATE '2026-04-03', 'mecanizada',
       1450, 1310, 140, 9.66, 'Equipe Alfa', 'Ajuste de rota por excesso de umidade.'
FROM fazendas f
JOIN talhoes t ON t.fazenda_id = f.id
WHERE f.nome = 'Fazenda Sao Jose' AND t.codigo = 'T02';

INSERT INTO registros_colheita (
    fazenda_id, talhao_id, safra, data_fechamento, tipo_colheita,
    producao_prevista_ton, producao_real_ton, perda_ton, perda_percentual,
    equipe_responsavel, observacoes
)
SELECT f.id, t.id, '2025/2026', DATE '2026-04-07', 'semimecanizada',
       1210, 1150, 60, 4.96, 'Equipe Beta', 'Boa uniformidade de cana no fechamento.'
FROM fazendas f
JOIN talhoes t ON t.fazenda_id = f.id
WHERE f.nome = 'Fazenda Sao Jose' AND t.codigo = 'T05';

INSERT INTO registros_colheita (
    fazenda_id, talhao_id, safra, data_fechamento, tipo_colheita,
    producao_prevista_ton, producao_real_ton, perda_ton, perda_percentual,
    equipe_responsavel, observacoes
)
SELECT f.id, t.id, '2025/2026', DATE '2026-04-09', 'mecanizada',
       1680, 1490, 190, 11.31, 'Equipe Gama', 'Paradas de manutencao reduziram o rendimento.'
FROM fazendas f
JOIN talhoes t ON t.fazenda_id = f.id
WHERE f.nome = 'Fazenda Sao Jose' AND t.codigo = 'T09';

INSERT INTO registros_colheita (
    fazenda_id, talhao_id, safra, data_fechamento, tipo_colheita,
    producao_prevista_ton, producao_real_ton, perda_ton, perda_percentual,
    equipe_responsavel, observacoes
)
SELECT f.id, t.id, '2025/2026', DATE '2026-04-10', 'manual',
       980, 940, 40, 4.08, 'Equipe Delta', 'Talhao colhido com equipe reduzida.'
FROM fazendas f
JOIN talhoes t ON t.fazenda_id = f.id
WHERE f.nome = 'Fazenda Boa Esperanca' AND t.codigo = 'T01';

INSERT INTO registros_colheita (
    fazenda_id, talhao_id, safra, data_fechamento, tipo_colheita,
    producao_prevista_ton, producao_real_ton, perda_ton, perda_percentual,
    equipe_responsavel, observacoes
)
SELECT f.id, t.id, '2025/2026', DATE '2026-04-12', 'mecanizada',
       1540, 1435, 105, 6.82, 'Equipe Epsilon', 'Produtividade dentro da faixa planejada.'
FROM fazendas f
JOIN talhoes t ON t.fazenda_id = f.id
WHERE f.nome = 'Fazenda Boa Esperanca' AND t.codigo = 'T04';

INSERT INTO registros_colheita (
    fazenda_id, talhao_id, safra, data_fechamento, tipo_colheita,
    producao_prevista_ton, producao_real_ton, perda_ton, perda_percentual,
    equipe_responsavel, observacoes
)
SELECT f.id, t.id, '2025/2026', DATE '2026-04-14', 'semimecanizada',
       1110, 1010, 100, 9.01, 'Equipe Zeta', 'Solo compactado dificultou o fechamento.'
FROM fazendas f
JOIN talhoes t ON t.fazenda_id = f.id
WHERE f.nome = 'Fazenda Boa Esperanca' AND t.codigo = 'T07';

COMMIT;
