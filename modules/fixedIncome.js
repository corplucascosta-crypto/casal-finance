// Gerenciamento de Receitas Fixas Mensais

let fixedIncomes = [];

// Carregar receitas fixas do localStorage
function loadFixedIncomes() {
    const stored = localStorage.getItem('fixedIncomes');
    if (stored) {
        fixedIncomes = JSON.parse(stored);
    } else {
        // Dados padrão
        fixedIncomes = [
            { id: 1, pessoa: 'LUCAS', descricao: 'Salário', valor: 5000, ativo: true },
            { id: 2, pessoa: 'BEATRIZ', descricao: 'Salário', valor: 4500, ativo: true },
            { id: 3, pessoa: 'CASAL', descricao: 'Rendimentos', valor: 1000, ativo: true }
        ];
        saveFixedIncomes();
    }
    renderFixedIncomes();
}

// Salvar receitas fixas
function saveFixedIncomes() {
    localStorage.setItem('fixedIncomes', JSON.stringify(fixedIncomes));
}

// Adicionar nova receita fixa
function addFixedIncome(pessoa, descricao, valor) {
    if (!descricao || !valor || valor <= 0) {
        alert('Preencha todos os campos corretamente!');
        return;
    }
    
    const newId = Date.now();
    fixedIncomes.push({
        id: newId,
        pessoa: pessoa,
        descricao: descricao,
        valor: parseFloat(valor),
        ativo: true
    });
    
    saveFixedIncomes();
    renderFixedIncomes();
    atualizarTotalReceitasFixas();
}

// Remover receita fixa
function removeFixedIncome(id) {
    fixedIncomes = fixedIncomes.filter(inc => inc.id !== id);
    saveFixedIncomes();
    renderFixedIncomes();
    atualizarTotalReceitasFixas();
}

// Alternar ativo/inativo
function toggleFixedIncome(id) {
    const income = fixedIncomes.find(inc => inc.id === id);
    if (income) {
        income.ativo = !income.ativo;
        saveFixedIncomes();
        renderFixedIncomes();
        atualizarTotalReceitasFixas();
    }
}

// Renderizar lista de receitas fixas
function renderFixedIncomes() {
    const container = document.getElementById('fixedIncomeList');
    if (!container) return;
    
    if (fixedIncomes.length === 0) {
        container.innerHTML = '<p class="no-data">Nenhuma receita fixa cadastrada.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    fixedIncomes.forEach(income => {
        const div = document.createElement('div');
        div.className = `fixed-income-item ${!income.ativo ? 'inactive' : ''}`;
        
        div.innerHTML = `
            <div class="income-info">
                <span class="income-person">${getEmoji(income.pessoa)} ${income.pessoa}</span>
                <span class="income-desc">${income.descricao}</span>
                <span class="income-value">R$ ${income.valor.toFixed(2)}</span>
            </div>
            <div class="income-actions">
                <button onclick="toggleFixedIncome(${income.id})" class="toggle-btn">
                    ${income.ativo ? '✅' : '⭕'}
                </button>
                <button onclick="removeFixedIncome(${income.id})" class="remove-btn">🗑️</button>
            </div>
        `;
        
        container.appendChild(div);
    });
}

function getEmoji(pessoa) {
    if (pessoa === 'LUCAS') return '👨';
    if (pessoa === 'BEATRIZ') return '👩';
    return '💑';
}

function atualizarTotalReceitasFixas() {
    const totalAtivo = fixedIncomes
        .filter(inc => inc.ativo)
        .reduce((sum, inc) => sum + inc.valor, 0);
    
    // Atualizar o card de receitas (será somado com receitas do CSV)
    const totalIncomeElement = document.getElementById('totalIncome');
    if (totalIncomeElement && typeof totalReceitasVariaveis !== 'undefined') {
        const totalFinal = totalAtivo + totalReceitasVariaveis;
        totalIncomeElement.innerHTML = `R$ ${totalFinal.toFixed(2)}`;
        
        // Atualizar saldo
        const totalExpenseElement = document.getElementById('totalExpense');
        const totalBalanceElement = document.getElementById('totalBalance');
        if (totalExpenseElement && totalBalanceElement) {
            const despesas = parseFloat(totalExpenseElement.innerHTML.replace('R$ ', '').replace(',', '.')) || 0;
            totalBalanceElement.innerHTML = `R$ ${(totalFinal - despesas).toFixed(2)}`;
        }
    }
}

// Configurar eventos do módulo
document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addFixedIncomeBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const pessoa = document.getElementById('fixedIncomePerson').value;
            const descricao = document.getElementById('fixedIncomeDesc').value;
            const valor = document.getElementById('fixedIncomeValue').value;
            addFixedIncome(pessoa, descricao, valor);
            
            // Limpar campos
            document.getElementById('fixedIncomeDesc').value = '';
            document.getElementById('fixedIncomeValue').value = '';
        });
    }
});
