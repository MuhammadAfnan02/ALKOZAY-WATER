// ============== MAIN APPLICATION ==============
document.addEventListener('DOMContentLoaded', async function() {
    console.log("🏭 Alkozay Factory Manager Loading...");
    
    // Initialize database
    await window.alkozayDB.init();
    
    // Load settings
    loadSettings();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial UI update
    refreshUI();
    
    // Start router
    router('dashboard');
    
    console.log("✅ App Ready");
});

function setupEventListeners() {
    // File input for JSON import
    document.getElementById('jsonFileInput').addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            await window.alkozayDB.importFromJSON(file);
            location.reload(); // Reload to show new data
        } catch (error) {
            window.alkozayDB.showToast('Import failed: ' + error.message, 'error');
        }
        
        // Reset file input
        this.value = '';
    });
    
    // Save on page unload
    window.addEventListener('beforeunload', async function() {
        await window.alkozayDB.saveData();
    });
    
    // Save when app goes to background (mobile)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            window.alkozayDB.saveData();
        }
    });
}

// ============== ROUTER FUNCTIONS ==============
function router(page) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected view
    document.getElementById(page).classList.add('active');
    
    // Set active nav item
    const navItems = ['dashboard', 'imports', 'sales', 'inventory', 'reports', 'settings'];
    const index = navItems.indexOf(page);
    if (index !== -1) {
        document.querySelectorAll('.nav-item')[index].classList.add('active');
    }
    
    // Update page title
    document.getElementById('page-title').textContent = 
        page.charAt(0).toUpperCase() + page.slice(1);
    
    // Update factory subtitle
    if (window.alkozayDB.appData) {
        document.getElementById('factory-sub').textContent = 
            `${window.alkozayDB.appData.meta.name} - ${window.alkozayDB.appData.meta.location}`;
    }
    
    // Refresh UI for specific pages
    if (page === 'dashboard') {
        renderDashboard();
    } else if (page === 'imports') {
        renderImports();
    } else if (page === 'sales') {
        renderSales();
    } else if (page === 'reports') {
        generateReport();
    }
    
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
        toggleSidebar(false);
    }
}

function toggleSidebar(show) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    if (show === undefined) {
        show = !sidebar.classList.contains('active');
    }
    
    if (show) {
        sidebar.classList.add('active');
        overlay.style.display = 'block';
        setTimeout(() => overlay.style.opacity = '1', 10);
    } else {
        sidebar.classList.remove('active');
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 300);
    }
}

function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    showToast('Theme changed');
}

// ============== IMPORT/EXPORT FUNCTIONS ==============
function exportData() {
    window.alkozayDB.exportToJSON();
}

function importData() {
    // Trigger file input click
    document.getElementById('jsonFileInput').click();
}

// ============== SETTINGS FUNCTIONS ==============
function loadSettings() {
    if (!window.alkozayDB.appData) return;
    
    const data = window.alkozayDB.appData;
    
    // Load form values
    document.getElementById('set-name').value = data.meta.name;
    document.getElementById('set-loc').value = data.meta.location;
    document.getElementById('set-p-s').value = data.settings.priceSmall;
    document.getElementById('set-p-l').value = data.settings.priceLarge;
    document.getElementById('set-lim-s').value = data.settings.minSmall;
    document.getElementById('set-lim-l').value = data.settings.minLarge;
}

async function saveSettings() {
    const settings = {
        name: document.getElementById('set-name').value,
        location: document.getElementById('set-loc').value,
        priceSmall: parseFloat(document.getElementById('set-p-s').value) || 500,
        priceLarge: parseFloat(document.getElementById('set-p-l').value) || 300,
        minSmall: parseInt(document.getElementById('set-lim-s').value) || 1000,
        minLarge: parseInt(document.getElementById('set-lim-l').value) || 500
    };
    
    window.alkozayDB.updateSettings(settings);
    await window.alkozayDB.forceSave();
    
    // Update UI
    document.getElementById('factory-sub').textContent = 
        `${settings.name} - ${settings.location}`;
    
    showToast('Settings saved');
}

