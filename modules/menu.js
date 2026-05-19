// Controle do menu hambúrguer
let currentModule = 'dashboard';

function initMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const closeMenu = document.getElementById('closeMenu');
    const menuItems = document.querySelectorAll('.menu-item');
    
    if (!hamburgerBtn) return;
    
    // Abrir menu
    hamburgerBtn.addEventListener('click', () => {
        sideMenu.classList.add('open');
        menuOverlay.classList.add('open');
    });
    
    // Fechar menu
    const closeMenuFunction = () => {
        sideMenu.classList.remove('open');
        menuOverlay.classList.remove('open');
    };
    
    if (closeMenu) closeMenu.addEventListener('click', closeMenuFunction);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenuFunction);
    
    // Trocar módulo
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
    
    // Atualizar classes dos módulos
    document.querySelectorAll('.module').forEach(mod => {
        mod.classList.remove('active');
    });
    
    const moduleElement = document.getElementById(`${module}Module`);
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
    if (module === 'analytics') {
        renderAnalytics();
    }
}

document.addEventListener('DOMContentLoaded', initMenu);
