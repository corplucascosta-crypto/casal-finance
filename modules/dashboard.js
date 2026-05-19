function renderDashboard() {
    let totalIncome = 0, totalExpense = 0;
    
    filteredData.forEach(item => {
        if (item.tipo === 'Receita') {
            totalIncome += item.valor;
        }
        if (item.tipo === 'Despesa') {
            totalExpense += item.valor;
        }
    });
    
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
    
    const ctx = document.getElementById('expenseChart').getContext('2d');
    if (window.expenseChart) window.expenseChart.destroy();
    
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
