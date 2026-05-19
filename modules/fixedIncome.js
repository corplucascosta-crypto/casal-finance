// Fixed Income Module - Versão com layout moderno
(function() {
    if (window.fixedIncomeInitialized) return;
    window.fixedIncomeInitialized = true;
    
    window.fixedIncomes = [];
    
    function initFixedIncome() {
        loadFixedIncomes();
        renderFixedIncomes();
        setupEvents();
    }
    
    function loadFixedIncomes() {
        const stored = localStorage.getItem('fixedIncomes');
        if (stored) {
            window.fixedIncomes = JSON.parse(stored);
        } else {
            window.fixedIncomes = [
                { id: 1, pessoa: 'LUCAS', descricao: 'Salário', valor: 5000, ativo: true },
                { id: 2, pessoa: 'BEATRIZ', descricao: 'Salário', valor: 4500, ativo: true }
            ];
            saveFixedIncomes();
        }
    }
    
    function saveFixedIncomes() {
        localStorage.setItem('fixedIncomes', JSON.stringify(window.fixedIncomes));
        if (typeof renderForecast === 'function') renderForecast();
    }
    
    function setupEvents() {
        const addBtn = document.getElementById('addFixedIncomeBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const pessoa = document.getElementById('fixedIncomePerson').value;
                const descricao = document.getElementById('fixedIncomeDesc').value;
                const valor = parseFloat(document.getElementById('fixedIncomeValue').value);
                
                if (!descricao || !valor || valor <= 0) {
                    if (window.showNotification) window.showNotification('❌ Preencha todos os campos', 'error');
                    return;
                }
                
                window.fixedIncomes.push({
                    id: Date.now(),
                    pessoa: pessoa,
                    descricao: descricao,
                    valor: valor,
                    ativo: true
                });
                
                saveFixedIncomes();
                renderFixedIncomes();
                
                document.getElementById('fixedIncomeDesc').value = '';
                document.getElementById('fixedIncomeValue').value = '';
                
                if (window.showNotification) window.showNotification('✅ Receita fixa adicionada!', 'success');
            });
        }
    }
    
    window.renderFixedIncomes = function() {
        const container = document.getElementById('fixedIncomeList');
        if (!container) return;
        
        if (window.fixedIncomes.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhuma receita fixa cadastrada.</p>';
            return;
        }
        
        // Separar por pessoa
        const lucasIncomes = window.fixedIncomes.filter(inc => inc.pessoa === 'LUCAS');
        const beatrizIncomes = window.fixedIncomes.filter(inc => inc.pessoa === 'BEATRIZ');
        
        container.innerHTML = `
            <div class="fixed-income-grid">
                <div class="fixed-income-column">
                    <div class="column-header lucas">👨 LUCAS</div>
                    <div class="column-items">
                        ${lucasIncomes.map(inc => `
                            <div class="income-card ${!inc.ativo ? 'inactive' : ''}">
                                <div class="income-info">
                                    <span class="income-emoji">💰</span>
                                    <div class="income-details">
                                        <span class="income-desc">${inc.descricao}</span>
                                        <span class="income-value">R$ ${inc.valor.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div class="income-actions">
                                    <button class="toggle-income" data-id="${inc.id}">${inc.ativo ? '✅' : '⭕'}</button>
                                    <button class="delete-income" data-id="${inc.id}">🗑️</button>
                                </div>
                            </div>
                        `).join('')}
                        ${lucasIncomes.length === 0 ? '<p class="empty-message">Nenhuma receita cadastrada</p>' : ''}
                    </div>
                </div>
                <div class="fixed-income-column">
                    <div class="column-header beatriz">👩 BEATRIZ</div>
                    <div class="column-items">
                        ${beatrizIncomes.map(inc => `
                            <div class="income-card ${!inc.ativo ? 'inactive' : ''}">
                                <div class="income-info">
                                    <span class="income-emoji">💰</span>
                                    <div class="income-details">
                                        <span class="income-desc">${inc.descricao}</span>
                                        <span class="income-value">R$ ${inc.valor.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div class="income-actions">
                                    <button class="toggle-income" data-id="${inc.id}">${inc.ativo ? '✅' : '⭕'}</button>
                                    <button class="delete-income" data-id="${inc.id}">🗑️</button>
                                </div>
                            </div>
                        `).join('')}
                        ${beatrizIncomes.length === 0 ? '<p class="empty-message">Nenhuma receita cadastrada</p>' : ''}
                    </div>
                </div>
            </div>
        `;
        
        // Eventos dos botões
        document.querySelectorAll('.toggle-income').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const income = window.fixedIncomes.find(i => i.id === id);
                if (income) {
                    income.ativo = !income.ativo;
                    saveFixedIncomes();
                    renderFixedIncomes();
                    if (window.showNotification) window.showNotification(income.ativo ? '✅ Receita ativada' : '⭕ Receita desativada', 'info');
                }
            });
        });
        
        document.querySelectorAll('.delete-income').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                window.fixedIncomes = window.fixedIncomes.filter(i => i.id !== id);
                saveFixedIncomes();
                renderFixedIncomes();
                if (window.showNotification) window.showNotification('🗑️ Receita removida', 'info');
            });
        });
    };
    
    window.loadFixedIncomes = loadFixedIncomes;
    
    document.addEventListener('DOMContentLoaded', initFixedIncome);
})();
