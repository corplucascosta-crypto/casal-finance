// Supabase Client - Com lançamentos parcelados e usuário automático
(function() {
    if (window.supabaseInitialized) return;
    window.supabaseInitialized = true;
    
    var SUPABASE_URL = 'https://bnxlpdwcismmxsakhtnp.supabase.co';
    var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueGxwZHdjaXNtbXhzYWtodG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODE3OTksImV4cCI6MjA5NDg1Nzc5OX0.mEG_5q26fYtaf_2-6NTLnOWX7E03G0L9V5PvGv-Krp8';
    
    var supabaseInstance = null;
    var usuarioAtual = null;
    
    function initSupabase() {
        usuarioAtual = localStorage.getItem('usuarioLogado');
        console.log('Usuário logado:', usuarioAtual);
        carregarSupabaseLib();
    }
    
    function carregarSupabaseLib() {
        if (window.supabase) {
            supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            finalizarInicializacao();
            return;
        }
        
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = function() {
            supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            finalizarInicializacao();
        };
        document.head.appendChild(script);
    }
    
    function finalizarInicializacao() {
        window.supabaseClient = { supabase: supabaseInstance, isReady: true };
        window.dispatchEvent(new Event('supabaseReady'));
        carregarDados();
        adicionarBotaoNovoLancamento();
        configurarRealtime();
    }
    
    function adicionarBotaoNovoLancamento() {
        var checkHeader = setInterval(function() {
            var header = document.querySelector('.main-content header');
            if (header && !document.getElementById('addTransactionBtn')) {
                clearInterval(checkHeader);
                
                var btnContainer = document.createElement('div');
                btnContainer.className = 'add-transaction-btn-container';
                btnContainer.innerHTML = '<button id="addTransactionBtn" class="add-transaction-btn">➕ Novo Lançamento</button>';
                header.appendChild(btnContainer);
                
                document.getElementById('addTransactionBtn').addEventListener('click', abrirModalLancamento);
            }
        }, 500);
    }
    
    function abrirModalLancamento() {
        var modal = document.createElement('div');
        modal.id = 'transactionModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>➕ Nova Despesa</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="transactionForm">
                        <div style="margin-bottom: 15px;">
                            <label>Valor (R$)</label>
                            <input type="number" step="0.01" id="txnValor" required style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
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
                            <label>Método de Pagamento</label>
                            <select id="txnMetodo" required style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
                                <option value="PIX">PIX</option>
                                <option value="Débito">Débito</option>
                                <option value="Crédito à vista">Crédito à vista</option>
                                <option value="Crédito parcelado">Crédito parcelado</option>
                                <option value="Dinheiro">Dinheiro</option>
                            </select>
                        </div>
                        <div id="parcelasGroup" style="margin-bottom: 15px; display: none;">
                            <label>Número de Parcelas</label>
                            <input type="number" id="txnParcelas" value="2" min="2" max="24" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
                            <small style="color: #64748b;">As próximas parcelas serão geradas automaticamente</small>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label>Descrição</label>
                            <input type="text" id="txnDescricao" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label>Tipo de Gasto</label>
                            <select id="txnTipoGasto" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
                                <option value="Essencial">Essencial</option>
                                <option value="Não essencial">Não essencial</option>
                            </select>
                        </div>
                        <button type="submit" style="background: #10b981; color: white; border: none; padding: 12px; border-radius: 8px; width: 100%; cursor: pointer; font-weight: bold;">💾 Salvar Despesa</button>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        // Mostrar/esconder campo de parcelas
        var metodoSelect = document.getElementById('txnMetodo');
        var parcelasGroup = document.getElementById('parcelasGroup');
        
        metodoSelect.addEventListener('change', function() {
            parcelasGroup.style.display = this.value === 'Crédito parcelado' ? 'block' : 'none';
        });
        
        // Fechar modal
        modal.querySelector('.modal-close').addEventListener('click', function() { modal.remove(); });
        modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
        
        // Submeter formulário
        document.getElementById('transactionForm').addEventListener('submit', function(e) {
            e.preventDefault();
            salvarLancamento();
            modal.remove();
        });
    }
    
    async function salvarLancamento() {
        var valor = parseFloat(document.getElementById('txnValor').value);
        var categoria = document.getElementById('txnCategoria').value;
        var metodo = document.getElementById('txnMetodo').value;
        var parcelas = parseInt(document.getElementById('txnParcelas').value);
        var descricao = document.getElementById('txnDescricao').value || '';
        var tipoGasto = document.getElementById('txnTipoGasto').value;
        
        // Tipo fixo como Despesa
        var tipo = 'Despesa';
        var quem = usuarioAtual;
        
        var agora = new Date();
        var mesReferencia = agora.getMonth() + 1;
        var diasSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
        var diaSemana = diasSemana[agora.getDay()];
        var hora = agora.toLocaleTimeString('pt-BR');
        
        // Se for parcelado, gerar todas as parcelas
        if (metodo === 'Crédito parcelado' && parcelas > 1) {
            var valorParcela = valor / parcelas;
            
            for (var i = 0; i < parcelas; i++) {
                var dataParcela = new Date(agora);
                dataParcela.setMonth(agora.getMonth() + i);
                
                var dataFormatada = dataParcela.toLocaleDateString('pt-BR') + ' ' + dataParcela.toLocaleTimeString('pt-BR');
                var mesParcela = dataParcela.getMonth() + 1;
                var diaSemanaParcela = diasSemana[dataParcela.getDay()];
                var horaParcela = dataParcela.toLocaleTimeString('pt-BR');
                
                var dadosParcela = {
                    valor: valorParcela,
                    tipo: tipo,
                    categoria: categoria,
                    subcategoria: '',
                    metodo: metodo + ' (' + (i + 1) + '/' + parcelas + ')',
                    parcelas: parcelas,
                    quem: quem,
                    descricao: descricao + ' (parcela ' + (i + 1) + '/' + parcelas + ')',
                    tipo_gasto: tipoGasto,
                    mes_referencia: mesParcela,
                    dia_semana: diaSemanaParcela,
                    hora: horaParcela,
                    data_hora: dataParcela.toISOString()
                };
                
                var { error } = await supabaseInstance
                    .from('lancamentos')
                    .insert([dadosParcela]);
                
                if (error) console.error('Erro ao salvar parcela:', error);
            }
            
            if (window.showNotification) window.showNotification('✅ Compra parcelada em ' + parcelas + 'x de R$ ' + valorParcela.toFixed(2) + ' registrada!', 'success');
        } else {
            // Lançamento normal
            var dados = {
                valor: valor,
                tipo: tipo,
                categoria: categoria,
                subcategoria: '',
                metodo: metodo,
                parcelas: 1,
                quem: quem,
                descricao: descricao,
                tipo_gasto: tipoGasto,
                mes_referencia: mesReferencia,
                dia_semana: diaSemana,
                hora: hora,
                data_hora: agora.toISOString()
            };
            
            var { error } = await supabaseInstance
                .from('lancamentos')
                .insert([dados]);
            
            if (error) {
                console.error('Erro:', error);
                if (window.showNotification) window.showNotification('❌ Erro ao salvar', 'error');
                return;
            }
            
            if (window.showNotification) window.showNotification('✅ Despesa salva!', 'success');
        }
        
        setTimeout(function() { carregarDados(); }, 500);
    }
    
    async function carregarDados() {
        if (!supabaseInstance) return;
        
        var { data, error } = await supabaseInstance
            .from('lancamentos')
            .select('*')
            .order('data_hora', { ascending: false });
        
        if (error) {
            console.error('Erro ao carregar:', error);
            return;
        }
        
        window.rawData = (data || []).map(function(item) {
            var dataObj = new Date(item.data_hora);
            var dataFormatada = dataObj.toLocaleDateString('pt-BR') + ' ' + dataObj.toLocaleTimeString('pt-BR');
            
            return {
                dataRaw: dataFormatada,
                data: dataFormatada.split(' ')[0],
                valor: item.valor,
                tipo: item.tipo,
                categoria: item.categoria,
                subcategoria: item.subcategoria || '',
                metodo: item.metodo || '',
                parcelas: item.parcelas || 1,
                quem: item.quem,
                descricao: item.descricao || 'Sem descrição',
                tipoGasto: item.tipo_gasto || 'Essencial'
            };
        });
        
        window.filteredData = [...window.rawData];
        
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderTable === 'function') renderTable();
        if (typeof renderForecast === 'function') renderForecast();
        if (typeof renderDailyChart === 'function') renderDailyChart();
        if (typeof renderAnalytics === 'function') renderAnalytics();
        if (typeof renderPersonDashboard === 'function') renderPersonDashboard();
        
        var updateEl = document.getElementById('lastUpdate');
        if (updateEl) updateEl.innerText = 'Última atualização: ' + new Date().toLocaleString();
    }
    
    function configurarRealtime() {
        if (!supabaseInstance) return;
        
        supabaseInstance
            .channel('lancamentos')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'lancamentos' }, function() {
                carregarDados();
            })
            .subscribe();
    }
    
    document.addEventListener('DOMContentLoaded', initSupabase);
})();
