// Módulo principal
var rawData = [];
var filteredData = [];

// Inicialização
async function init() {
    console.log('Iniciando app...');
    
    if (!verificarLogin()) return;
    
    // Carregar receitas fixas
    if (typeof loadFixedIncomes === 'function') loadFixedIncomes();
    
    // O Supabase Client já carrega os dados automaticamente
    // Aguardar o Supabase carregar
    setTimeout(function() {
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderTable === 'function') renderTable();
        if (typeof renderForecast === 'function') renderForecast();
        if (typeof renderDailyChart === 'function') renderDailyChart();
        if (typeof renderAnalytics === 'function') renderAnalytics();
        if (typeof renderPersonDashboard === 'function') renderPersonDashboard();
    }, 2000);
    
    setupEventListeners();
    updateLastUpdateTime();
}

function setupEventListeners() {
    var filterPerson = document.getElementById('filterPerson');
    var filterType = document.getElementById('filterType');
    var filterCategory = document.getElementById('filterCategory');
    var searchDescription = document.getElementById('searchDescription');
    var resetFilters = document.getElementById('resetFilters');
    
    if (filterPerson) filterPerson.addEventListener('change', applyFilters);
    if (filterType) filterType.addEventListener('change', applyFilters);
    if (filterCategory) filterCategory.addEventListener('change', applyFilters);
    if (searchDescription) searchDescription.addEventListener('input', applyFilters);
    if (resetFilters) resetFilters.addEventListener('click', resetFilters);
}

function applyFilters() {
    var person = document.getElementById('filterPerson')?.value || 'all';
    var type = document.getElementById('filterType')?.value || 'all';
    var category = document.getElementById('filterCategory')?.value || 'all';
    var search = document.getElementById('searchDescription')?.value.toLowerCase() || '';

    filteredData = rawData.filter(function(item) {
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
    if (typeof renderDailyChart === 'function') renderDailyChart();
    if (typeof renderAnalytics === 'function') renderAnalytics();
    if (typeof renderPersonDashboard === 'function') renderPersonDashboard();
}

function resetFilters() {
    var filterPerson = document.getElementById('filterPerson');
    var filterType = document.getElementById('filterType');
    var filterCategory = document.getElementById('filterCategory');
    var searchDescription = document.getElementById('searchDescription');
    
    if (filterPerson) filterPerson.value = 'all';
    if (filterType) filterType.value = 'all';
    if (filterCategory) filterCategory.value = 'all';
    if (searchDescription) searchDescription.value = '';
    
    applyFilters();
}

function updateLastUpdateTime() {
    var now = new Date();
    var updateEl = document.getElementById('lastUpdate');
    if (updateEl) {
        updateEl.innerText = 'Última atualização: ' + now.toLocaleString();
    }
}

// Aguardar DOM carregar
document.addEventListener('DOMContentLoaded', init);
