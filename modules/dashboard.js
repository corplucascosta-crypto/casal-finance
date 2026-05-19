function renderDashboard() {
    console.log('Renderizando Dashboard...');
    
    if (!window.filteredData || window.filteredData.length === 0) {
        console.log('Sem dados para renderizar dashboard');
        var totalExpenseEl = document.getElementById('totalExpense');
        if (totalExpenseEl) totalExpenseEl.innerHTML = 'R$ 0,00';
        
        var insightsIds = ['topDay', 'topPayment', 'topSpender', 'topCategory'];
        for (var i = 0; i < insightsIds.length; i++) {
            var el = document.getElementById(insightsIds[i]);
            if (el) el.innerHTML = 'Carregando...';
        }
        return;
    }
    
    // Calcular despesas totais
    var totalExpense = 0;
    for (var i = 0; i < window.filteredData.length; i++) {
        var item = window.filteredData[i];
        if (item.tipo === 'Despesa') {
            totalExpense += item.valor;
        }
    }
    
    var totalExpenseEl = document.getElementById('totalExpense');
    if (totalExpenseEl) totalExpenseEl.innerHTML = 'R$ ' + totalExpense.toFixed(2);
    
    // Insights - Filtrar apenas despesas
    var despesas = [];
    for (var i = 0; i < window.filteredData.length; i++) {
        if (window.filteredData[i].tipo === 'Despesa') {
            despesas.push(window.filteredData[i]);
        }
    }
    
    if (despesas.length > 0) {
        // Dia com mais gastos
        var gastosPorDia = {};
        for (var i = 0; i < despesas.length; i++) {
            var item = despesas[i];
            var dia = item.dataRaw || item.data;
            if (dia && typeof dia === 'string') {
                var diaApenas = dia.split(' ')[0];
                if (!gastosPorDia[diaApenas]) gastosPorDia[diaApenas] = 0;
                gastosPorDia[diaApenas] += item.valor;
            }
        }
        
        var topDay = null;
        var topDayValor = 0;
        for (var dia in gastosPorDia) {
            if (gastosPorDia[dia] > topDayValor) {
                topDayValor = gastosPorDia[dia];
                topDay = dia;
            }
        }
        if (topDay) {
            var topDayEl = document.getElementById('topDay');
            if (topDayEl) topDayEl.innerHTML = topDay + ' <small>R$ ' + topDayValor.toFixed(2) + '</small>';
        }
        
        // Método de pagamento mais usado
        var metodoCount = {};
        for (var i = 0; i < despesas.length; i++) {
            var metodo = despesas[i].metodo || 'Outros';
            if (!metodoCount[metodo]) metodoCount[metodo] = 0;
            metodoCount[metodo]++;
        }
        var topPayment = null;
        var topPaymentCount = 0;
        for (var metodo in metodoCount) {
            if (metodoCount[metodo] > topPaymentCount) {
                topPaymentCount = metodoCount[metodo];
                topPayment = metodo;
            }
        }
        if (topPayment) {
            var topPaymentEl = document.getElementById('topPayment');
            if (topPaymentEl) topPaymentEl.innerHTML = topPayment + ' <small>' + topPaymentCount + 'x</small>';
        }
        
        // Quem mais gastou
        var gastosPorPessoa = {};
        for (var i = 0; i < despesas.length; i++) {
            var pessoa = despesas[i].quem || 'Outros';
            if (!gastosPorPessoa[pessoa]) gastosPorPessoa[pessoa] = 0;
            gastosPorPessoa[pessoa] += despesas[i].valor;
        }
        var topSpender = null;
        var topSpenderValor = 0;
        for (var pessoa in gastosPorPessoa) {
            if (gastosPorPessoa[pessoa] > topSpenderValor) {
                topSpenderValor = gastosPorPessoa[pessoa];
                topSpender = pessoa;
            }
        }
        if (topSpender) {
            var topSpenderEl = document.getElementById('topSpender');
            if (topSpenderEl) topSpenderEl.innerHTML = topSpender + ' <small>R$ ' + topSpenderValor.toFixed(2) + '</small>';
        }
        
        // Categoria mais cara
        var gastosPorCategoria = {};
        for (var i = 0; i < despesas.length; i++) {
            var cat = despesas[i].categoria || 'Outros';
            if (!gastosPorCategoria[cat]) gastosPorCategoria[cat] = 0;
            gastosPorCategoria[cat] += despesas[i].valor;
        }
        var topCategory = null;
        var topCategoryValor = 0;
        for (var cat in gastosPorCategoria) {
            if (gastosPorCategoria[cat] > topCategoryValor) {
                topCategoryValor = gastosPorCategoria[cat];
                topCategory = cat;
            }
        }
        if (topCategory) {
            var topCategoryEl = document.getElementById('topCategory');
            if (topCategoryEl) topCategoryEl.innerHTML = topCategory + ' <small>R$ ' + topCategoryValor.toFixed(2) + '</small>';
        }
    }
    
    console.log('Dashboard renderizado com', despesas.length, 'despesas, total:', totalExpense);
}

window.renderDashboard = renderDashboard;
