function renderDashboard() {
    console.log('Renderizando Dashboard...');
    
    // Verificar se os dados existem
    if (!window.filteredData || window.filteredData.length === 0) {
        console.log('Sem dados para renderizar dashboard');
        const totalExpenseEl = document.getElementById('totalExpense');
        if (totalExpenseEl) totalExpenseEl.innerHTML = 'R$ 0,00';
        
        // Resetar insights
        const topDayEl = document.getElementById('topDay');
        const topPaymentEl = document.getElementById('topPayment');
        const topSpenderEl = document.getElementById('topSpender');
        const topCategoryEl = document.getElementById('topCategory');
        
        if (topDayEl) topDayEl.innerHTML = 'Carregando...';
        if (topPaymentEl) topPaymentEl.innerHTML = 'Carregando...';
        if (topSpenderEl) topSpenderEl.innerHTML = 'Carregando...';
        if (topCategoryEl) topCategoryEl.innerHTML = 'Carregando...';
        return;
    }
    
    // Calcular despesas totais
    let totalExpense = 0;
    window.filteredData.forEach(item => {
        if (item.tipo === 'Despesa') {
            totalExpense += item.valor;
        }
    });
    
    const totalExpenseEl = document.getElementById('totalExpense');
    if (totalExpenseEl) totalExpenseEl.innerHTML = `R$ ${totalExpense.toFixed(2)}`;
    
    // Insights - Filtrar apenas despesas
    const despesas = window.filteredData.filter(item => item.tipo === 'Despesa');
    
    if (despesas.length > 0) {
        // Dia com mais gastos
        const gastosPorDia = {};
        despesas.forEach(item => {
            // Usar dataRaw se existir, ou dataISO, ou tentar extrair
            let dia = item.dataRaw || item.dataISO || item.data;
            if (dia && typeof dia === 'string') {
                dia = dia.split(' ')[0]; // Pega apenas a data, sem hora
                gastosPorDia[dia] = (gastosPorDia[dia] || 0) + item.valor;
            }
        });
        
        if (Object.keys(gastosPorDia).length > 0) {
            const topDay = Object.entries(gastosPorDia).sort((a, b) => b[1] - a[1])[0];
            const topDayEl = document.getElementById('topDay');
            if (topDayEl) topDayEl.innerHTML = `${topDay[0]} <small>R$ ${topDay[1].toFixed(2)}</small>`;
        }
        
        // Método de pagamento mais usado
        const metodoCount = {};
        despesas.forEach(item => {
            const metodo = item.metodo || 'Outros';
            metodoCount[metodo] = (metodoCount[metodo] || 0) + 1;
        });
        
        if (Object.keys(metodoCount).length > 0) {
            const topPayment = Object.entries(metodoCount).sort((a, b) => b[1] - a[1])[0];
            const topPaymentEl = document.getElementById('topPayment');
            if (topPaymentEl) topPaymentEl.innerHTML = `${topPayment[0]} <small>${topPayment[1]}x</small>`;
        }
        
        // Quem mais gastou
        const gastosPorPessoa = {};
        despesas.forEach(item => {
            const pessoa = item.quem || 'Outros';
            gastosPorPessoa[pessoa] = (gastosPorPessoa[pessoa] || 0) + item.valor;
        });
        
        if (Object.keys(gastosPorPessoa).length > 0) {
            const topSpender = Object.entries(gastosPorPessoa).sort((a, b) => b[1] - a[1])[0];
            const topSpenderEl = document.getElementById('topSpender');
            if (topSpenderEl) topSpenderEl.innerHTML = `${topSpender[0]} <small>R$ ${topSpender[1].toFixed(2)}</small>`;
        }
        
        // Categoria mais cara
        const gastosPorCategoria = {};
        despesas.forEach(item => {
            const cat = item.categoria || 'Outros';
            gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + item.valor;
        });
        
        if (Object.keys(gastosPorCategoria).length > 0) {
            const topCategory = Object.entries(gastosPorCategoria).sort((a, b) => b[1] - a[1])[0];
            const topCategoryEl = document.getElementById('topCategory');
            if (topCategoryEl) topCategoryEl.innerHTML = `${topCategory[0]} <small>R$ ${topCategory[1].toFixed(2)}</small>`;
        }
    }
    
    console.log('Dashboard renderizado com', despesas.length, 'despesas, total:', totalExpense);
}

// Expor função globalmente
window.renderDashboard = renderDashboard;
