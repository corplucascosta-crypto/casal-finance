// Supabase Client - Banco de dados em tempo real
(function() {
    if (window.supabaseInitialized) return;
    window.supabaseInitialized = true;
    
    // Configuração - SUAS CREDENCIAIS
    var SUPABASE_URL = 'https://bnxlpdwcismmxsakhtnp.supabase.co';
    var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueGxwZHdjaXNtbXhzYWtodG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODE3OTksImV4cCI6MjA5NDg1Nzc5OX0.mEG_5q26fYtaf_2-6NTLnOWX7E03G0L9V5PvGv-Krp8';
    
    var supabase = null;
    
    function initSupabase() {
        console.log('Inicializando Supabase...');
        carregarSupabaseLib();
    }
    
    function carregarSupabaseLib() {
        // Verificar se já existe
        if (window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase já carregado!');
            carregarDados();
            adicionarBotaoNovoLancamento();
            configurarRealtime();
            return;
        }
        
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = function() {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase conectado!');
            carregarDados();
            adicionarBotaoNovoLancamento();
            configurarRealtime();
        };
        script.onerror = function() {
            console.error('Erro ao carregar Supabase');
        };
        document.head.appendChild(script);
    }
    
    function adicionarBotaoNovoLancamento() {
        // Aguardar o header existir
        var checkHeader = setInterval(function() {
            var header = document.querySelector('.main-content header');
            if (header && !document.getElementById('addTransactionBtn')) {
                clearInterval(checkHeader);
                
                var btnContainer = document.createElement('div');
                btnContainer.className = 'add-transaction-btn-container';
                btnContainer.innerHTML = '<button id="addTransactionBtn" class="add-transaction-btn">➕ Novo Lançamento</button>';
                header.appendChild(btnContainer);
                
                document.getElementById('addTransactionBtn').addEventListener('click', abrirModalLancamento);
                console.log('Botão de lançamento adicionado');
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
                    <h3>➕ Novo Lançamento</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="transactionForm">
                        <div style="margin-bottom: 15px;"><label>Valor (R$)</label><input type="number" step="0.01" id="txnValor" required style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;"></div>
                        <div style="margin-bottom: 15px;"><label>Tipo</label><select id="txnTipo" required style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;"><option value="Despesa">Despesa</option><option value="Receita">Receita</option></select></div>
                        <div style="margin-bottom: 15px;"><label>Categoria</label><input type="text" id="txnCategoria" list="categoriasList" required style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;"><datalist id="categoriasList"><option>Alimentação</option><option>Lazer</option><option>Transporte</option><option>Saúde</option><option>Educação</option><option>Moradia</option><option>Vestuário</option><option>Investimentos</option></datalist></div>
                        <div style="margin-bottom: 15px;"><label>Método de Pagamento</label><select id="txnMetodo" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;"><option value="PIX">PIX</option><option value="Débito">Débito</option><option value="Crédito à vista">Crédito à vista</option><option value="Crédito parcelado">Crédito parcelado</option><option value="Dinheiro">Dinheiro</option></select></div>
                        <div style="margin-bottom: 15px;"><label>Parcelas</label><input type="number" id="txnParcelas" value="1" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;"></div>
                        <div style="margin-bottom: 15px;"><label>Quem Gastou</label><select id="txnQuem" required style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;"><option value="LUCAS">LUCAS</option><option value="BEATRIZ">BEATRIZ</option><option value="CASAL">CASAL</option></select></div>
                        <div style="margin-bottom: 15px;"><label>Descrição</label><input type="text" id="txnDescricao" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;"></div>
                        <div style="margin-bottom: 15px;"><label>Tipo de Gasto</label><select id="txnTipoGasto" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;"><option value="Essencial">Essencial</option><option value="Supérfluo">Supérfluo</option><option value="Emergencial">Emergencial</option></select></div>
                        <button type="submit" style="background: #10b981; color: white; border: none; padding: 12px; border-radius: 8px; width: 100%; cursor: pointer; font-weight: bold;">💾 Salvar Lançamento</button>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        var closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.addEventListener('click', function() { modal.remove(); });
        modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
        
        var form = document.getElementById('transactionForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                salvarLancamento();
                modal.remove();
            });
        }
    }
    
    async function salvarLancamento() {
        var valor = parseFloat(document.getElementById('txnValor').value);
        var tipo = document.getElementById('txnTipo').value;
        var categoria = document.getElementById('txnCategoria').value;
        var metodo = document.getElementById('txnMetodo').value;
        var parcelas = parseInt(document.getElementById('txnParcelas').value);
        var quem = document.getElementById('txnQuem').value;
        var descricao = document.getElementById('txnDescricao').value || '';
        var tipoGasto = document.getElementById('txnTipoGasto').value;
        
        var agora = new Date();
        var mesReferencia = agora.getMonth() + 1;
        var diasSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
        var diaSemana = diasSemana[agora.getDay()];
        var hora = agora.toLocaleTimeString('pt-BR');
        
        var dados = {
            valor: valor,
            tipo: tipo,
            categoria: categoria,
            subcategoria: '',
            metodo: metodo,
            parcelas: parcelas,
            quem: quem,
            descricao: descricao,
            tipo_gasto: tipoGasto,
            mes_referencia: mesReferencia,
            dia_semana: diaSemana,
            hora: hora,
            data_hora: agora.toISOString()
        };
        
        console.log('Enviando dados:', dados);
        
        try {
            var { data, error } = await supabase
                .from('lancamentos')
                .insert([dados]);
            
            if (error) {
                console.error('Erro Supabase:', error);
                if (window.showNotification) window.showNotification('❌ Erro: ' + error.message, 'error');
                return;
            }
            
            console.log('Sucesso:', data);
            if (window.showNotification) window.showNotification('✅ Lançamento salvo com sucesso!', 'success');
            
            // Recarregar dados
            setTimeout(function() { carregarDados(); }, 500);
            
        } catch (error) {
            console.error('Erro ao salvar:', error);
            if (window.showNotification) window.showNotification('❌ Erro ao salvar. Tente novamente.', 'error');
        }
    }
    
    async function carregarDados() {
        if (!supabase) {
            console.log('Aguardando Supabase...');
            return;
        }
        
        console.log('Carregando dados do Supabase...');
        
        var { data, error } = await supabase
            .from('lancamentos')
            .select('*')
            .order('data_hora', { ascending: false });
        
        if (error) {
            console.error('Erro ao carregar:', error);
            return;
        }
        
        console.log('Dados recebidos:', data.length);
        
        // Converter dados do Supabase para o formato do app
        window.rawData = data.map(function(item) {
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
        
        // Atualizar visualizações
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderTable === 'function') renderTable();
        if (typeof renderForecast === 'function') renderForecast();
        if (typeof renderDailyChart === 'function') renderDailyChart();
        if (typeof renderAnalytics === 'function') renderAnalytics();
        if (typeof renderPersonDashboard === 'function') renderPersonDashboard();
        
        // Atualizar timestamp
        var now = new Date();
        var updateEl = document.getElementById('lastUpdate');
        if (updateEl) updateEl.innerText = 'Última atualização: ' + now.toLocaleString();
        
        console.log('Dados carregados do Supabase:', window.rawData.length);
    }
    
    function configurarRealtime() {
        if (!supabase) return;
        
        supabase
            .channel('lancamentos')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'lancamentos' }, function(payload) {
                console.log('Mudança detectada em tempo real:', payload.eventType);
                carregarDados();
            })
            .subscribe();
    }
    
    // Expor funções globalmente
    window.carregarDadosSupabase = carregarDados;
    
    document.addEventListener('DOMContentLoaded', initSupabase);
})();
