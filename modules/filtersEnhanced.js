// Enhanced Filters Module
let savedFilters = [];

function initEnhancedFilters() {
    // Adicionar filtros avançados
    const filtersDiv = document.querySelector('.filter-group');
    if (!filtersDiv) return;
    
    const enhancedDiv = document.createElement('div');
    enhancedDiv.className = 'enhanced-filters';
    enhancedDiv.innerHTML = `
        <div class="date-filters">
            <input type="date" id="startDate" placeholder="Data inicial">
            <input type="date" id="endDate" placeholder="Data final">
            <select id="monthFilter">
                <option value="">Todos os meses</option>
                <option value="01">Janeiro</option>
                <option value="02">Fevereiro</option>
                <option value="03">Março</option>
                <option value="04">Abril</option>
                <option value="05">Maio</option>
                <option value="06">Junho</option>
                <option value="07">Julho</option>
                <option value="08">Agosto</option>
                <option value="09">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
            </select>
            <select id="yearFilter">
                <option value="">Todos os anos</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
            </select>
        </div>
        <div class="filter-actions">
            <button id="applyFiltersBtn" class="apply-filters">🔍 Aplicar Filtros</button>
            <button id="saveFilterBtn" class="save-filter">💾 Salvar Filtro Atual</button>
            <select id="loadFilterSelect" class="load-filter">
                <option value="">Carregar filtro salvo...</option>
            </select>
        </div>
    `;
    
    filtersDiv.parentNode.insertBefore(enhancedDiv, filtersDiv.nextSibling);
    
    // Carregar filtros salvos
    loadSavedFilters();
    
    // Eventos
    document.getElementById('applyFiltersBtn').addEventListener('click', applyAdvancedFilters);
    document.getElementById('saveFilterBtn').addEventListener('click', saveCurrentFilter);
    document.getElementById('loadFilterSelect').addEventListener('change', loadFilter);
}

function applyAdvancedFilters() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const month = document.getElementById('monthFilter').value;
    const year = document.getElementById('yearFilter').value;
    
    let filtered = [...rawData];
    
    // Filtro por data
    if (startDate) {
        filtered = filtered.filter(item => item.data.split(' ')[0] >= startDate);
    }
    if (endDate) {
        filtered = filtered.filter(item => item.data.split(' ')[0] <= endDate);
    }
    
    // Filtro por mês/ano
    if (month) {
        filtered = filtered.filter(item => {
            const itemMonth = item.data.split('/')[1];
            return itemMonth === month;
        });
    }
    if (year) {
        filtered = filtered.filter(item => {
            const itemYear = item.data.split('/')[2].split(' ')[0];
            return itemYear === year;
        });
    }
    
    // Aplicar outros filtros existentes
    const person = document.getElementById('filterPerson')?.value || 'all';
    const type = document.getElementById('filterType')?.value || 'all';
    const category = document.getElementById('filterCategory')?.value || 'all';
    const search = document.getElementById('searchDescription')?.value.toLowerCase() || '';
    
    filtered = filtered.filter(item => {
        if (person !== 'all' && item.quem !== person) return false;
        if (type !== 'all' && item.tipo !== type) return false;
        if (category !== 'all' && item.categoria !== category) return false;
        if (search && !item.descricao.toLowerCase().includes(search)) return false;
        return true;
    });
    
    filteredData = filtered;
    renderDashboard();
    renderTable();
    
    showNotification(`✅ Filtros aplicados: ${filtered.length} registros`, 'success');
}

function saveCurrentFilter() {
    const filterName = prompt('Digite um nome para este filtro:', `Filtro ${savedFilters.length + 1}`);
    if (!filterName) return;
    
    const currentFilter = {
        id: Date.now(),
        name: filterName,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        month: document.getElementById('monthFilter').value,
        year: document.getElementById('yearFilter').value,
        person: document.getElementById('filterPerson')?.value || 'all',
        type: document.getElementById('filterType')?.value || 'all',
        category: document.getElementById('filterCategory')?.value || 'all',
        search: document.getElementById('searchDescription')?.value || ''
    };
    
    savedFilters.push(currentFilter);
    localStorage.setItem('savedFilters', JSON.stringify(savedFilters));
    loadSavedFilters();
    showNotification('💾 Filtro salvo com sucesso!', 'success');
}

function loadSavedFilters() {
    const saved = localStorage.getItem('savedFilters');
    if (saved) {
        savedFilters = JSON.parse(saved);
    }
    
    const select = document.getElementById('loadFilterSelect');
    if (select) {
        select.innerHTML = '<option value="">Carregar filtro salvo...</option>' +
            savedFilters.map(filter => `<option value="${filter.id}">${filter.name}</option>`).join('');
    }
}

function loadFilter(event) {
    const filterId = parseInt(event.target.value);
    if (!filterId) return;
    
    const filter = savedFilters.find(f => f.id === filterId);
    if (!filter) return;
    
    document.getElementById('startDate').value = filter.startDate || '';
    document.getElementById('endDate').value = filter.endDate || '';
    document.getElementById('monthFilter').value = filter.month || '';
    document.getElementById('yearFilter').value = filter.year || '';
    
    if (filter.person !== 'all') {
        const personSelect = document.getElementById('filterPerson');
        if (personSelect) personSelect.value = filter.person;
    }
    if (filter.type !== 'all') {
        const typeSelect = document.getElementById('filterType');
        if (typeSelect) typeSelect.value = filter.type;
    }
    if (filter.category !== 'all') {
        const categorySelect = document.getElementById('filterCategory');
        if (categorySelect) categorySelect.value = filter.category;
    }
    
    const searchInput = document.getElementById('searchDescription');
    if (searchInput) searchInput.value = filter.search || '';
    
    applyAdvancedFilters();
    showNotification(`🔄 Filtro "${filter.name}" carregado!`, 'success');
}

document.addEventListener('DOMContentLoaded', initEnhancedFilters);
