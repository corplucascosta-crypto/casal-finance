// Daily Chart Module - Gráfico de gastos por dia
(function() {
    if (window.dailyChartInitialized) return;
    window.dailyChartInitialized = true;
    
    let dailyChart = null;
    
    function initDailyChart() {
        preencherFiltrosAnoMes();
        window.renderDailyChart = renderDailyChart;
        renderDailyChart();
        
        const monthSelect = document.getElementById('dailyChartMonth');
        const yearSelect = document.getElementById('dailyChartYear');
        
        if (monthSelect) monthSelect.addEventListener('change', renderDailyChart);
        if (yearSelect) yearSelect.addEventListener('change', renderDailyChart);
    }
    
    function preencherFiltrosAnoMes() {
        const monthSelect = document.getElementById('dailyChartMonth');
        const yearSelect = document.getElementById('dailyChartYear');
        
        if (!monthSelect || !yearSelect) return;
        
        // Preencher meses
        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        monthSelect.innerHTML = '<option value="">Todos os meses</option>';
        meses.forEach((mes, index) => {
            const mesNum = String(index + 1).padStart(2, '0');
            monthSelect.innerHTML += `<option value="${mesNum}">${mes}</option>`;
        });
        
        // Preencher anos (últimos 5 anos)
        const anoAtual = new Date().getFullYear();
        yearSelect.innerHTML = '<option value="">Todos os anos</option>';
        for (let ano = anoAtual; ano >= anoAtual - 4; ano--) {
            yearSelect.innerHTML += `<option value="${ano}">${ano}</option>`;
        }
        
        // Selecionar mês e ano atual
        const mesAtual = String(new Date().getMonth() + 1).padStart(2, '0');
        monthSelect.value = mesAtual;
        yearSelect.value = anoAtual;
    }
    
    function renderDailyChart() {
        if (!window.filteredData) {
            console.log('Aguardando dados...');
            return;
        }
        
        const month = document.getElementById('dailyChartMonth')?.value;
        const year = document.getElementById('dailyChartYear')?.value;
        
        // Filtrar despesas
        let despesas = window.filteredData.filter(item => item.tipo === 'Despesa');
        
        if (month) {
            despesas = despesas.filter(item => {
                const data = new Date(item.data);
                return String(data.getMonth() + 1).padStart(2, '0') === month;
            });
        }
        
        if (year) {
            despesas = despesas.filter(item => {
                const data = new Date(item.data);
                return data.getFullYear() === parseInt(year);
            });
        }
        
        // Agrupar por dia
        const gastosPorDia = {};
        despesas.forEach(item => {
            const dia = item.data.split(' ')[0];
            gastosPorDia[dia] = (gastosPorDia[dia] || 0) + item.valor;
        });
        
        // Ordenar por data
        const diasOrdenados = Object.keys(gastosPorDia).sort();
        const valores = diasOrdenados.map(dia => gastosPorDia[dia]);
        
        const ctx = document.getElementById('dailyChart');
        if (!ctx) return;
        
        if (dailyChart) dailyChart.destroy();
        
        if (diasOrdenados.length === 0) {
            const context = ctx.getContext('2d');
            context.clearRect(0, 0, ctx.width, ctx.height);
            context.fillStyle = '#94a3b8';
            context.font = '14px Inter';
            context.textAlign = 'center';
            context.fillText('Nenhum dado para o período selecionado', ctx.width / 2, ctx.height / 2);
            return;
        }
        
        dailyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: diasOrdenados.map(dia => dia.split('/').slice(0, 2).join('/')),
                datasets: [{
                    label: 'Gastos por dia (R$)',
                    data: valores,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: '#ef4444',
                    borderWidth: 1,
                    borderRadius: 6
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
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `R$ ${value.toFixed(2)}`
                        }
                    }
                }
            }
        });
    }
    
    document.addEventListener('DOMContentLoaded', initDailyChart);
})();
