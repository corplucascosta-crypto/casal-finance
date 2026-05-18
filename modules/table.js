function renderTable() {
    const tbody = document.getElementById('tableBody');
    
    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhum lançamento encontrado.</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    filteredData.forEach(item => {
        const row = tbody.insertRow();
        
        const valorFormatado = `R$ ${item.valor.toFixed(2)}`;
        const valorClass = item.tipo === 'Receita' ? 'positive' : 'negative';
        
        row.insertCell(0).innerText = item.data;
        row.insertCell(1).innerHTML = `<span class="${valorClass}">${valorFormatado}</span>`;
        row.insertCell(2).innerText = item.tipo;
        row.insertCell(3).innerText = item.categoria;
        row.insertCell(4).innerText = item.quem;
        row.insertCell(5).innerText = item.metodo;
        row.insertCell(6).innerText = item.descricao;
    });
}