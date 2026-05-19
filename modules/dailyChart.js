// Daily Chart Module - Gráfico de gastos por dia
(function() {
    if (window.dailyChartInitialized) return;
    window.dailyChartInitialized = true;
    
    var dailyChart = null;
    
    function initDailyChart() {
        preencherFiltrosAnoMes();
        window.renderDailyChart = renderDailyChart;
        
        document.addEventListener('dadosCarregados', function() {
            renderDailyChart();
        });
        
        var monthSelect = document.getElementById('dailyChartMonth');
        var yearSelect = document.getElementById('dailyChartYear');
        
        if (monthSelect) monthSelect.addEventListener('change', renderDailyChart);
        if (yearSelect) yearSelect.addEventListener('change', renderDailyChart);
        
        renderDailyChart();
    }
    
    function preencherFiltrosAnoMes() {
        var monthSelect = document.getElementById('dailyChartMonth');
        var yearSelect = document.getElementById('dailyChartYear');
        
        if (!monthSelect || !yearSelect) return;
        
        var meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        
        monthSelect.innerHTML = '<option value="all">Todos os meses</option>';
        for (var i = 0; i < meses.length; i++) {
            var mesNum = String(i + 1).padStart(2, '0');
            monthSelect.innerHTML += '<option value="' + mesNum + '">' + meses[i] + '</option>';
        }
        
        var anoAtual = new Date().getFullYear();
        yearSelect.innerHTML = '<option value="all">Todos os anos</option>';
        for (var ano = anoAtual; ano >= anoAtual - 2; ano--) {
            yearSelect.innerHTML += '<option value="' + ano + '">' + ano + '</option>';
        }
        
        var mesAtual = String(new Date().getMonth() + 1).padStart(2, '0');
        monthSelect.value = mesAtual;
        yearSelect.value = anoAtual;
    }
    
    function renderDailyChart() {
        if (!window.filteredData || window.filteredData.length === 0) {
            console.log('Sem dados para gráfico diário');
            return;
        }
        
        var month = document.getElementById('dailyChartMonth')?.value;
        var year = document.getElementById('dailyChartYear')?.value;
        
        // Filtrar apenas despesas
        var despesas = [];
        for (var i = 0; i < window.filteredData.length; i++) {
            if (window.filteredData[i].tipo === 'Despesa') {
                despesas.push(window.filteredData[i]);
            }
        }
        
        // Aplicar filtros
        var despesasFiltradas = [];
        for (var i = 0; i < despesas.length; i++) {
            var item = despesas[i];
            var dataStr = item.dataRaw || item.data;
            if (!dataStr) continue;
            
            // Extrair data no formato DD/MM/YYYY
            var partes = dataStr.split('/');
            if (partes.length >= 3) {
                var dia = partes[0];
                var mes = partes[1].padStart(2, '0');
                var ano = partes[2].split(' ')[0];
                
                if (month !== 'all' && month !== mes) continue;
                if (year !== 'all' && year !== ano) continue;
                
                despesasFiltradas.push({ data: dataStr, valor: item.valor, dia: dia, mes: mes, ano: ano });
            }
        }
        
        // Agrupar por dia
        var gastosPorDia = {};
        for (var i = 0; i < despesasFiltradas.length; i++) {
            var item = despesasFiltradas[i];
            var chave = item.dia + '/' + item.mes;
            if (!gastosPorDia[chave]) gastosPorDia[chave] = 0;
            gastosPorDia[chave] += item.valor;
        }
        
        // Ordenar por dia
        var diasOrdenados = Object.keys(gastosPorDia).sort(function(a, b) {
            var diaA = parseInt(a.split('/')[0]);
            var diaB = parseInt(b.split('/')[0]);
            return diaA - diaB;
        });
        
        var valores = [];
        for (var i = 0; i < diasOrdenados.length; i++) {
            valores.push(gastosPorDia[diasOrdenados[i]]);
        }
        
        var ctx = document.getElementById('dailyChart');
        if (!ctx) return;
        
        if (dailyChart) dailyChart.destroy();
        
        if (diasOrdenados.length === 0) {
            var context = ctx.getContext('2d');
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
                            label: function(context) {
                                return 'R$ ' + context.raw.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
        
        console.log('Gráfico diário renderizado com', diasOrdenados.length, 'dias');
    }
    
    document.addEventListener('DOMContentLoaded', initDailyChart);
})();
