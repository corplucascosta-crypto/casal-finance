(function() {
    if (window.forecastInitialized) return;
    window.forecastInitialized = true;
    
    function initForecast() {
        document.addEventListener('dadosCarregados', function() { renderForecast(); });
        renderForecast();
    }
    
    window.renderForecast = function() {
        if (!window.filteredData || window.filteredData.length === 0) return;
        
        var now = new Date();
        var mesAtual = String(now.getMonth() + 1).padStart(2, '0');
        var anoAtual = now.getFullYear();
        
        var totalGasto = 0;
        for (var i = 0; i < window.filteredData.length; i++) {
            var item = window.filteredData[i];
            if (item.tipo !== 'Despesa') continue;
            
            var dataStr = item.dataRaw || item.data;
            if (dataStr && dataStr.indexOf('/') > 0) {
                var partes = dataStr.split('/');
                if (partes.length >= 3) {
                    var mes = partes[1].padStart(2, '0');
                    var ano = partes[2].split(' ')[0];
                    if (mes === mesAtual && ano === String(anoAtual)) {
                        totalGasto += item.valor;
                    }
                }
            }
        }
        
        var ultimoDiaMes = new Date(anoAtual, parseInt(mesAtual), 0).getDate();
        var diaAtual = now.getDate();
        var diasRestantes = ultimoDiaMes - diaAtual;
        var mediaDiaria = diaAtual > 0 ? totalGasto / diaAtual : 0;
        var projecaoMensal = mediaDiaria * ultimoDiaMes;
        
        var totalReceitas = 0;
        for (var i = 0; i < window.filteredData.length; i++) {
            var item = window.filteredData[i];
            if (item.tipo !== 'Receita') continue;
            var dataStr = item.dataRaw || item.data;
            if (dataStr && dataStr.indexOf('/') > 0) {
                var partes = dataStr.split('/');
                if (partes.length >= 3) {
                    var mes = partes[1].padStart(2, '0');
                    var ano = partes[2].split(' ')[0];
                    if (mes === mesAtual && ano === String(anoAtual)) {
                        totalReceitas += item.valor;
                    }
                }
            }
        }
        
        var totalReceitasFixas = 0;
        if (window.fixedIncomes) {
            for (var i = 0; i < window.fixedIncomes.length; i++) {
                if (window.fixedIncomes[i].ativo) {
                    totalReceitasFixas += window.fixedIncomes[i].valor;
                }
            }
        }
        
        var receitaTotal = totalReceitas + totalReceitasFixas;
        var orcamentoRestante = receitaTotal - totalGasto;
        var orcamentoPorDia = diasRestantes > 0 ? orcamentoRestante / diasRestantes : 0;
        
        var mediaEl = document.getElementById('mediaDiaria');
        var projecaoEl = document.getElementById('projecaoMensal');
        var orcamentoEl = document.getElementById('orcamentoRestante');
        var porDiaEl = document.getElementById('orcamentoPorDia');
        
        if (mediaEl) mediaEl.innerHTML = 'R$ ' + mediaDiaria.toFixed(2);
        if (projecaoEl) projecaoEl.innerHTML = 'R$ ' + projecaoMensal.toFixed(2);
        if (orcamentoEl) orcamentoEl.innerHTML = 'R$ ' + orcamentoRestante.toFixed(2);
        if (porDiaEl) porDiaEl.innerHTML = 'R$ ' + orcamentoPorDia.toFixed(2);
        
        console.log('Forecast - Total gasto:', totalGasto);
    };
    
    document.addEventListener('DOMContentLoaded', initForecast);
})();
