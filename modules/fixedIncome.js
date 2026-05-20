// Fixed Income Module - Sincronizado via Supabase
(function() {
    if (window.fixedIncomeInitialized) return;
    window.fixedIncomeInitialized = true;
    
    var supabase = null;
    
    function initFixedIncome() {
        // Aguardar Supabase estar disponível
        var checkSupabase = setInterval(function() {
            if (window.supabaseClient && window.supabaseClient.supabase) {
                supabase = window.supabaseClient.supabase;
                clearInterval(checkSupabase);
                carregarReceitasFixas();
                setupEvents();
            }
        }, 500);
    }
    
    async function carregarReceitasFixas() {
        if (!supabase) return;
        
        console.log('Carregando receitas fixas do Supabase...');
        
        var { data, error } = await supabase
            .from('receitas_fixas')
            .select('*')
            .order('pessoa', { ascending: true });
        
        if (error) {
            console.error('Erro ao carregar receitas fixas:', error);
            return;
        }
        
        window.fixedIncomes = data.map(function(item) {
            return {
                id: item.id,
                pessoa: item.pessoa,
                descricao: item.descricao,
                valor: item.valor,
                ativo: item.ativo
            };
        });
        
        console.log('Receitas fixas carregadas:', window.fixedIncomes.length);
        renderFixedIncomes();
        
        // Atualizar forecast
        if (typeof renderForecast === 'function') renderForecast();
    }
    
    async function salvarReceitaFixa(pessoa, descricao, valor) {
        if (!supabase) return false;
        
        var { data, error } = await supabase
            .from('receitas_fixas')
            .insert([{
                pessoa: pessoa,
                descricao: descricao,
                valor: valor,
                ativo: true
            }]);
        
        if (error) {
            console.error('Erro ao salvar:', error);
            if (window.showNotification) window.showNotification('❌ Erro ao salvar receita fixa', 'error');
            return false;
        }
        
        console.log('Receita fixa salva:', data);
        await carregarReceitasFixas();
        return true;
    }
    
    async function atualizarReceitaFixa(id, ativo) {
        if (!supabase) return false;
        
        var { error } = await supabase
            .from('receitas_fixas')
            .update({ ativo: ativo, updated_at: new Date().toISOString() })
            .eq('id', id);
        
        if (error) {
            console.error('Erro ao atualizar:', error);
            return false;
        }
        
        await carregarReceitasFixas();
        return true;
    }
    
    async function deletarReceitaFixa(id) {
        if (!supabase) return false;
        
        var { error } = await supabase
            .from('receitas_fixas')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Erro ao deletar:', error);
            return false;
        }
        
        await carregarReceitasFixas();
        return true;
    }
    
    function setupEvents() {
        var addBtn = document.getElementById('addFixedIncomeBtn');
        if (addBtn) {
            addBtn.addEventListener('click', function() {
                var pessoa = document.getElementById('fixedIncomePerson').value;
                var descricao = document.getElementById('fixedIncomeDesc').value;
                var valor = parseFloat(document.getElementById('fixedIncomeValue').value);
                
                if (!descricao || !valor || valor <= 0) {
                    if (window.showNotification) window.showNotification('Preencha todos os campos', 'error');
                    return;
                }
                
                salvarReceitaFixa(pessoa, descricao, valor).then(function(sucesso) {
                    if (sucesso) {
                        document.getElementById('fixedIncomeDesc').value = '';
                        document.getElementById('fixedIncomeValue').value = '';
                        if (window.showNotification) window.showNotification('✅ Receita fixa adicionada!', 'success');
                    }
                });
            });
        }
    }
    
    function renderFixedIncomes() {
        var container = document.getElementById('fixedIncomeList');
        if (!container) return;
        
        if (!window.fixedIncomes || window.fixedIncomes.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #94a3b8;">Nenhuma receita fixa cadastrada.</p>';
            return;
        }
        
        var lucasIncomes = window.fixedIncomes.filter(function(inc) { return inc.pessoa === 'LUCAS'; });
        var beatrizIncomes = window.fixedIncomes.filter(function(inc) { return inc.pessoa === 'BEATRIZ'; });
        
        var lucasTotal = 0;
        for (var i = 0; i < lucasIncomes.length; i++) {
            if (lucasIncomes[i].ativo) lucasTotal += lucasIncomes[i].valor;
        }
        
        var beatrizTotal = 0;
        for (var i = 0; i < beatrizIncomes.length; i++) {
            if (beatrizIncomes[i].ativo) beatrizTotal += beatrizIncomes[i].valor;
        }
        
        var html = '<div style="display: flex; gap: 20px; flex-wrap: wrap;">';
        
        // Coluna LUCAS
        html += '<div style="flex: 1; min-width: 250px; background: #f8fafc; border-radius: 16px; padding: 16px;">';
        html += '<h3 style="color: #3b82f6; margin-bottom: 12px;">👨 LUCAS</h3>';
        html += '<div style="background: #dbeafe; border-radius: 12px; padding: 8px 12px; margin-bottom: 16px;">';
        html += '<strong>Total mensal:</strong> R$ ' + lucasTotal.toFixed(2);
        html += '</div>';
        
        if (lucasIncomes.length === 0) {
            html += '<p style="color: #94a3b8;">Nenhuma receita cadastrada</p>';
        } else {
            for (var i = 0; i < lucasIncomes.length; i++) {
                var inc = lucasIncomes[i];
                html += '<div style="background: white; border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; ' + (!inc.ativo ? 'opacity: 0.5;' : '') + '">';
                html += '<div><strong>' + inc.descricao + '</strong><br><span style="color: #10b981;">R$ ' + inc.valor.toFixed(2) + '</span></div>';
                html += '<div><button class="toggle-income" data-id="' + inc.id + '" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;">' + (inc.ativo ? '✅' : '⭕') + '</button>';
                html += '<button class="delete-income" data-id="' + inc.id + '" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;">🗑️</button></div>';
                html += '</div>';
            }
        }
        html += '</div>';
        
        // Coluna BEATRIZ
        html += '<div style="flex: 1; min-width: 250px; background: #f8fafc; border-radius: 16px; padding: 16px;">';
        html += '<h3 style="color: #ec489a; margin-bottom: 12px;">👩 BEATRIZ</h3>';
        html += '<div style="background: #fce7f3; border-radius: 12px; padding: 8px 12px; margin-bottom: 16px;">';
        html += '<strong>Total mensal:</strong> R$ ' + beatrizTotal.toFixed(2);
        html += '</div>';
        
        if (beatrizIncomes.length === 0) {
            html += '<p style="color: #94a3b8;">Nenhuma receita cadastrada</p>';
        } else {
            for (var i = 0; i < beatrizIncomes.length; i++) {
                var inc = beatrizIncomes[i];
                html += '<div style="background: white; border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; ' + (!inc.ativo ? 'opacity: 0.5;' : '') + '">';
                html += '<div><strong>' + inc.descricao + '</strong><br><span style="color: #10b981;">R$ ' + inc.valor.toFixed(2) + '</span></div>';
                html += '<div><button class="toggle-income" data-id="' + inc.id + '" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;">' + (inc.ativo ? '✅' : '⭕') + '</button>';
                html += '<button class="delete-income" data-id="' + inc.id + '" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;">🗑️</button></div>';
                html += '</div>';
            }
        }
        html += '</div>';
        html += '</div>';
        
        container.innerHTML = html;
        
        // Eventos dos botões toggle
        document.querySelectorAll('.toggle-income').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(btn.dataset.id);
                var income = window.fixedIncomes.find(function(i) { return i.id === id; });
                if (income) {
                    atualizarReceitaFixa(id, !income.ativo);
                }
            });
        });
        
        // Eventos dos botões delete
        document.querySelectorAll('.delete-income').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(btn.dataset.id);
                if (confirm('Remover esta receita fixa?')) {
                    deletarReceitaFixa(id);
                }
            });
        });
    }
    
    // Configurar listener de tempo real para receitas fixas
    function configurarRealtimeReceitas() {
        if (!supabase) return;
        
        supabase
            .channel('receitas_fixas')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'receitas_fixas' }, function(payload) {
                console.log('Mudança em receitas fixas:', payload.eventType);
                carregarReceitasFixas();
            })
            .subscribe();
    }
    
    // Expor funções
    window.loadFixedIncomes = carregarReceitasFixas;
    window.renderFixedIncomes = renderFixedIncomes;
    
    // Inicializar quando o Supabase estiver pronto
    window.addEventListener('supabaseReady', function() {
        supabase = window.supabaseClient.supabase;
        carregarReceitasFixas();
        configurarRealtimeReceitas();
        setupEvents();
    });
    
    document.addEventListener('DOMContentLoaded', initFixedIncome);
})();
