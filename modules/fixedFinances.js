// Fixed Finances Module - Receitas e Despesas Fixas Unificado
(function() {
    if (window.fixedFinancesInitialized) return;
    window.fixedFinancesInitialized = true;
    
    var supabase = null;
    var abaAtiva = 'receitas';
    
    // Categorias padronizadas com emojis
    var categoriasDespesas = [
        { valor: 'Moradia', emoji: '🏠', label: 'Moradia' },
        { valor: 'Serviços', emoji: '📡', label: 'Serviços (Internet, Streaming)' },
        { valor: 'Transporte', emoji: '🚗', label: 'Transporte' },
        { valor: 'Saúde', emoji: '💊', label: 'Saúde' },
        { valor: 'Educação', emoji: '📚', label: 'Educação' },
        { valor: 'Alimentação', emoji: '🍔', label: 'Alimentação' },
        { valor: 'Lazer', emoji: '🎮', label: 'Lazer' },
        { valor: 'Vestuário', emoji: '👕', label: 'Vestuário' },
        { valor: 'Investimentos', emoji: '📈', label: 'Investimentos' },
        { valor: 'Outros', emoji: '📌', label: 'Outros (justificar no campo descrição)' }
    ];
    
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
        
        // Gerar options de categorias
        var categoriasOptions = '';
        for (var i = 0; i < categoriasDespesas.length; i++) {
            var cat = categoriasDespesas[i];
            categoriasOptions += '<option value="' + cat.valor + '">' + cat.emoji + ' ' + cat.label + '</option>';
        }
        
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
                                ${categoriasOptions}
                            </select>
                            <select id="fixDespesaVencimento" class="form-input">
                                <option value="">Dia vencimento</option>
                                <option value="1">Dia 1</option><option value="2">Dia 2</option><option value="3">Dia 3</option>
                                <option value="4">Dia 4</option><option value="5">Dia 5</option><option value="6">Dia 6</option>
                                <option value="7">Dia 7</option><option value="8">Dia 8</option><option value="9">Dia 9</option>
                                <option value="10">Dia 10</option><option value="11">Dia 11</option><option value="12">Dia 12</option>
                                <option value="13">Dia 13</option><option value="14">Dia 14</option><option value="15">Dia 15</option>
                                <option value="16">Dia 16</option><option value="17">Dia 17</option><option value="18">Dia 18</option>
                                <option value="19">Dia 19</option><option value="20">Dia 20</option><option value="21">Dia 21</option>
                                <option value="22">Dia 22</option><option value="23">Dia 23</option><option value="24">Dia 24</option>
                                <option value="25">Dia 25</option><option value="26">Dia 26</option><option value="27">Dia 27</option>
                                <option value="28">Dia 28</option><option value="29">Dia 29</option><option value="30">Dia 30</option>
                                <option value="31">Dia 31</option>
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
            if (!descricao) { alert('Digite uma descrição'); return; }
            if (!valor || valor <= 0) { alert('Digite um valor válido'); return; }
            adicionarReceita(pessoa, descricao, valor);
        });
        
        document.getElementById('addDespesaBtn').addEventListener('click', function() {
            var pessoa = document.getElementById('fixDespesaPessoa').value;
            var descricao = document.getElementById('fixDespesaDesc').value;
            var valor = parseFloat(document.getElementById('fixDespesaValor').value);
            var categoria = document.getElementById('fixDespesaCategoria').value;
            var vencimento = parseInt(document.getElementById('fixDespesaVencimento').value);
            if (!descricao) { alert('Digite uma descrição'); return; }
            if (!valor || valor <= 0) { alert('Digite um valor válido'); return; }
            adicionarDespesa(pessoa, descricao, valor, categoria, vencimento);
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
        limparCampos('fixReceita');
    }
    
    async function adicionarDespesa(pessoa, descricao, valor, categoria, vencimento) {
        var { error } = await supabase.from('despesas_fixas').insert([{ pessoa, descricao, valor, categoria, vencimento: vencimento || null, ativo: true }]);
        if (error) { alert('Erro: ' + error.message); return; }
        if (window.showNotification) window.showNotification('✅ Despesa fixa adicionada!', 'success');
        carregarDespesas();
        limparCampos('fixDespesa');
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
        if (itens.length === 0) html += '<div class="col-empty">Nenhuma receita cadastrada</div>';
        else {
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
        var html = '<div class="fixed-col"><div class="col-header" style="background: #ef4444;">' + titulo + '</div>';
        html += '<div class="col-total" style="background: #fee2e2;">💸 Total: R$ ' + total.toFixed(2) + '</div>';
        if (itens.length === 0) html += '<div class="col-empty">Nenhuma despesa cadastrada</div>';
        else {
            for (var i = 0; i < itens.length; i++) {
                var item = itens[i];
                var classe = item.ativo ? '' : 'inactive';
                var emoji = obterEmojiCategoria(item.categoria);
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
    
    function obterEmojiCategoria(categoria) {
        var emojis = {
            'Moradia': '🏠', 'Serviços': '📡', 'Transporte': '🚗', 'Saúde': '💊',
            'Educação': '📚', 'Alimentação': '🍔', 'Lazer': '🎮', 'Vestuário': '👕',
            'Investimentos': '📈', 'Outros': '📌'
        };
        return emojis[categoria] || '📌';
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
            .on('postgres_changes', { event: '*', schema: 'public', table: 'receitas_fixas' }, function() { carregarReceitas(); })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'despesas_fixas' }, function() { carregarDespesas(); })
            .subscribe();
    }
    
    document.addEventListener('DOMContentLoaded', initFixedFinances);
})();
