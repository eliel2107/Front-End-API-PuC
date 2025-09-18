/**
 * Renderiza um spinner de carregamento.
 * @returns {string} HTML do spinner.
 */
function renderSpinner() {
    return `
        <div class="loading">
            <div class="spinner"></div>
            <p class="mt-3">Carregando...</p>
        </div>
    `;
}

/**
 * Renderiza a página de listagem de ativos com filtros e grades.
 * @param {object} options - Opções contendo displayAssets, filters e uniqueValues.
 * @returns {string} HTML da página de listagem.
 */
function renderAssetListPage({ displayAssets = [], filters = {}, uniqueValues = {} }) {
    return `
        <div class="row">
            <!-- Filtros -->
            <div class="col-12 mb-4">
                <div class="filters-section">
                    <h4 class="filters-title">
                        <i class="fas fa-filter"></i>
                        Filtros de Busca
                    </h4>
                    <form id="filter-form">
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label for="filter-nome" class="form-label">Nome</label>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    id="filter-nome" 
                                    placeholder="Buscar por nome..."
                                    value="${filters.nome || ''}"
                                >
                            </div>
                            <div class="col-md-3 mb-3">
                                <label for="filter-tipo" class="form-label">Tipo</label>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    id="filter-tipo" 
                                    placeholder="Filtrar por tipo..."
                                    value="${filters.tipo || ''}"
                                >
                            </div>
                            <div class="col-md-3 mb-3">
                                <label for="filter-status" class="form-label">Status</label>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    id="filter-status" 
                                    placeholder="Filtrar por status..."
                                    value="${filters.status || ''}"
                                >
                            </div>
                            <div class="col-md-2 mb-3 d-flex align-items-end">
                                <button type="reset" class="btn btn-secondary w-100">
                                    <i class="fas fa-times"></i>
                                    Limpar
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Grade de Ativos -->
            <div class="col-12">
                <div id="asset-grid-container">
                    ${renderAssetGrid(displayAssets)}
                </div>
            </div>
        </div>
    `;
}

/**
 * Renderiza uma grade de cards de ativos.
 * @param {Array} displayAssets - Array de ativos a serem exibidos.
 * @returns {string} HTML da grade de ativos.
 */
function renderAssetGrid(displayAssets) {
    if (!displayAssets || displayAssets.length === 0) {
        return `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>Nenhum ativo encontrado</h3>
                <p>Não há ativos cadastrados ou que correspondam aos filtros aplicados.</p>
            </div>
        `;
    }

    return `
        <div class="asset-grid">
            ${displayAssets.map(ativo => renderAssetCard(ativo)).join('')}
        </div>
    `;
}

/**
 * Renderiza um card individual de ativo.
 * @param {object} ativo - O objeto ativo.
 * @returns {string} HTML do card do ativo.
 */
function renderAssetCard(ativo) {
    const statusClass = getStatusClass(ativo.status);
    const maintenanceHtml = renderMaintenanceSection(ativo);
    
    return `
        <div class="asset-card">
            <div class="asset-card-header">
                <h5 class="asset-name">${ativo.nome || 'Nome não informado'}</h5>
                <span class="asset-tag">${ativo.tag_patrimonio}</span>
            </div>
            
            <div class="asset-info">
                <p><strong>Tipo:</strong> ${ativo.tipo || 'Não informado'}</p>
                <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${ativo.status || 'Não informado'}</span></p>
                <p><strong>Valor:</strong> <span class="asset-value">R$ ${ativo.valor_aquisicao ? ativo.valor_aquisicao.toFixed(2).replace('.', ',') : '0,00'}</span></p>
            </div>

            ${maintenanceHtml}

            <div class="asset-actions">
                <button class="btn btn-warning btn-sm btn-edit" data-tag="${ativo.tag_patrimonio}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm btn-delete" data-tag="${ativo.tag_patrimonio}">
                    <i class="fas fa-trash"></i> Excluir
                </button>
                <button class="btn btn-success btn-sm btn-add-maintenance" data-id="${ativo.id}" data-nome="${ativo.nome}">
                    <i class="fas fa-tools"></i> Nova Manutenção
                </button>
            </div>
        </div>
    `;
}

