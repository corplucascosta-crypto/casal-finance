const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1NGVxknZtT9snTocuWpEXfDpADWqsQAbTujDS6_hLQxZn0UdfWHVynKsQSiialbe8OHQ79kg-jNwZ/pub?gid=2001858508&single=true&output=csv';

function parseBrazilianValue(valorStr) {
    if (!valorStr) return 0;
    // Remove "R$ " se existir
    let clean = valorStr.replace('R$', '').trim();
    // Remove pontos de milhar
    clean = clean.replace(/\./g, '');
    // Troca vírgula por ponto
    clean = clean.replace(',', '.');
    return parseFloat(clean);
}

async function loadCSVData() {
    try {
        const response = await fetch(CSV_URL);
        const csvText = await response.text();
        
        const lines = csvText.split('\n');
        
        rawData = [];
        const categorySet = new Set();
        
        // Pular cabeçalho (linha 0)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Dividir por vírgula, mas respeitando aspas
            const values = [];
            let current = '';
            let inQuotes = false;
            
            for (let char of line) {
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());
            
            if (values.length < 10) continue;
            
            // Mapeamento correto das colunas do seu CSV
            // Coluna 0: Carimbo de data/hora
            // Coluna 1: VALOR
            // Coluna 2: TIPO
            // Coluna 3: CATEGORIA
            // Coluna 4: SUBCATEGORIA
            // Coluna 5: MÉTODO DE PAGAMENTO
            // Coluna 6: PARCELAS
            // Coluna 7: QUEM GASTOU
            // Coluna 8: DESCRIÇÃO
            // Coluna 9: TIPO DE GASTO
            
            const dataRaw = values[0] || '';
            const valorRaw = values[1] || '0';
            const tipo = values[2] || '';
            const categoria = values[3] || 'Outros';
            const subcategoria = values[4] || '';
            const metodo = values[5] || '';
            const parcelas = values[6] || '';
            const quem = values[7] || '';
            const descricao = values[8] || 'Sem descrição';
            const tipoGasto = values[9] || '';
            
            // Converter valor (pode vir como "2,00" ou "R$ 2,00" ou apenas "2")
            let valor = 0;
            if (valorRaw.includes('R$')) {
                valor = parseBrazilianValue(valorRaw);
            } else {
                // Se vier sem R$, apenas número com vírgula
                valor = parseFloat(valorRaw.replace(',', '.'));
            }
            
            if (isNaN(valor)) {
                console.log('Valor inválido:', valorRaw);
                continue;
            }
            
            const item = {
                data: dataRaw,
                valor: valor,
                tipo: tipo,
                categoria: categoria,
                subcategoria: subcategoria,
                metodo: metodo,
                parcelas: parcelas,
                quem: quem,
                descricao: descricao,
                tipoGasto: tipoGasto
            };
            
            rawData.push(item);
            
            if (categoria && categoria !== 'Outros') {
                categorySet.add(categoria);
            }
        }
        
        // Atualizar filtro de categorias
        const categorySelect = document.getElementById('filterCategory');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="all">Todas as categorias</option>';
            Array.from(categorySet).sort().forEach(cat => {
                categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
            });
        }
        
        filteredData = [...rawData];
        
        // Debug
        console.log(`Carregados ${rawData.length} registros`);
        console.log('Primeiro registro:', rawData[0]);
        
        // Atualizar interface
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderTable === 'function') renderTable();
        
    } catch (error) {
        console.error('Erro ao carregar CSV:', error);
        const tbody = document.getElementById('tableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar dados. Verifique o link do Google Sheets.</td></tr>';
        }
    }
}
