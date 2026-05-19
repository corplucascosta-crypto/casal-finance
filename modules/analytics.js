let weeklyChart = null;
let paymentChart = null;
let personAnalyticsChart = null;

function renderAnalytics() {
    if (!window.filteredData || window.filteredData.length === 0) {
        console.log('Sem dados para análises');
        return;
    }
    
    console.log('Renderizando Análises Detalhadas...');
    
    const despesas = window.filteredData.filter(item => item.tipo === 'Despesa');
    
    // 1. Gastos por dia da semana
    const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const gastosPorDia = new Array(7).fill(0);
    const qtdPorDia = new Array(7).fill(0);
    
    despesas.forEach(item => {
        let data;
        if (item.dataISO) {
            data = new Date(item.dataISO);
        } else if (item.dataRaw) {
            const partes = item.dataRaw.split('/');
            if (partes.length >= 3) {
                data = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
            }
        }
        if (data && !isNaN(data.getDay())) {
            const diaSemana = data.getDay();
            gastosPorDia[diaSemana] += item.valor;
            qtdPorDia[diaSemana]++;
        }
    });
    
    const ctxWeekly = document.getElementById('weeklyChart');
    if (ctxWeekly && typeof Chart !== 'undefined') {
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
    
    // 2. Gastos por método de pagamento
    const gastosPorMetodo = {};
    despesas.forEach(item => {
        const metodo = item.metodo || 'Outros';
        gastosPorMetodo[metodo] = (gastosPorMetodo[metodo] || 0) + item.valor;
    });
    
    const ctxPayment = document.getElementById('paymentChart');
    if (ctxPayment && typeof Chart !== 'undefined') {
        if (paymentChart) paymentChart.destroy();
        paymentChart = new Chart(ctxPayment, {
            type: 'pie',
            data: {
                labels: Object.keys(gastosPorMetodo),
                datasets: [{
                    data: Object.values(gastosPorMetodo),
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6', '#8b5cf6', '#ec489a'],
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
    
    console.log('Análises renderizadas com', despesas.length, 'despesas');
}

document.addEventListener('dadosCarregados', renderAnalytics);
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderAnalytics, 500);
});
