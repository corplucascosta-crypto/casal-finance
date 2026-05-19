var weeklyChart = null;
var paymentChart = null;
var personAnalyticsChart = null;

function renderAnalytics() {
    if (!window.filteredData || window.filteredData.length === 0) {
        console.log('Sem dados para análises');
        return;
    }
    
    console.log('Renderizando Análises Detalhadas...');
    
    // Filtrar apenas despesas
    var despesas = [];
    for (var i = 0; i < window.filteredData.length; i++) {
        if (window.filteredData[i].tipo === 'Despesa') {
            despesas.push(window.filteredData[i]);
        }
    }
    
    // 1. Gastos por dia da semana
    var weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    var gastosPorDia = [0, 0, 0, 0, 0, 0, 0];
    var qtdPorDia = [0, 0, 0, 0, 0, 0, 0];
    
    for (var i = 0; i < despesas.length; i++) {
        var item = despesas[i];
        var dataStr = item.dataRaw || item.data;
        
        if (dataStr && dataStr.indexOf('/') > 0) {
            var partes = dataStr.split('/');
            if (partes.length >= 3) {
                var dia = parseInt(partes[0]);
                var mes = parseInt(partes[1]) - 1;
                var ano = parseInt(partes[2].split(' ')[0]);
                
                var data = new Date(ano, mes, dia);
                if (!isNaN(data.getDay())) {
                    var diaSemana = data.getDay();
                    gastosPorDia[diaSemana] += item.valor;
                    qtdPorDia[diaSemana]++;
                }
            }
        }
    }
    
    console.log('Gastos por dia da semana:', gastosPorDia);
    
    var ctxWeekly = document.getElementById('weeklyChart');
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
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'R$ ' + context.raw.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }
    
    // 2. Gastos por método de pagamento
    var gastosPorMetodo = {};
    for (var i = 0; i < despesas.length; i++) {
        var metodo = despesas[i].metodo || 'Outros';
        if (!gastosPorMetodo[metodo]) gastosPorMetodo[metodo] = 0;
        gastosPorMetodo[metodo] += despesas[i].valor;
    }
    
    console.log('Gastos por método:', gastosPorMetodo);
    
    var ctxPayment = document.getElementById('paymentChart');
    if (ctxPayment && typeof Chart !== 'undefined') {
        if (paymentChart) paymentChart.destroy();
        paymentChart = new Chart(ctxPayment, {
            type: 'pie',
            data: {
                labels: Object.keys(gastosPorMetodo),
                datasets: [{
                    data: Object.values(gastosPorMetodo),
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6', '#8b5cf6', '#ec489a']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                var label = context.label || '';
                                var value = context.raw || 0;
                                return label + ': R$ ' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }
    
    // 3. Gastos por pessoa (para o gráfico de análise)
    var gastosPorPessoaAnalytics = {};
    for (var i = 0; i < despesas.length; i++) {
        var pessoa = despesas[i].quem || 'Outros';
        if (!gastosPorPessoaAnalytics[pessoa]) gastosPorPessoaAnalytics[pessoa] = 0;
        gastosPorPessoaAnalytics[pessoa] += despesas[i].valor;
    }
    
    console.log('Gastos por pessoa:', gastosPorPessoaAnalytics);
    
    var ctxPerson = document.getElementById('personChart');
    if (ctxPerson && typeof Chart !== 'undefined') {
        if (personAnalyticsChart) personAnalyticsChart.destroy();
        personAnalyticsChart = new Chart(ctxPerson, {
            type: 'doughnut',
            data: {
                labels: Object.keys(gastosPorPessoaAnalytics),
                datasets: [{
                    data: Object.values(gastosPorPessoaAnalytics),
                    backgroundColor: ['#3b82f6', '#ec489a', '#8b5cf6', '#f59e0b', '#10b981']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                var label = context.label || '';
                                var value = context.raw || 0;
                                return label + ': R$ ' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }
    
    console.log('Análises renderizadas com', despesas.length, 'despesas');
}

// Aguardar dados carregarem
document.addEventListener('dadosCarregados', renderAnalytics);
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(renderAnalytics, 1000);
});

// Expor função global
window.renderAnalytics = renderAnalytics;