// ============== IMPORT MODAL FUNCTIONS ==============
function openImportModal(importId = null) {
    const modal = document.getElementById('modal-import');
    
    if (importId) {
        // Edit mode
        const importRecord = window.alkozayDB.appData.imports.find(imp => imp.id === importId);
        if (!importRecord) return;
        
        document.getElementById('imp-modal-title').textContent = 'Edit Import';
        document.getElementById('imp-id').value = importRecord.id;
        document.getElementById('imp-sup').value = importRecord.sup || '';
        document.getElementById('imp-config').value = importRecord.type || 'both';
        document.getElementById('imp-q-s').value = importRecord.qs || 0;
        document.getElementById('imp-q-l').value = importRecord.ql || 0;
        document.getElementById('imp-cost').value = importRecord.costPerBottle || 0;
        
    } else {
        // Add mode
        document.getElementById('imp-modal-title').textContent = 'Add Import';
        document.getElementById('imp-id').value = '';
        document.getElementById('imp-sup').value = '';
        document.getElementById('imp-config').value = 'both';
        document.getElementById('imp-q-s').value = '';
        document.getElementById('imp-q-l').value = '';
        document.getElementById('imp-cost').value = '';
    }
    
    uiToggleImportInputs();
    uiCalcImport();
    modal.classList.add('open');
}

function uiToggleImportInputs() {
    const type = document.getElementById('imp-config').value;
    const sDiv = document.getElementById('imp-grp-s');
    const lDiv = document.getElementById('imp-grp-l');
    
    if (type === 'small') {
        sDiv.style.display = 'block';
        lDiv.style.display = 'none';
        document.getElementById('imp-q-l').value = 0;
    } else if (type === 'large') {
        sDiv.style.display = 'none';
        lDiv.style.display = 'block';
        document.getElementById('imp-q-s').value = 0;
    } else {
        sDiv.style.display = 'block';
        lDiv.style.display = 'block';
    }
    
    uiCalcImport();
}

function uiCalcImport() {
    const qs = parseInt(document.getElementById('imp-q-s').value) || 0;
    const ql = parseInt(document.getElementById('imp-q-l').value) || 0;
    const cost = parseFloat(document.getElementById('imp-cost').value) || 0;
    const total = (qs + ql) * cost;
    document.getElementById('imp-total').textContent = total.toLocaleString();
}

async function saveImport() {
    const importData = {
        sup: document.getElementById('imp-sup').value.trim(),
        type: document.getElementById('imp-config').value,
        qs: parseInt(document.getElementById('imp-q-s').value) || 0,
        ql: parseInt(document.getElementById('imp-q-l').value) || 0,
        costPerBottle: parseFloat(document.getElementById('imp-cost').value) || 0,
        total: (parseInt(document.getElementById('imp-q-s').value) || 0 + 
                parseInt(document.getElementById('imp-q-l').value) || 0) * 
               (parseFloat(document.getElementById('imp-cost').value) || 0)
    };
    
    // Validation
    if (!importData.sup || importData.costPerBottle <= 0) {
        showToast('Please enter valid data', 'error');
        return;
    }
    
    if (importData.type === 'both' && importData.qs <= 0 && importData.ql <= 0) {
        showToast('Please enter quantity', 'error');
        return;
    }
    
    if (importData.type === 'small' && importData.qs <= 0) {
        showToast('Please enter quantity', 'error');
        return;
    }
    
    if (importData.type === 'large' && importData.ql <= 0) {
        showToast('Please enter quantity', 'error');
        return;
    }
    
    const importId = document.getElementById('imp-id').value;
    
    if (importId) {
        // Delete old import first
        window.alkozayDB.deleteImport(parseInt(importId));
    }
    
    // Add new import
    window.alkozayDB.addImport(importData);
    await window.alkozayDB.forceSave();
    
    closeModal('modal-import');
    renderImports();
    refreshUI();
    showToast(importId ? 'Import updated' : 'Import added');
}

