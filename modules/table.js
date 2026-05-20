function renderTable() {
    var tbody = document.getElementById('tableBody');
    
    if (!tbody) {
        console.error('Elemento tableBody não encontrado');
        return;
    }
    
    if (!window.filteredData || window.filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">Nenhum lançamento encontrado. </td</tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    for (var i = 0; i < window.filteredData.length; i++) {
        var item = window.filteredData[i];
        var row = tbody.insertRow();
        
        var valorFormatado = 'R$ ' + item.valor.toFixed(2);
        var valorClass = item.tipo === 'Receita' ? 'positive' : 'negative';
        
        row.insertCell(0).innerText = item.dataRaw || item.data;
        row.insertCell(1).innerHTML = '<span class="' + valorClass + '">' + valorFormatado + '</span>';
        row.insertCell(2).innerText = item.tipo;
        row.insertCell(3).innerText = item.categoria;
        row.insertCell(4).innerText = item.quem || '-';
        row.insertCell(5).innerText = item.metodo || '-';
        row.insertCell(6).innerText = item.descricao || 'Sem descrição';
        
        var deleteCell = row.insertCell(7);
        deleteCell.style.textAlign = 'center';
        deleteCell.innerHTML = '<button class="delete-transaction-btn" data-id="' + item.id + '" data-descricao="' + (item.descricao || '').replace(/'/g, "\\'") + '" data-valor="' + item.valor + '" style="background: none; border: none; cursor: pointer; font-size: 1.1rem; color: #ef4444;">🗑️</button>';
    }
    
    document.querySelectorAll('.delete-transaction-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var descricao = btn.dataset.descricao || 'este lançamento';
            var valor = parseFloat(btn.dataset.valor).toFixed(2);
            
            if (confirm('Excluir "' + descricao + '" (R$ ' + valor + ')? Esta ação não pode ser desfeita.')) {
                excluirLancamento(btn.dataset.id);
            }
        });
    });
    
    console.log('Tabela renderizada com', window.filteredData.length, 'registros');
}

async function excluirLancamento(id) {
    if (!window.supabaseClient || !window.supabaseClient.supabase) {
        if (window.showNotification) window.showNotification('❌ Supabase não disponível', 'error');
        return;
    }
    
    var supabase = window.supabaseClient.supabase;
    
    console.log('Excluindo lançamento ID:', id);
    
    var { error } = await supabase
        .from('lancamentos')
        .delete()
        .eq('id', parseInt(id));
    
    if (error) {
        console.error('Erro ao excluir:', error);
        if (window.showNotification) window.showNotification('❌ Erro ao excluir: ' + error.message, 'error');
        return;
    }
    
    if (window.showNotification) window.showNotification('✅ Lançamento excluído!', 'success');
    
    // Forçar recarregamento dos dados pela função global
    setTimeout(function() {
        if (typeof window.carregarDadosSupabase === 'function') {
            console.log('Chamando carregarDadosSupabase...');
            window.carregarDadosSupabase();
        } else {
            console.log('carregarDadosSupabase não encontrada, recarregando página...');
            location.reload();
        }
    }, 500);
}

window.renderTable = renderTable;
