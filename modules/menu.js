// Controle do menu hambúrguer
let currentModule = 'dashboard';

function initMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const closeMenu = document.getElementById('closeMenu');
    const menuItems = document.querySelectorAll('.menu-item');
    
    if (!hamburgerBtn) return;
    
    hamburgerBtn.addEventListener('click', () => {
        sideMenu.classList.add('open');
        menuOverlay.classList.add('open');
    });
    
    const closeMenuFunction = () => {
        sideMenu.classList.remove('open');
        menuOverlay.classList.remove('open');
    };
    
    if (closeMenu) closeMenu.addEventListener('click', closeMenuFunction);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenuFunction);
    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const module = item.dataset.module;
            switchModule(module);
            closeMenuFunction();
        });
    });
}

function switchModule(module) {
    currentModule = module;
    
    // Mapeamento de IDs dos módulos
    const moduleMap = {
        'dashboard': 'dashboardModule',
        'budgets': 'budgetsModule',
        'comparison': 'comparisonModule',
        'persons': 'personsModule',
        'fixedIncome': 'fixedIncomeModule',
        'transactions': 'transactionsModule',
        'analytics': 'analyticsModule'
    };
    
    const moduleId = moduleMap[module];
    
    // Esconder todos os módulos
    document.querySelectorAll('.module').forEach(mod => {
        mod.classList.remove('active');
    });
    
    // Mostrar módulo selecionado
    const moduleElement = document.getElementById(moduleId);
    if (moduleElement) {
        moduleElement.classList.add('active');
    }
    
    // Atualizar menu ativo
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.module === module) {
            item.classList.add('active');
        }
    });
    
    // Recarregar gráficos específicos se necessário
    if (module === 'analytics' && typeof renderAnalytics === 'function') {
        setTimeout(renderAnalytics, 100);
    }
    if (module === 'comparison' && typeof renderComparison === 'function') {
        setTimeout(renderComparison, 100);
    }
    if (module === 'persons' && typeof renderPersonDashboard === 'function') {
        setTimeout(renderPersonDashboard, 100);
    }
    if (module === 'budgets' && typeof renderBudgets === 'function') {
        setTimeout(renderBudgets, 100);
    }
    if (module === 'dashboard') {
        setTimeout(() => {
            if (typeof renderDailyChart === 'function') renderDailyChart();
        }, 100);
    }
}

document.addEventListener('DOMContentLoaded', initMenu);