function deleteImport(id) {
    if (window.alkozayDB.deleteImport(id)) {
        window.alkozayDB.forceSave();
        renderImports();
        refreshUI();
        showToast('Import deleted');
    }
}

// ============== SALE MODAL FUNCTIONS ==============
function openSaleModal(saleId = null) {
    const modal = document.getElementById('modal-sale');
    
    // Update price labels
    if (window.alkozayDB.appData) {
        document.getElementById('p-s-lbl').textContent = window.alkozayDB.appData.settings.priceSmall;
        document.getElementById('p-l-lbl').textContent = window.alkozayDB.appData.settings.priceLarge;
    }
    
    if (saleId) {
        // Edit mode
        const saleRecord = window.alkozayDB.appData.sales.find(sale => sale.id === saleId);
        if (!saleRecord) return;
        
        document.getElementById('sale-modal-title').textContent = 'Edit Sale';
        document.getElementById('sale-id').value = saleRecord.id;
        document.getElementById('sale-config').value = 
            saleRecord.qs > 0 && saleRecord.ql > 0 ? 'both' : 
            saleRecord.qs > 0 ? 'small' : 'large';
        document.getElementById('sale-q-s').value = saleRecord.qs || 0;
        document.getElementById('sale-q-l').value = saleRecord.ql || 0;
        document.getElementById('sale-note').value = saleRecord.note || '';
        
    } else {
        // Add mode
        document.getElementById('sale-modal-title').textContent = 'New Sale';
        document.getElementById('sale-id').value = '';
        document.getElementById('sale-config').value = 'both';
        document.getElementById('sale-q-s').value = '';
        document.getElementById('sale-q-l').value = '';
        document.getElementById('sale-note').value = '';
    }
    
    uiToggleSaleInputs();
    uiCalcSale();
    modal.classList.add('open');
}

function uiToggleSaleInputs() {
    const type = document.getElementById('sale-config').value;
    const sDiv = document.getElementById('grp-s');
    const lDiv = document.getElementById('grp-l');
    
    if (type === 'small') {
        sDiv.style.display = 'block';
        lDiv.style.display = 'none';
        document.getElementById('sale-q-l').value = 0;
    } else if (type === 'large') {
        sDiv.style.display = 'none';
        lDiv.style.display = 'block';
        document.getElementById('sale-q-s').value = 0;
    } else {
        sDiv.style.display = 'block';
        lDiv.style.display = 'block';
    }
    
    uiCalcSale();
}

function uiCalcSale() {
    if (!window.alkozayDB.appData) return;
    
    const qs = parseInt(document.getElementById('sale-q-s').value) || 0;
    const ql = parseInt(document.getElementById('sale-q-l').value) || 0;
    const total = (qs * window.alkozayDB.appData.settings.priceSmall) + 
                  (ql * window.alkozayDB.appData.settings.priceLarge);
    document.getElementById('sale-total').textContent = total.toLocaleString();
}

async function saveSale() {
    const saleData = {
        qs: parseInt(document.getElementById('sale-q-s').value) || 0,
        ql: parseInt(document.getElementById('sale-q-l').value) || 0,
        note: document.getElementById('sale-note').value.trim()
    };
    
    // Validation
    if (saleData.qs <= 0 && saleData.ql <= 0) {
        showToast('Please enter quantity', 'error');
        return;
    }
    
    const saleId = document.getElementById('sale-id').value;
    
    if (saleId) {
        // Delete old sale first
        window.alkozayDB.deleteSale(parseInt(saleId));
    }
    
    // Add new sale
    const result = window.alkozayDB.addSale(saleData);
    if (!result) {
        showToast('Insufficient stock', 'error');
        return;
    }
    
    await window.alkozayDB.forceSave();
    
    closeModal('modal-sale');
    renderSales();
    refreshUI();
    showToast(saleId ? 'Sale updated' : 'Sale completed');
}

