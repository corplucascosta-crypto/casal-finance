// Comparison Module - Comparativo Mensal
(function() {
    if (window.comparisonInitialized) return;
    window.comparisonInitialized = true;
    
    let comparisonChart = null;
    
    function initComparison() {
        renderComparison();
    }
    
    window.renderComparison = function() {
        if (!window.filteredData) return;
        
        // Agrupar gastos por mês/ano
        const gastosPorMes = {};
        
        window.filteredData
            .filter(item => item.tipo === 'Despesa')
            .forEach(item => {
                const data = new Date(item.data);
                const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
                gastosPorMes[mesAno] = (gastosPorMes[mesAno] || 0) + item.valor;
            });
        
        // Ordenar meses
        const mesesOrdenados = Object.keys(gastosPorMes).sort();
        
        if (mesesOrdenados.length === 0) return;
        
        // Calcular variação
        const mesAtual = mesesOrdenados[mesesOrdenados.length - 1];
        const mesAnterior = mesesOrdenados[mesesOrdenados.length - 2];
        
        if (mesAnterior) {
            const gastoAtual = gastosPorMes[mesAtual];
            const gastoAnterior = gastosPorMes[mesAnterior];
            const variacao = ((gastoAtual - gastoAnterior) / gastoAnterior) * 100;
            
            const variacaoElement = document.getElementById('variacaoMensal');
            const trendElement = document.getElementById('variacaoTrend');
            
            if (variacaoElement) {
                variacaoElement.innerHTML = `${variacao > 0 ? '+' : ''}${variacao.toFixed(1)}%`;
                variacaoElement.style.color = variacao > 0 ? '#ef4444' : '#10b981';
            }
            if (trendElement) {
                trendElement.innerHTML = variacao > 0 ? '↑ Aumento nos gastos' : '↓ Redução nos gastos';
                trendElement.style.color = variacao > 0 ? '#ef4444' : '#10b981';
            }
        }
        
        // Melhor e pior mês
        let melhorMes = { mes: '', valor: Infinity };
        let piorMes = { mes: '', valor: 0 };
        
        Object.entries(gastosPorMes).forEach(([mes, valor]) => {
            if (valor < melhorMes.valor) {
                melhorMes = { mes, valor };
            }
            if (valor > piorMes.valor) {
                piorMes = { mes, valor };
            }
        });
        
        const mesesNomes = {
            '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai',
            '06': 'Jun', '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
        };
        
        const melhorEl = document.getElementById('melhorMes');
        const piorEl = document.getElementById('piorMes');
        
        if (melhorEl && melhorMes.mes) {
            const [ano, mes] = melhorMes.mes.split('-');
            melhorEl.innerHTML = `${mesesNomes[mes]}/${ano}<br><small>R$ ${melhorMes.valor.toFixed(2)}</small>`;
        }
        
        if (piorEl && piorMes.mes) {
            const [ano, mes] = piorMes.mes.split('-');
            piorEl.innerHTML = `${mesesNomes[mes]}/${ano}<br><small>R$ ${piorMes.valor.toFixed(2)}</small>`;
        }
        
        // Gráfico
        const ctx = document.getElementById('comparisonChart');
        if (ctx && typeof Chart !== 'undefined') {
            if (comparisonChart) comparisonChart.destroy();
            
            const labels = mesesOrdenados.map(mes => {
                const [ano, mesNum] = mes.split('-');
                return `${mesesNomes[mesNum]}/${ano}`;
            });
            const valores = mesesOrdenados.map(mes => gastosPorMes[mes]);
            
            comparisonChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Gastos mensais (R$)',
                        data: valores,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: '#ef4444'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: {
                            callbacks: {
                                label: (context) => `R$ ${context.raw.toFixed(2)}`
                            }
                        }
                    }
                }
            });
        }
    };
    
    document.addEventListener('DOMContentLoaded', initComparison);
})();
