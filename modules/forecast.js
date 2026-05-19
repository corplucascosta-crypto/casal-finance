// Forecast Module - Previsão de Gastos
(function() {
    if (window.forecastInitialized) return;
    window.forecastInitialized = true;
    
    function initForecast() {
        document.addEventListener('dadosCarregados', () => renderForecast());
        renderForecast();
    }
    
    window.renderForecast = function() {
        console.log('Renderizando Previsão...');
        
        if (!window.filteredData || window.filteredData.length === 0) {
            console.log('Sem dados para forecast');
            resetForecastElements();
            return;
        }
        
        const now = new Date();
        const mesAtual = String(now.getMonth() + 1).padStart(2, '0');
        const anoAtual = now.getFullYear();
        
        // Filtrar despesas do mês atual
        const despesasMes = window.filteredData.filter(item => {
            if (item.tipo !== 'Despesa') return false;
            let dataStr = item.dataRaw || item.data;
            if (dataStr && dataStr.includes('/')) {
                const partes = dataStr.split('/');
                if (partes.length >= 3) {
                    const mes = partes[1].padStart(2, '0');
                    const ano = partes[2].split(' ')[0];
                    return mes === mesAtual && ano === String(anoAtual);
                }
            }
            return false;
        });
        
        const totalGasto = despesasMes.reduce((sum, item) => sum + item.valor, 0);
        
        const ultimoDiaMes = new Date(anoAtual, parseInt(mesAtual), 0).getDate();
        const diaAtual = now.getDate();
        const diasRestantes = ultimoDiaMes - diaAtual;
        
        const mediaDiaria = diaAtual > 0 ? totalGasto / diaAtual : 0;
        const projecaoMensal = mediaDiaria * ultimoDiaMes;
        
        // Calcular receitas do mês
        const receitasMes = window.filteredData.filter(item => {
            if (item.tipo !== 'Receita') return false;
            let dataStr = item.dataRaw || item.data;
            if (dataStr && dataStr.includes('/')) {
                const partes = dataStr.split('/');
                if (partes.length >= 3) {
                    const mes = partes[1].padStart(2, '0');
                    const ano = partes[2].split(' ')[0];
                    return mes === mesAtual && ano === String(anoAtual);
                }
            }
            return false;
        });
        
        const totalReceitas = receitasMes.reduce((sum, item) => sum + item.valor, 0);
        
        // Receitas fixas
        const totalReceitasFixas = (window.fixedIncomes || [])
            .filter(inc => inc.ativo)
            .reduce((sum, inc) => sum + inc.valor, 0);
        
        const receitaTotal = totalReceitas + totalReceitasFixas;
        const orcamentoRestante = receitaTotal - totalGasto;
        const orcamentoPorDia = diasRestantes > 0 ? orcamentoRestante / diasRestantes : 0;
        
        // Atualizar elementos
        updateElement('mediaDiaria', `R$ ${mediaDiaria.toFixed(2)}`);
        updateElement('projecaoMensal', `R$ ${projecaoMensal.toFixed(2)}`);
        updateElement('orcamentoRestante', `R$ ${orcamentoRestante.toFixed(2)}`);
        updateElement('orcamentoPorDia', `R$ ${orcamentoPorDia.toFixed(2)}`);
        
        // Destaque de cor
        const orcamentoEl = document.getElementById('orcamentoRestante');
        if (orcamentoEl) {
            if (orcamentoRestante < 0) orcamentoEl.style.color = '#ef4444';
            else if (orcamentoRestante < 500) orcamentoEl.style.color = '#f59e0b';
            else orcamentoEl.style.color = '#10b981';
        }
        
        console.log('Forecast - Total gasto:', totalGasto, 'Receitas:', receitaTotal);
    };
    
    function resetForecastElements() {
        updateElement('mediaDiaria', 'R$ 0,00');
        updateElement('projecaoMensal', 'R$ 0,00');
        updateElement('orcamentoRestante', 'R$ 0,00');
        updateElement('orcamentoPorDia', 'R$ 0,00');
    }
    
    function updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = value;
    }
    
    document.addEventListener('DOMContentLoaded', initForecast);
})();