function deleteSale(id) {
    if (window.alkozayDB.deleteSale(id)) {
        window.alkozayDB.forceSave();
        renderSales();
        refreshUI();
        showToast('Sale deleted');
    }
}

// ============== UI RENDER FUNCTIONS ==============
function renderDashboard() {
    if (!window.alkozayDB.appData) return;
    
    const stats = window.alkozayDB.getStats();
    
    // Update stats cards
    document.getElementById('d-today-rev').textContent = 
        stats.sales.today.toLocaleString();
    document.getElementById('d-stock-val').textContent = 
        Math.round((stats.inventory.small * window.alkozayDB.appData.settings.priceSmall / 12) + 
                  (stats.inventory.large * window.alkozayDB.appData.settings.priceLarge / 6)).toLocaleString();
    document.getElementById('d-small-qty').textContent = 
        stats.inventory.small.toLocaleString();
    document.getElementById('d-large-qty').textContent = 
        stats.inventory.large.toLocaleString();
    
    // Update inventory view
    document.getElementById('inv-s-qty').textContent = 
        stats.inventory.small.toLocaleString();
    document.getElementById('inv-l-qty').textContent = 
        stats.inventory.large.toLocaleString();
    document.getElementById('inv-s-packs').textContent = 
        Math.floor(stats.inventory.small / 12);
    document.getElementById('inv-l-packs').textContent = 
        Math.floor(stats.inventory.large / 6);
    
    // Render recent activity
    renderActivity();
    
    // Render chart
    renderChart();
}

function renderImports() {
    if (!window.alkozayDB.appData) return;
    
    const container = document.getElementById('list-imports');
    const imports = window.alkozayDB.appData.imports;
    
    container.innerHTML = imports.map((imp, index) => `
        <tr style="animation-delay: ${index * 0.05}s">
            <td data-label="Date">${new Date(imp.date).toLocaleDateString()}</td>
            <td data-label="Supplier">${imp.sup}</td>
            <td data-label="Type">${imp.type === 'both' ? 'Both' : imp.type}</td>
            <td data-label="Qty">${((imp.qs || 0) + (imp.ql || 0)).toLocaleString()}</td>
            <td data-label="Cost">₹${(imp.total || 0).toLocaleString()}</td>
            <td data-label="Actions">
                <button class="btn-action btn-edit" onclick="openImportModal(${imp.id})">✎</button>
                <button class="btn-action btn-del" onclick="deleteImport(${imp.id})">✖</button>
            </td>
        </tr>
    `).join('');
}

function renderSales() {
    if (!window.alkozayDB.appData) return;
    
    const searchTerm = document.getElementById('search-sale').value.toLowerCase();
    const sales = window.alkozayDB.appData.sales.filter(sale => 
        (sale.note || '').toLowerCase().includes(searchTerm) || 
        sale.date.includes(searchTerm)
    );
    
    const container = document.getElementById('list-sales');
    container.innerHTML = sales.map((sale, index) => `
        <tr style="animation-delay: ${index * 0.05}s">
            <td data-label="Date">${new Date(sale.date).toLocaleDateString()}</td>
            <td data-label="Details">
                ${sale.qs > 0 ? `<span style="color:var(--primary)">S:${sale.qs}</span> ` : ''}
                ${sale.ql > 0 ? `<span style="color:var(--secondary)">L:${sale.ql}</span>` : ''}
                <br><span style="color:var(--text-light); font-size:0.8rem;">${sale.note || ''}</span>
            </td>
            <td data-label="Amount" style="font-weight:bold; color:var(--success)">₹${(sale.total || 0).toLocaleString()}</td>
            <td data-label="Actions">
                <button class="btn-action btn-print" onclick="printReceipt(${sale.id})">🖨️</button>
                <button class="btn-action btn-edit" onclick="openSaleModal(${sale.id})">✎</button>
                <button class="btn-action btn-del" onclick="deleteSale(${sale.id})">✖</button>
            </td>
        </tr>
    `).join('');
}

