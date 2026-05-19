// Export Module - Versão corrigida
(function() {
    if (window.exportInitialized) return;
    window.exportInitialized = true;
    
    function initExport() {
        const csvBtn = document.getElementById('exportCSVBtn');
        const pdfBtn = document.getElementById('exportPDFBtn');
        
        if (csvBtn) csvBtn.addEventListener('click', exportToCSV);
        if (pdfBtn) pdfBtn.addEventListener('click', exportToPDF);
    }
    
    function exportToCSV() {
        if (!window.filteredData || window.filteredData.length === 0) {
            if (window.showNotification) window.showNotification('❌ Nenhum dado para exportar', 'error');
            return;
        }
        
        const headers = ['Data', 'Valor', 'Tipo', 'Categoria', 'Subcategoria', 'Método Pagamento', 'Parcelas', 'Quem', 'Descrição', 'Tipo Gasto'];
        const rows = window.filteredData.map(item => [
            item.data, item.valor, item.tipo, item.categoria,
            item.subcategoria || '', item.metodo || '', item.parcelas || '',
            item.quem || '', item.descricao || '', item.tipoGasto || ''
        ]);
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', `financiflow_${new Date().toISOString().slice(0,19)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        if (window.showNotification) window.showNotification(`✅ ${window.filteredData.length} registros exportados!`, 'success');
    }
    
    function exportToPDF() {
        if (!window.filteredData || window.filteredData.length === 0) {
            if (window.showNotification) window.showNotification('❌ Nenhum dado para exportar', 'error');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        const totalDespesas = window.filteredData
            .filter(item => item.tipo === 'Despesa')
            .reduce((sum, item) => sum + item.valor, 0);
        const totalReceitas = window.filteredData
            .filter(item => item.tipo === 'Receita')
            .reduce((sum, item) => sum + item.valor, 0);
        const saldo = totalReceitas - totalDespesas;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head><title>Relatório FinanciFlow</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #667eea; }
                .summary { background: #f5f7fa; padding: 20px; border-radius: 12px; margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background: #667eea; color: white; }
                .positive { color: green; }
                .negative { color: red; }
            </style>
            </head>
            <body>
                <h1>💰 FinanciFlow - Relatório Financeiro</h1>
                <p>Gerado em: ${new Date().toLocaleString()}</p>
                <div class="summary">
                    <h3>Resumo</h3>
                    <p>📊 Total de Registros: ${window.filteredData.length}</p>
                    <p>💰 Total Receitas: R$ ${totalReceitas.toFixed(2)}</p>
                    <p>💸 Total Despesas: R$ ${totalDespesas.toFixed(2)}</p>
                    <p>⚖️ Saldo: <strong class="${saldo >= 0 ? 'positive' : 'negative'}">R$ ${saldo.toFixed(2)}</strong></p>
                </div>
                <table>
                    <thead><tr><th>Data</th><th>Valor</th><th>Tipo</th><th>Categoria</th><th>Quem</th></tr></thead>
                    <tbody>
                        ${window.filteredData.map(item => `
                            <tr>
                                <td>${item.data}</td>
                                <td class="${item.tipo === 'Despesa' ? 'negative' : 'positive'}">R$ ${item.valor.toFixed(2)}</td>
                                <td>${item.tipo}</td>
                                <td>${item.categoria}</td>
                                <td>${item.quem}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        if (window.showNotification) window.showNotification('📑 PDF gerado!', 'success');
    }
    
    document.addEventListener('DOMContentLoaded', initExport);
})();
