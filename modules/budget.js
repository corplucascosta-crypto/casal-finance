// Budget Module - Metas e Orçamentos
(function() {
    if (window.budgetInitialized) return;
    window.budgetInitialized = true;
    
    let budgets = [];
    
    function initBudgets() {
        loadBudgets();
        criarSectionOrcamentos();
        setInterval(checkBudgetAlerts, 60000); // Verificar a cada minuto
    }
    
    function loadBudgets() {
        const saved = localStorage.getItem('budgets');
        if (saved) {
            budgets = JSON.parse(saved);
        } else {
            // Orçamentos padrão
            budgets = [
                { id: 1, categoria: 'Alimentação', limite: 1000, cor: '#ef4444', ativo: true },
                { id: 2, categoria: 'Lazer', limite: 500, cor: '#f59e0b', ativo: true },
                { id: 3, categoria: 'Transporte', limite: 300, cor: '#10b981', ativo: true },
                { id: 4, categoria: 'Saúde', limite: 400, cor: '#3b82f6', ativo: true }
            ];
            saveBudgets();
        }
    }
    
    function saveBudgets() {
        localStorage.setItem('budgets', JSON.stringify(budgets));
    }
    
    function criarSectionOrcamentos() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        
        // Verificar se já existe
        if (document.getElementById('budgetsSection')) return;
        
        const budgetSection = document.createElement('section');
        budgetSection.id = 'budgetsSection';
        budgetSection.className = 'budgets-section';
        budgetSection.innerHTML = `
            <h2 class="section-title">🎯 Metas e Orçamentos</h2>
            <div class="budget-controls">
                <select id="budgetCategorySelect">
                    <option value="">Selecione a categoria</option>
                </select>
                <input type="number" id="budgetLimitInput" placeholder="Limite (R$)" step="0.01">
                <input type="color" id="budgetColorInput" value="#ef4444">
                <button id="addBudgetBtn">➕ Adicionar Meta</button>
            </div>
            <div id="budgetsList" class="budgets-list"></div>
        `;
        
        // Inserir após o dashboard module
        const dashboardModule = document.getElementById('dashboardModule');
        if (dashboardModule) {
            dashboardModule.insertBefore(budgetSection, dashboardModule.querySelector('.chart-container'));
        }
        
        // Preencher categorias
        const categorySelect = document.getElementById('budgetCategorySelect');
        if (categorySelect && window.categoriasPersonalizadas) {
            window.categoriasPersonalizadas.forEach(cat => {
                categorySelect.innerHTML += `<option value="${cat.nome}">${cat.nome}</option>`;
            });
        }
        
        document.getElementById('addBudgetBtn')?.addEventListener('click', addBudget);
        
        renderBudgets();
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
        
        document.getElementById('budgetLimitInput').value = '';
    }
    
    function renderBudgets() {
        const container = document.getElementById('budgetsList');
        if (!container) return;
        
        if (budgets.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhuma meta cadastrada</p>';
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
            const cor = budget.cor;
            
            const div = document.createElement('div');
            div.className = 'budget-item';
            div.innerHTML = `
                <div class="budget-header">
                    <div class="budget-info">
                        <span class="budget-cat" style="background: ${cor}20; color: ${cor}">${budget.categoria}</span>
                        <span class="budget-values">R$ ${gasto.toFixed(2)} / R$ ${budget.limite.toFixed(2)}</span>
                    </div>
                    <div class="budget-actions">
                        <button class="edit-budget" data-id="${budget.id}">✏️</button>
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
        
        // Eventos dos botões
        document.querySelectorAll('.edit-budget').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const budget = budgets.find(b => b.id === id);
                if (budget) {
                    document.getElementById('budgetCategorySelect').value = budget.categoria;
                    document.getElementById('budgetLimitInput').value = budget.limite;
                    document.getElementById('budgetColorInput').value = budget.cor;
                }
            });
        });
        
        document.querySelectorAll('.delete-budget').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                budgets = budgets.filter(b => b.id !== id);
                saveBudgets();
                renderBudgets();
                if (window.showNotification) window.showNotification('🗑️ Meta removida', 'info');
            });
        });
    }
    
    function checkBudgetAlerts() {
        if (!window.filteredData) return;
        
        const gastosPorCategoria = {};
        window.filteredData
            .filter(item => item.tipo === 'Despesa')
            .forEach(item => {
                gastosPorCategoria[item.categoria] = (gastosPorCategoria[item.categoria] || 0) + item.valor;
            });
        
        budgets.forEach(budget => {
            const gasto = gastosPorCategoria[budget.categoria] || 0;
            const percentual = (gasto / budget.limite) * 100;
            
            if (percentual >= 100 && !budget.alerted) {
                if (window.showNotification) {
                    window.showNotification(`⚠️ ALERTA: ${budget.categoria} excedeu o limite de R$ ${budget.limite.toFixed(2)}!`, 'warning');
                }
                budget.alerted = true;
            } else if (percentual < 100) {
                budget.alerted = false;
            }
        });
        saveBudgets();
    }
    
    // Atualizar quando os dados mudarem
    const originalRenderDashboard = window.renderDashboard;
    if (originalRenderDashboard) {
        window.renderDashboard = function() {
            originalRenderDashboard();
            renderBudgets();
        };
    }
    
    document.addEventListener('DOMContentLoaded', initBudgets);
})();
