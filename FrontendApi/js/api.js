const API_URL = "http://127.0.0.1:5000";

/**
 * Função genérica para tratar respostas da API.
 * @param {Response} response - O objeto de resposta do fetch.
 * @returns {Promise<any>}
 */
async function handleResponse(response) {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
        const error = (data && data.message) || response.statusText;
        throw new Error(error);
    }
    return data;
}

/**
 * Busca a lista de ativos na API, com filtros opcionais.
 * @param {object} filters - Objeto com os filtros (nome, tipo, status).
 * @returns {Promise<Array>} Uma promessa que resolve para a lista de ativos.
 */
async function getAtivos(filters = {}) {
    const params = new URLSearchParams();
    if (filters.nome) params.append('nome', filters.nome);
    if (filters.tipo) params.append('tipo', filters.tipo);
    if (filters.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const url = `${API_URL}/ativos${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url);
    const data = await handleResponse(response);
    return data.ativos || [];
}

/**
 * Envia um novo ativo para a API para ser criado.
 * @param {object} dadosDoAtivo - O objeto com os dados do novo ativo.
 */
async function createAtivo(dadosDoAtivo) {
    const response = await fetch(`${API_URL}/ativo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosDoAtivo),
    });
    return handleResponse(response);
}

/**
 * Atualiza um ativo existente na API.
 * @param {string} tag - A tag de patrimônio do ativo a ser atualizado.
 * @param {object} dadosParaAtualizar - Os novos dados.
 */
async function updateAtivo(tag, dadosParaAtualizar) {
    const response = await fetch(`${API_URL}/ativo?tag_patrimonio=${encodeURIComponent(tag)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaAtualizar),
    });
    return handleResponse(response);
}

/**
 * Deleta um ativo da API.
 * @param {string} tag - A tag de patrimônio do ativo a ser deletado.
 */
async function deleteAtivo(tag) {
    const response = await fetch(`${API_URL}/ativo?tag_patrimonio=${encodeURIComponent(tag)}`, {
        method: 'DELETE',
    });
    return handleResponse(response);
}

/**
 * Adiciona um novo registro de manutenção a um ativo.
 * @param {object} dadosManutencao - Contém ativo_id e descricao.
 */
async function addManutencao(dadosManutencao) {
    const response = await fetch(`${API_URL}/manutencao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosManutencao),
    });
    return handleResponse(response);
}

/**
 * Atualiza um registro de manutenção existente.
 * @param {number} id - O ID da manutenção a ser atualizada.
 * @param {object} dadosParaAtualizar - Contém a nova descricao.
 */
async function updateManutencao(id, dadosParaAtualizar) {
    const response = await fetch(`${API_URL}/manutencao?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaAtualizar),
    });
    return handleResponse(response);
}

/**
 * Deleta um registro de manutenção da API.
 * @param {number} id - O ID da manutenção a ser deletada.
 */
async function deleteManutencao(id) {
    const response = await fetch(`${API_URL}/manutencao?id=${id}`, {
        method: 'DELETE',
    });
    return handleResponse(response);
}

