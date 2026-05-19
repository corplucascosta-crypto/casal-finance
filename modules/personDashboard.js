// Person Dashboard Module - Layout Moderno
(function() {
    if (window.personDashboardInitialized) return;
    window.personDashboardInitialized = true;
    
    let personComparisonChart = null;
    
    function initPersonDashboard() {
        document.addEventListener('dadosCarregados', () => window.renderPersonDashboard());
        window.renderPersonDashboard();
    }
    
    window.renderPersonDashboard = function() {
        if (!window.filteredData || window.filteredData.length === 0) return;
        
        const despesas = window.filteredData.filter(item => item.tipo === 'Despesa');
        
        // Calcular totais por pessoa
        const lucasTotal = despesas.filter(d => d.quem === 'LUCAS').reduce((s, d) => s + d.valor, 0);
        const beatrizTotal = despesas.filter(d => d.quem === 'BEATRIZ').reduce((s, d) => s + d.valor, 0);
        
        // Calcular médias e maiores gastos
        const lucasGastos = despesas.filter(d => d.quem === 'LUCAS').map(d => d.valor);
        const beatrizGastos = despesas.filter(d => d.quem === 'BEATRIZ').map(d => d.valor);
        
        const lucasMedia = lucasGastos.length > 0 ? lucasTotal / lucasGastos.length : 0;
        const beatrizMedia = beatrizGastos.length > 0 ? beatrizTotal / beatrizGastos.length : 0;
        
        const lucasMaior = lucasGastos.length > 0 ? Math.max(...lucasGastos) : 0;
        const beatrizMaior = beatrizGastos.length > 0 ? Math.max(...beatrizGastos) : 0;
        
        // Atualizar cards
        document.getElementById('lucasTotal')?.innerHTML = `R$ ${lucasTotal.toFixed(2)}`;
        document.getElementById('lucasMedia')?.innerHTML = `R$ ${lucasMedia.toFixed(2)}`;
        document.getElementById('lucasMaior')?.innerHTML = `R$ ${lucasMaior.toFixed(2)}`;
        document.getElementById('lucasGastos')?.innerHTML = `${lucasGastos.length} gastos`;
        
        document.getElementById('beatrizTotal')?.innerHTML = `R$ ${beatrizTotal.toFixed(2)}`;
        document.getElementById('beatrizMedia')?.innerHTML = `R$ ${beatrizMedia.toFixed(2)}`;
        document.getElementById('beatrizMaior')?.innerHTML = `R$ ${beatrizMaior.toFixed(2)}`;
        document.getElementById('beatrizGastos')?.innerHTML = `${beatrizGastos.length} gastos`;
        
        // Ranking
        const rankingContainer = document.getElementById('rankingListModern');
        if (rankingContainer) {
            const economizou = lucasTotal < beatrizTotal ? 'LUCAS' : 'BEATRIZ';
            const diferenca = Math.abs(lucasTotal - beatrizTotal);
            
            rankingContainer.innerHTML = `
                <div class="ranking-modern">
                    <div class="ranking-winner">
                        <span class="winner-icon">🏆</span>
                        <span class="winner-name">${economizou}</span>
                        <span class="winner-desc">Economizou R$ ${diferenca.toFixed(2)} a mais</span>
                    </div>
                    <div class="ranking-stats">
                        <div class="stat-bar">
                            <div class="stat-label">LUCAS</div>
                            <div class="stat-bar-bg">
                                <div class="stat-bar-fill" style="width: ${(lucasTotal / (lucasTotal + beatrizTotal)) * 100}%; background: #3b82f6"></div>
                            </div>
                            <div class="stat-value">R$ ${lucasTotal.toFixed(2)}</div>
                        </div>
                        <div class="stat-bar">
                            <div class="stat-label">BEATRIZ</div>
                            <div class="stat-bar-bg">
                                <div class="stat-bar-fill" style="width: ${(beatrizTotal / (lucasTotal + beatrizTotal)) * 100}%; background: #ec489a"></div>
                            </div>
                            <div class="stat-value">R$ ${beatrizTotal.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Gráfico
        const ctx = document.getElementById('personComparisonChart');
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
                        borderRadius: 12,
                        barPercentage: 0.6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: { callbacks: { label: (ctx) => `R$ ${ctx.raw.toFixed(2)}` } }
                    },
                    scales: { y: { beginAtZero: true, ticks: { callback: (v) => `R$ ${v}` } } }
                }
            });
        }
    };
    
    document.addEventListener('DOMContentLoaded', initPersonDashboard);
})();
