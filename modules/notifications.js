(function() {
    if (window.notificationsInitialized) return;
    window.notificationsInitialized = true;
    
    var notificationContainer = null;
    var tips = [
        "Revise seus gastos fixos a cada 3 meses para identificar cortes desnecessários",
        "Use a regra 50/30/20: 50% necessidades, 30% desejos, 20% poupança",
        "Pequenos gastos diários somam muito no fim do mês",
        "Antes de comprar, espere 24 horas para evitar compras por impulso",
        "Acompanhar cada real gasto é o primeiro passo para economizar",
        "Negocie contas fixas como internet e plano de celular anualmente",
        "Use dinheiro vivo para categorias que você quer controlar mais",
        "Planeje as compras do supermercado com lista para evitar excessos",
        "Uma reserva de emergência deve cobrir 3-6 meses de despesas",
        "Cozinhar em casa economiza até 70% comparado a comer fora"
    ];
    
    function initNotifications() {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        var tipContainer = document.querySelector('.tips-container');
        if (tipContainer) {
            var tipText = document.getElementById('dailyTip');
            if (tipText) {
                tipText.textContent = tips[Math.floor(Math.random() * tips.length)];
            }
            var newTipBtn = document.getElementById('newTipBtn');
            if (newTipBtn) {
                newTipBtn.addEventListener('click', function() {
                    var tipText = document.getElementById('dailyTip');
                    if (tipText) {
                        tipText.textContent = tips[Math.floor(Math.random() * tips.length)];
                    }
                });
            }
        }
    }
    
    window.showNotification = function(message, type) {
        if (!notificationContainer) return;
        type = type || 'info';
        var notification = document.createElement('div');
        notification.className = 'notification ' + type;
        notification.innerHTML = '<span class="notification-message">' + message + '</span><button class="notification-close">✕</button>';
        notificationContainer.appendChild(notification);
        setTimeout(function() { notification.remove(); }, 4000);
        notification.querySelector('.notification-close').addEventListener('click', function() { notification.remove(); });
    };
    
    document.addEventListener('DOMContentLoaded', initNotifications);
})();
