// Export Module - CSV e PDF
function initExportButtons() {
    // Criar seção de exportação
    const filtersSection = document.querySelector('.filters');
    if (!filtersSection) return;
    
    const exportSection = document.createElement('div');
    exportSection.className = 'export-section';
    exportSection.innerHTML = `
        <div class="export-buttons">
            <button id="exportCSVBtn" class="export-btn csv">📄 Exportar CSV</button>
            <button id="exportPDFBtn" class="export-btn pdf">📑 Exportar PDF</button>
        </div>
    `;
    filtersSection.appendChild(exportSection);
    
    document.getElementById('exportCSVBtn').addEventListener('click', exportToCSV);
    document.getElementById('exportPDFBtn').addEventListener('click', exportToPDF);
}

function exportToCSV() {
    if (!filteredData || filteredData.length === 0) {
        showNotification('❌ Nenhum dado para exportar', 'error');
        return;
    }
    
    // Criar cabeçalho
    const headers = ['Data', 'Valor', 'Tipo', 'Categoria', 'Subcategoria', 'Método Pagamento', 'Parcelas', 'Quem', 'Descrição', 'Tipo Gasto'];
    const rows = filteredData.map(item => [
        item.data,
        item.valor,
        item.tipo,
        item.categoria,
        item.subcategoria || '',
        item.metodo || '',
        item.parcelas || '',
        item.quem || '',
        item.descricao || '',
        item.tipoGasto || ''
    ]);
    
    // Converter para CSV
    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
    
    // Download
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `financiflow_${new Date().toISOString().slice(0,19)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification(`✅ ${filteredData.length} registros exportados!`, 'success');
}

function exportToPDF() {
    if (!filteredData || filteredData.length === 0) {
        showNotification('❌ Nenhum dado para exportar', 'error');
        return;
    }
    
    // Criar janela de impressão
    const printWindow = window.open('', '_blank');
    const totalDespesas = filteredData
        .filter(item => item.tipo === 'Despesa')
        .reduce((sum, item) => sum + item.valor, 0);
    const totalReceitas = filteredData
        .filter(item => item.tipo === 'Receita')
        .reduce((sum, item) => sum + item.valor, 0);
    const saldo = totalReceitas - totalDespesas;
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Relatório FinanciFlow</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #667eea; }
                .summary { background: #f5f7fa; padding: 20px; border-radius: 12px; margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background: #667eea; color: white; }
                .positive { color: green; }
                .negative { color: red; }
                .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <h1>💰 FinanciFlow - Relatório Financeiro</h1>
            <p>Gerado em: ${new Date().toLocaleString()}</p>
            
            <div class="summary">
                <h3>Resumo</h3>
                <p>📊 Total de Registros: ${filteredData.length}</p>
                <p>💰 Total Receitas: R$ ${totalReceitas.toFixed(2)}</p>
                <p>💸 Total Despesas: R$ ${totalDespesas.toFixed(2)}</p>
                <p>⚖️ Saldo: <strong class="${saldo >= 0 ? 'positive' : 'negative'}">R$ ${saldo.toFixed(2)}</strong></p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Valor</th>
                        <th>Tipo</th>
                        <th>Categoria</th>
                        <th>Quem</th>
                        <th>Pagamento</th>
                        <th>Descrição</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredData.map(item => `
                        <tr>
                            <td>${item.data}</td>
                            <td class="${item.tipo === 'Despesa' ? 'negative' : 'positive'}">R$ ${item.valor.toFixed(2)}</td>
                            <td>${item.tipo}</td>
                            <td>${item.categoria}</td>
                            <td>${item.quem}</td>
                            <td>${item.metodo || '-'}</td>
                            <td>${item.descricao}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="footer">
                <p>Relatório gerado automaticamente por FinanciFlow</p>
                <p>Dados sincronizados com Google Sheets</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
    
    showNotification('📑 Relatório PDF gerado com sucesso!', 'success');
}

document.addEventListener('DOMContentLoaded', initExportButtons);
