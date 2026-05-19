// Auto Refresh Module - Versão corrigida
(function() {
    if (window.autoRefreshInitialized) return;
    window.autoRefreshInitialized = true;
    
    let refreshInterval = null;
    let isAutoRefreshEnabled = true;

    function initAutoRefresh() {
        const manualBtn = document.getElementById('manualRefreshBtn');
        const toggleBtn = document.getElementById('toggleAutoRefreshBtn');
        const refreshStatus = document.getElementById('refreshStatus');
        
        if (!manualBtn) return;
        
        manualBtn.addEventListener('click', async () => {
            if (window.showNotification) window.showNotification('🔄 Atualizando dados...', 'info');
            await window.refreshData();
            if (window.showNotification) window.showNotification('✅ Dados atualizados!', 'success');
            if (refreshStatus) refreshStatus.innerHTML = '✅ Última atualização: ' + new Date().toLocaleTimeString();
        });
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                isAutoRefreshEnabled = !isAutoRefreshEnabled;
                if (isAutoRefreshEnabled) {
                    startAutoRefresh();
                    toggleBtn.classList.add('active');
                    toggleBtn.innerHTML = '⏱️ Auto (30s)';
                    if (window.showNotification) window.showNotification('⏱️ Auto-refresh ativado', 'success');
                } else {
                    stopAutoRefresh();
                    toggleBtn.classList.remove('active');
                    toggleBtn.innerHTML = '⏸️ Auto (Desligado)';
                    if (window.showNotification) window.showNotification('⏸️ Auto-refresh desativado', 'info');
                }
            });
        }
        
        startAutoRefresh();
    }

    async function refreshData() {
        if (typeof loadCSVData === 'function') {
            await loadCSVData();
            if (typeof updateLastUpdateTime === 'function') updateLastUpdateTime();
            if (window.currentModule === 'analytics' && typeof renderAnalytics === 'function') renderAnalytics();
        }
    }

    function startAutoRefresh() {
        if (refreshInterval) clearInterval(refreshInterval);
        refreshInterval = setInterval(() => {
            if (isAutoRefreshEnabled) refreshData();
        }, 30000);
    }

    function stopAutoRefresh() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
    }

    window.refreshData = refreshData;
    document.addEventListener('DOMContentLoaded', initAutoRefresh);
})();
