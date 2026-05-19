function renderDashboard() {
    let totalExpense = 0;
    
    if (!filteredData || filteredData.length === 0) {
        console.log('Sem dados para renderizar dashboard');
        document.getElementById('totalIncome').innerHTML = 'R$ 0,00';
        document.getElementById('totalExpense').innerHTML = 'R$ 0,00';
        document.getElementById('totalBalance').innerHTML = 'R$ 0,00';
        return;
    }
    
    // Calcular despesas
    filteredData.forEach(item => {
        if (item.tipo === 'Despesa') {
            totalExpense += item.valor;
        }
    });
    
    // Calcular receitas variáveis (do CSV)
    totalReceitasVariaveis = 0;
    filteredData.forEach(item => {
        if (item.tipo === 'Receita') {
            totalReceitasVariaveis += item.valor;
        }
    });
    
    // Calcular receitas fixas ativas
    const totalReceitasFixas = fixedIncomes
        .filter(inc => inc.ativo)
        .reduce((sum, inc) => sum + inc.valor, 0);
    
    // Total de receitas = fixas + variáveis
    const totalIncome = totalReceitasFixas + totalReceitasVariaveis;
    const balance = totalIncome - totalExpense;
    
    document.getElementById('totalIncome').innerHTML = `R$ ${totalIncome.toFixed(2)}`;
    document.getElementById('totalExpense').innerHTML = `R$ ${totalExpense.toFixed(2)}`;
    document.getElementById('totalBalance').innerHTML = `R$ ${balance.toFixed(2)}`;
    
    // Gráfico de despesas por categoria
    const expenseByCategory = {};
    filteredData.forEach(item => {
        if (item.tipo === 'Despesa') {
            const cat = item.categoria || 'Outros';
            expenseByCategory[cat] = (expenseByCategory[cat] || 0) + item.valor;
        }
    });
    
    const ctx = document.getElementById('expenseChart');
    if (!ctx) {
        console.error('Elemento expenseChart não encontrado');
        return;
    }
    
    // Destruir gráfico existente corretamente
    if (window.expenseChart && typeof window.expenseChart.destroy === 'function') {
        window.expenseChart.destroy();
    }
    
    // Criar novo gráfico
    window.expenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(expenseByCategory),
            datasets: [{
                label: 'Despesas por Categoria (R$)',
                data: Object.values(expenseByCategory),
                backgroundColor: '#ef4444',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'top' }
            }
        }
    });
}
