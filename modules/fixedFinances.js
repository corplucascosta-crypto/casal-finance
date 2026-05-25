// Fixed Finances Module - Exatamente como no print
(function() {
    if (window.fixedFinancesInitialized) return;
    window.fixedFinancesInitialized = true;
    
    var supabase = null;
    
    function initFixedFinances() {
        var checkSupabase = setInterval(function() {
            if (window.supabaseClient && window.supabaseClient.supabase) {
                supabase = window.supabaseClient.supabase;
                clearInterval(checkSupabase);
                console.log('FixedFinances: Supabase conectado');
                carregarReceitas();
                carregarDespesas();
                criarInterface();
                configurarRealtime();
            }
        }, 500);
    }
    
    function criarInterface() {
        var container = document.getElementById('fixedIncomeList');
        if (!container) return;
        
        container.innerHTML = `
            <div class="fixed-finances-container">
                <div class="abas-container">
                    <button class="aba-btn active" data-aba="receitas">💰 Receitas Fixas</button>
                    <button class="aba-btn" data-aba="despesas">💸 Despesas Fixas</button>
                </div>
                
                <!-- PAINEL RECEITAS FIXAS -->
                <div id="receitasPanel" class="panel active">
                    <div class="form-panel">
                        <h4>➕ Nova Receita Fixa</h4>
                        <div class="form-row">
                            <select id="fixReceitaPessoa" class="form-input">
                                <option value="LUCAS">👨 LUCAS</option>
                                <option value="BEATRIZ">👩 BEATRIZ</option>
                            </select>
                            <input type="text" id="fixReceitaDesc" placeholder="Descrição (ex: Salário)" class="form-input">
                            <input type="number" step="0.01" id="fixReceitaValor" placeholder="Valor (R$)" class="form-input">
                            <button id="addReceitaBtn" class="form-btn success">➕ Adicionar</button>
                        </div>
                    </div>
                    <div id="receitasLista" class="items-list"></div>
                </div>
                
                <!-- PAINEL DESPESAS FIXAS -->
                <div id="despesasPanel" class="panel">
                    <div class="form-panel">
                        <h4>➕ Nova Despesa Fixa</h4>
                        <div class="form-row">
                            <select id="fixDespesaPessoa" class="form-input">
                                <option value="LUCAS">👨 LUCAS</option>
                                <option value="BEATRIZ">👩 BEATRIZ</option>
                            </select>
                            <input type="text" id="fixDespesaDesc" placeholder="Descrição (ex: Aluguel, Netflix)" class="form-input">
                            <input type="number" step="0.01" id="fixDespesaValor" placeholder="Valor (R$)" class="form-input">
                            <select id="fixDespesaCategoria" class="form-input">
                                <option value="Moradia">🏠 Moradia</option>
                                <option value="Serviços">📡 Serviços</option>
                                <option value="Transporte">🚗 Transporte</option>
                                <option value="Saúde">💊 Saúde</option>
                                <option value="Educação">📚 Educação</option>
                                <option value="Alimentação">🍔 Alimentação</option>
                                <option value="Lazer">🎮 Lazer</option>
                                <option value="Vestuário">👕 Vestuário</option>
                                <option value="Investimentos">📈 Investimentos</option>
                                <option value="Outros">📌 Outros</option>
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
            });
        });
        
        // Botão Adicionar Receita
        document.getElementById('addReceitaBtn').addEventListener('click', function() {
            var pessoa = document.getElementById('fixReceitaPessoa').value;
            var descricao = document.getElementById('fixReceitaDesc').value;
            var valor = parseFloat(document.getElementById('fixReceitaValor').value);
            if (!descricao) { alert('Digite uma descrição'); return; }
            if (!valor || valor <= 0) { alert('Digite um valor válido'); return; }
            adicionarReceita(pessoa, descricao, valor);
            document.getElementById('fixReceitaDesc').value = '';
            document.getElementById('fixReceitaValor').value = '';
        });
        
        // Botão Adicionar Despesa
        document.getElementById('addDespesaBtn').addEventListener('click', function() {
            var pessoa = document.getElementById('fixDespesaPessoa').value;
            var descricao = document.getElementById('fixDespesaDesc').value;
            var valor = parseFloat(document.getElementById('fixDespesaValor').value);
            var categoria = document.getElementById('fixDespesaCategoria').value;
            if (!descricao) { alert('Digite uma descrição'); return; }
            if (!valor || valor <= 0) { alert('Digite um valor válido'); return; }
            adicionarDespesa(pessoa, descricao, valor, categoria);
            document.getElementById('fixDespesaDesc').value = '';
            document.getElementById('fixDespesaValor').value = '';
        });
    }
    
    async function carregarReceitas() {
        if (!supabase) return;
        var { data, error } = await supabase.from('receitas_fixas').select('*').order('id');
        if (error) { console.error(error); return; }
        window.receitasFixas = data || [];
        renderizarReceitas();
        atualizarForecast();
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
    }
    
    async function adicionarDespesa(pessoa, descricao, valor, categoria) {
        var { error } = await supabase.from('despesas_fixas').insert([{ pessoa, descricao, valor, categoria, ativo: true }]);
        if (error) { alert('Erro: ' + error.message); return; }
        if (window.showNotification) window.showNotification('✅ Despesa fixa adicionada!', 'success');
        carregarDespesas();
    }
    
    async function toggleReceita(id, ativo) {
        await supabase.from('receitas_fixas').update({ ativo: ativo }).eq('id', id);
        carregarReceitas();
    }
    
    async function toggleDespesa(id, ativo) {
        await supabase.from('despesas_fixas').update({ ativo: ativo }).eq('id', id);
        carregarDespesas();
    }
    
    async function deletarReceita(id) {
        if (confirm('Remover esta receita fixa?')) {
            await supabase.from('receitas_fixas').delete().eq('id', id);
            carregarReceitas();
        }
    }
    
    async function deletarDespesa(id) {
        if (confirm('Remover esta despesa fixa?')) {
            await supabase.from('despesas_fixas').delete().eq('id', id);
            carregarDespesas();
        }
    }
    
    function renderizarReceitas() {
        var container = document.getElementById('receitasLista');
        if (!container) return;
        
        var receitas = window.receitasFixas || [];
        var lucasReceitas = receitas.filter(function(r) { return r.pessoa === 'LUCAS'; });
        var beatrizReceitas = receitas.filter(function(r) { return r.pessoa === 'BEATRIZ'; });
        var lucasTotal = 0;
        for (var i = 0; i < lucasReceitas.length; i++) {
            if (lucasReceitas[i].ativo) lucasTotal += lucasReceitas[i].valor;
        }
        var beatrizTotal = 0;
        for (var i = 0; i < beatrizReceitas.length; i++) {
            if (beatrizReceitas[i].ativo) beatrizTotal += beatrizReceitas[i].valor;
        }
        
        var html = '<div class="fixed-grid">';
        
        // Coluna LUCAS
        html += '<div class="fixed-col">';
        html += '<div class="col-header" style="background: #3b82f6;">👨 LUCAS</div>';
        html += '<div class="col-total" style="background: #dbeafe;">💰 Total: R$ ' + lucasTotal.toFixed(2) + '</div>';
        if (lucasReceitas.length === 0) {
            html += '<div class="col-empty">Nenhuma receita cadastrada</div>';
        } else {
            for (var i = 0; i < lucasReceitas.length; i++) {
                var item = lucasReceitas[i];
                var classe = item.ativo ? '' : 'inactive';
                html += '<div class="fixed-item ' + classe + '">';
                html += '<div><strong>' + item.descricao + '</strong></div>';
                html += '<div class="item-value">R$ ' + item.valor.toFixed(2) + '</div>';
                html += '<div class="item-actions">';
                html += '<button class="toggle-receita" data-id="' + item.id + '" data-ativo="' + item.ativo + '">' + (item.ativo ? '✅' : '⭕') + '</button>';
                html += '<button class="delete-receita" data-id="' + item.id + '">🗑️</button>';
                html += '</div></div>';
            }
        }
        html += '</div>';
        
        // Coluna BEATRIZ
        html += '<div class="fixed-col">';
        html += '<div class="col-header" style="background: #ec489a;">👩 BEATRIZ</div>';
        html += '<div class="col-total" style="background: #fce7f3;">💰 Total: R$ ' + beatrizTotal.toFixed(2) + '</div>';
        if (beatrizReceitas.length === 0) {
            html += '<div class="col-empty">Nenhuma receita cadastrada</div>';
        } else {
            for (var i = 0; i < beatrizReceitas.length; i++) {
                var item = beatrizReceitas[i];
                var classe = item.ativo ? '' : 'inactive';
                html += '<div class="fixed-item ' + classe + '">';
                html += '<div><strong>' + item.descricao + '</strong></div>';
                html += '<div class="item-value">R$ ' + item.valor.toFixed(2) + '</div>';
                html += '<div class="item-actions">';
                html += '<button class="toggle-receita" data-id="' + item.id + '" data-ativo="' + item.ativo + '">' + (item.ativo ? '✅' : '⭕') + '</button>';
                html += '<button class="delete-receita" data-id="' + item.id + '">🗑️</button>';
                html += '</div></div>';
            }
        }
        html += '</div>';
        
        html += '</div>';
        container.innerHTML = html;
        
        // Eventos para receitas
        var toggleBtns = document.querySelectorAll('.toggle-receita');
        for (var i = 0; i < toggleBtns.length; i++) {
            toggleBtns[i].addEventListener('click', function(e) {
                var btn = e.currentTarget;
                var id = parseInt(btn.dataset.id);
                var ativo = btn.dataset.ativo === 'true' ? false : true;
                toggleReceita(id, ativo);
            });
        }
        
        var deleteBtns = document.querySelectorAll('.delete-receita');
        for (var i = 0; i < deleteBtns.length; i++) {
            deleteBtns[i].addEventListener('click', function(e) {
                var btn = e.currentTarget;
                var id = parseInt(btn.dataset.id);
                deletarReceita(id);
            });
        }
    }
    
    function renderizarDespesas() {
        var container = document.getElementById('despesasLista');
        if (!container) return;
        
        var emojis = { 'Moradia': '🏠', 'Serviços': '📡', 'Transporte': '🚗', 'Saúde': '💊', 'Educação': '📚', 'Alimentação': '🍔', 'Lazer': '🎮', 'Vestuário': '👕', 'Investimentos': '📈', 'Outros': '📌' };
        
        var despesas = window.despesasFixas || [];
        var lucasDespesas = despesas.filter(function(d) { return d.pessoa === 'LUCAS'; });
        var beatrizDespesas = despesas.filter(function(d) { return d.pessoa === 'BEATRIZ'; });
        var lucasTotal = 0;
        for (var i = 0; i < lucasDespesas.length; i++) {
            if (lucasDespesas[i].ativo) lucasTotal += lucasDespesas[i].valor;
        }
        var beatrizTotal = 0;
        for (var i = 0; i < beatrizDespesas.length; i++) {
            if (beatrizDespesas[i].ativo) beatrizTotal += beatrizDespesas[i].valor;
        }
        
        var html = '<div class="fixed-grid">';
        
        // Coluna LUCAS
        html += '<div class="fixed-col">';
        html += '<div class="col-header" style="background: #3b82f6;">👨 LUCAS</div>';
        html += '<div class="col-total" style="background: #fee2e2;">💸 Total: R$ ' + lucasTotal.toFixed(2) + '</div>';
        if (lucasDespesas.length === 0) {
            html += '<div class="col-empty">Nenhuma despesa cadastrada</div>';
        } else {
            for (var i = 0; i < lucasDespesas.length; i++) {
                var item = lucasDespesas[i];
                var classe = item.ativo ? '' : 'inactive';
                var emoji = emojis[item.categoria] || '📌';
                html += '<div class="fixed-item ' + classe + '">';
                html += '<div><strong>' + item.descricao + '</strong>';
                if (item.categoria) html += '<br><small>' + emoji + ' ' + item.categoria + '</small>';
                html += '</div>';
                html += '<div class="item-value">R$ ' + item.valor.toFixed(2) + '</div>';
                html += '<div class="item-actions">';
                html += '<button class="toggle-despesa" data-id="' + item.id + '" data-ativo="' + item.ativo + '">' + (item.ativo ? '✅' : '⭕') + '</button>';
                html += '<button class="delete-despesa" data-id="' + item.id + '">🗑️</button>';
                html += '</div></div>';
            }
        }
        html += '</div>';
        
        // Coluna BEATRIZ
        html += '<div class="fixed-col">';
        html += '<div class="col-header" style="background: #ec489a;">👩 BEATRIZ</div>';
        html += '<div class="col-total" style="background: #fee2e2;">💸 Total: R$ ' + beatrizTotal.toFixed(2) + '</div>';
        if (beatrizDespesas.length === 0) {
            html += '<div class="col-empty">Nenhuma despesa cadastrada</div>';
        } else {
            for (var i = 0; i < beatrizDespesas.length; i++) {
                var item = beatrizDespesas[i];
                var classe = item.ativo ? '' : 'inactive';
                var emoji = emojis[item.categoria] || '📌';
                html += '<div class="fixed-item ' + classe + '">';
                html += '<div><strong>' + item.descricao + '</strong>';
                if (item.categoria) html += '<br><small>' + emoji + ' ' + item.categoria + '</small>';
                html += '</div>';
                html += '<div class="item-value">R$ ' + item.valor.toFixed(2) + '</div>';
                html += '<div class="item-actions">';
                html += '<button class="toggle-despesa" data-id="' + item.id + '" data-ativo="' + item.ativo + '">' + (item.ativo ? '✅' : '⭕') + '</button>';
                html += '<button class="delete-despesa" data-id="' + item.id + '">🗑️</button>';
                html += '</div></div>';
            }
        }
        html += '</div>';
        
        html += '</div>';
        container.innerHTML = html;
        
        // Eventos para despesas
        var toggleBtns = document.querySelectorAll('.toggle-despesa');
        for (var i = 0; i < toggleBtns.length; i++) {
            toggleBtns[i].addEventListener('click', function(e) {
                var btn = e.currentTarget;
                var id = parseInt(btn.dataset.id);
                var ativo = btn.dataset.ativo === 'true' ? false : true;
                toggleDespesa(id, ativo);
            });
        }
        
        var deleteBtns = document.querySelectorAll('.delete-despesa');
        for (var i = 0; i < deleteBtns.length; i++) {
            deleteBtns[i].addEventListener('click', function(e) {
                var btn = e.currentTarget;
                var id = parseInt(btn.dataset.id);
                deletarDespesa(id);
            });
        }
    }
    
    function atualizarForecast() {
        setTimeout(function() {
            if (typeof renderForecast === 'function') renderForecast();
            if (typeof renderDashboard === 'function') renderDashboard();
        }, 500);
    }
    
    function configurarRealtime() {
        if (!supabase) return;
        supabase.channel('fixed_finances')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'receitas_fixas' }, function() { carregarReceitas(); })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'despesas_fixas' }, function() { carregarDespesas(); })
            .subscribe();
    }
    
    document.addEventListener('DOMContentLoaded', initFixedFinances);
})();
