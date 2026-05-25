// Categories Module - Categorias Personalizadas
(function() {
    if (window.categoriesInitialized) return;
    window.categoriesInitialized = true;
    
    window.categoriasPersonalizadas = [];
    
    function initCategories() {
        loadCategories();
        criarModalCategorias();
        
        // Atualizar selects de categoria quando houver mudanças
        document.addEventListener('categoriasAtualizadas', () => {
            atualizarSelectsCategoria();
        });
    }
    
    function loadCategories() {
        const saved = localStorage.getItem('customCategories');
        if (saved) {
            window.categoriasPersonalizadas = JSON.parse(saved);
        } else {
            // Categorias padrão baseadas nos dados do CSV
            window.categoriasPersonalizadas = [
                { id: 1, nome: 'Alimentação', cor: '#ef4444', icone: '🍔', ativo: true },
                { id: 2, nome: 'Lazer', cor: '#f59e0b', icone: '🎮', ativo: true },
                { id: 3, nome: 'Transporte', cor: '#10b981', icone: '🚗', ativo: true },
                { id: 4, nome: 'Saúde', cor: '#3b82f6', icone: '💊', ativo: true },
                { id: 5, nome: 'Educação', cor: '#8b5cf6', icone: '📚', ativo: true },
                { id: 6, nome: 'Moradia', cor: '#ec489a', icone: '🏠', ativo: true },
                { id: 7, nome: 'Investimentos', cor: '#14b8a6', icone: '📈', ativo: true },
                { id: 8, nome: 'Vestuário', cor: '#f97316', icone: '👕', ativo: true }
            ];
            saveCategories();
        }
    }
    
    function saveCategories() {
        localStorage.setItem('customCategories', JSON.stringify(window.categoriasPersonalizadas));
        document.dispatchEvent(new Event('categoriasAtualizadas'));
    }
    
    function atualizarSelectsCategoria() {
        // Atualizar select do filtro de categorias
        const filterSelect = document.getElementById('filterCategory');
        if (filterSelect) {
            const currentValue = filterSelect.value;
            filterSelect.innerHTML = '<option value="all">Todas as categorias</option>';
            window.categoriasPersonalizadas.forEach(cat => {
                filterSelect.innerHTML += `<option value="${cat.nome}">${cat.icone || '📁'} ${cat.nome}</option>`;
            });
            if (currentValue !== 'all' && filterSelect.querySelector(`option[value="${currentValue}"]`)) {
                filterSelect.value = currentValue;
            }
        }
        
        // Atualizar select do budget
        const budgetSelect = document.getElementById('budgetCategorySelect');
        if (budgetSelect) {
            budgetSelect.innerHTML = '<option value="">Selecione a categoria</option>';
            window.categoriasPersonalizadas.forEach(cat => {
                budgetSelect.innerHTML += `<option value="${cat.nome}">${cat.icone || '📁'} ${cat.nome}</option>`;
            });
        }
    }
    
        // Remover botão duplicado se existir
        if (existingBtn) existingBtn.remove();
        
        const filtersDiv = document.querySelector('.filters');
        if (!filtersDiv) return;
        
        const btnContainer = document.createElement('div');
        btnContainer.className = 'categories-btn-container';
        
        filtersDiv.appendChild(btnContainer);
        
        if (manageBtn) {
            manageBtn.addEventListener('click', abrirModalCategorias);
        }
    }
    
    function criarModalCategorias() {
        // Remover modal existente se houver
        const existingModal = document.getElementById('categoriesModal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.id = 'categoriesModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🏷️ Gerenciar Categorias</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="add-category-form">
                        <input type="text" id="newCatNome" placeholder="Nome da categoria">
                        <input type="color" id="newCatCor" value="#ef4444">
                        <input type="text" id="newCatIcone" placeholder="Emoji (ex: 🍔)" maxlength="2">
                        <button id="addCategoryBtn">➕ Adicionar</button>
                    </div>
                    <div id="categoriesList" class="categories-list"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        const addBtn = document.getElementById('addCategoryBtn');
        if (addBtn) {
            addBtn.addEventListener('click', addCategory);
        }
    }
    
    function abrirModalCategorias() {
        renderCategoriesList();
        const modal = document.getElementById('categoriesModal');
        if (modal) modal.style.display = 'flex';
    }
    
    function renderCategoriesList() {
        const container = document.getElementById('categoriesList');
        if (!container) return;
        
        container.innerHTML = '';
        
        window.categoriasPersonalizadas.forEach(cat => {
            const div = document.createElement('div');
            div.className = 'category-item';
            div.style.borderLeft = `4px solid ${cat.cor}`;
            div.innerHTML = `
                <div class="category-info">
                    <span class="category-icon">${cat.icone || '📁'}</span>
                    <span class="category-name">${cat.nome}</span>
                    <span class="category-color" style="background: ${cat.cor}"></span>
                </div>
                <div class="category-actions">
                    <button class="edit-category" data-id="${cat.id}">✏️</button>
                    <button class="delete-category" data-id="${cat.id}">🗑️</button>
                </div>
            `;
            container.appendChild(div);
        });
        
        document.querySelectorAll('.edit-category').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const cat = window.categoriasPersonalizadas.find(c => c.id === id);
                if (cat) {
                    const novoNome = prompt('Novo nome:', cat.nome);
                    if (novoNome && novoNome.trim()) cat.nome = novoNome.trim();
                    const novoIcone = prompt('Novo emoji:', cat.icone || '📁');
                    if (novoIcone && novoIcone.trim()) cat.icone = novoIcone.trim().substring(0, 2);
                    saveCategories();
                    renderCategoriesList();
                    if (window.showNotification) window.showNotification(`✏️ Categoria "${cat.nome}" atualizada`, 'success');
                }
            });
        });
        
        document.querySelectorAll('.delete-category').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                if (window.categoriasPersonalizadas.length <= 1) {
                    if (window.showNotification) window.showNotification('❌ Não é possível remover a última categoria', 'error');
                    return;
                }
                const cat = window.categoriasPersonalizadas.find(c => c.id === id);
                if (confirm(`Remover categoria "${cat.nome}"?`)) {
                    window.categoriasPersonalizadas = window.categoriasPersonalizadas.filter(c => c.id !== id);
                    saveCategories();
                    renderCategoriesList();
                    if (window.showNotification) window.showNotification(`🗑️ Categoria "${cat.nome}" removida`, 'success');
                }
            });
        });
    }
    
    function addCategory() {
        const nome = document.getElementById('newCatNome')?.value?.trim();
        const cor = document.getElementById('newCatCor')?.value;
        const icone = document.getElementById('newCatIcone')?.value?.trim() || '📁';
        
        if (!nome) {
            if (window.showNotification) window.showNotification('❌ Digite o nome da categoria', 'error');
            return;
        }
        
        if (window.categoriasPersonalizadas.some(c => c.nome === nome)) {
            if (window.showNotification) window.showNotification('❌ Categoria já existe', 'error');
            return;
        }
        
        window.categoriasPersonalizadas.push({
            id: Date.now(),
            nome: nome,
            cor: cor,
            icone: icone.substring(0, 2),
            ativo: true
        });
        
        saveCategories();
        renderCategoriesList();
        
        document.getElementById('newCatNome').value = '';
        document.getElementById('newCatIcone').value = '';
        
        if (window.showNotification) window.showNotification(`✅ Categoria "${nome}" adicionada!`, 'success');
    }
    
    document.addEventListener('DOMContentLoaded', initCategories);
})();
