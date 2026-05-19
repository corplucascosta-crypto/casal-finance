// Auto Refresh Module
let refreshInterval = null;
let isAutoRefreshEnabled = true;

function initAutoRefresh() {
    // Criar barra de controle
    const header = document.querySelector('header');
    const refreshControl = document.createElement('div');
    refreshControl.className = 'refresh-control';
    refreshControl.innerHTML = `
        <div class="refresh-buttons">
            <button id="manualRefreshBtn" class="refresh-btn">🔄 Atualizar Agora</button>
            <button id="toggleAutoRefreshBtn" class="auto-refresh-btn active">⏱️ Auto Atualizar (30s)</button>
        </div>
        <div class="refresh-status">
            <span id="refreshStatus">✅ Dados atualizados automaticamente</span>
        </div>
    `;
    header.appendChild(refreshControl);
    
    // Botão manual
    document.getElementById('manualRefreshBtn').addEventListener('click', async () => {
        showNotification('🔄 Atualizando dados...', 'info');
        await refreshData();
        showNotification('✅ Dados atualizados com sucesso!', 'success');
    });
    
    // Botão toggle auto-refresh
    const toggleBtn = document.getElementById('toggleAutoRefreshBtn');
    toggleBtn.addEventListener('click', () => {
        isAutoRefreshEnabled = !isAutoRefreshEnabled;
        if (isAutoRefreshEnabled) {
            startAutoRefresh();
            toggleBtn.classList.add('active');
            toggleBtn.innerHTML = '⏱️ Auto Atualizar (30s)';
            showNotification('⏱️ Atualização automática ativada', 'success');
        } else {
            stopAutoRefresh();
            toggleBtn.classList.remove('active');
            toggleBtn.innerHTML = '⏸️ Auto Atualizar (Desligado)';
            showNotification('⏸️ Atualização automática desativada', 'info');
        }
    });
    
    startAutoRefresh();
}

async function refreshData() {
    await loadCSVData();
    updateLastUpdateTime();
    // Atualizar todos os módulos
    if (currentModule === 'analytics') {
        renderAnalytics();
    }
}

function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
        if (isAutoRefreshEnabled) {
            refreshData();
        }
    }, 30000); // 30 segundos
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// Adicionar ao init
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initAutoRefresh, 1000);
    });
}
