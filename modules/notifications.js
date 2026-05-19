// Notifications Module - Versão melhorada
(function() {
    if (window.notificationsInitialized) return;
    window.notificationsInitialized = true;
    
    let notificationContainer = null;
    let lastAlertTime = 0;
    let alertCooldown = 60000;
    
    // Array de dicas expandido
    const tips = [
        "💰 Revise seus gastos fixos a cada 3 meses para identificar cortes desnecessários",
        "📊 Use a regra 50/30/20: 50% necessidades, 30% desejos, 20% poupança",
        "☕ Pequenos gastos diários somam muito: um café de R$ 10/dia = R$ 300/mês",
        "⏰ Antes de comprar, espere 24 horas para evitar compras por impulso",
        "📝 Acompanhar cada real gasto é o primeiro passo para economizar",
        "📞 Negocie contas fixas como internet e plano de celular anualmente",
        "💵 Use dinheiro vivo para categorias que você quer controlar mais",
        "🛒 Planeje as compras do supermercado com lista para evitar excessos",
        "🏦 Uma reserva de emergência deve cobrir 3-6 meses de despesas",
        "🎯 Defina metas financeiras mensais e acompanhe seu progresso",
        "📱 Use o FinanciFlow diariamente para manter o controle",
        "🔍 Compare seus gastos mês a mês para identificar tendências",
        "💳 Evite parcelamentos longos - eles comprometem o orçamento futuro",
        "🍽️ Cozinhar em casa economiza até 70% comparado a comer fora",
        "💡 Desligue aparelhos da tomada - podem consumir até 15% a mais de energia"
    ];
    
    function initNotifications() {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        criarCardDicaMelhorado();
        setInterval(checkAlerts, 30000);
    }
    
    function criarCardDicaMelhorado() {
        const tipsContainer = document.querySelector('.tips-container');
        if (!tipsContainer) return;
        
        // Salvar dica atual
        let currentTipIndex = Math.floor(Math.random() * tips.length);
        
        tipsContainer.innerHTML = `
            <div class="tip-card">
                <div class="tip-icon">💡</div>
                <div class="tip-content">
                    <h4>DICA DO DIA</h4>
                    <p id="dailyTipText">${tips[currentTipIndex]}</p>
                </div>
                <button class="tip-refresh" id="newTipBtn">
                    🔄 Nova Dica
                </button>
            </div>
        `;
        
        // Adicionar evento para nova dica
        const newTipBtn = document.getElementById('newTipBtn');
        if (newTipBtn) {
            newTipBtn.addEventListener('click', () => {
                let newIndex;
                do {
                    newIndex = Math.floor(Math.random() * tips.length);
                } while (newIndex === currentTipIndex && tips.length > 1);
                
                currentTipIndex = newIndex;
                const tipText = document.getElementById('dailyTipText');
                if (tipText) {
                    tipText.style.opacity = '0';
                    setTimeout(() => {
                        tipText.textContent = tips[currentTipIndex];
                        tipText.style.opacity = '1';
                    }, 200);
                }
                
                if (window.showNotification) {
                    window.showNotification('💡 Nova dica carregada!', 'info');
                }
            });
        }
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
