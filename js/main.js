// Objeto Singleton para gerenciar as notificações "Toast"
const toast = {
    container: document.getElementById('toast-container'),

    show(message, type = 'info', duration = 5000) {
        const toastEl = document.createElement('div');
        toastEl.className = `toast align-items-center text-white border-0`;
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');

        const bgClass = type === 'error' ? 'bg-danger' : 
                       type === 'warning' ? 'bg-warning' : 
                       type === 'success' ? 'bg-success' : 'bg-info';

        toastEl.classList.add(bgClass);

        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 
                                     type === 'warning' ? 'exclamation-circle' :
                                     type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        if (this.container) {
            this.container.appendChild(toastEl);
            const bsToast = new bootstrap.Toast(toastEl, { delay: duration });
            bsToast.show();

            // Remove o elemento após ser fechado
            toastEl.addEventListener('hidden.bs.toast', () => {
                toastEl.remove();
            });
        }
    }
};

// Objeto Singleton para gerenciar os modais de confirmação
const modal = {
    element: document.getElementById('confirmModal'),
    bsModal: null,
    onConfirmCallback: null,

    init() {
        if (this.element) {
            this.bsModal = new bootstrap.Modal(this.element);

            // Event listener para o botão de confirmação
            const confirmBtn = document.getElementById('modal-confirm');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    if (this.onConfirmCallback) {
                        this.onConfirmCallback();
                        this.hide();
                    }
                });
            }
        }
    },

    show(message, confirmText = 'Confirmar', onConfirm = null) {
        if (!this.bsModal) return;

        const messageEl = document.getElementById('modal-message');
        const confirmBtn = document.getElementById('modal-confirm');

        if (messageEl) messageEl.textContent = message;
        if (confirmBtn) {
            confirmBtn.textContent = confirmText;
            confirmBtn.style.display = onConfirm ? 'inline-block' : 'none';
        }

        this.onConfirmCallback = onConfirm;
        this.bsModal.show();
    },

    hide() {
        if (this.bsModal) {
            this.bsModal.hide();
            this.onConfirmCallback = null;
        }
    }
};