function renderActivity() {
    if (!window.alkozayDB.appData) return;
    
    const container = document.getElementById('dash-activity');
    const activities = window.alkozayDB.appData.activities.slice(0, 6);
    
    container.innerHTML = activities.map((act, index) => `
        <tr style="animation-delay: ${index * 0.05}s">
            <td data-label="Type">
                <span style="color:${act.type === 'import' ? 'var(--primary)' : 'var(--success)'}">
                    ${act.type === 'import' ? '🚚' : '💰'} ${act.type}
                </span>
            </td>
            <td data-label="Desc">${act.description}</td>
            <td data-label="Time" style="color:var(--text-light)">
                ${new Date(act.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
            </td>
        </tr>
    `).join('');
}

function renderChart() {
    const container = document.getElementById('sales-chart');
    if (!container || !window.alkozayDB.appData) return;
    
    // Generate last 6 months data
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push(d.toISOString().slice(0, 7));
    }
    
    const data = months.map(month => 
        window.alkozayDB.appData.sales
            .filter(s => s.date.startsWith(month))
            .reduce((sum, s) => sum + (s.total || 0), 0)
    );
    
    const max = Math.max(...data) || 100;
    
    container.innerHTML = months.map((month, i) => {
        const height = (data[i] / max) * 100;
        const label = new Date(month + '-01').toLocaleDateString('en-US', {month: 'short'});
        return `
            <div class="bar-wrapper" style="animation-delay: ${i * 0.1}s">
                <div class="bar" style="height:${height}%">
                    <span class="bar-val">₹${data[i] > 999 ? (data[i]/1000).toFixed(1)+'k' : data[i]}</span>
                </div>
                <span class="bar-lbl">${label}</span>
            </div>
        `;
    }).join('');
}

function generateReport() {
    if (!window.alkozayDB.appData) return;
    
    const month = document.getElementById('report-month').value;
    if (!month) return;
    
    const sales = window.alkozayDB.appData.sales.filter(s => s.date.startsWith(month));
    const imports = window.alkozayDB.appData.imports.filter(i => i.date.startsWith(month));
    
    const income = sales.reduce((sum, s) => sum + (s.total || 0), 0);
    const expense = imports.reduce((sum, i) => sum + (i.total || 0), 0);
    
    document.getElementById('rep-inc').textContent = '₹' + income.toLocaleString();
    document.getElementById('rep-exp').textContent = '₹' + expense.toLocaleString();
    document.getElementById('rep-net').textContent = '₹' + (income - expense).toLocaleString();
    
    // Update bottles data
    const bottles = window.alkozayDB.appData.bottlesData;
    document.getElementById('rep-total-imported').textContent = 
        (bottles.importedS + bottles.importedL).toLocaleString();
    document.getElementById('rep-imported-s').textContent = bottles.importedS.toLocaleString();
    document.getElementById('rep-imported-l').textContent = bottles.importedL.toLocaleString();
    
    document.getElementById('rep-total-sold').textContent = 
        (bottles.soldS + bottles.soldL).toLocaleString();
    document.getElementById('rep-sold-s').textContent = bottles.soldS.toLocaleString();
    document.getElementById('rep-sold-l').textContent = bottles.soldL.toLocaleString();
    
    const inventory = window.alkozayDB.appData.inventory;
    document.getElementById('rep-current-stock').textContent = 
        (inventory.small + inventory.large).toLocaleString();
    document.getElementById('rep-stock-s').textContent = inventory.small.toLocaleString();
    document.getElementById('rep-stock-l').textContent = inventory.large.toLocaleString();
    
    // Render ledger
    const logs = [
        ...sales.map(s => ({date: s.date, type: 'Sale', detail: `Sale #${s.id}`, amount: s.total})),
        ...imports.map(i => ({date: i.date, type: 'Import', detail: i.sup, amount: -i.total}))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const container = document.getElementById('rep-list');
    container.innerHTML = logs.map((log, index) => `
        <tr style="animation-delay: ${index * 0.05}s">
            <td data-label="Date">${log.date.slice(0, 10)}</td>
            <td data-label="Type">
                <span style="color:${log.type === 'Sale' ? 'var(--success)' : 'var(--primary)'}">
                    ${log.type}
                </span>
            </td>
            <td data-label="Detail">${log.detail}</td>
            <td data-label="Amount" style="color:${log.amount >= 0 ? 'var(--success)' : 'var(--danger)'}">
                ${log.amount >= 0 ? '₹' : '-₹'}${Math.abs(log.amount).toLocaleString()}
            </td>
        </tr>
    `).join('');
}

function refreshUI() {
    if (!window.alkozayDB.appData) return;
    
    renderDashboard();
    
    // Update database info
    document.getElementById('db-status').textContent = '✅ Connected';
    document.getElementById('db-size').textContent = 
        `${(JSON.stringify(window.alkozayDB.appData).length / 1024).toFixed(2)} KB`;
    
    if (window.alkozayDB.appData.meta.lastSave) {
        const lastSave = new Date(window.alkozayDB.appData.meta.lastSave);
        document.getElementById('last-save').textContent = 
            `${lastSave.getHours().toString().padStart(2, '0')}:${lastSave.getMinutes().toString().padStart(2, '0')}`;
    }
}

// ============== UTILITY FUNCTIONS ==============
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toast-msg').previousElementSibling;
    const text = document.getElementById('toast-msg');
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    icon.textContent = icons[type] || icons.success;
    text.textContent = message;
    
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('open');
}

