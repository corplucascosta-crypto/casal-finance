const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1NGVxknZtT9snTocuWpEXfDpADWqsQAbTujDS6_hLQxZn0UdfWHVynKsQSiialbe8OHQ79kg-jNwZ/pub?gid=2001858508&single=true&output=csv';

async function loadCSVData() {
    try {
        const response = await fetch(CSV_URL);
        const csvText = await response.text();
        
        const rows = csvText.split('\n').slice(1); // remove header
        rawData = [];
        
        const categorySet = new Set();
        
        for (let row of rows) {
            if (!row.trim()) continue;
            const cols = row.match(/(".*?"|[^,]*)(?=\s*,|\s*$)/g);
            if (!cols || cols.length < 9) continue;
            
            const rawValue = cols[1]?.replace('R$ ', '').replace(',', '.').trim() || '0';
            const valor = parseFloat(rawValue);
            const tipo = cols[2]?.trim() || '';
            const categoria = cols[3]?.trim() || 'Outros';
            const metodo = cols[5]?.trim() || '';
            const quem = cols[7]?.trim() || '';
            const descricao = cols[8]?.trim() || 'Sem descrição';
            const dataRaw = cols[0]?.trim() || '';
            
            if (isNaN(valor)) continue;
            
            rawData.push({
                data: dataRaw,
                valor: valor,
                tipo: tipo,
                categoria: categoria,
                metodo: metodo,
                quem: quem,
                descricao: descricao
            });
            
            categorySet.add(categoria);
        }
        
        // Preencher filtro de categorias
        const categorySelect = document.getElementById('filterCategory');
        categorySelect.innerHTML = '<option value="all">Todas as categorias</option>';
        Array.from(categorySet).sort().forEach(cat => {
            categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
        
        filteredData = [...rawData];
    } catch (error) {
        console.error('Erro ao carregar CSV:', error);
        document.getElementById('tableBody').innerHTML = '<tr><td colspan="7">Erro ao carregar dados. Verifique o link do Google Sheets.</td></tr>';
    }
}