// Daily Chart Module - Gráfico de gastos por dia (sem duplicação)
(function() {
    if (window.dailyChartInitialized) return;
    window.dailyChartInitialized = true;
    
    var dailyChart = null;
    
    function initDailyChart() {
        preencherFiltrosAnoMes();
        window.renderDailyChart = renderDailyChart;
        document.addEventListener('dadosCarregados', function() { renderDailyChart(); });
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
        for (var ano = anoAtual + 2; ano >= anoAtual - 2; ano--) {
            yearSelect.innerHTML += '<option value="' + ano + '">' + ano + '</option>';
        }
        
        var mesAtual = String(new Date().getMonth() + 1).padStart(2, '0');
        monthSelect.value = mesAtual;
        yearSelect.value = anoAtual;
    }
    
    function padronizarData(dataStr) {
        if (!dataStr) return null;
        
        // Formato com barras: 23/05/2026
        if (dataStr.includes('/')) {
            var partes = dataStr.split('/');
            if (partes.length >= 3) {
                var dia = partes[0].padStart(2, '0');
                var mes = partes[1].padStart(2, '0');
                var ano = partes[2].split(' ')[0];
                return { dia: dia, mes: mes, ano: ano, dataFormatada: dia + '/' + mes + '/' + ano, dataISO: ano + '-' + mes + '-' + dia };
            }
        }
        
        // Formato com traços: 2026-10-19
        if (dataStr.includes('-')) {
            var partes = dataStr.split('-');
            if (partes.length >= 3) {
                var ano = partes[0];
                var mes = partes[1].padStart(2, '0');
                var dia = partes[2].split(' ')[0].padStart(2, '0');
                return { dia: dia, mes: mes, ano: ano, dataFormatada: dia + '/' + mes + '/' + ano, dataISO: ano + '-' + mes + '-' + dia };
            }
        }
        
        return null;
    }
    
    function renderDailyChart() {
        console.log('Renderizando gráfico diário...');
        
        if (!window.filteredData && !window.despesasFixas) return;
        
        var month = document.getElementById('dailyChartMonth')?.value;
        var year = document.getElementById('dailyChartYear')?.value;
        
        if (month === 'all') month = null;
        if (year === 'all') year = null;
        
        var gastosPorPeriodo = {};
        
        // PRIMEIRO: Adicionar despesas fixas
        if (window.despesasFixas) {
            for (var i = 0; i < window.despesasFixas.length; i++) {
                var despesa = window.despesasFixas[i];
                if (despesa.ativo) {
                    var anoInt = year ? parseInt(year) : new Date().getFullYear();
                    var mesInt = month ? parseInt(month) : null;
                    
                    if (mesInt) {
                        var chaveFixa = '01/' + String(mesInt).padStart(2,'0') + '/' + anoInt;
                        gastosPorPeriodo[chaveFixa] = (gastosPorPeriodo[chaveFixa] || 0) + despesa.valor;
                    } else if (!month && !year) {
                        var chaveFixaAll = 'Despesas Fixas';
                        gastosPorPeriodo[chaveFixaAll] = (gastosPorPeriodo[chaveFixaAll] || 0) + despesa.valor;
                    }
                }
            }
        }
        
        // SEGUNDO: Adicionar despesas variáveis (incluindo parcelas já existentes)
        if (window.filteredData) {
            for (var i = 0; i < window.filteredData.length; i++) {
                var item = window.filteredData[i];
                if (item.tipo === 'Despesa') {
                    var dataInfo = padronizarData(item.dataRaw || item.data);
                    if (dataInfo) {
                        var mes = dataInfo.mes;
                        var ano = dataInfo.ano;
                        var dataFormatada = dataInfo.dataFormatada;
                        
                        // Verificar se pertence ao período selecionado
                        var pertence = true;
                        if (month && mes !== month) pertence = false;
                        if (year && ano !== year) pertence = false;
                        
                        if (pertence) {
                            gastosPorPeriodo[dataFormatada] = (gastosPorPeriodo[dataFormatada] || 0) + item.valor;
                        }
                    }
                }
            }
        }
        
        // TERCEIRO: Adicionar SOMENTE AS PARCELAS QUE AINDA NÃO FORAM LANÇADAS
        // Identificamos parcelas futuras olhando para a data atual
        var hoje = new Date();
        var anoAtual = hoje.getFullYear();
        var mesAtualNum = hoje.getMonth() + 1;
        
        if (window.filteredData) {
            for (var i = 0; i < window.filteredData.length; i++) {
                var item = window.filteredData[i];
                // Verificar se é uma despesa parcelada
                if (item.tipo === 'Despesa' && item.metodo && item.metodo.includes('Crédito parcelado')) {
                    var dataInfo = padronizarData(item.dataRaw || item.data);
                    if (dataInfo) {
                        var dia = parseInt(dataInfo.dia);
                        var mes = parseInt(dataInfo.mes);
                        var ano = parseInt(dataInfo.ano);
                        
                        // Extrair total de parcelas da descrição
                        var totalParcelas = 1;
                        var parcelaAtual = 1;
                        var parcelaMatch = item.descricao.match(/(\d+)\/(\d+)/);
                        if (parcelaMatch) {
                            parcelaAtual = parseInt(parcelaMatch[1]);
                            totalParcelas = parseInt(parcelaMatch[2]);
                        }
                        
                        // Para cada parcela futura (a partir da próxima)
                        for (var p = parcelaAtual + 1; p <= totalParcelas; p++) {
                            var dataParcela = new Date(ano, mes - 1, dia);
                            dataParcela.setMonth(dataParcela.getMonth() + (p - parcelaAtual));
                            
                            var anoParcela = dataParcela.getFullYear();
                            var mesParcela = dataParcela.getMonth() + 1;
                            var diaParcela = dataParcela.getDate();
                            var mesParcelaStr = String(mesParcela).padStart(2,'0');
                            var anoParcelaStr = String(anoParcela);
                            var dataParcelaStr = String(diaParcela).padStart(2,'0') + '/' + mesParcelaStr + '/' + anoParcelaStr;
                            
                            // Verificar se a parcela pertence ao período selecionado
                            var pertence = true;
                            if (month && mesParcelaStr !== month) pertence = false;
                            if (year && anoParcelaStr !== year) pertence = false;
                            
                            // Verificar se a parcela já não foi adicionada (evitar duplicação)
                            if (pertence && !gastosPorPeriodo[dataParcelaStr]) {
                                var valorParcela = item.valor;
                                gastosPorPeriodo[dataParcelaStr] = (gastosPorPeriodo[dataParcelaStr] || 0) + valorParcela;
                                console.log('Parcela futura adicionada:', p + '/' + totalParcelas, dataParcelaStr, 'R$', valorParcela);
                            }
                        }
                    }
                }
            }
        }
        
        // Ordenar por data
        var labels = Object.keys(gastosPorPeriodo);
        
        // Separar despesas fixas das variáveis
        var fixasLabel = null;
        var fixasValor = 0;
        var datasLabels = [];
        
        for (var i = 0; i < labels.length; i++) {
            if (labels[i] === 'Despesas Fixas') {
                fixasLabel = labels[i];
                fixasValor = gastosPorPeriodo[labels[i]];
            } else {
                datasLabels.push(labels[i]);
            }
        }
        
        // Ordenar datas
        datasLabels.sort(function(a, b) {
            var partesA = a.split('/');
            var partesB = b.split('/');
            if (partesA.length === 3 && partesB.length === 3) {
                var dataA = new Date(partesA[2], partesA[1] - 1, partesA[0]);
                var dataB = new Date(partesB[2], partesB[1] - 1, partesB[0]);
                return dataA - dataB;
            }
            return 0;
        });
        
        // Montar arrays finais
        var labelsFinal = datasLabels;
        var valoresFinal = datasLabels.map(function(l) { return gastosPorPeriodo[l]; });
        
        if (fixasLabel) {
            labelsFinal.push(fixasLabel);
            valoresFinal.push(fixasValor);
        }
        
        var ctx = document.getElementById('dailyChart');
        if (!ctx) return;
        
        if (dailyChart) dailyChart.destroy();
        
        if (labelsFinal.length === 0) {
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
                labels: labelsFinal,
                datasets: [{
                    label: 'Gastos (R$)',
                    data: valoresFinal,
                    backgroundColor: function(context) {
                        var label = labelsFinal[context.dataIndex];
                        return label === 'Despesas Fixas' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.8)';
                    },
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
        
        console.log('Gráfico diário renderizado com', labelsFinal.length, 'itens');
    }
    
    document.addEventListener('DOMContentLoaded', initDailyChart);
})();
