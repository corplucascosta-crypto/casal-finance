// Fixed Income Module - Sincronizado via Supabase (VERSÃO ESTÁVEL)
(function() {
    if (window.fixedIncomeInitialized) {
        console.log('FixedIncome já inicializado');
        return;
    }
    window.fixedIncomeInitialized = true;
    
    var supabase = null;
    var botaoConfigurado = false;
    
    function initFixedIncome() {
        console.log('Inicializando FixedIncome...');
        
        // Aguardar Supabase estar disponível
        var checkSupabase = setInterval(function() {
            if (window.supabaseClient && window.supabaseClient.supabase) {
                supabase = window.supabaseClient.supabase;
                clearInterval(checkSupabase);
                console.log('FixedIncome: Supabase conectado');
                carregarReceitasFixas();
                configurarBotao();
                configurarRealtimeReceitas();
            }
        }, 500);
    }
    
    async function carregarReceitasFixas() {
        if (!supabase) return;
        
        console.log('Carregando receitas fixas...');
        
        var { data, error } = await supabase
            .from('receitas_fixas')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) {
            console.error('Erro ao carregar:', error);
            return;
        }
        
        window.fixedIncomes = data || [];
        console.log('Receitas carregadas:', window.fixedIncomes.length);
        renderizarLista();
        
        // Atualizar forecast se disponível
        if (typeof renderForecast === 'function') renderForecast();
    }
    
    function configurarBotao() {
        if (botaoConfigurado) return;
        botaoConfigurado = true;
        
        // Aguardar o botão existir
        var checkBotao = setInterval(function() {
            var addBtn = document.getElementById('addFixedIncomeBtn');
            if (addBtn && !addBtn.hasAttribute('data-listener')) {
                clearInterval(checkBotao);
                
                // Marcar que o listener já foi adicionado
                addBtn.setAttribute('data-listener', 'true');
                
                addBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    var pessoa = document.getElementById('fixedIncomePerson').value;
                    var descricao = document.getElementById('fixedIncomeDesc').value;
                    var valor = parseFloat(document.getElementById('fixedIncomeValue').value);
                    
                    if (!descricao || !valor || valor <= 0) {
                        if (window.showNotification) window.showNotification('Preencha todos os campos', 'error');
                        return;
                    }
                    
                    // Desabilitar botão temporariamente
                    addBtn.disabled = true;
                    addBtn.textContent = '⏳ Salvando...';
                    
                    salvarReceitaFixa(pessoa, descricao, valor).then(function() {
                        addBtn.disabled = false;
                        addBtn.textContent = '➕ Adicionar';
                        document.getElementById('fixedIncomeDesc').value = '';
                        document.getElementById('fixedIncomeValue').value = '';
                    });
                });
                
                console.log('Botão de adicionar configurado');
            }
        }, 500);
    }
    
    async function salvarReceitaFixa(pessoa, descricao, valor) {
        if (!supabase) return false;
        
        console.log('Salvando:', { pessoa, descricao, valor });
        
        var { error } = await supabase
            .from('receitas_fixas')
            .insert([{
                pessoa: pessoa,
                descricao: descricao,
                valor: valor,
                ativo: true
            }]);
        
        if (error) {
            console.error('Erro:', error);
            if (window.showNotification) window.showNotification('❌ Erro ao salvar', 'error');
            return false;
        }
        
        console.log('Salvo com sucesso');
        if (window.showNotification) window.showNotification('✅ Receita fixa adicionada!', 'success');
        
        // Recarregar a lista
        await carregarReceitasFixas();
        return true;
    }
    
    async function atualizarReceitaFixa(id, ativo) {
        if (!supabase) return;
        
        var { error } = await supabase
            .from('receitas_fixas')
            .update({ ativo: ativo })
            .eq('id', id);
        
        if (error) {
            console.error('Erro ao atualizar:', error);
            return;
        }
        
        await carregarReceitasFixas();
    }
    
    async function deletarReceitaFixa(id) {
        if (!supabase) return;
        
        var { error } = await supabase
            .from('receitas_fixas')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Erro ao deletar:', error);
            return;
        }
        
        await carregarReceitasFixas();
        if (window.showNotification) window.showNotification('🗑️ Receita removida', 'info');
    }
    
    function renderizarLista() {
        var container = document.getElementById('fixedIncomeList');
        if (!container) return;
        
        if (!window.fixedIncomes || window.fixedIncomes.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 20px;">Nenhuma receita fixa cadastrada.</p>';
            return;
        }
        
        var lucasIncomes = window.fixedIncomes.filter(function(inc) { return inc.pessoa === 'LUCAS'; });
        var beatrizIncomes = window.fixedIncomes.filter(function(inc) { return inc.pessoa === 'BEATRIZ'; });
        
        var lucasTotal = 0;
        lucasIncomes.forEach(function(inc) { if (inc.ativo) lucasTotal += inc.valor; });
        
        var beatrizTotal = 0;
        beatrizIncomes.forEach(function(inc) { if (inc.ativo) beatrizTotal += inc.valor; });
        
        var html = '<div style="display: flex; gap: 20px; flex-wrap: wrap;">';
        
        // LUCAS
        html += '<div style="flex: 1; min-width: 250px; background: #f8fafc; border-radius: 16px; padding: 16px;">';
        html += '<h3 style="color: #3b82f6; margin-bottom: 12px;">👨 LUCAS</h3>';
        html += '<div style="background: #dbeafe; border-radius: 12px; padding: 8px 12px; margin-bottom: 16px;"><strong>Total mensal:</strong> R$ ' + lucasTotal.toFixed(2) + '</div>';
        
        if (lucasIncomes.length === 0) {
            html += '<p style="color: #94a3b8;">Nenhuma receita cadastrada</p>';
        } else {
            lucasIncomes.forEach(function(inc) {
                html += '<div style="background: white; border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; ' + (!inc.ativo ? 'opacity: 0.5;' : '') + '">';
                html += '<div><strong>' + inc.descricao + '</strong><br><span style="color: #10b981;">R$ ' + inc.valor.toFixed(2) + '</span></div>';
                html += '<div><button class="toggle-fixed" data-id="' + inc.id + '" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;">' + (inc.ativo ? '✅' : '⭕') + '</button>';
                html += '<button class="delete-fixed" data-id="' + inc.id + '" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;">🗑️</button></div>';
                html += '</div>';
            });
        }
        html += '</div>';
        
        // BEATRIZ
        html += '<div style="flex: 1; min-width: 250px; background: #f8fafc; border-radius: 16px; padding: 16px;">';
        html += '<h3 style="color: #ec489a; margin-bottom: 12px;">👩 BEATRIZ</h3>';
        html += '<div style="background: #fce7f3; border-radius: 12px; padding: 8px 12px; margin-bottom: 16px;"><strong>Total mensal:</strong> R$ ' + beatrizTotal.toFixed(2) + '</div>';
        
        if (beatrizIncomes.length === 0) {
            html += '<p style="color: #94a3b8;">Nenhuma receita cadastrada</p>';
        } else {
            beatrizIncomes.forEach(function(inc) {
                html += '<div style="background: white; border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; ' + (!inc.ativo ? 'opacity: 0.5;' : '') + '">';
                html += '<div><strong>' + inc.descricao + '</strong><br><span style="color: #10b981;">R$ ' + inc.valor.toFixed(2) + '</span></div>';
                html += '<div><button class="toggle-fixed" data-id="' + inc.id + '" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;">' + (inc.ativo ? '✅' : '⭕') + '</button>';
                html += '<button class="delete-fixed" data-id="' + inc.id + '" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;">🗑️</button></div>';
                html += '</div>';
            });
        }
        html += '</div>';
        html += '</div>';
        
        container.innerHTML = html;
        
        // Eventos toggle
        document.querySelectorAll('.toggle-fixed').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(btn.dataset.id);
                var income = window.fixedIncomes.find(function(i) { return i.id === id; });
                if (income) atualizarReceitaFixa(id, !income.ativo);
            });
        });
        
        // Eventos delete
        document.querySelectorAll('.delete-fixed').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(btn.dataset.id);
                if (confirm('Remover esta receita fixa?')) deletarReceitaFixa(id);
            });
        });
    }
    
    function configurarRealtimeReceitas() {
        if (!supabase) return;
        
        supabase
            .channel('receitas_fixas')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'receitas_fixas' }, function() {
                console.log('Mudança em receitas fixas - recarregando');
                carregarReceitasFixas();
            })
            .subscribe();
    }
    
    document.addEventListener('DOMContentLoaded', initFixedIncome);
})();
