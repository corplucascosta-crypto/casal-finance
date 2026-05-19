// Notifications and Alerts Module
let notificationContainer = null;

function initNotifications() {
    // Criar container de notificações
    notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
    
    // Criar container de dicas
    const tipsContainer = document.createElement('div');
    tipsContainer.className = 'tips-container';
    tipsContainer.innerHTML = `
        <div class="tip-card">
            <div class="tip-icon">💡</div>
            <div class="tip-content">
                <h4>Dica do Dia</h4>
                <p id="dailyTip">Carregando dica...</p>
            </div>
        </div>
    `;
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(tipsContainer, mainContent.firstChild);
    }
    
    // Mostrar dica do dia
    showDailyTip();
    
    // Verificar alertas periodicamente
    setInterval(checkAlerts, 10000); // A cada 10 segundos
}

function showNotification(message, type = 'info') {
    if (!notificationContainer) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    notification.innerHTML = `
        <span class="notification-icon">${icons[type] || 'ℹ️'}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close">✕</button>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Auto fechar após 4 segundos
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
    
    // Botão fechar
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

function showDailyTip() {
    const tips = [
        "Revise seus gastos fixos a cada 3 meses para identificar cortes desnecessários",
        "Use a regra 50/30/20: 50% necessidades, 30% desejos, 20% poupança",
        "Pequenos gastos diários somam muito no fim do mês",
        "Antes de comprar, espere 24 horas para evitar compras por impulso",
        "Acompanhar cada real gasto é o primeiro passo para economizar",
        "Café de R$ 10 por dia = R$ 300 por mês",
        "Negocie contas fixas como internet e plano de celular anualmente",
        "Use dinheiro vivo para categorias que você quer controlar mais",
        "Planeje as compras do supermercado com lista para evitar excessos",
        "Uma reserva de emergência deve cobrir 3-6 meses de despesas"
    ];
    
    const todayTip = tips[Math.floor(Math.random() * tips.length)];
    const tipElement = document.getElementById('dailyTip');
    if (tipElement) {
        tipElement.textContent = todayTip;
    }
}

function checkAlerts() {
    if (!filteredData || filteredData.length === 0) return;
    
    // Calcular receitas totais (fixas + variáveis)
    const totalReceitasFixas = fixedIncomes
        .filter(inc => inc.ativo)
        .reduce((sum, inc) => sum + inc.valor, 0);
    
    const totalReceitasVariaveis = filteredData
        .filter(item => item.tipo === 'Receita')
        .reduce((sum, item) => sum + item.valor, 0);
    
    const totalReceitas = totalReceitasFixas + totalReceitasVariaveis;
    
    const totalDespesas = filteredData
        .filter(item => item.tipo === 'Despesa')
        .reduce((sum, item) => sum + item.valor, 0);
    
    // Alerta 1: Despesa > 80% da receita
    if (totalDespesas > totalReceitas * 0.8) {
        const percentual = ((totalDespesas / totalReceitas) * 100).toFixed(1);
        showNotification(
            `⚠️ Atenção! Você já gastou ${percentual}% da sua receita mensal!`,
            'warning'
        );
    }
    
    // Verificar últimos gastos adicionados (monitorar localStorage)
    checkLastAddedExpenses();
}

function checkLastAddedExpenses() {
    const lastExpenses = JSON.parse(localStorage.getItem('lastExpenses') || '[]');
    const now = new Date();
    
    lastExpenses.forEach(expense => {
        const expenseDate = new Date(expense.timestamp);
        const hoursDiff = (now - expenseDate) / (1000 * 60 * 60);
        
        // Se foi adicionado nas últimas 24h
        if (hoursDiff < 24 && !expense.notified) {
            if (expense.valor > 500) {
                showNotification(
                    `💰 Gasto alto detectado: R$ ${expense.valor.toFixed(2)} em ${expense.descricao}. Foi necessário?`,
                    'warning'
                );
                expense.notified = true;
            } else if (expense.valor > 200) {
                showNotification(
                    `💸 Você gastou R$ ${expense.valor.toFixed(2)} em ${expense.descricao}. Continue controlando!`,
                    'info'
                );
                expense.notified = true;
            }
        }
    });
    
    localStorage.setItem('lastExpenses', JSON.stringify(lastExpenses));
}

// Monitorar novos gastos (sobrescrever addFixedIncome original)
const originalAddFixedIncome = window.addFixedIncome;
if (originalAddFixedIncome) {
    window.addFixedIncome = function(pessoa, descricao, valor) {
        originalAddFixedIncome(pessoa, descricao, valor);
        
        // Registrar gasto para alerta
        const expenses = JSON.parse(localStorage.getItem('lastExpenses') || '[]');
        expenses.push({
            timestamp: new Date().toISOString(),
            valor: parseFloat(valor),
            descricao: descricao,
            pessoa: pessoa,
            notified: false
        });
        
        // Manter apenas últimos 20 registros
        while (expenses.length > 20) expenses.shift();
        localStorage.setItem('lastExpenses', JSON.stringify(expenses));
    };
}

// Monitorar novos lançamentos no CSV (simular)
setInterval(() => {
    if (window.lastDataLength !== undefined && rawData.length > window.lastDataLength) {
        const newItems = rawData.slice(window.lastDataLength);
        newItems.forEach(item => {
            if (item.tipo === 'Despesa' && item.valor > 200) {
                showNotification(
                    `🆕 Novo gasto detectado: R$ ${item.valor.toFixed(2)} em ${item.categoria}`,
                    'info'
                );
            }
        });
    }
    window.lastDataLength = rawData.length;
}, 5000);

// Adicionar estilos CSS para notificações
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 350px;
    }
    
    .notification {
        background: white;
        border-radius: 12px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
        border-left: 4px solid;
    }
    
    .notification.success { border-left-color: #10b981; }
    .notification.error { border-left-color: #ef4444; }
    .notification.warning { border-left-color: #f59e0b; }
    .notification.info { border-left-color: #3b82f6; }
    
    .notification-icon { font-size: 1.2rem; }
    .notification-message { flex: 1; font-size: 0.85rem; color: #1e293b; }
    .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        color: #94a3b8;
        font-size: 1rem;
    }
    
    .tips-container {
        margin-bottom: 24px;
    }
    
    .tip-card {
        background: linear-gradient(135deg, #667eea15, #764ba215);
        border-radius: 16px;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 16px;
        border: 1px solid #e2e8f0;
    }
    
    .tip-icon {
        font-size: 2rem;
    }
    
    .tip-content h4 {
        font-size: 0.85rem;
        font-weight: 600;
        color: #667eea;
        margin-bottom: 4px;
    }
    
    .tip-content p {
        font-size: 0.9rem;
        color: #1e293b;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

document.addEventListener('DOMContentLoaded', initNotifications);
