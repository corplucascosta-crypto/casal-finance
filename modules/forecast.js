// Forecast Module - Previsão de Gastos
(function() {
    if (window.forecastInitialized) return;
    window.forecastInitialized = true;
    
    function initForecast() {
        criarSectionPrevisao();
        renderForecast();
        
        // Atualizar quando os dados mudarem
        const originalRenderDashboard = window.renderDashboard;
        if (originalRenderDashboard) {
            window.renderDashboard = function() {
                originalRenderDashboard();
                renderForecast();
            };
        }
    }
    
    function criarSectionPrevisao() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        
        if (document.getElementById('forecastSection')) return;
        
        const forecastSection = document.createElement('section');
        forecastSection.id = 'forecastSection';
        forecastSection.className = 'forecast-section';
        forecastSection.innerHTML = `
            <h2 class="section-title">📈 Previsão do Mês</h2>
            <div class="forecast-cards">
                <div class="forecast-card">
                    <h4>📊 Média diária</h4>
                    <p id="mediaDiaria">R$ 0,00</p>
                </div>
                <div class="forecast-card">
                    <h4>📅 Projeção mensal</h4>
                    <p id="projecaoMensal">R$ 0,00</p>
                </div>
                <div class="forecast-card">
                    <h4>💰 Orçamento restante</h4>
                    <p id="orcamentoRestante">R$ 0,00</p>
                </div>
                <div class="forecast-card">
                    <h4>📌 Por dia (restante)</h4>
                    <p id="orcamentoPorDia">R$ 0,00</p>
                </div>
            </div>
        `;
        
        const dashboardModule = document.getElementById('dashboardModule');
        if (dashboardModule) {
            dashboardModule.insertBefore(forecastSection, dashboardModule.querySelector('.budgets-section'));
        }
    }
    
    function renderForecast() {
        if (!window.filteredData) return;
        
        // Calcular gastos do mês atual
        const now = new Date();
        const mesAtual = String(now.getMonth() + 1).padStart(2, '0');
        const anoAtual = now.getFullYear();
        
        const despesasMes = window.filteredData.filter(item => {
            if (item.tipo !== 'Despesa') return false;
            const data = new Date(item.data);
            return data.getMonth() + 1 === parseInt(mesAtual) && data.getFullYear() === anoAtual;
        });
        
        const totalGasto = despesasMes.reduce((sum, item) => sum + item.valor, 0);
        
        // Dias úteis restantes no mês
        const ultimoDiaMes = new Date(anoAtual, parseInt(mesAtual), 0).getDate();
        const diaAtual = now.getDate();
        const diasRestantes = ultimoDiaMes - diaAtual;
        
        // Média diária baseada nos dias já passados
        const mediaDiaria = totalGasto / diaAtual;
        const projecaoMensal = mediaDiaria * ultimoDiaMes;
        
        // Receitas do mês
        const receitasMes = window.filteredData.filter(item => {
            if (item.tipo !== 'Receita') return false;
            const data = new Date(item.data);
            return data.getMonth() + 1 === parseInt(mesAtual) && data.getFullYear() === anoAtual;
        });
        
        const totalReceitas = receitasMes.reduce((sum, item) => sum + item.valor, 0);
        
        // Adicionar receitas fixas
        const totalReceitasFixas = (window.fixedIncomes || [])
            .filter(inc => inc.ativo)
            .reduce((sum, inc) => sum + inc.valor, 0);
        
        const receitaTotal = totalReceitas + totalReceitasFixas;
        const orcamentoRestante = receitaTotal - totalGasto;
        const orcamentoPorDia = diasRestantes > 0 ? orcamentoRestante / diasRestantes : 0;
        
        document.getElementById('mediaDiaria').innerHTML = `R$ ${mediaDiaria.toFixed(2)}`;
        document.getElementById('projecaoMensal').innerHTML = `R$ ${projecaoMensal.toFixed(2)}`;
        document.getElementById('orcamentoRestante').innerHTML = `R$ ${orcamentoRestante.toFixed(2)}`;
        document.getElementById('orcamentoPorDia').innerHTML = `R$ ${orcamentoPorDia.toFixed(2)}`;
        
        // Destaque se orçamento estiver baixo
        const orcamentoElement = document.getElementById('orcamentoRestante');
        if (orcamentoElement) {
            if (orcamentoRestante < 0) {
                orcamentoElement.style.color = '#ef4444';
            } else if (orcamentoRestante < 500) {
                orcamentoElement.style.color = '#f59e0b';
            } else {
                orcamentoElement.style.color = '#10b981';
            }
        }
    }
    
    document.addEventListener('DOMContentLoaded', initForecast);
})();
