// ============== ALKOZAY DATABASE SYSTEM ==============
class AlkozayDatabase {
    constructor() {
        this.dbName = 'alkozay_factory_v5';
        this.backupKeys = [
            'alkozay_main_data',
            'alkozay_backup_1',
            'alkozay_backup_2',
            'alkozay_backup_3'
        ];
        this.appData = null;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        console.log("🏭 Alkozay Database Initializing...");
        
        // Load existing data
        await this.loadData();
        
        // Start auto-save every 2 seconds
        this.startAutoSave();
        
        console.log("✅ Database Ready");
    }

    async loadData() {
        console.log("📥 Loading data...");
        
        // Try all backup keys
        for (const key of this.backupKeys) {
            try {
                const data = localStorage.getItem(key);
                if (data && data !== 'null') {
                    this.appData = JSON.parse(data);
                    console.log(`✅ Loaded from: ${key}`);
                    return;
                }
            } catch (e) {
                console.warn(`Failed to load from ${key}:`, e);
            }
        }
        
        // Create new data if none found
        this.appData = this.getDefaultData();
        console.log("✨ New database created");
        
        // Save immediately
        await this.saveData();
    }

    getDefaultData() {
        return {
            meta: {
                name: "Alkozay Water Factory",
                location: "Peshawar",
                version: "5.0",
                created: new Date().toISOString(),
                lastSave: null
            },
            settings: {
                priceSmall: 500,
                priceLarge: 300,
                minSmall: 1000,
                minLarge: 500
            },
            inventory: {
                small: 0,
                large: 0
            },
            imports: [],
            sales: [],
            bottlesData: {
                importedS: 0,
                importedL: 0,
                soldS: 0,
                soldL: 0
            },
            activities: []
        };
    }

    async saveData() {
        try {
            console.log("💾 Saving data...");
            
            if (!this.appData) return false;
            
            // Update timestamp
            this.appData.meta.lastSave = new Date().toISOString();
            
            const dataStr = JSON.stringify(this.appData, null, 2);
            
            // Save to all backup locations
            for (const key of this.backupKeys) {
                try {
                    localStorage.setItem(key, dataStr);
                } catch (e) {
                    console.warn(`Failed to save to ${key}:`, e);
                }
            }
            
            // Also save to sessionStorage
            try {
                sessionStorage.setItem('alkozay_session_data', dataStr);
            } catch (e) {
                // Ignore
            }
            
            console.log("✅ Data saved successfully");
            return true;
            
        } catch (error) {
            console.error("Save error:", error);
            return false;
        }
    }

