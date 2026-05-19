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
            
            // Parse correto de CSV com aspas
            const colunas = [];
            let current = '';
            let inQuotes = false;
            
            for (let char of linha) {
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    colunas.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            colunas.push(current.trim());
            
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
            
            // Converter data para formato ISO para ordenação
            let dataISO = dataRaw;
            if (dataRaw && dataRaw.includes('/')) {
                const partes = dataRaw.split(' ');
                const dataParte = partes[0].split('/');
                if (dataParte.length === 3) {
                    // Formato DD/MM/YYYY
                    dataISO = `${dataParte[2]}-${dataParte[1].padStart(2, '0')}-${dataParte[0].padStart(2, '0')}`;
                    if (partes[1]) dataISO += ` ${partes[1]}`;
                }
            }
            
            if (tipo && (tipo === 'Despesa' || tipo === 'Receita') && !isNaN(valor) && valor > 0) {
                window.rawData.push({
                    dataRaw: dataRaw,
                    dataISO: dataISO,
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
        }
        
        // Ordenar por data
        window.rawData.sort((a, b) => a.dataISO.localeCompare(b.dataISO));
        window.filteredData = [...window.rawData];
        
        console.log('Dados carregados:', window.rawData.length);
        console.log('Categorias encontradas:', Array.from(categoriasSet));
        console.log('Primeiro registro:', window.rawData[0]);
        
        // Atualizar filtro de categorias
        const categorySelect = document.getElementById('filterCategory');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="all">Todas as categorias</option>';
            Array.from(categoriasSet).sort().forEach(cat => {
                categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
            });
        }
        
        // Disparar evento de dados carregados
        const event = new CustomEvent('dadosCarregados', { detail: { dados: window.rawData } });
        document.dispatchEvent(event);
        
        // Atualizar timestamp
        const now = new Date();
        const updateEl = document.getElementById('lastUpdate');
        if (updateEl) {
            updateEl.innerText = `Última atualização: ${now.toLocaleString()}`;
        }
        
        // Forçar renderização de todos os módulos
        setTimeout(() => {
            if (typeof renderDashboard === 'function') renderDashboard();
            if (typeof renderTable === 'function') renderTable();
            if (typeof renderForecast === 'function') renderForecast();
            if (typeof renderComparison === 'function') renderComparison();
            if (typeof renderPersonDashboard === 'function') renderPersonDashboard();
            if (typeof renderDailyChart === 'function') renderDailyChart();
            if (typeof renderAnalytics === 'function') renderAnalytics();
            if (typeof renderBudgets === 'function') renderBudgets();
        }, 100);
        
    } catch (error) {
        console.error('Erro ao carregar CSV:', error);
        const tbody = document.getElementById('tableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar dados. Verifique o console. </td</tr>';
        }
    }
}
