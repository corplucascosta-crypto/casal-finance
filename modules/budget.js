// Budget Module - Metas e Orçamentos
(function() {
    if (window.budgetInitialized) return;
    window.budgetInitialized = true;
    
    let budgets = [];
    
    function initBudgets() {
        loadBudgets();
        setupBudgetEvents();
        renderBudgets();
    }
    
    function setupBudgetEvents() {
        const addBtn = document.getElementById('addBudgetBtn');
        if (addBtn) {
            addBtn.addEventListener('click', addBudget);
        }
        
        // Popular select de categorias
        const categorySelect = document.getElementById('budgetCategorySelect');
        if (categorySelect && window.categoriasPersonalizadas) {
            categorySelect.innerHTML = '<option value="">Selecione a categoria</option>';
            window.categoriasPersonalizadas.forEach(cat => {
                categorySelect.innerHTML += `<option value="${cat.nome}">${cat.icone || '📁'} ${cat.nome}</option>`;
            });
        }
    }
    
    function loadBudgets() {
        const saved = localStorage.getItem('budgets');
        if (saved) {
            budgets = JSON.parse(saved);
        } else {
            budgets = [];
        }
    }
    
    function saveBudgets() {
        localStorage.setItem('budgets', JSON.stringify(budgets));
    }
    
    function addBudget() {
        const categoria = document.getElementById('budgetCategorySelect')?.value;
        const limite = parseFloat(document.getElementById('budgetLimitInput')?.value);
        const cor = document.getElementById('budgetColorInput')?.value;
        
        if (!categoria || !limite || limite <= 0) {
            if (window.showNotification) window.showNotification('❌ Preencha todos os campos corretamente', 'error');
            return;
        }
        
        const existing = budgets.find(b => b.categoria === categoria);
        if (existing) {
            existing.limite = limite;
            existing.cor = cor;
            if (window.showNotification) window.showNotification(`✏️ Meta atualizada: ${categoria}`, 'success');
        } else {
            budgets.push({
                id: Date.now(),
                categoria: categoria,
                limite: limite,
                cor: cor,
                ativo: true
            });
            if (window.showNotification) window.showNotification(`✅ Meta criada: ${categoria}`, 'success');
        }
        
        saveBudgets();
        renderBudgets();
        
        const limitInput = document.getElementById('budgetLimitInput');
        if (limitInput) limitInput.value = '';
    }
    
    window.renderBudgets = function() {
        const container = document.getElementById('budgetsList');
        if (!container) return;
        
        if (budgets.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhuma meta cadastrada. Adicione uma meta acima!</p>';
            return;
        }
        
        // Calcular gastos atuais por categoria
        const gastosPorCategoria = {};
        if (window.filteredData) {
            window.filteredData
                .filter(item => item.tipo === 'Despesa')
                .forEach(item => {
                    const cat = item.categoria;
                    gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + item.valor;
                });
        }
        
        container.innerHTML = '';
        
        budgets.forEach(budget => {
            const gasto = gastosPorCategoria[budget.categoria] || 0;
            const percentual = (gasto / budget.limite) * 100;
            const cor = budget.cor || '#ef4444';
            
            const div = document.createElement('div');
            div.className = 'budget-item';
            div.innerHTML = `
                <div class="budget-header">
                    <div class="budget-info">
                        <span class="budget-cat" style="background: ${cor}20; color: ${cor}">${budget.categoria}</span>
                        <span class="budget-values">R$ ${gasto.toFixed(2)} / R$ ${budget.limite.toFixed(2)}</span>
                    </div>
                    <div class="budget-actions">
                        <button class="delete-budget" data-id="${budget.id}">🗑️</button>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(percentual, 100)}%; background: ${cor}"></div>
                </div>
                <div class="budget-status ${percentual >= 100 ? 'danger' : percentual >= 80 ? 'warning' : 'safe'}">
                    ${percentual >= 100 ? '⚠️ Limite excedido!' : percentual >= 80 ? '⚡ Atenção, próximo do limite!' : '✅ Dentro do orçamento'}
                </div>
            `;
            
            container.appendChild(div);
        });
        
        // Eventos dos botões de deletar
        document.querySelectorAll('.delete-budget').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                budgets = budgets.filter(b => b.id !== id);
                saveBudgets();
                window.renderBudgets();
                if (window.showNotification) window.showNotification('🗑️ Meta removida', 'info');
            });
        });
    };
    
    document.addEventListener('DOMContentLoaded', initBudgets);
})();
