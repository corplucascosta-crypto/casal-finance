const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1NGVxknZtT9snTocuWpEXfDpADWqsQAbTujDS6_hLQxZn0UdfWHVynKsQSiialbe8OHQ79kg-jNwZ/pub?gid=2001858508&single=true&output=csv';

async function loadCSVData() {
    try {
        console.log('Carregando CSV...');
        const response = await fetch(CSV_URL);
        const texto = await response.text();
        
        // Dividir em linhas
        const linhas = texto.split('\n');
        console.log('Total de linhas:', linhas.length);
        
        rawData = [];
        const categoriasSet = new Set();
        
        // Pular cabeçalho (linha 0)
        for (let i = 1; i < linhas.length; i++) {
            const linha = linhas[i].trim();
            if (!linha) continue;
            
            // Dividir por vírgula
            const colunas = linha.split(',');
            
            // Mapeamento correto das colunas
            // 0: data, 1: valor, 2: tipo, 3: categoria, 4: subcategoria, 
            // 5: metodo, 6: parcelas, 7: quem, 8: descricao, 9: tipoGasto
            const data = colunas[0] || '';
            const valor = parseFloat(colunas[1]) || 0;  // Agora é número puro!
            const tipo = colunas[2] || '';
            const categoria = colunas[3] || 'Outros';
            const subcategoria = colunas[4] || '';
            const metodo = colunas[5] || '';
            const parcelas = colunas[6] || '';
            const quem = colunas[7] || '';
            const descricao = colunas[8] || 'Sem descrição';
            const tipoGasto = colunas[9] || '';
            
            console.log(`Linha ${i}:`, { data, valor, tipo, categoria, quem });
            
            if (tipo && (tipo === 'Despesa' || tipo === 'Receita') && !isNaN(valor)) {
                rawData.push({
                    data: data,
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
        
        console.log('Dados carregados:', rawData.length);
        console.log('Primeiro item:', rawData[0]);
        
        // Calcular totais para debug
        let totalReceitas = 0, totalDespesas = 0;
        rawData.forEach(item => {
            if (item.tipo === 'Receita') totalReceitas += item.valor;
            if (item.tipo === 'Despesa') totalDespesas += item.valor;
        });
        console.log('Total Receitas:', totalReceitas);
        console.log('Total Despesas:', totalDespesas);
        
        // Atualizar filtro de categorias
        const categorySelect = document.getElementById('filterCategory');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="all">Todas as categorias</option>';
            Array.from(categoriasSet).sort().forEach(cat => {
                categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
            });
        }
        
        filteredData = [...rawData];
        
        // Renderizar
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderTable === 'function') renderTable();
        
        // Atualizar timestamp
        const now = new Date();
        const updateEl = document.getElementById('lastUpdate');
        if (updateEl) {
            updateEl.innerText = `Última atualização: ${now.toLocaleString()}`;
        }
        
    } catch (error) {
        console.error('Erro ao carregar CSV:', error);
        const tbody = document.getElementById('tableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar dados. Verifique o console.</td></tr>';
        }
    }
}
