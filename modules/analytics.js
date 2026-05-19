let weeklyChart = null;
let personChart = null;
let paymentChart = null;

function renderAnalytics() {
    if (!filteredData || filteredData.length === 0) return;
    
    // Filtrar apenas despesas
    const despesas = filteredData.filter(item => item.tipo === 'Despesa');
    
    // 1. Gastos por dia da semana
    const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const gastosPorDia = new Array(7).fill(0);
    
    despesas.forEach(item => {
        const data = new Date(item.data);
        const diaSemana = data.getDay();
        gastosPorDia[diaSemana] += item.valor;
    });
    
    const ctxWeekly = document.getElementById('weeklyChart');
    if (ctxWeekly) {
        if (weeklyChart) weeklyChart.destroy();
        weeklyChart = new Chart(ctxWeekly, {
            type: 'bar',
            data: {
                labels: weekDays,
                datasets: [{
                    label: 'Gastos (R$)',
                    data: gastosPorDia,
                    backgroundColor: '#8b5cf6',
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
    
    // 2. Gastos por pessoa
    const gastosPorPessoa = {};
    despesas.forEach(item => {
        const pessoa = item.quem || 'Outros';
        gastosPorPessoa[pessoa] = (gastosPorPessoa[pessoa] || 0) + item.valor;
    });
    
    const ctxPerson = document.getElementById('personChart');
    if (ctxPerson) {
        if (personChart) personChart.destroy();
        personChart = new Chart(ctxPerson, {
            type: 'doughnut',
            data: {
                labels: Object.keys(gastosPorPessoa),
                datasets: [{
                    data: Object.values(gastosPorPessoa),
                    backgroundColor: ['#3b82f6', '#ec489a', '#8b5cf6', '#f59e0b'],
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
    
    // 3. Gastos por método de pagamento
    const gastosPorMetodo = {};
    despesas.forEach(item => {
        const metodo = item.metodo || 'Outros';
        gastosPorMetodo[metodo] = (gastosPorMetodo[metodo] || 0) + item.valor;
    });
    
    const ctxPayment = document.getElementById('paymentChart');
    if (ctxPayment) {
        if (paymentChart) paymentChart.destroy();
        paymentChart = new Chart(ctxPayment, {
            type: 'pie',
            data: {
                labels: Object.keys(gastosPorMetodo),
                datasets: [{
                    data: Object.values(gastosPorMetodo),
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'],
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
