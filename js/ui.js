/**
 * Renderiza um spinner de carregamento.
 * @returns {string} HTML do spinner.
 */
function renderSpinner() {
    return `
        <div class="d-flex justify-content-center align-items-center p-5">
            <div class="spinner-ring me-3"></div>
            <span class="text-info">Carregando...</span>
        </div>
    `;
}

/**
 * Renderiza uma mensagem quando não há dados para exibir.
 * @param {string} message - Mensagem a ser exibida.
 * @returns {string} HTML da mensagem.
 */
function renderEmptyState(message = "Nenhum item encontrado") {
    return `
        <div class="text-center p-5">
            <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">${message}</h5>
            <p class="text-muted">Não há dados disponíveis no momento.</p>
        </div>
    `;
}

/**
 * Renderiza um painel com barras de progresso para a distribuição de ativos por tipo.
 * @param {Array} ativos - A lista de ativos.
 * @returns {string} O HTML do painel de distribuição.
 */
function renderTypeDistribution(ativos) {
    if (!ativos || ativos.length === 0) {
        return '<p class="text-muted text-center py-5">Sem dados para exibir a distribuição.</p>';
    }

    const tiposCount = {};
    ativos.forEach(ativo => {
        const tipo = ativo.tipo || 'Não informado';
        tiposCount[tipo] = (tiposCount[tipo] || 0) + 1;
    });

    const totalAtivos = ativos.length;

    // Converte o objeto em um array para ordenar do maior para o menor
    const sortedTipos = Object.entries(tiposCount).sort(([, a], [, b]) => b - a);

    let html = '<div class="distribution-list">';

    sortedTipos.forEach(([tipo, count]) => {
        const percentage = ((count / totalAtivos) * 100).toFixed(1);
        html += `
            <div class="distribution-item mb-3">
                <div class="d-flex justify-content-between mb-1">
                    <span class="distribution-label">${tipo}</span>
                    <span class="distribution-value">${count} (${percentage}%)</span>
                </div>
                <div class="progress" style="height: 10px;">
                    <div class="progress-bar" 
                         role="progressbar" 
                         style="width: ${percentage}%; background: linear-gradient(90deg, var(--primary-tech), var(--secondary-tech));" 
                         aria-valuenow="${percentage}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

/**
 * Renderiza a página do dashboard com estatísticas e gráficos.
 * @param {Array} ativos - Lista de ativos.
 * @returns {string} HTML do dashboard.
 */
function renderDashboard(ativos = []) {
    const stats = calculateStats(ativos);
    const recentActivities = getRecentActivities(ativos);

    return `
        <div class="dashboard fade-in">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="glow-text mb-0">
                    <i class="fas fa-chart-pie me-2"></i>
                    Dashboard
                </h2>
                <small class="text-muted">Última atualização: ${new Date().toLocaleString('pt-BR')}</small>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-card-header">
                        <i class="fas fa-cubes stat-card-icon"></i>
                        <h6 class="stat-card-title">Total de Ativos</h6>
                    </div>
                    <div class="stat-card-value">${stats.total}</div>
                </div>

                <div class="stat-card success">
                    <div class="stat-card-header">
                        <i class="fas fa-check-circle stat-card-icon"></i>
                        <h6 class="stat-card-title">Ativos Ativos</h6>
                    </div>
                    <div class="stat-card-value">${stats.ativo}</div>
                </div>

                <div class="stat-card warning">
                    <div class="stat-card-header">
                        <i class="fas fa-tools stat-card-icon"></i>
                        <h6 class="stat-card-title">Ativos em Manutenção</h6>
                    </div>
                    <div class="stat-card-value">${stats.manutencao}</div>
                    <div class="stat-card-subtitle">
                        Total de ${stats.totalManutencoes} registros
                    </div>
                </div>

                <div class="stat-card danger">
                    <div class="stat-card-header">
                        <i class="fas fa-times-circle stat-card-icon"></i>
                        <h6 class="stat-card-title">Inativos</h6>
                    </div>
                    <div class="stat-card-value">${stats.inativo}</div>
                </div>

                <div class="stat-card">
                    <div class="stat-card-header">
                        <i class="fas fa-dollar-sign stat-card-icon"></i>
                        <h6 class="stat-card-title">Valor Total</h6>
                    </div>
                    <div class="stat-card-value">R$ ${stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
            </div>

            <div class="row mt-4">
                <div class="col-lg-8">
                    <div class="chart-container">
                        <h4 class="chart-title">
                            <i class="fas fa-tasks me-2"></i>
                            Distribuição por Tipo
                        </h4>
                        ${renderTypeDistribution(ativos)}
                    </div>
                </div>

                <div class="col-lg-4">
                    <div class="recent-activities">
                        <h4 class="chart-title mb-3">
                            <i class="fas fa-clock me-2"></i>
                            Atividades Recentes
                        </h4>
                        ${renderRecentActivities(recentActivities)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Calcula estatísticas dos ativos.
 * @param {Array} ativos - Lista de ativos.
 * @returns {Object} Objeto com estatísticas.
 */
function calculateStats(ativos) {
    const stats = {
        total: ativos.length,
        ativo: 0,
        inativo: 0,
        manutencao: 0,
        valorTotal: 0,
        totalManutencoes: 0
    };

    ativos.forEach(ativo => {
        stats.valorTotal += ativo.valor_aquisicao || 0;
        stats.totalManutencoes += ativo.manutencoes ? ativo.manutencoes.length : 0;

        switch (ativo.status) {
            case 'Ativo':
                stats.ativo++;
                break;
            case 'Inativo':
                stats.inativo++;
                break;
            case 'Em Manutenção':
                stats.manutencao++;
                break;
        }
    });

    return stats;
}

/**
 * Obtem atividades recentes baseadas nas manutenções.
 * @param {Array} ativos - Lista de ativos.
 * @returns {Array} Lista de atividades recentes.
 */
function getRecentActivities(ativos) {
    const activities = [];

    ativos.forEach(ativo => {
        if (ativo.manutencoes && ativo.manutencoes.length > 0) {
            ativo.manutencoes.forEach(manutencao => {
                activities.push({
                    type: 'maintenance',
                    title: `${ativo.nome}`,
                    description: manutencao.descricao,
                    date: manutencao.data_manutencao,
                    ativo: ativo
                });
            });
        }
    });

    // Ordenar por data mais recente
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    return activities.slice(0, 5); // Retorna apenas as 5 mais recentes
}

/**
 * Renderiza a lista de atividades recentes.
 * @param {Array} activities - Lista de atividades.
 * @returns {string} HTML das atividades.
 */
function renderRecentActivities(activities) {
    if (activities.length === 0) {
        return `
            <div class="text-center p-3">
                <i class="fas fa-history fa-2x text-muted mb-2"></i>
                <p class="text-muted mb-0">Nenhuma atividade recente</p>
            </div>
        `;
    }

    return activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-tools"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-description">${activity.description}</div>
                <div class="activity-time">${formatDate(activity.date)}</div>
            </div>
        </div>
    `).join('');
}

/**
 * Renderiza a página completa de listagem de ativos.
 * @param {Array} ativos - Lista de ativos para exibir.
 * @returns {string} HTML da página de listagem.
 */
function renderFullListPage(ativos = []) {
    return `
        <div class="fade-in">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="glow-text mb-0">
                    <i class="fas fa-list me-2"></i>
                    Gerenciar Ativos
                </h2>
                <div>
                    <button class="btn btn-outline-primary glow-hover" onclick="app.showRoute('cadastrar')">
                        <i class="fas fa-plus me-2"></i>
                        Novo Ativo
                    </button>
                </div>
            </div>

            ${renderFilters()}

            <div id="ativos-list">
                ${ativos.length > 0 ? renderAssetGrid(ativos) : renderEmptyState("Nenhum ativo encontrado")}
            </div>
        </div>
    `;
}

/**
 * Renderiza os filtros de busca.
 * @returns {string} HTML dos filtros.
 */
function renderFilters() {
    return `
        <div class="filters-container mb-4">
            <h5 class="filters-title">
                <i class="fas fa-filter me-2"></i>
                Filtros
            </h5>
            <div class="row g-3">
                <div class="col-md-5">
                    <label class="form-label">Nome do Ativo</label>
                    <input type="text" class="form-control" id="filter-nome" placeholder="Digite para buscar...">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Tipo</label>
                    <select class="form-control" id="filter-tipo">
                        <option value="">Todos os tipos</option>
                        <option value="Notebook">Notebook</option>
                        <option value="Desktop">Desktop</option>
                        <option value="Monitor">Monitor</option>
                        <option value="Impressora">Impressora</option>
                        <option value="Tablet">Tablet</option>
                        <option value="Smartphone">Smartphone</option>
                        <option value="Servidor">Servidor</option>
                        <option value="Outro">Outro</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Status</label>
                    <select class="form-control" id="filter-status">
                        <option value="">Todos os status</option>
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                        <option value="Em Manutenção">Em Manutenção</option>
                    </select>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renderiza um grid de cards de ativos.
 * @param {Array} ativos - Lista de ativos.
 * @returns {string} HTML do grid de ativos.
 */
function renderAssetGrid(ativos) {
    return `
        <div class="asset-grid">
            ${ativos.map(ativo => renderAssetCard(ativo)).join('')}
        </div>
    `;
}

/**
 * Renderiza um card individual de ativo.
 * @param {Object} ativo - Objeto do ativo.
 * @returns {string} HTML do card do ativo.
 */
function renderAssetCard(ativo) {
    return `
        <div class="asset-card" data-ativo-id="${ativo.id}">
            <div class="asset-header">
                <div class="asset-tag">${ativo.tag_patrimonio}</div>
                <div class="asset-actions">
                    <button class="btn btn-sm btn-warning glow-hover" onclick="app.editAtivo('${ativo.tag_patrimonio}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger glow-hover" onclick="app.deleteAtivo('${ativo.tag_patrimonio}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>

            <h5 class="asset-title">${ativo.nome}</h5>

            <div class="asset-details">
                <div class="asset-detail-item">
                    <span class="asset-detail-label">Tipo:</span>
                    <span class="asset-detail-value">${ativo.tipo || 'Não informado'}</span>
                </div>
                <div class="asset-detail-item">
                    <span class="asset-detail-label">Status:</span>
                    <span class="status-badge status-${ativo.status.toLowerCase().replace(/ /g, '-').replace(/ç/g, 'c').replace(/ã/g, 'a')}">${ativo.status}</span>
                </div>
                <div class="asset-detail-item">
                    <span class="asset-detail-label">Valor:</span>
                    <span class="asset-detail-value">R$ ${(ativo.valor_aquisicao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="asset-detail-item">
                    <span class="asset-detail-label">Manutenções:</span>
                    <span class="asset-detail-value">${ativo.manutencoes ? ativo.manutencoes.length : 0}</span>
                </div>
            </div>

            ${renderMaintenanceSection(ativo)}
        </div>
    `;
}

/**
 * Renderiza a seção de manutenções de um ativo.
 * @param {Object} ativo - Objeto doativo.
 * @returns {string} HTML da seção de manutenções.
 */
function renderMaintenanceSection(ativo) {
    const manutencoes = ativo.manutencoes || [];

    return `
        <div class="maintenance-section mt-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="text-secondary mb-0">
                    <i class="fas fa-tools me-1"></i>
                    Manutenções (${manutencoes.length})
                </h6>
                <button class="btn btn-sm btn-outline-primary" onclick="app.showMaintenanceModal(${ativo.id})" title="Adicionar Manutenção">
                    <i class="fas fa-plus"></i>
                </button>
            </div>

            ${manutencoes.length > 0 ? 
                `<div class="maintenance-list">
                    ${manutencoes.map(manutencao => `
                        <div class="maintenance-item p-2 border-bottom">
                            <div class="d-flex justify-content-between align-items-start">
                                <div class="flex-grow-1">
                                    <small class="text-info">${formatDate(manutencao.data_manutencao)}</small>
                                    <p class="mb-0 text-light">${manutencao.descricao}</p>
                                </div>
                                <div class="maintenance-actions">
                                    <button class="btn btn-sm btn-outline-warning" onclick="app.editMaintenance(${manutencao.id})" title="Editar">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteMaintenance(${manutencao.id})" title="Excluir">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>` : 
                '<p class="text-muted text-center py-2"><em>Nenhuma manutenção registrada</em></p>'
            }
        </div>
    `;
}

/**
 * Renderiza a página de cadastro/edição de ativo.
 * @param {Object|null} ativo - Ativo para editar (null para novo cadastro).
 * @returns {string} HTML do formulário.
 */
function showCreateFormPage(ativo = null) {
    const isEditing = ativo !== null;
    const title = isEditing ? 'Editar Ativo' : 'Cadastrar Novo Ativo';
    const buttonText = isEditing ? 'Atualizar Ativo' : 'Cadastrar Ativo';

    return `
        <div class="fade-in">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="glow-text mb-0">
                    <i class="fas fa-${isEditing ? 'edit' : 'plus'} me-2"></i>
                    ${title}
                </h2>
                <button class="btn btn-outline-secondary glow-hover" onclick="app.showRoute('listar')">
                    <i class="fas fa-arrow-left me-2"></i>
                    Voltar
                </button>
            </div>

            <div class="form-container">
                <form id="ativo-form">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="tag_patrimonio" class="form-label">Tag de Patrimônio *</label>
                            <input type="text" class="form-control" id="tag_patrimonio" 
                                   value="${ativo?.tag_patrimonio || ''}" 
                                   ${isEditing ? 'readonly' : ''} required>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label for="nome" class="form-label">Nome do Ativo *</label>
                            <input type="text" class="form-control" id="nome" 
                                   value="${ativo?.nome || ''}" required>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="tipo" class="form-label">Tipo *</label>
                            <select class="form-control" id="tipo" required>
                                <option value="">Selecione o tipo</option>
                                <option value="Notebook" ${ativo?.tipo === 'Notebook' ? 'selected' : ''}>Notebook</option>
                                <option value="Desktop" ${ativo?.tipo === 'Desktop' ? 'selected' : ''}>Desktop</option>
                                <option value="Monitor" ${ativo?.tipo === 'Monitor' ? 'selected' : ''}>Monitor</option>
                                <option value="Impressora" ${ativo?.tipo === 'Impressora' ? 'selected' : ''}>Impressora</option>
                                <option value="Tablet" ${ativo?.tipo === 'Tablet' ? 'selected' : ''}>Tablet</option>
                                <option value="Smartphone" ${ativo?.tipo === 'Smartphone' ? 'selected' : ''}>Smartphone</option>
                                <option value="Servidor" ${ativo?.tipo === 'Servidor' ? 'selected' : ''}>Servidor</option>
                                <option value="Outro" ${ativo?.tipo === 'Outro' ? 'selected' : ''}>Outro</option>
                            </select>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label for="status" class="form-label">Status *</label>
                            <select class="form-control" id="status" required>
                                <option value="">Selecione o status</option>
                                <option value="Ativo" ${ativo?.status === 'Ativo' ? 'selected' : ''}>Ativo</option>
                                <option value="Inativo" ${ativo?.status === 'Inativo' ? 'selected' : ''}>Inativo</option>
                                <option value="Em Manutenção" ${ativo?.status === 'Em Manutenção' ? 'selected' : ''}>Em Manutenção</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="valor_aquisicao" class="form-label">Valor de Aquisição</label>
                        <input type="number" class="form-control" id="valor_aquisicao" 
                               step="0.01" min="0" value="${ativo?.valor_aquisicao || ''}">
                    </div>

                    <div class="text-center">
                        <button type="button" class="btn btn-secondary me-2 glow-hover" onclick="app.showRoute('listar')">
                            <i class="fas fa-times me-2"></i>
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary glow-hover">
                            <i class="fas fa-save me-2"></i>
                            ${buttonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

/**
 * Formata uma data para exibição.
 * @param {string} dateString - String da data.
 * @returns {string} Data formatada.
 */
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        // Adiciona o fuso horário para corrigir a data que vem como UTC
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
    } catch {
        return dateString;
    }
}