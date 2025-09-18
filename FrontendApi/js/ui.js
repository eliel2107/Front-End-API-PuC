/**
 * Renderiza um spinner de carregamento.
 * @returns {string} HTML do spinner.
 */
function renderSpinner() {
    return `
        <div class="spinner-container">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
}

/**
 * Cria o HTML para os controles de filtro com autocompletar.
 * @param {object} options - Opções para os filtros.
 * @returns {string} A string HTML da barra de filtros.
 */
function renderFilterControls({ filters = {}, uniqueValues = { types: [], statuses: [] } }) {
    const typesOptions = uniqueValues.types.map(type => `<option value="${type}"></option>`).join('');
    const statusesOptions = uniqueValues.statuses.map(status => `<option value="${status}"></option>`).join('');

    return `
        <form id="filter-form" class="filter-bar">
            <div class="row g-3 align-items-end">
                <div class="col-md">
                    <label for="filter-nome" class="form-label">Filtrar por Nome</label>
                    <input type="text" id="filter-nome" name="nome" class="form-control" value="${filters.nome || ''}" placeholder="Digite para buscar..." autocomplete="off">
                </div>
                <div class="col-md">
                    <label for="filter-tipo" class="form-label">Filtrar por Tipo</label>
                    <input type="text" id="filter-tipo" name="tipo" class="form-control" list="types-datalist" value="${filters.tipo || ''}" placeholder="Selecione ou digite..." autocomplete="off">
                    <datalist id="types-datalist">${typesOptions}</datalist>
                </div>
                <div class="col-md">
                    <label for="filter-status" class="form-label">Filtrar por Status</label>
                    <input type="text" id="filter-status" name="status" class="form-control" list="statuses-datalist" value="${filters.status || ''}" placeholder="Selecione ou digite..." autocomplete="off">
                    <datalist id="statuses-datalist">${statusesOptions}</datalist>
                </div>
                <div class="col-md-auto">
                    <button type="reset" class="btn btn-secondary w-100">Limpar</button>
                </div>
            </div>
        </form>
    `;
}

/**
 * Cria o HTML para um único item da lista de manutenções.
 * @param {object} manutencao - O objeto de manutenção.
 * @param {number} ativoId - O ID do ativo pai.
 * @returns {string} A string HTML do item.
 */
function createMaintenanceItem(manutencao, ativoId) {
    return `
        <li class="maintenance-item">
            <span class="description">${manutencao.descricao}</span>
            <div class="maintenance-details">
                <span class="date me-3">${new Date(manutencao.data_manutencao).toLocaleDateString()}</span>
                <div class="maintenance-actions">
                    <button class="icon-btn btn-edit-maintenance" data-id="${manutencao.id}" data-ativo-id="${ativoId}">
                        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                        <span class="icon-text">Editar</span>
                    </button>
                    <button class="icon-btn btn-delete-maintenance" data-id="${manutencao.id}">
                        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        <span class="icon-text">Excluir</span>
                    </button>
                </div>
            </div>
        </li>
    `;
}

/**
 * Cria o HTML para um único card de ativo.
 * @param {object} ativo - O objeto do ativo.
 * @returns {string} A string HTML do card.
 */
function createAssetCard(ativo) {
    let maintenanceHtml = '';
    if (ativo.manutencoes && ativo.manutencoes.length > 0) {
        const maintenanceItems = ativo.manutencoes.map(m => createMaintenanceItem(m, ativo.id)).join('');
        maintenanceHtml = `
            <div class="mt-3 pt-3 border-top">
                <h6>Histórico de Manutenção</h6>
                <ul class="list-unstyled mb-0">${maintenanceItems}</ul>
            </div>
        `;
    }

    return `
        <div class="col">
            <div class="card h-100 shadow-sm asset-card" data-tag="${ativo.tag_patrimonio}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title mb-0">${ativo.nome}</h5>
                        <span class="badge bg-secondary">${ativo.tag_patrimonio}</span>
                    </div>
                    <p class="card-text"><strong>Tipo:</strong> ${ativo.tipo}</p>
                    <p class="card-text"><strong>Status:</strong> ${ativo.status || 'Não informado'}</p>
                    <p class="card-text"><strong>Valor:</strong> R$ ${ativo.valor_aquisicao.toFixed(2).replace('.', ',')}</p>
                    ${maintenanceHtml}
                </div>
                <div class="card-footer d-flex justify-content-between align-items-center">
                    <button class="btn btn-sm btn-outline-primary btn-add-maintenance" data-id="${ativo.id}" data-nome="${ativo.nome}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                        Manutenção
                    </button>
                    <div class="actions">
                        <button class="icon-btn btn-edit" data-tag="${ativo.tag_patrimonio}">
                           <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                           <span class="icon-text">Editar</span>
                        </button>
                        <button class="icon-btn btn-delete" data-tag="${ativo.tag_patrimonio}">
                            <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                            <span class="icon-text">Excluir</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renderiza apenas a grade de ativos.
 * @param {Array} displayAssets - A lista de ativos a ser renderizada.
 * @returns {string} O HTML da grade de ativos.
 */
function renderAssetGrid(displayAssets) {
    if (!displayAssets || displayAssets.length === 0) {
        return '<div class="alert alert-info">Nenhum ativo encontrado para os filtros e ordenação aplicados.</div>';
    }
    const cardsHtml = displayAssets.map(createAssetCard).join('');
    return `<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">${cardsHtml}</div>`;
}

/**
 * Renderiza a página de listagem de ativos.
 * @param {object} data - Contém as listas de ativos, filtros, etc.
 * @returns {string} Uma string HTML com a página completa.
 */
function renderAssetListPage({ displayAssets, filters, uniqueValues }) {
    return `
        <h2 class="page-title">Meus Ativos</h2>
        ${renderFilterControls({ filters, uniqueValues })}
        <div id="asset-grid-container">
            ${renderAssetGrid(displayAssets)}
        </div>
    `;
}

/**
 * Renderiza o formulário de cadastro ou edição de um ativo.
 * @param {object} options - Opções para o formulário.
 * @returns {string} A string HTML do formulário.
 */
function renderFormPage({ title, ativo = {}, isUpdate = false }) {
    const tagReadonly = isUpdate ? 'readonly' : '';
    const tagValue = isUpdate ? `value="${ativo.tag_patrimonio}"` : '';
    const buttonText = isUpdate ? 'Salvar Alterações' : 'Cadastrar Ativo';

    return `
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="card shadow-sm">
                    <div class="card-body p-4">
                        <h2 class="page-title text-center">${title}</h2>
                        <form id="asset-form">
                            <div class="mb-3">
                                <label for="tag_patrimonio" class="form-label">Tag de Patrimônio</label>
                                <input type="text" class="form-control" id="tag_patrimonio" ${tagValue} ${tagReadonly} required>
                            </div>
                            <div class="mb-3">
                                <label for="nome" class="form-label">Nome do Ativo</label>
                                <input type="text" class="form-control" id="nome" value="${ativo.nome || ''}" required>
                            </div>
                             <div class="mb-3">
                                <label for="tipo" class="form-label">Tipo</label>
                                <input type="text" class="form-control" id="tipo" value="${ativo.tipo || ''}" required>
                            </div>
                            <div class="mb-3">
                                <label for="status" class="form-label">Status</label>
                                <input type="text" class="form-control" id="status" value="${ativo.status || ''}" required>
                            </div>
                             <div class="mb-3">
                                <label for="valor_aquisicao" class="form-label">Valor de Aquisição (R$)</label>
                                <input type="number" step="0.01" class="form-control" id="valor_aquisicao" value="${ativo.valor_aquisicao || ''}" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">${buttonText}</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