function showResetConfirm() {
    document.getElementById('resetConfirm').style.display = 'block';
}

function hideResetConfirm() {
    document.getElementById('resetConfirm').style.display = 'none';
}

async function confirmResetData() {
    const confirmed = await window.alkozayDB.resetData();
    if (confirmed) {
        hideResetConfirm();
        location.reload();
    }
}

function printReceipt(saleId) {
    const sale = window.alkozayDB.appData.sales.find(s => s.id === saleId);
    if (!sale) return;
    
    const win = window.open('', '_blank');
    win.document.write(`
        <html>
            <head>
                <title>Receipt #${saleId}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h2 { color: #333; text-align: center; }
                    .receipt { border: 1px dashed #ccc; padding: 20px; margin: 20px 0; }
                    .item { display: flex; justify-content: space-between; margin: 5px 0; }
                    .total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #333; padding-top: 10px; }
                </style>
            </head>
            <body>
                <h2>${window.alkozayDB.appData.meta.name}</h2>
                <p style="text-align: center;">${window.alkozayDB.appData.meta.location}</p>
                <hr>
                <p>Receipt #${saleId.toString().slice(-6)}</p>
                <p>Date: ${new Date(sale.date).toLocaleString()}</p>
                <div class="receipt">
                    ${sale.qs > 0 ? `<div class="item"><span>Small Packs x ${sale.qs}</span><span>₹${sale.qs * window.alkozayDB.appData.settings.priceSmall}</span></div>` : ''}
                    ${sale.ql > 0 ? `<div class="item"><span>Large Packs x ${sale.ql}</span><span>₹${sale.ql * window.alkozayDB.appData.settings.priceLarge}</span></div>` : ''}
                    <div class="item total">
                        <span>TOTAL</span>
                        <span>₹${sale.total}</span>
                    </div>
                </div>
                <p>Customer: ${sale.note || 'N/A'}</p>
                <p style="text-align: center; margin-top: 30px;">Thank you for your business!</p>
            </body>
        </html>
    `);
    win.print();
    win.close();
}

// ============== CONFIRMATION MODAL ==============
let pendingAction = null;

function showConfirm(title, message, callback) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    pendingAction = callback;
    document.getElementById('modal-confirm').classList.add('open');
}

function confirmAction() {
    if (pendingAction) {
        pendingAction();
        pendingAction = null;
    }
    closeModal('modal-confirm');
}
