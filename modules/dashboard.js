function renderDashboard() {
    console.log('Renderizando Dashboard...');
    
    if (!window.filteredData || window.filteredData.length === 0) {
        var totalExpenseEl = document.getElementById('totalExpense');
        if (totalExpenseEl) totalExpenseEl.innerHTML = 'R$ 0,00';
        return;
    }
    
    var totalExpense = 0;
    for (var i = 0; i < window.filteredData.length; i++) {
        if (window.filteredData[i].tipo === 'Despesa') {
            totalExpense += window.filteredData[i].valor;
        }
    }
    
    var totalExpenseEl = document.getElementById('totalExpense');
    if (totalExpenseEl) totalExpenseEl.innerHTML = 'R$ ' + totalExpense.toFixed(2);
    
    var despesas = [];
    for (var i = 0; i < window.filteredData.length; i++) {
        if (window.filteredData[i].tipo === 'Despesa') {
            despesas.push(window.filteredData[i]);
        }
    }
    
    if (despesas.length > 0) {
        var gastosPorDia = {};
        for (var i = 0; i < despesas.length; i++) {
            var item = despesas[i];
            var diaRaw = item.dataRaw || item.data;
            if (diaRaw) {
                var dia = diaRaw.split(' ')[0];
                gastosPorDia[dia] = (gastosPorDia[dia] || 0) + item.valor;
            }
        }
        
        var topDay = null, topDayValor = 0;
        for (var dia in gastosPorDia) {
            if (gastosPorDia[dia] > topDayValor) {
                topDayValor = gastosPorDia[dia];
                topDay = dia;
            }
        }
        if (topDay) {
            var topDayEl = document.getElementById('topDay');
            if (topDayEl) topDayEl.innerHTML = topDay + ' R$ ' + topDayValor.toFixed(2);
        }
        
        var metodoCount = {};
        for (var i = 0; i < despesas.length; i++) {
            var metodo = despesas[i].metodo || 'Outros';
            metodoCount[metodo] = (metodoCount[metodo] || 0) + 1;
        }
        var topPayment = null, topPaymentCount = 0;
        for (var metodo in metodoCount) {
            if (metodoCount[metodo] > topPaymentCount) {
                topPaymentCount = metodoCount[metodo];
                topPayment = metodo;
            }
        }
        if (topPayment) {
            var topPaymentEl = document.getElementById('topPayment');
            if (topPaymentEl) topPaymentEl.innerHTML = topPayment + ' ' + topPaymentCount + 'x';
        }
        
        var gastosPorPessoa = {};
        for (var i = 0; i < despesas.length; i++) {
            var pessoa = despesas[i].quem || 'Outros';
            gastosPorPessoa[pessoa] = (gastosPorPessoa[pessoa] || 0) + despesas[i].valor;
        }
        var topSpender = null, topSpenderValor = 0;
        for (var pessoa in gastosPorPessoa) {
            if (gastosPorPessoa[pessoa] > topSpenderValor) {
                topSpenderValor = gastosPorPessoa[pessoa];
                topSpender = pessoa;
            }
        }
        if (topSpender) {
            var topSpenderEl = document.getElementById('topSpender');
            if (topSpenderEl) topSpenderEl.innerHTML = topSpender + ' R$ ' + topSpenderValor.toFixed(2);
        }
        
        var gastosPorCategoria = {};
        for (var i = 0; i < despesas.length; i++) {
            var cat = despesas[i].categoria || 'Outros';
            gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + despesas[i].valor;
        }
        var topCategory = null, topCategoryValor = 0;
        for (var cat in gastosPorCategoria) {
            if (gastosPorCategoria[cat] > topCategoryValor) {
                topCategoryValor = gastosPorCategoria[cat];
                topCategory = cat;
            }
        }
        if (topCategory) {
            var topCategoryEl = document.getElementById('topCategory');
            if (topCategoryEl) topCategoryEl.innerHTML = topCategory + ' R$ ' + topCategoryValor.toFixed(2);
        }
    }
}

window.renderDashboard = renderDashboard;
