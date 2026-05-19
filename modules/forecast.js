// Forecast Module - Previsão de Gastos
(function() {
    if (window.forecastInitialized) return;
    window.forecastInitialized = true;
    
    function initForecast() {
        renderForecast();
    }
    
    window.renderForecast = function() {
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
        const mediaDiaria = diaAtual > 0 ? totalGasto / diaAtual : 0;
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
        
        const mediaEl = document.getElementById('mediaDiaria');
        const projecaoEl = document.getElementById('projecaoMensal');
        const orcamentoEl = document.getElementById('orcamentoRestante');
        const porDiaEl = document.getElementById('orcamentoPorDia');
        
        if (mediaEl) mediaEl.innerHTML = `R$ ${mediaDiaria.toFixed(2)}`;
        if (projecaoEl) projecaoEl.innerHTML = `R$ ${projecaoMensal.toFixed(2)}`;
        if (orcamentoEl) orcamentoEl.innerHTML = `R$ ${orcamentoRestante.toFixed(2)}`;
        if (porDiaEl) porDiaEl.innerHTML = `R$ ${orcamentoPorDia.toFixed(2)}`;
        
        // Destaque se orçamento estiver baixo
        if (orcamentoEl) {
            if (orcamentoRestante < 0) {
                orcamentoEl.style.color = '#ef4444';
            } else if (orcamentoRestante < 500) {
                orcamentoEl.style.color = '#f59e0b';
            } else {
                orcamentoEl.style.color = '#10b981';
            }
        }
    };
    
    // Atualizar quando os dados mudarem
    const originalRenderDashboard = window.renderDashboard;
    if (originalRenderDashboard) {
        window.renderDashboard = function() {
            originalRenderDashboard();
            window.renderForecast();
        };
    }
    
    document.addEventListener('DOMContentLoaded', initForecast);
})();
