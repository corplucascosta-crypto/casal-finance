// Google Sheets API Integration
(function() {
    if (window.googleSheetsInitialized) return;
    window.googleSheetsInitialized = true;
    
    // Configuração - SUBSTITUA PELOS SEUS VALORES
    var SPREADSHEET_ID = '1WxKQg2kq3wRCFJpQ_IvOw6wLCsUyH66mp3lLzlXH44U'; // ID da sua planilha
    var API_KEY = 'AIzaSyBUVP6VnCfEnWJVjuWMOqaoLE6kKk9XA7g'; // Sua chave API
    
    var SHEET_NAME = 'Planilha1'; // Nome da aba (padrão é "Planilha1")
    
    function initGoogleSheets() {
        console.log('Google Sheets API inicializada');
        adicionarBotaoNovoLancamento();
    }
    
    function adicionarBotaoNovoLancamento() {
        var header = document.querySelector('.main-content header');
        if (!header) return;
        
        var btnContainer = document.createElement('div');
        btnContainer.className = 'add-transaction-btn-container';
        btnContainer.innerHTML = '<button id="addTransactionBtn" class="add-transaction-btn">➕ Novo Lançamento</button>';
        header.appendChild(btnContainer);
        
        document.getElementById('addTransactionBtn').addEventListener('click', abrirModalLancamento);
    }
    
    function abrirModalLancamento() {
        var modal = document.createElement('div');
        modal.id = 'transactionModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>➕ Novo Lançamento</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="transactionForm">
                        <div style="margin-bottom: 15px;">
                            <label>Data e Hora</label>
                            <input type="datetime-local" id="txnData" required style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label>Valor (R$)</label>
                            <input type="number" step="0.01" id="txnValor" required style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label>Tipo</label>
                            <select id="txnTipo" required style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
                                <option value="Despesa">Despesa</option>
                                <option value="Receita">Receita</option>
                            </select>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label>Categoria</label>
                            <input type="text" id="txnCategoria" list="categoriasList" required style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
                            <datalist id="categoriasList">
                                <option>Alimentação</option>
                                <option>Lazer</option>
                                <option>Transporte</option>
                                <option>Saúde</option>
                                <option>Educação</option>
                                <option>Moradia</option>
                                <option>Vestuário</option>
                                <option>Investimentos</option>
                            </datalist>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label>Subcategoria</label>
                            <input type="text" id="txnSubcategoria" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label>Método de Pagamento</label>
                            <select id="txnMetodo" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
                                <option value="PIX">PIX</option>
                                <option value="Débito">Débito</option>
                                <option value="Crédito à vista">Crédito à vista</option>
                                <option value="Crédito parcelado">Crédito parcelado</option>
                                <option value="Dinheiro">Dinheiro</option>
                            </select>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label>Parcelas</label>
                            <input type="number" id="txnParcelas" value="1" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label>Quem Gastou</label>
                            <select id="txnQuem" required style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
                                <option value="LUCAS">LUCAS</option>
                                <option value="BEATRIZ">BEATRIZ</option>
                                <option value="CASAL">CASAL</option>
                            </select>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label>Descrição</label>
                            <input type="text" id="txnDescricao" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label>Tipo de Gasto</label>
                            <select id="txnTipoGasto" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
                                <option value="Essencial">Essencial</option>
                                <option value="Supérfluo">Supérfluo</option>
                                <option value="Emergencial">Emergencial</option>
                                <option value="Investimento">Investimento</option>
                            </select>
                        </div>
                        <button type="submit" style="background: #10b981; color: white; border: none; padding: 12px; border-radius: 8px; width: 100%; cursor: pointer; font-weight: bold;">💾 Salvar Lançamento</button>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        // Data atual no campo datetime-local
        var now = new Date();
        var formattedDate = now.getFullYear() + '-' + 
            String(now.getMonth() + 1).padStart(2, '0') + '-' + 
            String(now.getDate()).padStart(2, '0') + 'T' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0');
        document.getElementById('txnData').value = formattedDate;
        
        document.querySelector('.modal-close').addEventListener('click', function() {
            modal.remove();
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.remove();
        });
        
        document.getElementById('transactionForm').addEventListener('submit', function(e) {
            e.preventDefault();
            salvarLancamento();
        });
    }
    
    function salvarLancamento() {
        var dataHora = document.getElementById('txnData').value;
        var dataFormatada = dataHora.replace('T', ' ').replace(/-/g, '/');
        var valor = parseFloat(document.getElementById('txnValor').value);
        var tipo = document.getElementById('txnTipo').value;
        var categoria = document.getElementById('txnCategoria').value;
        var subcategoria = document.getElementById('txnSubcategoria').value || '';
        var metodo = document.getElementById('txnMetodo').value;
        var parcelas = document.getElementById('txnParcelas').value;
        var quem = document.getElementById('txnQuem').value;
        var descricao = document.getElementById('txnDescricao').value || '';
        var tipoGasto = document.getElementById('txnTipoGasto').value;
        
        var mesReferencia = new Date().getMonth() + 1;
        var diasSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
        var diaSemana = diasSemana[new Date().getDay()];
        var hora = new Date().toLocaleTimeString('pt-BR');
        
        var linha = [
            dataFormatada,
            valor,
            tipo,
            categoria,
            subcategoria,
            metodo,
            parcelas,
            quem,
            descricao,
            tipoGasto,
            mesReferencia,
            diaSemana,
            hora
        ];
        
        console.log('Salvando lançamento:', linha);
        
        // Salvar via fetch (requer backend proxy ou usar localStorage como fallback)
        salvarLocalmente(linha);
        
        var modal = document.getElementById('transactionModal');
        if (modal) modal.remove();
        
        if (window.showNotification) {
            window.showNotification('✅ Lançamento salvo! Recarregue a página para ver as alterações.', 'success');
        }
    }
    
    function salvarLocalmente(linha) {
        var saved = localStorage.getItem('pendingTransactions');
        var pending = saved ? JSON.parse(saved) : [];
        pending.push(linha);
        localStorage.setItem('pendingTransactions', JSON.stringify(pending));
        
        // Tentar sincronizar com Google Sheets via proxy
        sincronizarViaProxy(linha);
    }
    
    function sincronizarViaProxy(linha) {
        // Como o Google Sheets API requer backend, usamos um proxy ou alertamos o usuário
        console.log('Lançamento registrado localmente. Para sincronizar, exporte manualmente.');
    }
    
    window.exportarParaSheets = function() {
        var pending = localStorage.getItem('pendingTransactions');
        if (!pending) {
            if (window.showNotification) window.showNotification('Nenhum lançamento pendente', 'info');
            return;
        }
        
        var lancamentos = JSON.parse(pending);
        var csv = lancamentos.map(function(l) { return l.join(','); }).join('\n');
        
        // Criar arquivo CSV para download
        var blob = new Blob([csv], { type: 'text/csv' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'lancamentos_para_importar.csv';
        link.click();
        
        if (window.showNotification) window.showNotification('CSV gerado! Importe manualmente no Google Sheets.', 'success');
    };
    
    document.addEventListener('DOMContentLoaded', initGoogleSheets);
})();

// Adicionar botão de exportar pendências no menu
function adicionarBotaoExportar() {
    var menuFooter = document.querySelector('.menu-footer');
    if (!menuFooter) return;
    
    var exportBtn = document.createElement('button');
    exportBtn.id = 'exportPendingBtn';
    exportBtn.className = 'logout-btn';
    exportBtn.style.marginTop = '10px';
    exportBtn.style.background = '#f59e0b';
    exportBtn.innerHTML = '📤 Exportar Pendências';
    exportBtn.addEventListener('click', function() {
        if (window.exportarParaSheets) window.exportarParaSheets();
    });
    
    menuFooter.appendChild(exportBtn);
}

// Aguardar e adicionar o botão
setTimeout(adicionarBotaoExportar, 2000);
