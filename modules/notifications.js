// Notifications Module - Versão corrigida
(function() {
    if (window.notificationsInitialized) return;
    window.notificationsInitialized = true;
    
    let notificationContainer = null;
    let lastAlertTime = 0;
    let alertCooldown = 60000; // 60 segundos de cooldown
    
    function initNotifications() {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        showDailyTip();
        setInterval(checkAlerts, 30000); // Verificar a cada 30 segundos
    }
    
    window.showNotification = function(message, type = 'info') {
        if (!notificationContainer) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        
        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">✕</button>
        `;
        
        notificationContainer.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
        
        notification.querySelector('.notification-close').addEventListener('click', () => notification.remove());
    };
    
    function showDailyTip() {
        const tips = [
            "Revise seus gastos fixos a cada 3 meses",
            "Use a regra 50/30/20: 50% necessidades, 30% desejos, 20% poupança",
            "Pequenos gastos diários somam muito no fim do mês",
            "Antes de comprar, espere 24 horas para evitar impulsos",
            "Acompanhar cada real gasto é o primeiro passo para economizar",
            "Negocie contas fixas como internet e plano de celular",
            "Use dinheiro vivo para categorias que quer controlar mais",
            "Planeje as compras do supermercado com lista",
            "Reserva de emergência deve cobrir 3-6 meses de despesas"
        ];
        
        const tipElement = document.getElementById('dailyTip');
        if (tipElement) {
            tipElement.textContent = tips[Math.floor(Math.random() * tips.length)];
        }
    }
    
    function checkAlerts() {
        const now = Date.now();
        if (now - lastAlertTime < alertCooldown) return;
        
        if (!window.filteredData || window.filteredData.length === 0) return;
        
        const totalReceitasFixas = (window.fixedIncomes || [])
            .filter(inc => inc.ativo)
            .reduce((sum, inc) => sum + inc.valor, 0);
        
        const totalReceitasVariaveis = window.filteredData
            .filter(item => item.tipo === 'Receita')
            .reduce((sum, item) => sum + item.valor, 0);
        
        const totalReceitas = totalReceitasFixas + totalReceitasVariaveis;
        const totalDespesas = window.filteredData
            .filter(item => item.tipo === 'Despesa')
            .reduce((sum, item) => sum + item.valor, 0);
        
        if (totalReceitas > 0 && totalDespesas > totalReceitas * 0.8) {
            const percentual = ((totalDespesas / totalReceitas) * 100).toFixed(1);
            window.showNotification(`⚠️ Atenção! Você já gastou ${percentual}% da receita mensal!`, 'warning');
            lastAlertTime = now;
        }
    }
    
    document.addEventListener('DOMContentLoaded', initNotifications);
})();
