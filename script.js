// Módulo principal
let rawData = [];
let filteredData = [];
let expenseChart = null;

// Inicialização
async function init() {
    await loadCSVData();
    setupEventListeners();
    renderDashboard();
    renderTable();
    updateLastUpdateTime();
}

function setupEventListeners() {
    document.getElementById('filterPerson').addEventListener('change', applyFilters);
    document.getElementById('filterType').addEventListener('change', applyFilters);
    document.getElementById('filterCategory').addEventListener('change', applyFilters);
    document.getElementById('searchDescription').addEventListener('input', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
}

function applyFilters() {
    const person = document.getElementById('filterPerson').value;
    const type = document.getElementById('filterType').value;
    const category = document.getElementById('filterCategory').value;
    const search = document.getElementById('searchDescription').value.toLowerCase();

    filteredData = rawData.filter(item => {
        if (person !== 'all' && item.quem !== person) return false;
        if (type !== 'all' && item.tipo !== type) return false;
        if (category !== 'all' && item.categoria !== category) return false;
        if (search && !item.descricao.toLowerCase().includes(search)) return false;
        return true;
    });

    renderDashboard();
    renderTable();
}

function resetFilters() {
    document.getElementById('filterPerson').value = 'all';
    document.getElementById('filterType').value = 'all';
    document.getElementById('filterCategory').value = 'all';
    document.getElementById('searchDescription').value = '';
    applyFilters();
}

function updateLastUpdateTime() {
    const now = new Date();
    document.getElementById('lastUpdate').innerText = `Última atualização: ${now.toLocaleString()}`;
}

init();