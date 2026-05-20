// Notifications Module - Com 50 dicas financeiras
(function() {
    if (window.notificationsInitialized) return;
    window.notificationsInitialized = true;
    
    var notificationContainer = null;
    
    // 50 Dicas Financeiras
    var tips = [
        "💰 Revise seus gastos fixos a cada 3 meses para identificar cortes desnecessários",
        "📊 Use a regra 50/30/20: 50% necessidades, 30% desejos, 20% poupança",
        "☕ Pequenos gastos diários somam muito: um café de R$ 10/dia = R$ 300/mês",
        "⏰ Antes de comprar, espere 24 horas para evitar compras por impulso",
        "📝 Acompanhar cada real gasto é o primeiro passo para economizar",
        "📞 Negocie contas fixas como internet e plano de celular anualmente",
        "💵 Use dinheiro vivo para categorias que você quer controlar mais",
        "🛒 Planeje as compras do supermercado com lista para evitar excessos",
        "🏦 Uma reserva de emergência deve cobrir 3-6 meses de despesas",
        "🍳 Cozinhar em casa economiza até 70% comparado a comer fora",
        "📱 Use o FinanciFlow diariamente para manter o controle",
        "📉 Compare seus gastos mês a mês para identificar tendências",
        "💳 Evite parcelamentos longos - comprometem o orçamento futuro",
        "🎯 Defina metas financeiras mensais e acompanhe seu progresso",
        "🔍 Revise suas assinaturas mensais (streaming, apps) - cancele as não usadas",
        "💡 Desligue aparelhos da tomada - podem consumir até 15% a mais de energia",
        "🚗 Considere transporte público ou carona para economizar combustível",
        "🏠 Faça pequenos reparos em casa antes que virem grandes problemas",
        "📚 Invista em conhecimento - cursos online gratuitos podem aumentar sua renda",
        "🛍️ Compre roupas em fim de estação - descontos de até 70%",
        "🍱 Leve marmita para o trabalho - economia de R$ 300/mês",
        "💧 Economize água - banhos mais curtos economizam R$ 50/mês",
        "🔋 Troque lâmpadas por LED - economia de até 80% na conta de luz",
        "🏦 Compare taxas de bancos antes de contratar serviços",
        "📅 Pague contas em dia - evite juros e multas",
        "🎓 Ensine educação financeira para as crianças desde cedo",
        "💸 Tenha um 'dia livre de gastos' por semana",
        "📦 Venda coisas que você não usa mais - espaço e dinheiro extra",
        "🍷 Reduza saídas para bares/restaurantes - cozinhem juntos em casa",
        "📱 Use apps de cashback para compras online",
        "🛒 Faça compras do mês de uma vez - evita idas extras ao mercado",
        "💊 Compre medicamentos genéricos - mesma eficácia por menos preço",
        "🧹 Faça você mesmo pequenos serviços (manutenção, limpeza)",
        "📺 Compartilhe assinaturas de streaming com familiares",
        "🚫 Evite comprar produtos na primeira semana de lançamento",
        "💪 Pratique exercícios em casa - economiza academia e transporte",
        "📚 Use bibliotecas públicas - livros, filmes e jogos gratuitos",
        "🔄 Faça rotação de roupas - renove o guarda-roupa sem gastar",
        "🎁 Para presentes, opte por experiências (jantar, cinema) em vez de objetos",
        "🧾 Guarde todas as notas fiscais para conferência",
        "📈 Invista em CDB de liquidez diária para reserva de emergência",
        "🏦 Diversifique seus investimentos - não coloque todos ovos na mesma cesta",
        "📊 Evite dívidas com juros altos (cartão de crédito, cheque especial)",
        "🎯 Tenha um objetivo financeiro claro (viagem, casa, aposentadoria)",
        "📅 Faça um balanço mensal: quanto entrou, quanto saiu, quanto sobrou",
        "🤝 Converse com seu parceiro sobre finanças - time que joga unido ganha",
        "📱 Configure alertas de gastos no banco por SMS",
        "🔒 Crie uma senha forte para seus apps financeiros",
        "📄 Digitalize e organize seus comprovantes na nuvem",
        "🎉 Comemore pequenas conquistas financeiras - motive-se!"
    ];
    
    function initNotifications() {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        var tipContainer = document.querySelector('.tips-container');
        if (tipContainer) {
            var tipText = document.getElementById('dailyTip');
            var currentTipIndex = Math.floor(Math.random() * tips.length);
            
            if (tipText) {
                tipText.textContent = tips[currentTipIndex];
            }
            
            var newTipBtn = document.getElementById('newTipBtn');
            if (newTipBtn) {
                newTipBtn.addEventListener('click', function() {
                    var newIndex;
                    do {
                        newIndex = Math.floor(Math.random() * tips.length);
                    } while (newIndex === currentTipIndex && tips.length > 1);
                    
                    currentTipIndex = newIndex;
                    var tipText = document.getElementById('dailyTip');
                    if (tipText) {
                        tipText.style.opacity = '0';
                        setTimeout(function() {
                            tipText.textContent = tips[currentTipIndex];
                            tipText.style.opacity = '1';
                        }, 200);
                    }
                    showNotification('💡 Nova dica carregada!', 'info');
                });
            }
        }
    }
    
    function showNotification(message, type) {
        if (!notificationContainer) return;
        type = type || 'info';
        var notification = document.createElement('div');
        notification.className = 'notification ' + type;
        var icons = { success: '✅', error: '❌', warning: '⚠️', info: '💡' };
        notification.innerHTML = '<span class="notification-icon">' + (icons[type] || 'ℹ️') + '</span>' +
            '<span class="notification-message">' + message + '</span>' +
            '<button class="notification-close">✕</button>';
        notificationContainer.appendChild(notification);
        setTimeout(function() { notification.remove(); }, 4000);
        notification.querySelector('.notification-close').addEventListener('click', function() { notification.remove(); });
    }
    
    window.showNotification = showNotification;
    document.addEventListener('DOMContentLoaded', initNotifications);
})();
