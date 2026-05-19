// Person Dashboard Module - Dashboard por Pessoa
(function() {
    if (window.personDashboardInitialized) return;
    window.personDashboardInitialized = true;
    
    let personComparisonChart = null;
    
    function initPersonDashboard() {
        renderPersonDashboard();
    }
    
    window.renderPersonDashboard = function() {
        if (!window.filteredData) return;
        
        const gastosPorPessoa = {
            LUCAS: { total: 0, valores: [], dias: new Set() },
            BEATRIZ: { total: 0, valores: [], dias: new Set() }
        };
        
        window.filteredData
            .filter(item => item.tipo === 'Despesa')
            .forEach(item => {
                const pessoa = item.quem;
                if (gastosPorPessoa[pessoa]) {
                    gastosPorPessoa[pessoa].total += item.valor;
                    gastosPorPessoa[pessoa].valores.push(item.valor);
                    
                    const data = item.data.split(' ')[0];
                    gastosPorPessoa[pessoa].dias.add(data);
                }
            });
        
        // Atualizar cards
        Object.entries(gastosPorPessoa).forEach(([pessoa, dados]) => {
            const total = dados.total;
            const numDias = dados.dias.size || 1;
            const mediaDiaria = total / numDias;
            const maiorGasto = Math.max(...dados.valores, 0);
            
            const idPrefix = pessoa.toLowerCase();
            const gastoEl = document.getElementById(`${idPrefix}Gasto`);
            const mediaEl = document.getElementById(`${idPrefix}Media`);
            const maiorEl = document.getElementById(`${idPrefix}Maior`);
            
            if (gastoEl) gastoEl.innerHTML = `R$ ${total.toFixed(2)}`;
            if (mediaEl) mediaEl.innerHTML = `R$ ${mediaDiaria.toFixed(2)}`;
            if (maiorEl) maiorEl.innerHTML = `R$ ${maiorGasto.toFixed(2)}`;
        });
        
        // Ranking de economia
        const lucasTotal = gastosPorPessoa.LUCAS.total;
        const beatrizTotal = gastosPorPessoa.BEATRIZ.total;
        
        const ranking = [
            { nome: 'LUCAS', gasto: lucasTotal, economia: 0 },
            { nome: 'BEATRIZ', gasto: beatrizTotal, economia: 0 }
        ];
        
        const menorGasto = Math.min(lucasTotal, beatrizTotal);
        ranking.forEach(p => {
            p.economia = p.gasto - menorGasto;
        });
        
        ranking.sort((a, b) => a.gasto - b.gasto);
        
        const rankingContainer = document.getElementById('rankingList');
        if (rankingContainer) {
            rankingContainer.innerHTML = ranking.map((p, idx) => `
                <div class="ranking-item ${idx === 0 ? 'winner' : ''}">
                    <span class="ranking-position">${idx === 0 ? '🥇' : '🥈'}</span>
                    <span class="ranking-name">${p.nome}</span>
                    <span class="ranking-gasto">R$ ${p.gasto.toFixed(2)}</span>
                    <span class="ranking-economia">${p.economia === 0 ? '🎯 Economizou mais!' : `R$ ${p.economia.toFixed(2)} a mais`}</span>
                </div>
            `).join('');
        }
        
        // Gráfico comparativo
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
                        borderRadius: 8
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
    
    document.addEventListener('DOMContentLoaded', initPersonDashboard);
})();
