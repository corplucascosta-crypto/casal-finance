// Forecast Module - Previsão de Gastos
(function() {
    if (window.forecastInitialized) return;
    window.forecastInitialized = true;
    
    function initForecast() {
        window.renderForecast = renderForecast;
        document.addEventListener('dadosCarregados', () => renderForecast());
        renderForecast();
    }
    
    function renderForecast() {
        if (!window.filteredData || window.filteredData.length === 0) {
            console.log('Sem dados para forecast');
            return;
        }
        
        const now = new Date();
        const mesAtual = String(now.getMonth() + 1).padStart(2, '0');
        const anoAtual = now.getFullYear();
        
        const despesasMes = window.filteredData.filter(item => {
            if (item.tipo !== 'Despesa') return false;
            const data = new Date(item.data);
            return data.getMonth() + 1 === parseInt(mesAtual) && data.getFullYear() === anoAtual;
        });
        
        const totalGasto = despesasMes.reduce((sum, item) => sum + item.valor, 0);
        
        const ultimoDiaMes = new Date(anoAtual, parseInt(mesAtual), 0).getDate();
        const diaAtual = now.getDate();
        const diasRestantes = ultimoDiaMes - diaAtual;
        
        const mediaDiaria = diaAtual > 0 ? totalGasto / diaAtual : 0;
        const projecaoMensal = mediaDiaria * ultimoDiaMes;
        
        const receitasMes = window.filteredData.filter(item => {
            if (item.tipo !== 'Receita') return false;
            const data = new Date(item.data);
            return data.getMonth() + 1 === parseInt(mesAtual) && data.getFullYear() === anoAtual;
        });
        
        const totalReceitas = receitasMes.reduce((sum, item) => sum + item.valor, 0);
        
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
        
        if (orcamentoEl) {
            if (orcamentoRestante < 0) {
                orcamentoEl.style.color = '#ef4444';
            } else if (orcamentoRestante < 500) {
                orcamentoEl.style.color = '#f59e0b';
            } else {
                orcamentoEl.style.color = '#10b981';
            }
        }
        
        console.log('Forecast atualizado - Total gasto:', totalGasto);
    }
    
    document.addEventListener('DOMContentLoaded', initForecast);
})();
