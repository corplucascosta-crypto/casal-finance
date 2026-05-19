// Enhanced Filters Module - Versão corrigida
(function() {
    if (window.filtersEnhancedInitialized) return;
    window.filtersEnhancedInitialized = true;
    
    let savedFilters = [];

    function initEnhancedFilters() {
        const applyBtn = document.getElementById('applyFiltersBtn');
        const saveBtn = document.getElementById('saveFilterBtn');
        const loadSelect = document.getElementById('loadFilterSelect');
        
        if (!applyBtn) return;
        
        applyBtn.addEventListener('click', applyAdvancedFilters);
        if (saveBtn) saveBtn.addEventListener('click', saveCurrentFilter);
        if (loadSelect) loadSelect.addEventListener('change', loadFilter);
        
        loadSavedFilters();
    }
    
    function applyAdvancedFilters() {
        const startDate = document.getElementById('startDate')?.value;
        const endDate = document.getElementById('endDate')?.value;
        const month = document.getElementById('monthFilter')?.value;
        const year = document.getElementById('yearFilter')?.value;
        
        let filtered = [...window.rawData];
        
        if (startDate) {
            filtered = filtered.filter(item => item.data.split(' ')[0] >= startDate);
        }
        if (endDate) {
            filtered = filtered.filter(item => item.data.split(' ')[0] <= endDate);
        }
        if (month) {
            filtered = filtered.filter(item => item.data.split('/')[1] === month);
        }
        if (year) {
            filtered = filtered.filter(item => item.data.split('/')[2].split(' ')[0] === year);
        }
        
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
        
        window.filteredData = filtered;
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderTable === 'function') renderTable();
        
        if (window.showNotification) window.showNotification(`✅ ${filtered.length} registros`, 'success');
    }
    
    function saveCurrentFilter() {
        const filterName = prompt('Nome do filtro:', `Filtro ${savedFilters.length + 1}`);
        if (!filterName) return;
        
        savedFilters.push({
            id: Date.now(),
            name: filterName,
            startDate: document.getElementById('startDate')?.value || '',
            endDate: document.getElementById('endDate')?.value || '',
            month: document.getElementById('monthFilter')?.value || '',
            year: document.getElementById('yearFilter')?.value || ''
        });
        
        localStorage.setItem('savedFilters', JSON.stringify(savedFilters));
        loadSavedFilters();
        if (window.showNotification) window.showNotification('💾 Filtro salvo!', 'success');
    }
    
    function loadSavedFilters() {
        const saved = localStorage.getItem('savedFilters');
        if (saved) savedFilters = JSON.parse(saved);
        
        const select = document.getElementById('loadFilterSelect');
        if (select) {
            select.innerHTML = '<option value="">Carregar filtro...</option>' +
                savedFilters.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
        }
    }
    
    function loadFilter(event) {
        const filter = savedFilters.find(f => f.id == event.target.value);
        if (!filter) return;
        
        if (document.getElementById('startDate')) document.getElementById('startDate').value = filter.startDate;
        if (document.getElementById('endDate')) document.getElementById('endDate').value = filter.endDate;
        if (document.getElementById('monthFilter')) document.getElementById('monthFilter').value = filter.month;
        if (document.getElementById('yearFilter')) document.getElementById('yearFilter').value = filter.year;
        
        applyAdvancedFilters();
        if (window.showNotification) window.showNotification(`🔄 Filtro "${filter.name}" carregado!`, 'success');
    }
    
    document.addEventListener('DOMContentLoaded', initEnhancedFilters);
})();
