function renderDashboard() {
    let totalExpense = 0;
    
    if (!window.filteredData || window.filteredData.length === 0) {
        document.getElementById('totalExpense').innerHTML = 'R$ 0,00';
        return;
    }
    
    // Calcular despesas totais
    window.filteredData.forEach(item => {
        if (item.tipo === 'Despesa') {
            totalExpense += item.valor;
        }
    });
    
    document.getElementById('totalExpense').innerHTML = `R$ ${totalExpense.toFixed(2)}`;
    
    // Insights
    const despesas = window.filteredData.filter(item => item.tipo === 'Despesa');
    
    if (despesas.length > 0) {
        // Dia com mais gastos
        const gastosPorDia = {};
        despesas.forEach(item => {
            const dia = item.data.split(' ')[0];
            gastosPorDia[dia] = (gastosPorDia[dia] || 0) + item.valor;
        });
        const topDay = Object.entries(gastosPorDia).sort((a,b) => b[1] - a[1])[0];
        const topDayElement = document.getElementById('topDay');
        if (topDayElement) topDayElement.innerHTML = `${topDay[0]} <small>R$ ${topDay[1].toFixed(2)}</small>`;
        
        // Método de pagamento mais usado
        const metodoCount = {};
        despesas.forEach(item => {
            const metodo = item.metodo || 'Outros';
            metodoCount[metodo] = (metodoCount[metodo] || 0) + 1;
        });
        const topPayment = Object.entries(metodoCount).sort((a,b) => b[1] - a[1])[0];
        const topPaymentElement = document.getElementById('topPayment');
        if (topPaymentElement) topPaymentElement.innerHTML = `${topPayment[0]} <small>${topPayment[1]}x</small>`;
        
        // Quem mais gastou
        const gastosPorPessoa = {};
        despesas.forEach(item => {
            const pessoa = item.quem || 'Outros';
            gastosPorPessoa[pessoa] = (gastosPorPessoa[pessoa] || 0) + item.valor;
        });
        const topSpender = Object.entries(gastosPorPessoa).sort((a,b) => b[1] - a[1])[0];
        const topSpenderElement = document.getElementById('topSpender');
        if (topSpenderElement) topSpenderElement.innerHTML = `${topSpender[0]} <small>R$ ${topSpender[1].toFixed(2)}</small>`;
        
        // Categoria mais cara
        const gastosPorCategoria = {};
        despesas.forEach(item => {
            const cat = item.categoria || 'Outros';
            gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + item.valor;
        });
        const topCategory = Object.entries(gastosPorCategoria).sort((a,b) => b[1] - a[1])[0];
        const topCategoryElement = document.getElementById('topCategory');
        if (topCategoryElement) topCategoryElement.innerHTML = `${topCategory[0]} <small>R$ ${topCategory[1].toFixed(2)}</small>`;
    }
}
