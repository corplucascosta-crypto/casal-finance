// Controle de autenticação
let usuarioAtual = null;

function verificarLogin() {
    usuarioAtual = localStorage.getItem('usuarioLogado');
    
    if (!usuarioAtual) {
        window.location.href = 'index.html';
        return false;
    }
    
    // Exibir nome do usuário no header
    const userNameSpan = document.getElementById('userNameDisplay');
    if (userNameSpan) {
        let emoji = '';
        if (usuarioAtual === 'LUCAS') emoji = '👨';
        else if (usuarioAtual === 'BEATRIZ') emoji = '👩';
        userNameSpan.innerHTML = `${emoji} ${usuarioAtual}`;
    }
    
    // Exibir nome do usuário no menu lateral
    const userNameSide = document.getElementById('userNameSide');
    if (userNameSide) {
        let emoji = '';
        if (usuarioAtual === 'LUCAS') emoji = '👨';
        else if (usuarioAtual === 'BEATRIZ') emoji = '👩';
        userNameSide.innerHTML = `${emoji} ${usuarioAtual}`;
    }
    
    return true;
}

function fazerLogout() {
    console.log('Executando logout...');
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
}

// Configurar botões de logout quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('Configurando botões de logout...');
    
    // Botão no header
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        console.log('Botão logout encontrado no header');
        logoutBtn.addEventListener('click', fazerLogout);
    } else {
        console.log('Botão logout NÃO encontrado no header');
    }
    
    // Botão no menu lateral
    const logoutBtnSide = document.getElementById('logoutBtnSide');
    if (logoutBtnSide) {
        console.log('Botão logout encontrado no menu lateral');
        logoutBtnSide.addEventListener('click', fazerLogout);
    } else {
        console.log('Botão logout NÃO encontrado no menu lateral');
    }
});
