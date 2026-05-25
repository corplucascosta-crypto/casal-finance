// Fixed Finances Module - Apenas visualização (sem formulário de adição)
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
                <div id="receitasPanel" class="panel active">
                    <div id="receitasLista" class="items-list"></div>
                </div>
                <div id="despesasPanel" class="panel">
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
        var lucasReceitas = receitas.filter(r => r.pessoa === 'LUCAS');
        var beatrizReceitas = receitas.filter(r => r.pessoa === 'BEATRIZ');
        var lucasTotal = lucasReceitas.filter(r => r.ativo).reduce((s, r) => s + r.valor, 0);
        var beatrizTotal = beatrizReceitas.filter(r => r.ativo).reduce((s, r) => s + r.valor, 0);
        
        var html = '<div class="fixed-grid">';
        html += gerarColunaReceita('👨 LUCAS', lucasReceitas, lucasTotal);
        html += gerarColunaReceita('👩 BEATRIZ', beatrizReceitas, beatrizTotal);
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
        html += gerarColunaDespesa('👨 LUCAS', lucasDespesas, lucasTotal);
        html += gerarColunaDespesa('👩 BEATRIZ', beatrizDespesas, beatrizTotal);
        html += '</div>';
        container.innerHTML = html;
        
        document.querySelectorAll('.toggle-despesa').forEach(btn => {
            btn.addEventListener('click', () => toggleDespesa(parseInt(btn.dataset.id), btn.dataset.ativo === 'true' ? false : true));
        });
        document.querySelectorAll('.delete-despesa').forEach(btn => {
            btn.addEventListener('click', () => deletarDespesa(parseInt(btn.dataset.id)));
        });
    }
    
    function gerarColunaReceita(titulo, itens, total) {
        var html = '<div class="fixed-col"><div class="col-header" style="background: #3b82f6;">' + titulo + '</div>';
        html += '<div class="col-total" style="background: #dbeafe;">💰 Total: R$ ' + total.toFixed(2) + '</div>';
        if (itens.length === 0) {
            html += '<div class="col-empty">Nenhuma receita cadastrada</div>';
        } else {
            for (var i = 0; i < itens.length; i++) {
                var item = itens[i];
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
        return html;
    }
    
    function gerarColunaDespesa(titulo, itens, total) {
        var emojis = { 'Moradia': '🏠', 'Serviços': '📡', 'Transporte': '🚗', 'Saúde': '💊', 'Educação': '📚', 'Alimentação': '🍔', 'Lazer': '🎮', 'Vestuário': '👕', 'Investimentos': '📈', 'Outros': '📌' };
        
        var html = '<div class="fixed-col"><div class="col-header" style="background: #ef4444;">' + titulo + '</div>';
        html += '<div class="col-total" style="background: #fee2e2;">💸 Total: R$ ' + total.toFixed(2) + '</div>';
        if (itens.length === 0) {
            html += '<div class="col-empty">Nenhuma despesa cadastrada</div>';
        } else {
            for (var i = 0; i < itens.length; i++) {
                var item = itens[i];
                var classe = item.ativo ? '' : 'inactive';
                var emoji = emojis[item.categoria] || '📌';
                html += '<div class="fixed-item ' + classe + '">';
                html += '<div><strong>' + item.descricao + '</strong>';
                if (item.categoria) html += '<br><small>' + emoji + ' ' + item.categoria + '</small>';
                if (item.vencimento) html += '<br><small>📅 Vence dia ' + item.vencimento + '</small>';
                html += '</div>';
                html += '<div class="item-value">R$ ' + item.valor.toFixed(2) + '</div>';
                html += '<div class="item-actions">';
                html += '<button class="toggle-despesa" data-id="' + item.id + '" data-ativo="' + item.ativo + '">' + (item.ativo ? '✅' : '⭕') + '</button>';
                html += '<button class="delete-despesa" data-id="' + item.id + '">🗑️</button>';
                html += '</div></div>';
            }
        }
        html += '</div>';
        return html;
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
