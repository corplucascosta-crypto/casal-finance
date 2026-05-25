// Fixed Finances Module - Receitas e Despesas Fixas Unificado
(function() {
    if (window.fixedFinancesInitialized) return;
    window.fixedFinancesInitialized = true;
    
    var supabase = null;
    var abaAtiva = 'receitas';
    
    function initFixedFinances() {
        var checkSupabase = setInterval(function() {
            if (window.supabaseClient && window.supabaseClient.supabase) {
                supabase = window.supabaseClient.supabase;
                clearInterval(checkSupabase);
                console.log('FixedFinances: Supabase conectado');
                carregarReceitas();
                carregarDespesas();
                criarInterface();
                configurarBotoes();
                configurarRealtime();
            }
        }, 500);
    }
    
    function criarInterface() {
        var container = document.getElementById('fixedIncomeList');
        if (!container) return;
        
        // Criar estrutura com abas
        container.innerHTML = `
            <div class="fixed-finances-container">
                <div class="abas-container">
                    <button class="aba-btn active" data-aba="receitas">💰 Receitas Fixas</button>
                    <button class="aba-btn" data-aba="despesas">💸 Despesas Fixas</button>
                </div>
                <div id="receitasPanel" class="panel active">
                    <div class="form-panel">
                        <h4>➕ Nova Receita Fixa</h4>
                        <div class="form-row">
                            <select id="fixReceitaPessoa" class="form-input">
                                <option value="LUCAS">LUCAS</option>
                                <option value="BEATRIZ">BEATRIZ</option>
                            </select>
                            <input type="text" id="fixReceitaDesc" placeholder="Descrição (ex: Salário)" class="form-input">
                            <input type="number" step="0.01" id="fixReceitaValor" placeholder="Valor (R$)" class="form-input">
                            <button id="addReceitaBtn" class="form-btn success">➕ Adicionar</button>
                        </div>
                    </div>
                    <div id="receitasLista" class="items-list"></div>
                </div>
                <div id="despesasPanel" class="panel">
                    <div class="form-panel">
                        <h4>➕ Nova Despesa Fixa</h4>
                        <div class="form-row">
                            <select id="fixDespesaPessoa" class="form-input">
                                <option value="LUCAS">LUCAS</option>
                                <option value="BEATRIZ">BEATRIZ</option>
                            </select>
                            <input type="text" id="fixDespesaDesc" placeholder="Descrição (ex: Aluguel, Internet)" class="form-input">
                            <input type="number" step="0.01" id="fixDespesaValor" placeholder="Valor (R$)" class="form-input">
                            <select id="fixDespesaCategoria" class="form-input">
                                <option value="Moradia">🏠 Moradia</option>
                                <option value="Serviços">📡 Serviços</option>
                                <option value="Transporte">🚗 Transporte</option>
                                <option value="Saúde">💊 Saúde</option>
                                <option value="Educação">📚 Educação</option>
                                <option value="Outros">📌 Outros</option>
                            </select>
                            <select id="fixDespesaVencimento" class="form-input">
                                <option value="">Dia vencimento</option>
                                <option value="1">Dia 1</option><option value="2">Dia 2</option><option value="3">Dia 3</option>
                                <option value="4">Dia 4</option><option value="5">Dia 5</option><option value="6">Dia 6</option>
                                <option value="7">Dia 7</option><option value="8">Dia 8</option><option value="9">Dia 9</option>
                                <option value="10">Dia 10</option>
                            </select>
                            <button id="addDespesaBtn" class="form-btn warning">➕ Adicionar</button>
                        </div>
                    </div>
                    <div id="despesasLista" class="items-list"></div>
                </div>
            </div>
        `;
        
        // Configurar abas
        document.querySelectorAll('.aba-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var aba = this.dataset.aba;
                document.querySelectorAll('.aba-btn').forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
                document.getElementById(aba + 'Panel').classList.add('active');
                abaAtiva = aba;
            });
        });
        
        // Botões de adicionar
        document.getElementById('addReceitaBtn').addEventListener('click', function() {
            var pessoa = document.getElementById('fixReceitaPessoa').value;
            var descricao = document.getElementById('fixReceitaDesc').value;
            var valor = parseFloat(document.getElementById('fixReceitaValor').value);
            if (descricao && valor > 0) adicionarReceita(pessoa, descricao, valor);
        });
        
        document.getElementById('addDespesaBtn').addEventListener('click', function() {
            var pessoa = document.getElementById('fixDespesaPessoa').value;
            var descricao = document.getElementById('fixDespesaDesc').value;
            var valor = parseFloat(document.getElementById('fixDespesaValor').value);
            var categoria = document.getElementById('fixDespesaCategoria').value;
            var vencimento = parseInt(document.getElementById('fixDespesaVencimento').value);
            if (descricao && valor > 0) adicionarDespesa(pessoa, descricao, valor, categoria, vencimento);
        });
    }
    
    async function carregarReceitas() {
        if (!supabase) return;
        var { data, error } = await supabase.from('receitas_fixas').select('*').order('id');
        if (error) { console.error(error); return; }
        window.receitasFixas = data || [];
        renderizarReceitas();
    }
    
    async function carregarDespesas() {
        if (!supabase) return;
        var { data, error } = await supabase.from('despesas_fixas').select('*').order('id');
        if (error) { console.error(error); return; }
        window.despesasFixas = data || [];
        renderizarDespesas();
        atualizarForecast();
    }
    
    async function adicionarReceita(pessoa, descricao, valor) {
        var { error } = await supabase.from('receitas_fixas').insert([{ pessoa, descricao, valor, ativo: true }]);
        if (error) { alert('Erro: ' + error.message); return; }
        if (window.showNotification) window.showNotification('✅ Receita fixa adicionada!', 'success');
        carregarReceitas();
        atualizarForecast();
        limparCampos('fixReceita');
    }
    
    async function adicionarDespesa(pessoa, descricao, valor, categoria, vencimento) {
        var { error } = await supabase.from('despesas_fixas').insert([{ pessoa, descricao, valor, categoria, vencimento, ativo: true }]);
        if (error) { alert('Erro: ' + error.message); return; }
        if (window.showNotification) window.showNotification('✅ Despesa fixa adicionada!', 'success');
        carregarDespesas();
        limparCampos('fixDespesa');
    }
    
    async function toggleReceita(id, ativo) {
        await supabase.from('receitas_fixas').update({ ativo: ativo }).eq('id', id);
        carregarReceitas();
        atualizarForecast();
    }
    
    async function toggleDespesa(id, ativo) {
        await supabase.from('despesas_fixas').update({ ativo: ativo }).eq('id', id);
        carregarDespesas();
        atualizarForecast();
    }
    
    async function deletarReceita(id) {
        if (confirm('Remover esta receita fixa?')) {
            await supabase.from('receitas_fixas').delete().eq('id', id);
            carregarReceitas();
            atualizarForecast();
        }
    }
    
    async function deletarDespesa(id) {
        if (confirm('Remover esta despesa fixa?')) {
            await supabase.from('despesas_fixas').delete().eq('id', id);
            carregarDespesas();
            atualizarForecast();
        }
    }
    
    function renderizarReceitas() {
        var container = document.getElementById('receitasLista');
        if (!container) return;
        var receitas = window.receitasFixas || [];
        var lucasReceitas = receitas.filter(r => r.pessoa === 'LUCAS');
        var beatrizReceitas = receitas.filter(r => r.pessoa === 'BEATRIZ');
        var lucasTotal = lucasReceitas.filter(r => r.ativo).reduce((s, r) => s + r.valor, 0);
        var beatrizTotal = beatrizReceitas.filter(r => r.ativo).reduce((s, r) => s + r.valor, 0);
        
        var html = '<div class="fixed-grid">';
        html += gerarColuna('👨 LUCAS', lucasReceitas, lucasTotal, 'receita');
        html += gerarColuna('👩 BEATRIZ', beatrizReceitas, beatrizTotal, 'receita');
        html += '</div>';
        container.innerHTML = html;
        
        document.querySelectorAll('.toggle-receita').forEach(btn => {
            btn.addEventListener('click', () => toggleReceita(parseInt(btn.dataset.id), btn.dataset.ativo === 'true' ? false : true));
        });
        document.querySelectorAll('.delete-receita').forEach(btn => {
            btn.addEventListener('click', () => deletarReceita(parseInt(btn.dataset.id)));
        });
    }
    
    function renderizarDespesas() {
        var container = document.getElementById('despesasLista');
        if (!container) return;
        var despesas = window.despesasFixas || [];
        var lucasDespesas = despesas.filter(d => d.pessoa === 'LUCAS');
        var beatrizDespesas = despesas.filter(d => d.pessoa === 'BEATRIZ');
        var lucasTotal = lucasDespesas.filter(d => d.ativo).reduce((s, d) => s + d.valor, 0);
        var beatrizTotal = beatrizDespesas.filter(d => d.ativo).reduce((s, d) => s + d.valor, 0);
        
        var html = '<div class="fixed-grid">';
        html += gerarColuna('👨 LUCAS', lucasDespesas, lucasTotal, 'despesa');
        html += gerarColuna('👩 BEATRIZ', beatrizDespesas, beatrizTotal, 'despesa');
        html += '</div>';
        container.innerHTML = html;
        
        document.querySelectorAll('.toggle-despesa').forEach(btn => {
            btn.addEventListener('click', () => toggleDespesa(parseInt(btn.dataset.id), btn.dataset.ativo === 'true' ? false : true));
        });
        document.querySelectorAll('.delete-despesa').forEach(btn => {
            btn.addEventListener('click', () => deletarDespesa(parseInt(btn.dataset.id)));
        });
    }
    
    function gerarColuna(titulo, itens, total, tipo) {
        var corTitulo = tipo === 'receita' ? '#3b82f6' : '#ef4444';
        var corBg = tipo === 'receita' ? '#dbeafe' : '#fee2e2';
        var html = '<div class="fixed-col"><div class="col-header" style="background: ' + corTitulo + ';">' + titulo + '</div>';
        html += '<div class="col-total" style="background: ' + corBg + ';">Total: R$ ' + total.toFixed(2) + '</div>';
        if (itens.length === 0) html += '<div class="col-empty">Nenhum item cadastrado</div>';
        else {
            for (var i = 0; i < itens.length; i++) {
                var item = itens[i];
                var classe = item.ativo ? '' : 'inactive';
                html += '<div class="fixed-item ' + classe + '">';
                html += '<div><strong>' + item.descricao + '</strong>';
                if (item.categoria) html += '<br><small>' + item.categoria + '</small>';
                if (item.vencimento) html += '<br><small>Vence dia ' + item.vencimento + '</small>';
                html += '</div>';
                html += '<div class="item-value">R$ ' + item.valor.toFixed(2) + '</div>';
                html += '<div class="item-actions">';
                html += '<button class="toggle-' + tipo + '" data-id="' + item.id + '" data-ativo="' + item.ativo + '">' + (item.ativo ? '✅' : '⭕') + '</button>';
                html += '<button class="delete-' + tipo + '" data-id="' + item.id + '">🗑️</button>';
                html += '</div></div>';
            }
        }
        html += '</div>';
        return html;
    }
    
    function limparCampos(prefixo) {
        document.getElementById(prefixo + 'Desc').value = '';
        document.getElementById(prefixo + 'Valor').value = '';
        if (prefixo === 'fixDespesa') {
            document.getElementById('fixDespesaCategoria').value = 'Moradia';
            document.getElementById('fixDespesaVencimento').value = '';
        }
    }
    
    function atualizarForecast() {
        setTimeout(function() {
            if (typeof renderForecast === 'function') renderForecast();
            if (typeof renderDashboard === 'function') renderDashboard();
        }, 500);
    }
    
    function configurarBotoes() {
        var checkBtns = setInterval(function() {
            if (document.getElementById('addReceitaBtn')) {
                clearInterval(checkBtns);
                console.log('Botões configurados');
            }
        }, 500);
    }
    
    function configurarRealtime() {
        if (!supabase) return;
        supabase.channel('fixed_finances')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'receitas_fixas' }, function() { carregarReceitas(); atualizarForecast(); })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'despesas_fixas' }, function() { carregarDespesas(); atualizarForecast(); })
            .subscribe();
    }
    
    document.addEventListener('DOMContentLoaded', initFixedFinances);
})();
