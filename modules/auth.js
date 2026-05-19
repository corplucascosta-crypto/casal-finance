// Controle de autenticação
let usuarioAtual = null;

function verificarLogin() {
    usuarioAtual = localStorage.getItem('usuarioLogado');
    
    if (!usuarioAtual) {
        window.location.href = 'index.html';
        return false;
    }
    
    // Exibir nome do usuário
    const userNameSpan = document.getElementById('userNameDisplay');
    if (userNameSpan) {
        let emoji = '';
        if (usuarioAtual === 'LUCAS') emoji = '👨';
        else if (usuarioAtual === 'BEATRIZ') emoji = '👩';
        else emoji = '💑';
        userNameSpan.innerHTML = `${emoji} ${usuarioAtual}`;
    }
    
    return true;
}

function fazerLogout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
}

// Configurar botão de logout
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', fazerLogout);
    }
});
