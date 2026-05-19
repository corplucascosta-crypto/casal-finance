// Person Dashboard Module - Layout Moderno e Compacto
(function() {
    if (window.personDashboardInitialized) return;
    window.personDashboardInitialized = true;
    
    let personComparisonChart = null;
    
    function initPersonDashboard() {
        document.addEventListener('dadosCarregados', function() {
            window.renderPersonDashboard();
        });
        window.renderPersonDashboard();
    }
    
    window.renderPersonDashboard = function() {
        console.log('Renderizando Person Dashboard...');
        
        if (!window.filteredData || window.filteredData.length === 0) {
            return;
        }
        
        var despesas = window.filteredData.filter(function(item) {
            return item.tipo === 'Despesa';
        });
        
        // Calcular totais por pessoa
        var lucasTotal = 0;
        var beatrizTotal = 0;
        var lucasGastosLista = [];
        var beatrizGastosLista = [];
        var lucasDias = new Set();
        var beatrizDias = new Set();
        
        despesas.forEach(function(item) {
            if (item.quem === 'LUCAS') {
                lucasTotal += item.valor;
                lucasGastosLista.push(item.valor);
                if (item.data) lucasDias.add(item.data);
                if (item.dataRaw) lucasDias.add(item.dataRaw.split(' ')[0]);
            }
            if (item.quem === 'BEATRIZ') {
                beatrizTotal += item.valor;
                beatrizGastosLista.push(item.valor);
                if (item.data) beatrizDias.add(item.data);
                if (item.dataRaw) beatrizDias.add(item.dataRaw.split(' ')[0]);
            }
        });
        
        var lucasMedia = lucasDias.size > 0 ? lucasTotal / lucasDias.size : 0;
        var beatrizMedia = beatrizDias.size > 0 ? beatrizTotal / beatrizDias.size : 0;
        
        var lucasMaior = lucasGastosLista.length > 0 ? Math.max.apply(null, lucasGastosLista) : 0;
        var beatrizMaior = beatrizGastosLista.length > 0 ? Math.max.apply(null, beatrizGastosLista) : 0;
        
        // Atualizar elementos
        var lucasTotalEl = document.getElementById('lucasTotal');
        var lucasMediaEl = document.getElementById('lucasMedia');
        var lucasMaiorEl = document.getElementById('lucasMaior');
        var lucasGastosEl = document.getElementById('lucasGastos');
        
        var beatrizTotalEl = document.getElementById('beatrizTotal');
        var beatrizMediaEl = document.getElementById('beatrizMedia');
        var beatrizMaiorEl = document.getElementById('beatrizMaior');
        var beatrizGastosEl = document.getElementById('beatrizGastos');
        
        if (lucasTotalEl) lucasTotalEl.innerHTML = 'R$ ' + lucasTotal.toFixed(2);
        if (lucasMediaEl) lucasMediaEl.innerHTML = 'R$ ' + lucasMedia.toFixed(2);
        if (lucasMaiorEl) lucasMaiorEl.innerHTML = 'R$ ' + lucasMaior.toFixed(2);
        if (lucasGastosEl) lucasGastosEl.innerHTML = lucasGastosLista.length + ' gastos';
        
        if (beatrizTotalEl) beatrizTotalEl.innerHTML = 'R$ ' + beatrizTotal.toFixed(2);
        if (beatrizMediaEl) beatrizMediaEl.innerHTML = 'R$ ' + beatrizMedia.toFixed(2);
        if (beatrizMaiorEl) beatrizMaiorEl.innerHTML = 'R$ ' + beatrizMaior.toFixed(2);
        if (beatrizGastosEl) beatrizGastosEl.innerHTML = beatrizGastosLista.length + ' gastos';
        
        // Ranking
        var rankingContainer = document.getElementById('rankingListModern');
        if (rankingContainer) {
            var economizou = lucasTotal < beatrizTotal ? 'LUCAS' : 'BEATRIZ';
            var diferenca = Math.abs(lucasTotal - beatrizTotal);
            var totalGeral = lucasTotal + beatrizTotal;
            var lucasPercent = totalGeral > 0 ? (lucasTotal / totalGeral) * 100 : 0;
            var beatrizPercent = totalGeral > 0 ? (beatrizTotal / totalGeral) * 100 : 0;
            
            rankingContainer.innerHTML = '<div class="ranking-modern">' +
                '<div class="ranking-winner">' +
                '<span class="winner-icon">🏆</span>' +
                '<span class="winner-name">' + economizou + '</span>' +
                '<span class="winner-desc">Economizou R$ ' + diferenca.toFixed(2) + ' a mais</span>' +
                '</div>' +
                '<div class="ranking-stats">' +
                '<div class="stat-bar">' +
                '<div class="stat-label">LUCAS</div>' +
                '<div class="stat-bar-bg">' +
                '<div class="stat-bar-fill" style="width: ' + lucasPercent + '%; background: #3b82f6"></div>' +
                '</div>' +
                '<div class="stat-value">R$ ' + lucasTotal.toFixed(2) + '</div>' +
                '</div>' +
                '<div class="stat-bar">' +
                '<div class="stat-label">BEATRIZ</div>' +
                '<div class="stat-bar-bg">' +
                '<div class="stat-bar-fill" style="width: ' + beatrizPercent + '%; background: #ec489a"></div>' +
                '</div>' +
                '<div class="stat-value">R$ ' + beatrizTotal.toFixed(2) + '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
        }
        
        // Gráfico
        var ctx = document.getElementById('personComparisonChart');
        if (ctx && typeof Chart !== 'undefined') {
            if (personComparisonChart) personComparisonChart.destroy();
            
            personComparisonChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['LUCAS', 'BEATRIZ'],
                    datasets: [{
                        label: 'Gastos totais (R$)',
                        data: [lucasTotal, beatrizTotal],
                        backgroundColor: ['#3b82f6', '#ec489a'],
                        borderRadius: 8,
                        barPercentage: 0.5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: { callbacks: { label: function(ctx) { return 'R$ ' + ctx.raw.toFixed(2); } } }
                    },
                    scales: { y: { beginAtZero: true, ticks: { callback: function(v) { return 'R$ ' + v; } } } }
                }
            });
        }
    };
    
    document.addEventListener('DOMContentLoaded', initPersonDashboard);
})();
