const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1NGVxknZtT9snTocuWpEXfDpADWqsQAbTujDS6_hLQxZn0UdfWHVynKsQSiialbe8OHQ79kg-jNwZ/pub?gid=2001858508&single=true&output=csv';

async function loadCSVData() {
    try {
        console.log('Carregando CSV...');
        const response = await fetch(CSV_URL);
        const texto = await response.text();
        
        const linhas = texto.split('\n');
        console.log('Total de linhas:', linhas.length);
        
        window.rawData = [];
        const categoriasSet = new Set();
        
        for (let i = 1; i < linhas.length; i++) {
            const linha = linhas[i].trim();
            if (!linha) continue;
            
            // Parse simples por vírgula
            const colunas = linha.split(',');
            
            const dataRaw = colunas[0] || '';
            const valor = parseFloat(colunas[1]) || 0;
            const tipo = colunas[2] || '';
            const categoria = colunas[3] || 'Outros';
            const subcategoria = colunas[4] || '';
            const metodo = colunas[5] || '';
            const parcelas = colunas[6] || '';
            const quem = colunas[7] || '';
            const descricao = colunas[8] || 'Sem descrição';
            const tipoGasto = colunas[9] || '';
            
            // Validar dados
            if (!tipo || (tipo !== 'Despesa' && tipo !== 'Receita')) continue;
            if (isNaN(valor) || valor === 0) continue;
            if (!dataRaw) continue;
            
            // Extrair apenas a data (sem hora)
            const dataParte = dataRaw.split(' ')[0];
            
            window.rawData.push({
                dataRaw: dataRaw,
                data: dataParte,
                valor: valor,
                tipo: tipo,
                categoria: categoria,
                subcategoria: subcategoria,
                metodo: metodo,
                parcelas: parcelas,
                quem: quem,
                descricao: descricao,
                tipoGasto: tipoGasto
            });
            
            if (categoria && categoria !== 'Outros') {
                categoriasSet.add(categoria);
            }
        }
        
        window.filteredData = [...window.rawData];
        
        console.log('Dados carregados:', window.rawData.length);
        console.log('Primeiro registro:', window.rawData[0]);
        console.log('Categorias:', Array.from(categoriasSet));
        
        // Atualizar filtro de categorias
        const categorySelect = document.getElementById('filterCategory');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="all">Todas as categorias</option>';
            Array.from(categoriasSet).sort().forEach(cat => {
                categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
            });
        }
        
        // Atualizar timestamp
        const now = new Date();
        const updateEl = document.getElementById('lastUpdate');
        if (updateEl) {
            updateEl.innerText = `Última atualização: ${now.toLocaleString()}`;
        }
        
        // Disparar evento e renderizar
        setTimeout(() => {
            if (typeof window.renderDashboard === 'function') window.renderDashboard();
            if (typeof renderTable === 'function') renderTable();
            if (typeof window.renderForecast === 'function') window.renderForecast();
            if (typeof window.renderComparison === 'function') window.renderComparison();
            if (typeof window.renderPersonDashboard === 'function') window.renderPersonDashboard();
            if (typeof window.renderDailyChart === 'function') window.renderDailyChart();
            if (typeof renderAnalytics === 'function') renderAnalytics();
            if (typeof window.renderBudgets === 'function') window.renderBudgets();
        }, 100);
        
    } catch (error) {
        console.error('Erro ao carregar CSV:', error);
        const tbody = document.getElementById('tableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar dados. Verifique o console.</td</tr>';
        }
    }
}