/**
 * Renderiza a seção de manutenções de um ativo.
 * @param {object} ativo - O objeto ativo com suas manutenções.
 * @returns {string} HTML da seção de manutenções.
 */
function renderMaintenanceSection(ativo) {
    if (!ativo.manutencoes || ativo.manutencoes.length === 0) {
        return `
            <div class="maintenance-section">
                <h6 class="maintenance-title">
                    <i class="fas fa-tools"></i>
                    Manutenções (0)
                </h6>
                <p class="text-muted"><em>Nenhuma manutenção registrada</em></p>
            </div>
        `;
    }

    return `
        <div class="maintenance-section">
            <h6 class="maintenance-title">
                <i class="fas fa-tools"></i>
                Manutenções (${ativo.manutencoes.length})
            </h6>
            <div class="maintenance-list">
                ${ativo.manutencoes.map(manutencao => `
                    <div class="maintenance-item">
                        <div class="maintenance-description">${manutencao.descricao}</div>
                        <div class="maintenance-actions">
                            <button class="btn btn-sm btn-warning btn-edit-maintenance" 
                                    data-id="${manutencao.id}" 
                                    data-ativo-id="${ativo.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger btn-delete-maintenance" 
                                    data-id="${manutencao.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Renderiza a página de formulário (criar/editar).
 * @param {object} options - Opções contendo title, ativo e isUpdate.
 * @returns {string} HTML da página do formulário.
 */
function renderFormPage({ title, ativo = null, isUpdate = false }) {
    return `
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="form-section">
                    <h2 class="form-title">${title}</h2>
                    
                    <form id="asset-form">
                        ${!isUpdate ? `
                        <div class="mb-3">
                            <label for="tag_patrimonio" class="form-label">Tag Patrimônio *</label>
                            <input type="text" class="form-control" id="tag_patrimonio" required 
                                   value="${ativo?.tag_patrimonio || ''}" placeholder="Ex: COMP001">
                        </div>
                        ` : ''}
                        
                        <div class="mb-3">
                            <label for="nome" class="form-label">Nome *</label>
                            <input type="text" class="form-control" id="nome" required 
                                   value="${ativo?.nome || ''}" placeholder="Nome do ativo">
                        </div>
                        
                        <div class="mb-3">
                            <label for="tipo" class="form-label">Tipo *</label>
                            <input type="text" class="form-control" id="tipo" required 
                                   value="${ativo?.tipo || ''}" placeholder="Tipo do ativo">
                        </div>
                        
                        <div class="mb-3">
                            <label for="status" class="form-label">Status *</label>
                            <select class="form-control" id="status" required>
                                <option value="">Selecione o status</option>
                                <option value="Ativo" ${ativo?.status === 'Ativo' ? 'selected' : ''}>Ativo</option>
                                <option value="Inativo" ${ativo?.status === 'Inativo' ? 'selected' : ''}>Inativo</option>
                                <option value="Em Manutenção" ${ativo?.status === 'Em Manutenção' ? 'selected' : ''}>Em Manutenção</option>
                            </select>
                        </div>
                        
                        <div class="mb-4">
                            <label for="valor_aquisicao" class="form-label">Valor de Aquisição *</label>
                            <input type="number" step="0.01" class="form-control" id="valor_aquisicao" required 
                                   value="${ativo?.valor_aquisicao || ''}" placeholder="0.00">
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i>
                                ${isUpdate ? 'Atualizar' : 'Cadastrar'}
                            </button>
                            <button type="button" class="btn btn-secondary" id="nav-listar">
                                <i class="fas fa-arrow-left"></i>
                                Voltar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

/**
 * Retorna a classe CSS apropriada para o status.
 * @param {string} status - O status do ativo.
 * @returns {string} A classe CSS.
 */
function getStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'ativo': return 'status-ativo';
        case 'em manutenção': return 'status-manutencao';
        case 'inativo': return 'status-inativo';
        default: return 'status-inativo';
    }
}