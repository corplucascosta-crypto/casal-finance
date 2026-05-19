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
        var stored = localStorage.getItem('fixedIncomes');
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
        var addBtn = document.getElementById('addFixedIncomeBtn');
        if (addBtn) {
            addBtn.addEventListener('click', function() {
                var pessoa = document.getElementById('fixedIncomePerson').value;
                var descricao = document.getElementById('fixedIncomeDesc').value;
                var valor = parseFloat(document.getElementById('fixedIncomeValue').value);
                
                if (!descricao || !valor || valor <= 0) {
                    if (window.showNotification) window.showNotification('Preencha todos os campos', 'error');
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
                if (window.showNotification) window.showNotification('Receita fixa adicionada!', 'success');
            });
        }
    }
    
    window.renderFixedIncomes = function() {
        var container = document.getElementById('fixedIncomeList');
        if (!container) return;
        
        if (window.fixedIncomes.length === 0) {
            container.innerHTML = '<p>Nenhuma receita fixa cadastrada.</p>';
            return;
        }
        
        var lucasIncomes = window.fixedIncomes.filter(function(inc) { return inc.pessoa === 'LUCAS'; });
        var beatrizIncomes = window.fixedIncomes.filter(function(inc) { return inc.pessoa === 'BEATRIZ'; });
        
        var html = '<div style="display: flex; gap: 20px; flex-wrap: wrap;">';
        
        html += '<div style="flex: 1; min-width: 200px; background: #f8fafc; border-radius: 16px; padding: 16px;">';
        html += '<h3 style="color: #3b82f6; margin-bottom: 12px;">👨 LUCAS</h3>';
        if (lucasIncomes.length === 0) {
            html += '<p style="color: #94a3b8;">Nenhuma receita cadastrada</p>';
        } else {
            for (var i = 0; i < lucasIncomes.length; i++) {
                var inc = lucasIncomes[i];
                html += '<div style="background: white; border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">';
                html += '<div><strong>' + inc.descricao + '</strong><br><span style="color: #10b981;">R$ ' + inc.valor.toFixed(2) + '</span></div>';
                html += '<div><button class="toggle-income" data-id="' + inc.id + '" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;">' + (inc.ativo ? '✅' : '⭕') + '</button>';
                html += '<button class="delete-income" data-id="' + inc.id + '" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;">🗑️</button></div>';
                html += '</div>';
            }
        }
        html += '</div>';
        
        html += '<div style="flex: 1; min-width: 200px; background: #f8fafc; border-radius: 16px; padding: 16px;">';
        html += '<h3 style="color: #ec489a; margin-bottom: 12px;">👩 BEATRIZ</h3>';
        if (beatrizIncomes.length === 0) {
            html += '<p style="color: #94a3b8;">Nenhuma receita cadastrada</p>';
        } else {
            for (var i = 0; i < beatrizIncomes.length; i++) {
                var inc = beatrizIncomes[i];
                html += '<div style="background: white; border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">';
                html += '<div><strong>' + inc.descricao + '</strong><br><span style="color: #10b981;">R$ ' + inc.valor.toFixed(2) + '</span></div>';
                html += '<div><button class="toggle-income" data-id="' + inc.id + '" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;">' + (inc.ativo ? '✅' : '⭕') + '</button>';
                html += '<button class="delete-income" data-id="' + inc.id + '" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;">🗑️</button></div>';
                html += '</div>';
            }
        }
        html += '</div>';
        html += '</div>';
        
        container.innerHTML = html;
        
        document.querySelectorAll('.toggle-income').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(btn.dataset.id);
                var income = window.fixedIncomes.find(function(i) { return i.id === id; });
                if (income) {
                    income.ativo = !income.ativo;
                    saveFixedIncomes();
                    renderFixedIncomes();
                }
            });
        });
        
        document.querySelectorAll('.delete-income').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(btn.dataset.id);
                window.fixedIncomes = window.fixedIncomes.filter(function(i) { return i.id !== id; });
                saveFixedIncomes();
                renderFixedIncomes();
            });
        });
    };
    
    window.loadFixedIncomes = loadFixedIncomes;
    document.addEventListener('DOMContentLoaded', initFixedIncome);
})();
