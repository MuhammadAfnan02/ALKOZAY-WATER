// Admin Panel JavaScript - Client-side functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data structure
    let restaurantData = {
        about: { text: '' },
        contact: {
            phone: '',
            location: '',
            hours: '',
            email: '',
            address: ''
        },
        menu: [],
        offers: {
            student: [],
            family: [],
            teacher: [],
            special: [],
            combo: []
        }
    };
    
    const DATA_FILE = 'restaurant_data.json';
    const UPLOAD_DIR = 'assets/';
    
    // DOM Elements
    const adminMessage = document.getElementById('admin-message');
    const messageText = document.getElementById('message-text');
    
    // Current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Load data from localStorage or JSON file
    async function loadData() {
        try {
            // Try to load from localStorage first (for faster access)
            const savedData = localStorage.getItem('restaurant_data');
            if (savedData) {
                restaurantData = JSON.parse(savedData);
                return;
            }
            
            // If not in localStorage, try to load from JSON file
            const response = await fetch(DATA_FILE);
            if (response.ok) {
                const data = await response.json();
                restaurantData = data;
                // Save to localStorage for next time
                localStorage.setItem('restaurant_data', JSON.stringify(data));
            }
        } catch (error) {
            console.log('Loading fresh data...');
            // Keep default data structure
        }
        
        updateUI();
    }
    
    // Save data to localStorage and JSON file
    async function saveData() {
        try {
            // Save to localStorage
            localStorage.setItem('restaurant_data', JSON.stringify(restaurantData));
            
            // Save to JSON file using GitHub Pages API or similar
            await saveToJSONFile();
            
            showMessage('Data saved successfully!', 'success');
            updateStats();
        } catch (error) {
            showMessage('Error saving data: ' + error.message, 'error');
        }
    }
    
    // Save to JSON file (simulated - for GitHub Pages you'll need a different approach)
    async function saveToJSONFile() {
        // For GitHub Pages, you can't write files directly
        // This is a workaround - it will create a download link
        const dataStr = JSON.stringify(restaurantData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(dataBlob);
        downloadLink.download = DATA_FILE;
        downloadLink.click();
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(downloadLink.href), 1000);
    }
    
    // Show message
    function showMessage(text, type = 'success') {
        messageText.textContent = text;
        adminMessage.className = `message ${type} show`;
        adminMessage.style.display = 'flex';
        
        setTimeout(() => {
            adminMessage.classList.remove('show');
            adminMessage.style.display = 'none';
        }, 5000);
    }
    
    // Update UI with loaded data
    function updateUI() {
        // About section
        document.getElementById('about_text').value = restaurantData.about.text || '';
        
        // Contact section
        document.getElementById('phone').value = restaurantData.contact.phone || '';
        document.getElementById('email').value = restaurantData.contact.email || '';
        document.getElementById('location').value = restaurantData.contact.location || '';
        document.getElementById('address').value = restaurantData.contact.address || '';
        document.getElementById('hours').value = restaurantData.contact.hours || '';
        
        // Update menu table
        updateMenuTable();
        
        // Update offers
        updateOffersDisplay();
        
        // Update stats
        updateStats();
    }
    
    // Update dashboard statistics
    function updateStats() {
        const menuCount = restaurantData.menu.length;
        document.getElementById('menu-count').textContent = menuCount;
        document.getElementById('menu-items-count').textContent = menuCount;
        
        let offersCount = 0;
        for (const category in restaurantData.offers) {
            if (Array.isArray(restaurantData.offers[category])) {
                offersCount += restaurantData.offers[category].length;
            }
        }
        document.getElementById('offers-count').textContent = offersCount;
        
        const categoriesCount = Object.keys(restaurantData.offers).length;
        document.getElementById('categories-count').textContent = categoriesCount;
        
        // Show/hide empty states
        document.getElementById('empty-menu-state').style.display = 
            menuCount === 0 ? 'block' : 'none';
        document.getElementById('empty-offers-state').style.display = 
            offersCount === 0 ? 'block' : 'none';
    }
    
    // Update menu items table
    function updateMenuTable() {
        const tableBody = document.getElementById('menu-items-table');
        tableBody.innerHTML = '';
        
        if (restaurantData.menu.length === 0) {
            document.getElementById('menu-items-table').parentElement.style.display = 'none';
            return;
        }
        
        document.getElementById('menu-items-table').parentElement.style.display = 'block';
        
        restaurantData.menu.forEach((item, index) => {
            const row = document.createElement('tr');
            
            // Image cell
            const imgCell = document.createElement('td');
            if (item.image) {
                const img = document.createElement('img');
                img.src = item.image;
                img.alt = item.name;
                img.className = 'table-image';
                img.onerror = function() {
                    this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjcwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjMjU2M2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZTwvdGV4dD48L3N2Zz4=';
                };
                imgCell.appendChild(img);
            } else {
                const div = document.createElement('div');
                div.style.cssText = 'width: 70px; height: 70px; background: var(--light-gray); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: var(--dark-gray);';
                div.innerHTML = '<i class="fas fa-image"></i>';
                imgCell.appendChild(div);
            }
            
            // Name and description cell
            const nameCell = document.createElement('td');
            nameCell.innerHTML = `
                <strong>${escapeHtml(item.name)}</strong>
                <br>
                <small style="color: var(--dark-gray); font-size: 0.85rem;">
                    ${escapeHtml(item.description.substring(0, 60))}${item.description.length > 60 ? '...' : ''}
                </small>
            `;
            
            // Category cell
            const categoryCell = document.createElement('td');
            const category = item.category || 'all';
            categoryCell.innerHTML = `
                <span class="category-badge category-${category}">
                    ${escapeHtml(category.charAt(0).toUpperCase() + category.slice(1))}
                </span>
            `;
            
            // Price cell
            const priceCell = document.createElement('td');
            priceCell.innerHTML = `
                <div class="table-price">${formatPrice(item.price)}</div>
            `;
            
            // Actions cell
            const actionsCell = document.createElement('td');
            actionsCell.innerHTML = `
                <div class="table-actions">
                    <button class="table-action-btn table-action-edit edit-menu-item" data-id="${index}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="table-action-btn table-action-delete delete-menu-item" data-id="${index}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            row.appendChild(imgCell);
            row.appendChild(nameCell);
            row.appendChild(categoryCell);
            row.appendChild(priceCell);
            row.appendChild(actionsCell);
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners to edit/delete buttons
        document.querySelectorAll('.edit-menu-item').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-id'));
                editMenuItem(index);
            });
        });
        
        document.querySelectorAll('.delete-menu-item').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-id'));
                deleteMenuItem(index);
            });
        });
    }
    
    // Update offers display
    function updateOffersDisplay() {
        const offersContainer = document.getElementById('offers-container');
        offersContainer.innerHTML = '';
        
        let hasOffers = false;
        
        for (const categoryKey in restaurantData.offers) {
            const offers = restaurantData.offers[categoryKey];
            if (offers && offers.length > 0) {
                hasOffers = true;
                
                const categoryDiv = document.createElement('div');
                categoryDiv.style.marginBottom = '30px';
                
                const categoryName = getCategoryName(categoryKey);
                
                categoryDiv.innerHTML = `
                    <h4 style="margin-bottom: 15px; color: var(--text-dark); display: flex; align-items: center; gap: 10px; font-size: 1.1rem;">
                        <span class="category-badge category-${categoryKey}" style="font-size: 0.7rem; padding: 3px 12px;">
                            ${categoryName}
                        </span>
                        <span style="font-size: 0.85rem; color: var(--dark-gray);">
                            (${offers.length} offers)
                        </span>
                    </h4>
                    <div class="data-table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="offers-${categoryKey}">
                                ${offers.map((offer, index) => `
                                    <tr>
                                        <td>
                                            ${offer.image ? `
                                                <img src="${offer.image}" alt="${escapeHtml(offer.title)}" class="table-image" onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjcwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjM2U4MmY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5PZmZlcjwvdGV4dD48L3N2Zz4=';">
                                            ` : `
                                                <div style="width: 70px; height: 70px; background: var(--light-gray); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: var(--dark-gray);">
                                                    <i class="fas fa-image"></i>
                                                </div>
                                            `}
                                        </td>
                                        <td>
                                            <strong>${escapeHtml(offer.title)}</strong>
                                        </td>
                                        <td>
                                            ${escapeHtml(offer.description.substring(0, 60))}${offer.description.length > 60 ? '...' : ''}
                                        </td>
                                        <td>
                                            ${isNumeric(offer.price) ? `
                                                <div class="table-price">${formatPrice(offer.price)}</div>
                                            ` : `
                                                <div style="font-weight: 600; color: var(--accent-orange);">${escapeHtml(offer.price)}</div>
                                            `}
                                        </td>
                                        <td>
                                            <div class="table-actions">
                                                <button class="table-action-btn table-action-edit edit-offer" data-category="${categoryKey}" data-index="${index}">
                                                    <i class="fas fa-edit"></i> Edit
                                                </button>
                                                <button class="table-action-btn table-action-delete delete-offer" data-category="${categoryKey}" data-index="${index}">
                                                    <i class="fas fa-trash"></i> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
                
                offersContainer.appendChild(categoryDiv);
            }
        }
        
        // Add event listeners to offer buttons
        document.querySelectorAll('.edit-offer').forEach(button => {
            button.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                const index = parseInt(this.getAttribute('data-index'));
                editOffer(category, index);
            });
        });
        
        document.querySelectorAll('.delete-offer').forEach(button => {
            button.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                const index = parseInt(this.getAttribute('data-index'));
                deleteOffer(category, index);
            });
        });
        
        document.getElementById('empty-offers-state').style.display = 
            hasOffers ? 'none' : 'block';
    }
    
    // Get category display name
    function getCategoryName(key) {
        const names = {
            student: 'Student Offers',
            family: 'Family Offers',
            teacher: 'Teacher Offers',
            special: 'Special Offers',
            combo: 'Combo Offers',
            other: 'Other Offers'
        };
        return names[key] || key.charAt(0).toUpperCase() + key.slice(1) + ' Offers';
    }
    
    // Edit menu item
    let editingMenuItemIndex = -1;
    
    function editMenuItem(index) {
        const item = restaurantData.menu[index];
        if (!item) return;
        
        editingMenuItemIndex = index;
        
        // Update form
        document.getElementById('menu_item_id').value = index;
        document.getElementById('item_name').value = item.name;
        document.getElementById('item_price').value = item.price;
        document.getElementById('item_category').value = item.category || '';
        document.getElementById('item_description').value = item.description;
        
        // Update form UI
        document.getElementById('menu-form-icon').className = 'fas fa-edit';
        document.getElementById('menu-form-title').textContent = 'Edit Menu Item';
        document.getElementById('upload-title').textContent = 'Change Image';
        document.getElementById('menu-submit-btn').innerHTML = '<i class="fas fa-edit"></i> Update Menu Item';
        document.getElementById('menu-cancel-btn').style.display = 'flex';
        
        // Show current image if exists
        if (item.image) {
            document.getElementById('current-menu-image').src = item.image;
            document.getElementById('menu-image-preview').style.display = 'block';
        } else {
            document.getElementById('menu-image-preview').style.display = 'none';
        }
        
        // Scroll to form
        document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Delete menu item
    function deleteMenuItem(index) {
        if (confirm('Are you sure you want to delete this menu item?')) {
            restaurantData.menu.splice(index, 1);
            updateMenuTable();
            updateStats();
            saveData();
            showMessage('Menu item deleted successfully!', 'success');
        }
    }
    
    // Edit offer
    let editingOfferCategory = '';
    let editingOfferIndex = -1;
    
    function editOffer(category, index) {
        const offer = restaurantData.offers[category][index];
        if (!offer) return;
        
        editingOfferCategory = category;
        editingOfferIndex = index;
        
        // Update form
        document.getElementById('offer_id').value = index;
        document.getElementById('offer_category_hidden').value = category;
        document.getElementById('offer_category').value = category;
        document.getElementById('offer_title').value = offer.title;
        document.getElementById('offer_price').value = offer.price;
        document.getElementById('offer_description').value = offer.description;
        
        // Update form UI
        document.getElementById('offer-form-icon').className = 'fas fa-edit';
        document.getElementById('offer-form-title').textContent = 'Edit Offer';
        document.getElementById('offer-upload-title').textContent = 'Change Image';
        document.getElementById('offer-submit-btn').innerHTML = '<i class="fas fa-edit"></i> Update Offer';
        document.getElementById('offer-cancel-btn').style.display = 'flex';
        
        // Show current image if exists
        if (offer.image) {
            document.getElementById('current-offer-image').src = offer.image;
            document.getElementById('offer-image-preview').style.display = 'block';
        } else {
            document.getElementById('offer-image-preview').style.display = 'none';
        }
        
        // Scroll to form
        document.getElementById('offers').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Delete offer
    function deleteOffer(category, index) {
        if (confirm('Are you sure you want to delete this offer?')) {
            if (restaurantData.offers[category]) {
                restaurantData.offers[category].splice(index, 1);
                updateOffersDisplay();
                updateStats();
                saveData();
                showMessage('Offer deleted successfully!', 'success');
            }
        }
    }
    
    // Handle about form submission
    document.getElementById('about-form').addEventListener('submit', function(e) {
        e.preventDefault();
        restaurantData.about.text = document.getElementById('about_text').value;
        saveData();
        showMessage('About section updated successfully!', 'success');
    });
    
    // Handle contact form submission
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        restaurantData.contact.phone = document.getElementById('phone').value;
        restaurantData.contact.email = document.getElementById('email').value;
        restaurantData.contact.location = document.getElementById('location').value;
        restaurantData.contact.address = document.getElementById('address').value;
        restaurantData.contact.hours = document.getElementById('hours').value;
        saveData();
        showMessage('Contact information updated successfully!', 'success');
    });
    
    // Handle menu form submission
    document.getElementById('menu-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('item_name').value,
            price: parseFloat(document.getElementById('item_price').value) || 0,
            category: document.getElementById('item_category').value,
            description: document.getElementById('item_description').value
        };
        
        // Handle image upload
        const imageInput = document.getElementById('menu_image');
        if (imageInput.files && imageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                formData.image = e.target.result;
                processMenuItem(formData);
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            // If editing and no new image, keep existing image
            if (editingMenuItemIndex !== -1 && restaurantData.menu[editingMenuItemIndex]) {
                formData.image = restaurantData.menu[editingMenuItemIndex].image;
            }
            processMenuItem(formData);
        }
    });
    
    function processMenuItem(formData) {
        if (editingMenuItemIndex !== -1) {
            // Update existing item
            restaurantData.menu[editingMenuItemIndex] = formData;
            showMessage('Menu item updated successfully!', 'success');
            editingMenuItemIndex = -1;
        } else {
            // Add new item
            formData.id = restaurantData.menu.length + 1;
            restaurantData.menu.push(formData);
            showMessage('Menu item added successfully!', 'success');
        }
        
        // Reset form
        document.getElementById('menu-form').reset();
        document.getElementById('menu_item_id').value = '';
        document.getElementById('menu-form-icon').className = 'fas fa-plus';
        document.getElementById('menu-form-title').textContent = 'Add New Menu Item';
        document.getElementById('upload-title').textContent = 'Upload Item Image';
        document.getElementById('menu-submit-btn').innerHTML = '<i class="fas fa-plus"></i> Add Menu Item';
        document.getElementById('menu-cancel-btn').style.display = 'none';
        document.getElementById('menu-image-preview').style.display = 'none';
        
        updateMenuTable();
        updateStats();
        saveData();
    }
    
    // Handle offer form submission
    document.getElementById('offer-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        let category = document.getElementById('offer_category').value;
        const newCategory = document.getElementById('new_offer_category').value;
        
        // Use new category if provided
        if (category === 'other' && newCategory) {
            category = newCategory.toLowerCase().replace(/\s+/g, '_');
            if (!restaurantData.offers[category]) {
                restaurantData.offers[category] = [];
            }
        }
        
        const formData = {
            title: document.getElementById('offer_title').value,
            price: document.getElementById('offer_price').value,
            description: document.getElementById('offer_description').value
        };
        
        // Handle image upload
        const imageInput = document.getElementById('offer_image');
        if (imageInput.files && imageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                formData.image = e.target.result;
                processOffer(formData, category);
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            // If editing and no new image, keep existing image
            if (editingOfferCategory && editingOfferIndex !== -1 && 
                restaurantData.offers[editingOfferCategory] && 
                restaurantData.offers[editingOfferCategory][editingOfferIndex]) {
                formData.image = restaurantData.offers[editingOfferCategory][editingOfferIndex].image;
            }
            processOffer(formData, category);
        }
    });
    
    function processOffer(formData, category) {
        if (editingOfferCategory && editingOfferIndex !== -1) {
            // Update existing offer
            if (restaurantData.offers[editingOfferCategory]) {
                if (editingOfferCategory !== category) {
                    // Move to new category
                    restaurantData.offers[editingOfferCategory].splice(editingOfferIndex, 1);
                    formData.id = (restaurantData.offers[category] || []).length + 1;
                    if (!restaurantData.offers[category]) {
                        restaurantData.offers[category] = [];
                    }
                    restaurantData.offers[category].push(formData);
                } else {
                    // Update in same category
                    restaurantData.offers[category][editingOfferIndex] = formData;
                }
            }
            showMessage('Offer updated successfully!', 'success');
            editingOfferCategory = '';
            editingOfferIndex = -1;
        } else {
            // Add new offer
            if (!restaurantData.offers[category]) {
                restaurantData.offers[category] = [];
            }
            formData.id = restaurantData.offers[category].length + 1;
            restaurantData.offers[category].push(formData);
            showMessage('Offer added successfully!', 'success');
        }
        
        // Reset form
        document.getElementById('offer-form').reset();
        document.getElementById('offer_id').value = '';
        document.getElementById('offer_category_hidden').value = '';
        document.getElementById('offer-form-icon').className = 'fas fa-plus';
        document.getElementById('offer-form-title').textContent = 'Add New Offer';
        document.getElementById('offer-upload-title').textContent = 'Upload Offer Image';
        document.getElementById('offer-submit-btn').innerHTML = '<i class="fas fa-plus"></i> Add Offer';
        document.getElementById('offer-cancel-btn').style.display = 'none';
        document.getElementById('new_offer_category').style.display = 'none';
        document.getElementById('offer-image-preview').style.display = 'none';
        
        updateOffersDisplay();
        updateStats();
        saveData();
    }
    
    // Cancel menu edit
    document.getElementById('menu-cancel-btn').addEventListener('click', function() {
        document.getElementById('menu-form').reset();
        document.getElementById('menu_item_id').value = '';
        document.getElementById('menu-form-icon').className = 'fas fa-plus';
        document.getElementById('menu-form-title').textContent = 'Add New Menu Item';
        document.getElementById('upload-title').textContent = 'Upload Item Image';
        document.getElementById('menu-submit-btn').innerHTML = '<i class="fas fa-plus"></i> Add Menu Item';
        this.style.display = 'none';
        document.getElementById('menu-image-preview').style.display = 'none';
        editingMenuItemIndex = -1;
    });
    
    // Cancel offer edit
    document.getElementById('offer-cancel-btn').addEventListener('click', function() {
        document.getElementById('offer-form').reset();
        document.getElementById('offer_id').value = '';
        document.getElementById('offer_category_hidden').value = '';
        document.getElementById('offer-form-icon').className = 'fas fa-plus';
        document.getElementById('offer-form-title').textContent = 'Add New Offer';
        document.getElementById('offer-upload-title').textContent = 'Upload Offer Image';
        document.getElementById('offer-submit-btn').innerHTML = '<i class="fas fa-plus"></i> Add Offer';
        this.style.display = 'none';
        document.getElementById('new_offer_category').style.display = 'none';
        document.getElementById('offer-image-preview').style.display = 'none';
        editingOfferCategory = '';
        editingOfferIndex = -1;
    });
    
    // Handle category selection for new category input
    document.getElementById('item_category').addEventListener('change', function() {
        const newCategoryInput = document.getElementById('new_category');
        newCategoryInput.style.display = this.value === 'other' ? 'block' : 'none';
    });
    
    document.getElementById('offer_category').addEventListener('change', function() {
        const newCategoryInput = document.getElementById('new_offer_category');
        newCategoryInput.style.display = this.value === 'other' ? 'block' : 'none';
    });
    
    // Save all data button
    document.getElementById('save-all-btn').addEventListener('click', function() {
        saveData();
    });
    
    // File upload preview
    document.getElementById('menu_image').addEventListener('change', function(e) {
        previewImage(this, 'current-menu-image', 'menu-image-preview');
    });
    
    document.getElementById('offer_image').addEventListener('change', function(e) {
        previewImage(this, 'current-offer-image', 'offer-image-preview');
    });
    
    function previewImage(input, imgId, previewId) {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.getElementById(imgId);
                img.src = e.target.result;
                document.getElementById(previewId).style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }
    
    // Anchor link scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Calculate offset for fixed header
                    const headerHeight = document.querySelector('.admin-header').offsetHeight + 30;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    // Smooth scroll to target
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Highlight section
                    targetElement.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.3)';
                    setTimeout(() => {
                        targetElement.style.boxShadow = '';
                    }, 1000);
                }
            }
        });
    });
    
    // Scroll to top button
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });
    
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Helper functions
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function formatPrice(price) {
        return new Intl.NumberFormat('en-IN').format(price);
    }
    
    function isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }
    
    // Initialize everything
    loadData();
});
