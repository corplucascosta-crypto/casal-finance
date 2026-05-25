// Controle do menu hambúrguer e troca de módulos
(function() {
    // Aguardar DOM carregar
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Inicializando menu...');
        
        // Elementos do menu
        var hamburgerBtn = document.getElementById('hamburgerBtn');
        var sideMenu = document.getElementById('sideMenu');
        var menuOverlay = document.getElementById('menuOverlay');
        var closeMenu = document.getElementById('closeMenu');
        var menuItems = document.querySelectorAll('.menu-item');
        
        // Abrir menu
        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', function() {
                sideMenu.classList.add('open');
                menuOverlay.classList.add('open');
            });
        }
        
        // Fechar menu
        var closeMenuFunction = function() {
            sideMenu.classList.remove('open');
            menuOverlay.classList.remove('open');
        };
        
        if (closeMenu) closeMenu.addEventListener('click', closeMenuFunction);
        if (menuOverlay) menuOverlay.addEventListener('click', closeMenuFunction);
        
        // Trocar módulo ao clicar no menu
        for (var i = 0; i < menuItems.length; i++) {
            menuItems[i].addEventListener('click', function() {
                var module = this.dataset.module;
                switchModule(module);
                closeMenuFunction();
            });
        }
        
        // Garantir que apenas o módulo ativo está visível
        function switchModule(module) {
            console.log('Trocando para módulo:', module);
            
            // Mapeamento dos IDs
            var modulesIds = {
                'dashboard': 'dashboardModule',
                'fixedIncome': 'fixedIncomeModule',
                'transactions': 'transactionsModule',
                'analytics': 'analyticsModule'
            };
            
            var activeId = modulesIds[module];
            
            // Esconder todos os módulos
            var allModules = document.querySelectorAll('.module');
            for (var i = 0; i < allModules.length; i++) {
                allModules[i].classList.remove('active');
            }
            
            // Mostrar o módulo selecionado
            var activeModule = document.getElementById(activeId);
            if (activeModule) {
                activeModule.classList.add('active');
            }
            
            // Atualizar classe ativa no menu
            for (var i = 0; i < menuItems.length; i++) {
                menuItems[i].classList.remove('active');
                if (menuItems[i].dataset.module === module) {
                    menuItems[i].classList.add('active');
                }
            }
        }
        
        // Inicializar com o módulo dashboard ativo
        switchModule('dashboard');
    });
})();