    startAutoSave() {
        // Clear existing interval
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        // Start new interval (every 2 seconds)
        this.autoSaveInterval = setInterval(async () => {
            await this.saveData();
            
            // Update last save time in UI
            if (document.getElementById('last-save')) {
                const now = new Date();
                document.getElementById('last-save').textContent = 
                    `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            }
            
            // Update storage size
            if (document.getElementById('db-size')) {
                const size = JSON.stringify(this.appData).length;
                document.getElementById('db-size').textContent = 
                    `${(size / 1024).toFixed(2)} KB`;
            }
            
        }, 2000); // 2 seconds
    }

    // Force save (call this after every change)
    async forceSave() {
        const success = await this.saveData();
        this.showToast(success ? "💾 Saved successfully!" : "⚠️ Saved with backup");
        return success;
    }

    // ============== JSON IMPORT/EXPORT ==============
    exportToJSON() {
        try {
            // Create export data with metadata
            const exportData = {
                ...this.appData,
                exportInfo: {
                    exportedAt: new Date().toISOString(),
                    exportType: "Alkozay Factory Backup",
                    version: "5.0"
                }
            };
            
            // Convert to JSON string
            const jsonString = JSON.stringify(exportData, null, 2);
            
            // Create blob
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `alkozay_backup_${new Date().toISOString().slice(0,10)}.json`;
            
            // Trigger download
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Cleanup
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);
            
            this.showToast("📤 Backup exported successfully!");
            return true;
            
        } catch (error) {
            console.error("Export error:", error);
            this.showToast("❌ Export failed");
            return false;
        }
    }

    importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (event) => {
                try {
                    console.log("📥 Importing JSON file...");
                    
                    // Parse JSON
                    const importedData = JSON.parse(event.target.result);
                    
                    // Validate data structure
                    if (!this.validateImportData(importedData)) {
                        reject(new Error("Invalid backup file format"));
                        return;
                    }
                    
                    // Show confirmation
                    const shouldImport = await this.showImportConfirmation(importedData);
                    if (!shouldImport) {
                        reject(new Error("Import cancelled"));
                        return;
                    }
                    
                    // Replace current data
                    this.appData = importedData;
                    
                    // Save immediately
                    await this.saveData();
                    
                    this.showToast("✅ Data imported successfully!");
                    resolve(true);
                    
                } catch (error) {
                    console.error("Import error:", error);
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error("Failed to read file"));
            };
            
            reader.readAsText(file);
        });
    }

    validateImportData(data) {
        // Check required fields
        const required = ['meta', 'settings', 'inventory', 'imports', 'sales'];
        for (const field of required) {
            if (!data[field]) {
                console.error(`Missing field: ${field}`);
                return false;
            }
        }
        
        // Check data types
        if (!Array.isArray(data.imports) || !Array.isArray(data.sales)) {
            console.error("Invalid data types");
            return false;
        }
        
        return true;
    }

    async showImportConfirmation(importedData) {
        return new Promise((resolve) => {
            // Create confirmation modal
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `;
            
            const content = document.createElement('div');
            content.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 20px;
                max-width: 400px;
                width: 90%;
                text-align: center;
            `;
            
            const stats = this.getImportStats(importedData);
            
            content.innerHTML = `
                <h3 style="margin-bottom: 20px; color: #333;">⚠️ Import Backup</h3>
                <div style="text-align: left; margin-bottom: 25px;">
                    <p><strong>Factory:</strong> ${importedData.meta.name}</p>
                    <p><strong>Imports:</strong> ${stats.imports} records</p>
                    <p><strong>Sales:</strong> ${stats.sales} records</p>
                    <p><strong>Last Save:</strong> ${stats.lastSave}</p>
                </div>
                <p style="color: #ef5350; margin-bottom: 25px;">
                    ⚠️ This will replace ALL current data!
                </p>
                <div style="display: flex; gap: 10px;">
                    <button id="cancelImport" style="flex: 1; padding: 12px; background: #f0f0f0; border: none; border-radius: 10px; cursor: pointer;">
                        Cancel
                    </button>
                    <button id="confirmImport" style="flex: 1; padding: 12px; background: #ef5350; color: white; border: none; border-radius: 10px; cursor: pointer;">
                        Import
                    </button>
                </div>
            `;
            
            modal.appendChild(content);
            document.body.appendChild(modal);
            
            // Add event listeners
            document.getElementById('cancelImport').onclick = () => {
                document.body.removeChild(modal);
                resolve(false);
            };
            
            document.getElementById('confirmImport').onclick = () => {
                document.body.removeChild(modal);
                resolve(true);
            };
        });
    }

    getImportStats(data) {
        return {
            imports: data.imports.length,
            sales: data.sales.length,
            lastSave: data.meta.lastSave ? 
                new Date(data.meta.lastSave).toLocaleDateString() : 
                'Unknown'
        };
    }

    // ============== DATA OPERATIONS ==============
    addImport(importData) {
        if (!this.appData) return null;
        
        const importRecord = {
            id: Date.now(),
            date: new Date().toISOString(),
            ...importData
        };
        
        // Update inventory
        if (importData.type === 'small' || importData.type === 'both') {
            this.appData.inventory.small += importData.qs || 0;
            this.appData.bottlesData.importedS += importData.qs || 0;
        }
        if (importData.type === 'large' || importData.type === 'both') {
            this.appData.inventory.large += importData.ql || 0;
            this.appData.bottlesData.importedL += importData.ql || 0;
        }
        
        // Add to imports list
        this.appData.imports.unshift(importRecord);
        
        // Add activity
        this.addActivity('import', `Imported ${importData.qs || 0 + importData.ql || 0} bottles`);
        
        return importRecord;
    }

    addSale(saleData) {
        if (!this.appData) return null;
        
        const CONFIG = { packS: 12, packL: 6 };
        const bottlesSmall = saleData.qs * CONFIG.packS;
        const bottlesLarge = saleData.ql * CONFIG.packL;
        
        // Check inventory
        if (this.appData.inventory.small < bottlesSmall || 
            this.appData.inventory.large < bottlesLarge) {
            return null; // Insufficient stock
        }
        
        // Update inventory
        this.appData.inventory.small -= bottlesSmall;
        this.appData.inventory.large -= bottlesLarge;
        
        // Update bottles data
        this.appData.bottlesData.soldS += bottlesSmall;
        this.appData.bottlesData.soldL += bottlesLarge;
        
        const saleRecord = {
            id: Date.now(),
            date: new Date().toISOString(),
            ...saleData,
            total: (saleData.qs * this.appData.settings.priceSmall) + 
                   (saleData.ql * this.appData.settings.priceLarge)
        };
        
        // Add to sales list
        this.appData.sales.unshift(saleRecord);
        
        // Add activity
        this.addActivity('sale', `Sold ${saleData.qs || 0 + saleData.ql || 0} packs`);
        
        return saleRecord;
    }

    deleteImport(id) {
        if (!this.appData) return false;
        
        const index = this.appData.imports.findIndex(imp => imp.id === id);
        if (index === -1) return false;
        
        const importRecord = this.appData.imports[index];
        
        // Restore inventory
        if (importRecord.type === 'small' || importRecord.type === 'both') {
            this.appData.inventory.small = Math.max(0, this.appData.inventory.small - (importRecord.qs || 0));
            this.appData.bottlesData.importedS -= (importRecord.qs || 0);
        }
        if (importRecord.type === 'large' || importRecord.type === 'both') {
            this.appData.inventory.large = Math.max(0, this.appData.inventory.large - (importRecord.ql || 0));
            this.appData.bottlesData.importedL -= (importRecord.ql || 0);
        }
        
        // Remove from imports
        this.appData.imports.splice(index, 1);
        
        return true;
    }

    deleteSale(id) {
        if (!this.appData) return false;
        
        const index = this.appData.sales.findIndex(sale => sale.id === id);
        if (index === -1) return false;
        
        const saleRecord = this.appData.sales[index];
        const CONFIG = { packS: 12, packL: 6 };
        
        // Restore inventory
        this.appData.inventory.small += saleRecord.qs * CONFIG.packS;
        this.appData.inventory.large += saleRecord.ql * CONFIG.packL;
        
        // Update bottles data
        this.appData.bottlesData.soldS -= saleRecord.qs * CONFIG.packS;
        this.appData.bottlesData.soldL -= saleRecord.ql * CONFIG.packL;
        
        // Remove from sales
        this.appData.sales.splice(index, 1);
        
        return true;
    }

    updateSettings(settings) {
        if (!this.appData) return false;
        
        this.appData.settings = { ...this.appData.settings, ...settings };
        this.appData.meta.name = settings.name || this.appData.meta.name;
        this.appData.meta.location = settings.location || this.appData.meta.location;
        
        return true;
    }

    addActivity(type, description) {
        if (!this.appData) return;
        
        this.appData.activities.unshift({
            type,
            description,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 activities
        if (this.appData.activities.length > 50) {
            this.appData.activities.length = 50;
        }
    }

    // ============== UI HELPERS ==============
    showToast(message, type = 'info') {
        // Create or get toast element
        let toast = document.getElementById('alkozayToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'alkozayToast';
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: #323232;
                color: white;
                padding: 12px 24px;
                border-radius: 50px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 10px;
                opacity: 0;
                transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            `;
            document.body.appendChild(toast);
        }
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <span style="font-size: 1.2rem;">${icons[type] || icons.info}</span>
            <span>${message}</span>
        `;
        
        // Show toast
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(100px)';
        }, 3000);
    }

    // ============== STATISTICS ==============
    getStats() {
        if (!this.appData) return {};
        
        const today = new Date().toISOString().slice(0, 10);
        const todaySales = this.appData.sales
            .filter(s => s.date.startsWith(today))
            .reduce((sum, s) => sum + (s.total || 0), 0);
        
        const todayImports = this.appData.imports
            .filter(i => i.date.startsWith(today))
            .reduce((sum, i) => sum + (i.total || 0), 0);
        
        return {
            inventory: {
                small: this.appData.inventory.small,
                large: this.appData.inventory.large,
                total: this.appData.inventory.small + this.appData.inventory.large
            },
            sales: {
                today: todaySales,
                total: this.appData.sales.reduce((sum, s) => sum + (s.total || 0), 0),
                count: this.appData.sales.length
            },
            imports: {
                today: todayImports,
                total: this.appData.imports.reduce((sum, i) => sum + (i.total || 0), 0),
                count: this.appData.imports.length
            },
            bottles: this.appData.bottlesData
        };
    }

    // ============== RESET DATA ==============
    async resetData() {
        const confirmed = await this.showConfirm(
            'Reset All Data',
            'This will delete ALL data including imports, sales, and inventory. This cannot be undone!'
        );
        
        if (confirmed) {
            this.appData = this.getDefaultData();
            await this.saveData();
            this.showToast('🗑️ All data has been reset', 'warning');
            return true;
        }
        
        return false;
    }

    showConfirm(title, message) {
        return new Promise((resolve) => {
            // Create confirmation modal
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `;
            
            const content = document.createElement('div');
            content.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 20px;
                max-width: 400px;
                width: 90%;
                text-align: center;
            `;
            
            content.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 20px; color: #ef5350;">⚠️</div>
                <h3 style="margin-bottom: 10px; color: #333;">${title}</h3>
                <p style="margin-bottom: 25px; color: #666;">${message}</p>
                <div style="display: flex; gap: 10px;">
                    <button id="confirmCancel" style="flex: 1; padding: 12px; background: #f0f0f0; border: none; border-radius: 10px; cursor: pointer;">
                        Cancel
                    </button>
                    <button id="confirmProceed" style="flex: 1; padding: 12px; background: #ef5350; color: white; border: none; border-radius: 10px; cursor: pointer;">
                        Proceed
                    </button>
                </div>
            `;
            
            modal.appendChild(content);
            document.body.appendChild(modal);
            
            // Add event listeners
            document.getElementById('confirmCancel').onclick = () => {
                document.body.removeChild(modal);
                resolve(false);
            };
            
            document.getElementById('confirmProceed').onclick = () => {
                document.body.removeChild(modal);
                resolve(true);
            };
        });
    }
}

// Create global instance
window.alkozayDB = new AlkozayDatabase();