// Objeto Singleton para gerenciar a aplicação
const app = {
    root: document.getElementById('app-root'),
    navLinks: document.querySelectorAll('.nav-link'),
    allAssets: [], // Armazena a lista completa de ativos
    filteredAssets: [], // Armazena os ativos filtrados
    currentRoute: 'dashboard',
    editingAtivo: null,
    debounceTimeout: null, // Para o filtro inteligente
    maintenanceModal: null, // Para o modal de manutenção

    async init() {
        try {
            // Inicializar componentes
            modal.init();
            
            const maintenanceModalEl = document.getElementById('maintenanceModal');
            if (maintenanceModalEl) {
                this.maintenanceModal = new bootstrap.Modal(maintenanceModalEl);
            }

            const maintenanceForm = document.getElementById('maintenance-form');
            if (maintenanceForm) {
                maintenanceForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.handleMaintenanceSubmit();
                });
            }

            // Configurar navegação
            this.setupNavigation();

            // Carregar dados iniciais
            await this.loadAssets();

            // Mostrar dashboard por padrão
            await this.showRoute('dashboard');
            
            // Ocultar loading
            this.hideLoading();

            // Adicionar partículas de fundo
            this.createParticles();

        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
            toast.show('Erro ao inicializar a aplicação', 'error');
            this.hideLoading();
        }
    },

    hideLoading() {
        const loading = document.getElementById('loading-overlay');
        if (loading) {
            loading.classList.add('hidden');
            setTimeout(() => loading.style.display = 'none', 500);
        }
    },

    createParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;

        // Criar partículas animadas
        for (let i = 0; i < 150; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = Math.random() * 4 + 1 + 'px';
            particle.style.height = particle.style.width;
            particle.style.background = '#00d4ff';
            particle.style.borderRadius = '50%';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.opacity = Math.random() * 0.5 + 0.2;
            particle.style.animation = `float ${Math.random() * 3 + 3}s infinite ease-in-out`;
            particle.style.animationDelay = Math.random() * 2 + 's';

            particlesContainer.appendChild(particle);
        }
    },

    setupNavigation() {
        // Adicionar event listeners aos links de navegação
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('[data-bs-target]');
            if (navLink) {
                e.preventDefault();
                const route = navLink.getAttribute('data-bs-target');
                this.showRoute(route);

                // Atualizar estado ativo dos links
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                navLink.classList.add('active');
            }
        });
    },
    
    // Configuração do filtro para ser "vivo" (live)
    setupFilters() {
        const applyDebouncedFilter = () => {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => {
                this.applyFilters();
            }, 300); // Aguarda 300ms após o usuário parar de digitar
        };

        const filterNome = document.getElementById('filter-nome');
        const filterTipo = document.getElementById('filter-tipo');
        const filterStatus = document.getElementById('filter-status');

        if (filterNome) {
            filterNome.addEventListener('input', applyDebouncedFilter);
        }
        if (filterTipo) {
            filterTipo.addEventListener('change', () => this.applyFilters());
        }
        if (filterStatus) {
            filterStatus.addEventListener('change', () => this.applyFilters());
        }
    },

    async loadAssets() {
        try {
            this.allAssets = await getAtivos();
            this.filteredAssets = [...this.allAssets];
        } catch (error) {
            console.error('Erro ao carregar ativos:', error);
            toast.show('Erro ao carregar ativos', 'error');
            this.allAssets = [];
            this.filteredAssets = [];
        }
    },

    async showRoute(route) {
        if (!this.root) return;

        this.currentRoute = route;
        this.root.innerHTML = renderSpinner();

        // Usamos um pequeno timeout de 0 para garantir que o spinner renderize primeiro
        setTimeout(async () => {
            try {
                let content = '';
                switch (route) {
                    case 'dashboard':
                        content = renderDashboard(this.allAssets);
                        break;
                    case 'listar':
                        content = renderFullListPage(this.filteredAssets);
                        break;
                    case 'cadastrar':
                        content = showCreateFormPage(this.editingAtivo);
                        break;
                    default:
                        content = renderDashboard(this.allAssets);
                        break;
                }

                this.root.innerHTML = content;

                // A lógica pós-renderização agora está mais simples e robusta
                if (route === 'cadastrar') {
                    this.setupForm();
                } else if (route === 'listar') {
                    this.setupFilters();
                }

            } catch (error) {
                console.error('Erro ao renderizar rota:', error);
                this.root.innerHTML = `
                    <div class="text-center p-5">
                        <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                        <h5 class="text-danger">Erro ao carregar página</h5>
                        <p class="text-muted">Ocorreu um erro inesperado. Tente novamente.</p>
                    </div>
                `;
            }
        }, 0);
    },

    setupForm() {
        const form = document.getElementById('ativo-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleFormSubmit();
            });
        }
    },

    async handleFormSubmit() {
        const formData = {
            tag_patrimonio: document.getElementById('tag_patrimonio')?.value,
            nome: document.getElementById('nome')?.value,
            tipo: document.getElementById('tipo')?.value,
            status: document.getElementById('status')?.value,
            valor_aquisicao: parseFloat(document.getElementById('valor_aquisicao')?.value) || 0
        };

        try {
            if (this.editingAtivo) {
                await updateAtivo(this.editingAtivo.tag_patrimonio, formData);
                toast.show('Ativo atualizado com sucesso!', 'success');
            } else {
                await createAtivo(formData);
                toast.show('Ativo cadastrado com sucesso!', 'success');
            }

            await this.loadAssets();
            this.editingAtivo = null;
            this.showRoute('listar');

        } catch (error) {
            console.error('Erro ao salvar ativo:', error);
            toast.show('Erro ao salvar ativo: ' + error.message, 'error');
        }
    },

    async applyFilters() {
        const filters = {
            nome: document.getElementById('filter-nome')?.value || '',
            tipo: document.getElementById('filter-tipo')?.value || '',
            status: document.getElementById('filter-status')?.value || ''
        };

        try {
            this.filteredAssets = await getAtivos(filters);

            const ativosList = document.getElementById('ativos-list');
            if (ativosList) {
                ativosList.innerHTML = this.filteredAssets.length > 0 ? 
                    renderAssetGrid(this.filteredAssets) : 
                    renderEmptyState("Nenhum ativo encontrado com os filtros aplicados");
            }

        } catch (error) {
            console.error('Erro ao aplicar filtros:', error);
            toast.show('Erro ao aplicar filtros', 'error');
        }
    },

    editAtivo(tag) {
        const ativo = this.allAssets.find(a => a.tag_patrimonio === tag);
        if (ativo) {
            this.editingAtivo = ativo;
            this.showRoute('cadastrar');
        }
    },

    deleteAtivo(tag) {
        const ativo = this.allAssets.find(a => a.tag_patrimonio === tag);
        if (ativo) {
            modal.show(
                `Tem certeza que deseja excluir o ativo "${ativo.nome}"?`,
                'Excluir',
                async () => {
                    try {
                        await deleteAtivo(tag);
                        toast.show('Ativo excluído com sucesso!', 'success');
                        await this.loadAssets();
                        
                        if(this.currentRoute === 'listar'){
                           await this.applyFilters();
                        } else {
                           this.showRoute(this.currentRoute);
                        }
                    } catch (error) {
                        console.error('Erro ao excluir ativo:', error);
                        toast.show('Erro ao excluir ativo: ' + error.message, 'error');
                    }
                }
            );
        }
    },

    showMaintenanceModal(ativoId) {
        const ativo = this.allAssets.find(a => a.id === ativoId);
        if (!ativo) {
            toast.show('Ativo não encontrado.', 'error');
            return;
        }

        const form = document.getElementById('maintenance-form');
        form.reset();
        document.getElementById('maintenance-ativo-id').value = ativo.id;
        document.getElementById('maintenance-data').value = new Date().toISOString().split('T')[0];

        this.maintenanceModal.show();
    },

    async handleMaintenanceSubmit() {
        const ativoId = parseInt(document.getElementById('maintenance-ativo-id').value);
        const descricao = document.getElementById('maintenance-descricao').value;
        const data = document.getElementById('maintenance-data').value;

        if (!ativoId || !descricao || !data) {
            toast.show('Por favor, preencha todos os campos.', 'warning');
            return;
        }

        const dadosManutencao = {
            ativo_id: ativoId,
            descricao: descricao,
            data_manutencao: data
        };

        try {
            await addManutencao(dadosManutencao);
            toast.show('Manutenção adicionada com sucesso!', 'success');
            this.maintenanceModal.hide();
            await this.loadAssets();
            
            if (this.currentRoute === 'listar') {
                await this.applyFilters();
            }

        } catch (error) {
            console.error('Erro ao adicionar manutenção:', error);
            toast.show('Erro ao adicionar manutenção: ' + error.message, 'error');
        }
    },

    editMaintenance(id) {
        toast.show('Funcionalidade de edição de manutenção em desenvolvimento', 'info');
    },

    deleteMaintenance(id) {
        modal.show(
            'Tem certeza que deseja excluir esta manutenção?',
            'Excluir',
            async () => {
                try {
                    await deleteManutencao(id);
                    toast.show('Manutenção excluída com sucesso!', 'success');
                    await this.loadAssets();
                    if(this.currentRoute === 'listar'){
                        await this.applyFilters();
                    } else {
                       this.showRoute(this.currentRoute);
                    }
                } catch (error) {
                    console.error('Erro ao excluir manutenção:', error);
                    toast.show('Erro ao excluir manutenção: ' + error.message, 'error');
                }
            }
        );
    }
};

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Função global para compatibilidade
window.app = app;