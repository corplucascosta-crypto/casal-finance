// Daily Chart Module - Gráfico de gastos por dia
(function() {
    if (window.dailyChartInitialized) return;
    window.dailyChartInitialized = true;
    
    let dailyChart = null;
    
    function initDailyChart() {
        preencherFiltrosAnoMes();
        window.renderDailyChart = renderDailyChart;
        
        document.addEventListener('dadosCarregados', () => renderDailyChart());
        
        const monthSelect = document.getElementById('dailyChartMonth');
        const yearSelect = document.getElementById('dailyChartYear');
        
        if (monthSelect) monthSelect.addEventListener('change', renderDailyChart);
        if (yearSelect) yearSelect.addEventListener('change', renderDailyChart);
        
        renderDailyChart();
    }
    
    function preencherFiltrosAnoMes() {
        const monthSelect = document.getElementById('dailyChartMonth');
        const yearSelect = document.getElementById('dailyChartYear');
        
        if (!monthSelect || !yearSelect) return;
        
        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        monthSelect.innerHTML = '<option value="all">Todos os meses</option>';
        meses.forEach((mes, index) => {
            const mesNum = String(index + 1).padStart(2, '0');
            monthSelect.innerHTML += `<option value="${mesNum}">${mes}</option>`;
        });
        
        const anos = [...new Set(window.rawData?.map(d => d.dataISO?.split('-')[0]) || [])];
        yearSelect.innerHTML = '<option value="all">Todos os anos</option>';
        
        if (anos.length > 0) {
            anos.sort().reverse().forEach(ano => {
                yearSelect.innerHTML += `<option value="${ano}">${ano}</option>`;
            });
        } else {
            const anoAtual = new Date().getFullYear();
            for (let ano = anoAtual; ano >= anoAtual - 2; ano--) {
                yearSelect.innerHTML += `<option value="${ano}">${ano}</option>`;
            }
        }
        
        const mesAtual = String(new Date().getMonth() + 1).padStart(2, '0');
        monthSelect.value = mesAtual;
        yearSelect.value = new Date().getFullYear();
    }
    
    function renderDailyChart() {
        if (!window.filteredData || window.filteredData.length === 0) {
            console.log('Sem dados para gráfico diário');
            return;
        }
        
        const month = document.getElementById('dailyChartMonth')?.value;
        const year = document.getElementById('dailyChartYear')?.value;
        
        let despesas = window.filteredData.filter(item => item.tipo === 'Despesa');
        
        if (month && month !== 'all') {
            despesas = despesas.filter(item => {
                const data = new Date(item.dataISO);
                return String(data.getMonth() + 1).padStart(2, '0') === month;
            });
        }
        
        if (year && year !== 'all') {
            despesas = despesas.filter(item => {
                const data = new Date(item.dataISO);
                return data.getFullYear() === parseInt(year);
            });
        }
        
        const gastosPorDia = {};
        despesas.forEach(item => {
            const dia = item.dataRaw?.split(' ')[0] || item.dataISO?.split('T')[0];
            gastosPorDia[dia] = (gastosPorDia[dia] || 0) + item.valor;
        });
        
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
                labels: diasOrdenados,
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
        
        console.log('Gráfico diário renderizado com', diasOrdenados.length, 'dias');
    }
    
    document.addEventListener('DOMContentLoaded', initDailyChart);
})();
