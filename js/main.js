// Objeto Singleton para gerenciar as notificações "Toast"
const toast = {
    container: document.getElementById('toast-container'),
    
    show(message, type = 'info', duration = 5000) {
        const toastEl = document.createElement('div');
        toastEl.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : 'success'} border-0`;
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        this.container.appendChild(toastEl);
        const bsToast = new bootstrap.Toast(toastEl, { delay: duration });
        bsToast.show();
        
        toastEl.addEventListener('hidden.bs.toast', () => {
            if (toastEl.parentNode) {
                toastEl.parentNode.removeChild(toastEl);
            }
        });
    }
};

// Objeto Singleton para gerenciar modal
const modal = {
    element: null,
    bsModal: null,
    onConfirmCallback: null,
    
    init() {
        this.element = document.getElementById('modal');
        this.bsModal = new bootstrap.Modal(this.element);
        
        // Botão confirmar
        document.getElementById('modal-confirm').addEventListener('click', () => {
            if (this.onConfirmCallback) {
                this.onConfirmCallback();
            }
        });
    },
    
    show({ title, message = '', htmlContent = '', confirmText = 'Confirmar', cancelText = 'Cancelar', showCancel = true, onConfirm = null }) {
        document.getElementById('modal-title').textContent = title;
        
        if (htmlContent) {
            document.getElementById('modal-body').innerHTML = htmlContent;
        } else {
            document.getElementById('modal-body').innerHTML = `<p>${message}</p>`;
        }
        
        const confirmBtn = document.getElementById('modal-confirm');
        confirmBtn.textContent = confirmText;
        confirmBtn.style.display = onConfirm ? 'inline-block' : 'none';
        
        this.onConfirmCallback = onConfirm;
        this.bsModal.show();
    },
    
    hide() {
        this.bsModal.hide();
        this.onConfirmCallback = null;
    }
};

// Objeto Singleton para gerenciar a aplicação
const app = {
    root: document.getElementById('app-root'),
    navLinks: document.querySelectorAll('.nav-link'),
    allAssets: [], // Armazena a lista completa de ativos
    uniqueValues: { types: [], statuses: [] },
    currentFilters: {},
    debounceTimer: null,

    routes: {
        'listar': renderFullListPage,
        'cadastrar': showCreateFormPage
    },

    async init() {
        modal.init();
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        this.root.addEventListener('click', (e) => this.handleDynamicClicks(e));
        
        await this.fetchAllAssets();
        this.routes['listar']();
    },

    async fetchAllAssets() {
        try {
            this.allAssets = await getAtivos();
            this.uniqueValues.types = [...new Set(this.allAssets.map(a => a.tipo).filter(Boolean))];
            this.uniqueValues.statuses = [...new Set(this.allAssets.map(a => a.status).filter(Boolean))];
        } catch (error) {
            console.error('Error fetching assets:', error);
            toast.show("Falha ao buscar dados da API.", "error");
            this.allAssets = []; // Garante que não quebre em caso de erro
        }
    },

    handleNavClick(event) {
        event.preventDefault();
        const id = event.target.id.replace('nav-', '');

        this.navLinks.forEach(link => link.classList.remove('active'));
        event.target.classList.add('active');

        if (this.routes[id]) this.routes[id]();
    },

    handleDynamicClicks(event) {
        const button = event.target.closest('button');
        if (button) {
            if (button.classList.contains('btn-delete')) handleDeleteAsset(button.dataset.tag);
            if (button.classList.contains('btn-edit')) showUpdateFormPage(button.dataset.tag);
            if (button.classList.contains('btn-add-maintenance')) handleShowAddMaintenanceForm(button.dataset.id, button.dataset.nome);
            if (button.classList.contains('btn-delete-maintenance')) handleDeleteMaintenance(button.dataset.id);
            if (button.classList.contains('btn-edit-maintenance')) handleShowUpdateMaintenanceForm(button.dataset.id, button.dataset.ativoId);
        }
    }
};

// --- FUNÇÃO UTILITÁRIA DEBOUNCE ---
function debounce(func, delay = 300) {
    return (...args) => {
        clearTimeout(app.debounceTimer);
        app.debounceTimer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// --- CONTROLADORES DE PÁGINA ---

/**
 * Atualiza apenas a grade de ativos, preservando os filtros.
 */
function updateAssetGrid() {
    const gridContainer = document.getElementById('asset-grid-container');
    if (!gridContainer) return;

    let displayAssets = [...app.allAssets];

    // Aplicar Filtros (localmente e de forma case-insensitive, usando 'includes')
    const { nome, tipo, status } = app.currentFilters;
    if (nome) {
        const searchNome = nome.toLowerCase();
        displayAssets = displayAssets.filter(a => a.nome.toLowerCase().includes(searchNome));
    }
    if (tipo) {
        const searchTipo = tipo.toLowerCase();
        displayAssets = displayAssets.filter(a => a.tipo && a.tipo.toLowerCase().includes(searchTipo));
    }
    if (status) {
        const searchStatus = status.toLowerCase();
        displayAssets = displayAssets.filter(a => a.status && a.status.toLowerCase().includes(searchStatus));
    }

    // Atualiza o conteúdo da grade
    gridContainer.innerHTML = renderAssetGrid(displayAssets);
}

function renderFullListPage() {
    // Renderiza a página "casca" com a barra de filtros
    app.root.innerHTML = renderAssetListPage({
        displayAssets: [], // Inicia com a grade vazia
        filters: app.currentFilters,
        uniqueValues: app.uniqueValues,
    });

    // Anexa os "escutadores" de eventos ao formulário de filtro
    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
        filterForm.addEventListener('input', debounce(handleFilterInput));
        filterForm.addEventListener('reset', handleFilterReset);
    }

    // Popula a grade com os dados iniciais
    updateAssetGrid();
}

function showCreateFormPage() {
    app.root.innerHTML = renderFormPage({ title: 'Cadastrar Novo Ativo' });
    document.getElementById('asset-form').addEventListener('submit', handleCreateAsset);
}

async function showUpdateFormPage(tag) {
    const ativo = app.allAssets.find(a => a.tag_patrimonio === tag);
    if (!ativo) {
        toast.show("Ativo não encontrado para edição.", "error");
        return;
    }

    app.root.innerHTML = renderFormPage({
        title: 'Editar Ativo',
        ativo: ativo,
        isUpdate: true
    });

    document.getElementById('asset-form').addEventListener('submit', (e) => handleUpdateAsset(e, tag));
}

// --- HANDLERS ---

function handleFilterInput() {
    const nome = document.getElementById('filter-nome').value;
    const tipo = document.getElementById('filter-tipo').value;
    const status = document.getElementById('filter-status').value;

    app.currentFilters = { nome, tipo, status };
    updateAssetGrid(); // Apenas atualiza a grade, sem redesenhar a página inteira
}

function handleFilterReset() {
    app.currentFilters = {};
    const filterForm = document.getElementById('filter-form');
    if (filterForm) filterForm.reset();
    updateAssetGrid(); // Apenas atualiza a grade
}

async function handleCreateAsset(event) {
    event.preventDefault();

    const data = {
        tag_patrimonio: document.getElementById('tag_patrimonio').value,
        nome: document.getElementById('nome').value,
        tipo: document.getElementById('tipo').value,
        status: document.getElementById('status').value,
        valor_aquisicao: parseFloat(document.getElementById('valor_aquisicao').value)
    };

    try {
        await createAtivo(data);
        toast.show('Ativo cadastrado com sucesso!', 'success');
        await app.fetchAllAssets(); // Atualiza a lista principal
        document.querySelector('#nav-listar').click();
    } catch (error) {
        toast.show(`Erro ao cadastrar: ${error.message}`, 'error');
    }
}

async function handleUpdateAsset(event, tag) {
    event.preventDefault();

    const data = {
        nome: document.getElementById('nome').value,
        tipo: document.getElementById('tipo').value,
        status: document.getElementById('status').value,
        valor_aquisicao: parseFloat(document.getElementById('valor_aquisicao').value)
    };

    try {
        await updateAtivo(tag, data);
        toast.show('Ativo atualizado com sucesso!', 'success');
        await app.fetchAllAssets();
        document.querySelector('#nav-listar').click();
    } catch (error) {
        toast.show(`Erro ao atualizar: ${error.message}`, 'error');
    }
}

function handleDeleteAsset(tag) {
    modal.show({
        title: 'Confirmar Exclusão',
        message: `Deseja realmente excluir o ativo com a tag "${tag}"?`,
        async onConfirm() {
            try {
                await deleteAtivo(tag);
                toast.show('Ativo excluído com sucesso!', 'success');
                await app.fetchAllAssets();
                renderFullListPage();
                modal.hide();
            } catch (error) {
                toast.show(`Erro ao excluir: ${error.message}`, 'error');
            }
        }
    });
}

// --- HANDLERS DE MANUTENÇÃO ---

function handleShowAddMaintenanceForm(ativoId, ativoNome) {
    modal.show({
        title: `Adicionar Manutenção para ${ativoNome}`,
        htmlContent: `
            <form id="maintenance-form">
                <div class="mb-3">
                    <label for="maintenance-description" class="form-label">Descrição da Manutenção</label>
                    <textarea 
                        class="form-control" 
                        id="maintenance-description" 
                        rows="3" 
                        placeholder="Descreva a manutenção realizada..."
                        required
                    ></textarea>
                </div>
            </form>
        `,
        confirmText: 'Adicionar Manutenção',
        onConfirm: () => handleAddMaintenance(ativoId)
    });
}

async function handleAddMaintenance(ativoId) {
    const description = document.getElementById('maintenance-description').value.trim();
    
    if (!description) {
        toast.show('Descrição da manutenção é obrigatória.', 'error');
        return;
    }
    
    try {
        await addManutencao({
            ativo_id: parseInt(ativoId),
            descricao: description
        });
        
        toast.show('Manutenção adicionada com sucesso!', 'success');
        await app.fetchAllAssets();
        updateAssetGrid();
        modal.hide();
    } catch (error) {
        toast.show(`Erro ao adicionar manutenção: ${error.message}`, 'error');
    }
}

function handleShowUpdateMaintenanceForm(maintenanceId, ativoId) {
    // Find the asset and maintenance
    const ativo = app.allAssets.find(a => a.id == ativoId);
    if (!ativo) {
        toast.show('Ativo não encontrado.', 'error');
        return;
    }
    
    const manutencao = ativo.manutencoes.find(m => m.id == maintenanceId);
    if (!manutencao) {
        toast.show('Manutenção não encontrada.', 'error');
        return;
    }
    
    modal.show({
        title: `Editar Manutenção`,
        htmlContent: `
            <form id="maintenance-form">
                <div class="mb-3">
                    <label for="maintenance-description" class="form-label">Descrição da Manutenção</label>
                    <textarea 
                        class="form-control" 
                        id="maintenance-description" 
                        rows="3" 
                        placeholder="Descreva a manutenção realizada..."
                        required
                    >${manutencao.descricao}</textarea>
                </div>
            </form>
        `,
        confirmText: 'Atualizar Manutenção',
        onConfirm: () => handleUpdateMaintenance(maintenanceId)
    });
}

async function handleUpdateMaintenance(maintenanceId) {
    const description = document.getElementById('maintenance-description').value.trim();
    
    if (!description) {
        toast.show('Descrição da manutenção é obrigatória.', 'error');
        return;
    }
    
    try {
        await updateManutencao(maintenanceId, {
            descricao: description
        });
        
        toast.show('Manutenção atualizada com sucesso!', 'success');
        await app.fetchAllAssets();
        updateAssetGrid();
        modal.hide();
    } catch (error) {
        toast.show(`Erro ao atualizar manutenção: ${error.message}`, 'error');
    }
}

function handleDeleteMaintenance(maintenanceId) {
    modal.show({
        title: 'Confirmar Exclusão',
        message: 'Deseja realmente excluir esta manutenção?',
        async onConfirm() {
            try {
                await deleteManutencao(maintenanceId);
                toast.show('Manutenção excluída com sucesso!', 'success');
                await app.fetchAllAssets();
                updateAssetGrid();
                modal.hide();
            } catch (error) {
                toast.show(`Erro ao excluir manutenção: ${error.message}`, 'error');
            }
        }
    });
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});