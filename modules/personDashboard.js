// Person Dashboard Module - Dashboard por Pessoa
(function() {
    if (window.personDashboardInitialized) return;
    window.personDashboardInitialized = true;
    
    let personComparisonChart = null;
    
    function initPersonDashboard() {
        criarSectionPessoas();
        renderPersonDashboard();
        
        const originalRenderDashboard = window.renderDashboard;
        if (originalRenderDashboard) {
            window.renderDashboard = function() {
                originalRenderDashboard();
                renderPersonDashboard();
            };
        }
    }
    
    function criarSectionPessoas() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        
        if (document.getElementById('personDashboardSection')) return;
        
        const personSection = document.createElement('section');
        personSection.id = 'personDashboardSection';
        personSection.className = 'person-dashboard-section';
        personSection.innerHTML = `
            <h2 class="section-title">👥 Dashboard por Pessoa</h2>
            <div class="person-cards">
                <div class="person-card lucas">
                    <div class="person-header">👨 LUCAS</div>
                    <div class="person-stats">
                        <div class="stat">
                            <span class="stat-label">Total gasto</span>
                            <span class="stat-value" id="lucasGasto">R$ 0,00</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Média diária</span>
                            <span class="stat-value" id="lucasMedia">R$ 0,00</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Maior gasto</span>
                            <span class="stat-value" id="lucasMaior">R$ 0,00</span>
                        </div>
                    </div>
                </div>
                <div class="person-card beatriz">
                    <div class="person-header">👩 BEATRIZ</div>
                    <div class="person-stats">
                        <div class="stat">
                            <span class="stat-label">Total gasto</span>
                            <span class="stat-value" id="beatrizGasto">R$ 0,00</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Média diária</span>
                            <span class="stat-value" id="beatrizMedia">R$ 0,00</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Maior gasto</span>
                            <span class="stat-value" id="beatrizMaior">R$ 0,00</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="comparison-ranking">
                <div class="ranking-card">
                    <h4>🏆 Ranking de Economia</h4>
                    <div id="rankingList" class="ranking-list"></div>
                </div>
                <div class="chart-person-container">
                    <canvas id="personComparisonChart" width="400" height="200"></canvas>
                </div>
            </div>
        `;
        
        const dashboardModule = document.getElementById('dashboardModule');
        if (dashboardModule) {
            dashboardModule.appendChild(personSection);
        }
    }
    
    function renderPersonDashboard() {
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
            document.getElementById(`${idPrefix}Gasto`).innerHTML = `R$ ${total.toFixed(2)}`;
            document.getElementById(`${idPrefix}Media`).innerHTML = `R$ ${mediaDiaria.toFixed(2)}`;
            document.getElementById(`${idPrefix}Maior`).innerHTML = `R$ ${maiorGasto.toFixed(2)}`;
        });
        
        // Ranking de economia
        const lucasTotal = gastosPorPessoa.LUCAS.total;
        const beatrizTotal = gastosPorPessoa.BEATRIZ.total;
        
        const ranking = [
            { nome: 'LUCAS', gasto: lucasTotal, economia: 0 },
            { nome: 'BEATRIZ', gasto: beatrizTotal, economia: 0 }
        ];
        
        // Quem gastou menos é o mais econômico
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
    }
    
    document.addEventListener('DOMContentLoaded', initPersonDashboard);
})();
