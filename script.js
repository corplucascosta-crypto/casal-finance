// Módulo principal
let rawData = [];
let filteredData = [];
let totalReceitasVariaveis = 0;

// Inicialização
async function init() {
    console.log('Iniciando app...');
    
    if (!verificarLogin()) return;
    
    loadFixedIncomes();
    await loadCSVData();
    setupEventListeners();
    
    // Chamar todas as funções de renderização
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderTable === 'function') renderTable();
    if (typeof renderForecast === 'function') renderForecast();
    if (typeof renderComparison === 'function') renderComparison();
    if (typeof renderPersonDashboard === 'function') renderPersonDashboard();
    if (typeof renderDailyChart === 'function') renderDailyChart();
    if (typeof renderAnalytics === 'function') setTimeout(renderAnalytics, 500);
    if (typeof renderBudgets === 'function') setTimeout(renderBudgets, 500);
    
    updateLastUpdateTime();
}

function setupEventListeners() {
    const filterPerson = document.getElementById('filterPerson');
    const filterType = document.getElementById('filterType');
    const filterCategory = document.getElementById('filterCategory');
    const searchDescription = document.getElementById('searchDescription');
    const resetFilters = document.getElementById('resetFilters');
    
    if (filterPerson) filterPerson.addEventListener('change', applyFilters);
    if (filterType) filterType.addEventListener('change', applyFilters);
    if (filterCategory) filterCategory.addEventListener('change', applyFilters);
    if (searchDescription) searchDescription.addEventListener('input', applyFilters);
    if (resetFilters) resetFilters.addEventListener('click', resetFilters);
}

function applyFilters() {
    const person = document.getElementById('filterPerson')?.value || 'all';
    const type = document.getElementById('filterType')?.value || 'all';
    const category = document.getElementById('filterCategory')?.value || 'all';
    const search = document.getElementById('searchDescription')?.value.toLowerCase() || '';

    filteredData = rawData.filter(item => {
        if (person !== 'all' && item.quem !== person) return false;
        if (type !== 'all' && item.tipo !== type) return false;
        if (category !== 'all' && item.categoria !== category) return false;
        if (search && !item.descricao.toLowerCase().includes(search)) return false;
        return true;
    });

    // Atualizar todas as visualizações
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderTable === 'function') renderTable();
    if (typeof renderForecast === 'function') renderForecast();
    if (typeof renderComparison === 'function') renderComparison();
    if (typeof renderPersonDashboard === 'function') renderPersonDashboard();
    if (typeof renderDailyChart === 'function') renderDailyChart();
    if (typeof renderAnalytics === 'function') renderAnalytics();
    if (typeof renderBudgets === 'function') renderBudgets();
}

function resetFilters() {
    const filterPerson = document.getElementById('filterPerson');
    const filterType = document.getElementById('filterType');
    const filterCategory = document.getElementById('filterCategory');
    const searchDescription = document.getElementById('searchDescription');
    
    if (filterPerson) filterPerson.value = 'all';
    if (filterType) filterType.value = 'all';
    if (filterCategory) filterCategory.value = 'all';
    if (searchDescription) searchDescription.value = '';
    
    applyFilters();
}

function updateLastUpdateTime() {
    const now = new Date();
    const updateEl = document.getElementById('lastUpdate');
    if (updateEl) {
        updateEl.innerText = `Última atualização: ${now.toLocaleString()}`;
    }
}

document.addEventListener('DOMContentLoaded', init);
