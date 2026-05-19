function renderDashboard() {
    let totalExpense = 0;
    
    if (!filteredData || filteredData.length === 0) {
        document.getElementById('totalExpense').innerHTML = 'R$ 0,00';
        return;
    }
    
    // Calcular despesas totais
    filteredData.forEach(item => {
        if (item.tipo === 'Despesa') {
            totalExpense += item.valor;
        }
    });
    
    document.getElementById('totalExpense').innerHTML = `R$ ${totalExpense.toFixed(2)}`;
    
    // Calcular receitas fixas ativas para o saldo (mas não mostrar)
    const totalReceitasFixas = fixedIncomes
        .filter(inc => inc.ativo)
        .reduce((sum, inc) => sum + inc.valor, 0);
    
    const totalReceitasVariaveis = filteredData
        .filter(item => item.tipo === 'Receita')
        .reduce((sum, item) => sum + item.valor, 0);
    
    const saldoTotal = (totalReceitasFixas + totalReceitasVariaveis) - totalExpense;
    
    // Insights
    const despesas = filteredData.filter(item => item.tipo === 'Despesa');
    
    if (despesas.length > 0) {
        // Dia com mais gastos
        const gastosPorDia = {};
        despesas.forEach(item => {
            const dia = item.data.split(' ')[0];
            gastosPorDia[dia] = (gastosPorDia[dia] || 0) + item.valor;
        });
        const topDay = Object.entries(gastosPorDia).sort((a,b) => b[1] - a[1])[0];
        document.getElementById('topDay').innerHTML = `${topDay[0]} <small>R$ ${topDay[1].toFixed(2)}</small>`;
        
        // Método de pagamento mais usado
        const metodoCount = {};
        despesas.forEach(item => {
            const metodo = item.metodo || 'Outros';
            metodoCount[metodo] = (metodoCount[metodo] || 0) + 1;
        });
        const topPayment = Object.entries(metodoCount).sort((a,b) => b[1] - a[1])[0];
        document.getElementById('topPayment').innerHTML = `${topPayment[0]} <small>${topPayment[1]}x</small>`;
        
        // Quem mais gastou
        const gastosPorPessoa = {};
        despesas.forEach(item => {
            const pessoa = item.quem || 'Outros';
            gastosPorPessoa[pessoa] = (gastosPorPessoa[pessoa] || 0) + item.valor;
        });
        const topSpender = Object.entries(gastosPorPessoa).sort((a,b) => b[1] - a[1])[0];
        document.getElementById('topSpender').innerHTML = `${topSpender[0]} <small>R$ ${topSpender[1].toFixed(2)}</small>`;
        
        // Categoria mais cara
        const gastosPorCategoria = {};
        despesas.forEach(item => {
            const cat = item.categoria || 'Outros';
            gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + item.valor;
        });
        const topCategory = Object.entries(gastosPorCategoria).sort((a,b) => b[1] - a[1])[0];
        document.getElementById('topCategory').innerHTML = `${topCategory[0]} <small>R$ ${topCategory[1].toFixed(2)}</small>`;
    }
    
    // Gráfico de despesas por categoria
    const expenseByCategory = {};
    despesas.forEach(item => {
        const cat = item.categoria || 'Outros';
        expenseByCategory[cat] = (expenseByCategory[cat] || 0) + item.valor;
    });
    
    const ctx = document.getElementById('expenseChart');
    if (ctx) {
        if (window.expenseChart && typeof window.expenseChart.destroy === 'function') {
            window.expenseChart.destroy();
        }
        
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
                plugins: { legend: { position: 'top' } }
            }
        });
    }
}
