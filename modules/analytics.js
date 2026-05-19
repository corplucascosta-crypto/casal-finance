var weeklyChart = null;
var paymentChart = null;
var personAnalyticsChart = null;

function renderAnalytics() {
    if (!window.filteredData || window.filteredData.length === 0) return;
    
    var despesas = window.filteredData.filter(function(item) { return item.tipo === 'Despesa'; });
    
    var weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    var gastosPorDia = [0, 0, 0, 0, 0, 0, 0];
    
    for (var i = 0; i < despesas.length; i++) {
        var item = despesas[i];
        var dataStr = item.dataRaw || item.data;
        if (dataStr && dataStr.indexOf('/') > 0) {
            var partes = dataStr.split('/');
            if (partes.length >= 3) {
                var data = new Date(partes[2], partes[1] - 1, partes[0]);
                if (!isNaN(data.getDay())) {
                    gastosPorDia[data.getDay()] += item.valor;
                }
            }
        }
    }
    
    var ctxWeekly = document.getElementById('weeklyChart');
    if (ctxWeekly && typeof Chart !== 'undefined') {
        if (weeklyChart) weeklyChart.destroy();
        weeklyChart = new Chart(ctxWeekly, {
            type: 'bar',
            data: { labels: weekDays, datasets: [{ label: 'Gastos (R$)', data: gastosPorDia, backgroundColor: '#8b5cf6', borderRadius: 8 }] },
            options: { responsive: true, maintainAspectRatio: true }
        });
    }
    
    var gastosPorMetodo = {};
    for (var i = 0; i < despesas.length; i++) {
        var metodo = despesas[i].metodo || 'Outros';
        gastosPorMetodo[metodo] = (gastosPorMetodo[metodo] || 0) + despesas[i].valor;
    }
    
    var ctxPayment = document.getElementById('paymentChart');
    if (ctxPayment && typeof Chart !== 'undefined') {
        if (paymentChart) paymentChart.destroy();
        paymentChart = new Chart(ctxPayment, {
            type: 'pie',
            data: { labels: Object.keys(gastosPorMetodo), datasets: [{ data: Object.values(gastosPorMetodo), backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'] }] },
            options: { responsive: true, maintainAspectRatio: true }
        });
    }
    
    var gastosPorPessoaAnalytics = {};
    for (var i = 0; i < despesas.length; i++) {
        var pessoa = despesas[i].quem || 'Outros';
        gastosPorPessoaAnalytics[pessoa] = (gastosPorPessoaAnalytics[pessoa] || 0) + despesas[i].valor;
    }
    
    var ctxPerson = document.getElementById('personChart');
    if (ctxPerson && typeof Chart !== 'undefined') {
        if (personAnalyticsChart) personAnalyticsChart.destroy();
        personAnalyticsChart = new Chart(ctxPerson, {
            type: 'doughnut',
            data: { labels: Object.keys(gastosPorPessoaAnalytics), datasets: [{ data: Object.values(gastosPorPessoaAnalytics), backgroundColor: ['#3b82f6', '#ec489a', '#8b5cf6', '#f59e0b'] }] },
            options: { responsive: true, maintainAspectRatio: true }
        });
    }
}

document.addEventListener('dadosCarregados', renderAnalytics);
document.addEventListener('DOMContentLoaded', function() { setTimeout(renderAnalytics, 500); });
