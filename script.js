// ZamZam Fast Food - Fixed & Optimized JavaScript

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

// Initialize the application
function initApp() {
    // Load all data from JSON
    loadData();
    
    // Setup navigation
    setupNavigation();
    
    // Setup fullpage sections
    setupFullpageSections();
    
    // Setup animations
    setupAnimations();
    
    // Setup back to top button
    setupBackToTop();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup food background animation
    setupFoodBackgroundAnimation();
    
    // Setup menu filtering
    setupMenuFiltering();
    
    // Setup offer tabs
    setupOfferTabs();
}

// Global variables
let restaurantData = null;

// Load data from data.json
function loadData() {
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            restaurantData = data;
            
            // Render all sections with data
            renderAbout(data.about);
            renderMenu(data.menu);
            renderOffers(data.offers);
            renderContact(data.contact);
            
            // Initialize menu filtering
            setTimeout(() => {
                filterMenuItems('all');
            }, 500);
            
            // Initialize offers
            setTimeout(() => {
                showOffersByCategory('student');
            }, 500);
        })
        .catch(error => {
            console.error('Error loading data:', error);
            // Fallback data in case JSON fails to load
            loadFallbackData();
        });
}

// Fallback data if JSON fails to load
function loadFallbackData() {
    const fallbackData = {
        about: {
            text: "Welcome to ZamZam Fast Food, where taste meets perfection! Since 2019, we've been serving the community with high-quality fast food made from the freshest ingredients."
        },
        contact: {
            phone: "+91 98765 43210",
            location: "123 Food Street, Mumbai, Maharashtra 400001",
            address: "123 Food Street, Near Central Park, Mumbai",
            hours: "Monday - Sunday: 10:00 AM - 11:00 PM",
            email: "info@zamzamfastfood.com"
        },
        menu: [
            {
                id: 1,
                name: "ZamZam Special Burger",
                price: 189,
                description: "Juicy beef patty with lettuce, tomato, onion, pickles, and our special sauce.",
                image: "assets/burger.png",
                category: "burgers"
            },
            {
                id: 2,
                name: "Crispy Chicken Sandwich",
                price: 169,
                description: "Crispy fried chicken fillet with mayo, lettuce, and tomato on a brioche bun.",
                image: "assets/chicken-sandwich.png",
                category: "sandwiches"
            }
        ],
        offers: {
            student: [
                {
                    id: 1,
                    title: "Student Meal Deal",
                    description: "Burger + Fries + Soft Drink at a special price for students",
                    price: 249,
                    image: "assets/student-offer.png"
                }
            ],
            family: [
                {
                    id: 1,
                    title: "Family Feast Pack",
                    description: "4 burgers, 4 fries, 4 drinks, and a free dessert",
                    price: 799,
                    image: "assets/family-pack.png"
                }
            ],
            teacher: [
                {
                    id: 1,
                    title: "Teacher Appreciation Meal",
                    description: "Special discount for all teachers and school staff",
                    price: "20% off",
                    image: "assets/teacher-offer.png"
                }
            ],
            special: [
                {
                    id: 1,
                    title: "Weekend Breakfast Special",
                    description: "Breakfast sandwich with coffee or juice",
                    price: 129,
                    image: "assets/breakfast-special.png"
                }
            ],
            combo: [
                {
                    id: 1,
                    title: "Combo Meal Deal",
                    description: "Any burger with fries and drink at a discounted price",
                    price: 299,
                    image: "assets/combo-meal.png"
                }
            ]
        }
    };
    
    restaurantData = fallbackData;
    renderAbout(fallbackData.about);
    renderMenu(fallbackData.menu);
    renderOffers(fallbackData.offers);
    renderContact(fallbackData.contact);
}

// Render About section
function renderAbout(aboutData) {
    const aboutElement = document.getElementById('about-text-content');
    if (aboutElement && aboutData && aboutData.text) {
        // Replace newlines with paragraphs
        const paragraphs = aboutData.text.split('\n\n');
        let html = '';
        
        paragraphs.forEach((paragraph, index) => {
            if (paragraph.trim()) {
                html += `<p class="fade-in" data-delay="${index * 0.2}s">${paragraph}</p>`;
            }
        });
        
        aboutElement.innerHTML = html;
    }
}

// Render Menu section
function renderMenu(menuData) {
    const menuContainer = document.getElementById('menu-items');
    if (!menuContainer || !menuData || !Array.isArray(menuData)) return;
    
    let html = '';
    
    menuData.forEach((item, index) => {
        // Use fallback image if specified image doesn't exist
        const imageSrc = item.image || `assets/default-food.png`;
        const category = item.category || 'all';
        
        html += `
            <div class="menu-item fade-in" data-category="${category}" data-delay="${index * 0.1}s">
                <div class="menu-item-image">
                    <img src="${imageSrc}" alt="${item.name}" onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzI1NjNlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+${item.name.split(' ')[0]}</dGV4dD48L3N2Zz4='">
                </div>
                <div class="menu-item-header">
                    <h3 class="menu-item-name">${item.name}</h3>
                    <span class="menu-item-price">${item.price}</span>
                </div>
                <p class="menu-item-description">${item.description}</p>
            </div>
        `;
    });
    
    menuContainer.innerHTML = html;
}

// Setup menu filtering
function setupMenuFiltering() {
    const categoryBtns = document.querySelectorAll('.menu-category-btn');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get category
            const category = this.getAttribute('data-category');
            
            // Filter menu items
            filterMenuItems(category);
        });
    });
}

// Filter menu items by category
function filterMenuItems(category) {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        
        if (category === 'all' || itemCategory === category) {
            item.style.display = 'block';
            
            // Add animation
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 100);
        } else {
            item.style.display = 'none';
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
        }
    });
}

// Render Offers section
function renderOffers(offersData) {
    const offersContainer = document.getElementById('offers-content');
    if (!offersContainer || !offersData) return;
    
    // Offers will be loaded dynamically when category is selected
    offersContainer.innerHTML = '<div class="loading">Select a category to view offers...</div>';
}

// Setup offer tabs
function setupOfferTabs() {
    const tabs = document.querySelectorAll('.offer-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get category
            const category = this.getAttribute('data-category');
            
            // Show offers for this category
            showOffersByCategory(category);
        });
    });
}

// Show offers by category
function showOffersByCategory(category) {
    const offersContainer = document.getElementById('offers-content');
    
    if (!restaurantData || !restaurantData.offers || !restaurantData.offers[category]) {
        offersContainer.innerHTML = '<div class="loading">No offers available in this category.</div>';
        return;
    }
    
    const categoryOffers = restaurantData.offers[category];
    
    if (!categoryOffers || !Array.isArray(categoryOffers)) {
        offersContainer.innerHTML = '<div class="loading">No offers available in this category.</div>';
        return;
    }
    
    let html = '<div class="offers-grid">';
    
    categoryOffers.forEach((offer, index) => {
        // Use fallback image if specified image doesn't exist
        const imageSrc = offer.image || `assets/default-offer.png`;
        
        // Check if price is a number or string
        const priceDisplay = typeof offer.price === 'number' ? `₹${offer.price}` : offer.price;
        
        html += `
            <div class="offer-card fade-in" data-delay="${index * 0.1}s">
                <div class="menu-item-image" style="height: 180px; margin-bottom: 15px; border-radius: 12px 12px 0 0;">
                    <img src="${imageSrc}" alt="${offer.title}" onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iIzNlODJmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+${offer.title.split(' ')[0]}</dGV4dD48L3N2Zz4='">
                </div>
                <h3 class="offer-title">${offer.title}</h3>
                <p class="offer-description">${offer.description}</p>
                <div class="offer-price">${priceDisplay}</div>
            </div>
        `;
    });
    
    html += '</div>';
    offersContainer.innerHTML = html;
}

// Render Contact section
function renderContact(contactData) {
    if (!contactData) return;
    
    const phoneElement = document.getElementById('contact-phone');
    const locationElement = document.getElementById('contact-location');
    const hoursElement = document.getElementById('contact-hours');
    const emailElement = document.getElementById('contact-email');
    const addressElement = document.getElementById('contact-address');
    
    if (phoneElement && contactData.phone) {
        phoneElement.textContent = contactData.phone;
        phoneElement.classList.add('fade-in');
    }
    
    if (locationElement && contactData.location) {
        locationElement.textContent = contactData.location;
        locationElement.classList.add('fade-in');
    }
    
    if (hoursElement && contactData.hours) {
        hoursElement.textContent = contactData.hours;
        hoursElement.classList.add('fade-in');
    }
    
    if (emailElement && contactData.email) {
        emailElement.textContent = contactData.email;
        emailElement.classList.add('fade-in');
    }
    
    if (addressElement && contactData.address) {
        addressElement.textContent = contactData.address;
        addressElement.classList.add('fade-in');
    }
}

// Setup fullpage sections navigation
function setupFullpageSections() {
    const sections = document.querySelectorAll('.fullpage-section');
    const navLinks = document.querySelectorAll('.nav-link, .nav-section-btn, .section-nav-btn, .section-dot');
    const footer = document.querySelector('.footer');
    
    // Show only home section initially
    showSection('home');
    
    // Navigation click handler
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section') || 
                                 this.getAttribute('href')?.substring(1);
            
            if (targetSection) {
                showSection(targetSection);
                
                // Update URL hash without scrolling
                history.pushState(null, null, `#${targetSection}`);
            }
        });
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1) || 'home';
        showSection(hash);
    });
    
    // Show footer only in home section
    function updateFooterVisibility(currentSection) {
        if (currentSection === 'home') {
            footer.classList.add('visible');
        } else {
            footer.classList.remove('visible');
        }
    }
    
    // Function to show a specific section
    function showSection(sectionId) {
        // Hide all sections
        sections.forEach(section => {
            section.classList.remove('active');
            section.classList.remove('exit');
        });
        
        // Remove active class from all nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Update navigation
            const correspondingNavLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
            const correspondingDot = document.querySelector(`.section-dot[data-section="${sectionId}"]`);
            
            if (correspondingNavLink) {
                correspondingNavLink.classList.add('active');
            }
            
            if (correspondingDot) {
                correspondingDot.classList.add('active');
            }
            
            // Update footer visibility
            updateFooterVisibility(sectionId);
            
            // Trigger animations for the section
            setTimeout(() => {
                triggerSectionAnimations(sectionId);
            }, 300);
            
            // Scroll to top of section
            targetSection.scrollTop = 0;
        }
    }
    
    // Initial section based on URL hash
    const initialSection = window.location.hash.substring(1) || 'home';
    showSection(initialSection);
}

// Trigger animations for a specific section
function triggerSectionAnimations(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // Fade in elements with delay
    const fadeElements = section.querySelectorAll('.fade-in');
    fadeElements.forEach((element, index) => {
        const delay = element.getAttribute('data-delay') || (index * 0.1);
        
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, parseFloat(delay) * 1000);
    });
}

// Setup navigation
function setupNavigation() {
    const navbar = document.querySelector('.navbar');
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Setup animations
function setupAnimations() {
    // Hero food items animation
    const foodItems = document.querySelectorAll('.food-display-item');
    foodItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.5}s`;
    });
    
    // Stats animation for about section
    const stats = document.querySelectorAll('.stat h3');
    stats.forEach(stat => {
        const originalText = stat.textContent;
        const targetValue = parseInt(originalText);
        
        if (!isNaN(targetValue)) {
            let current = 0;
            const increment = targetValue / 20;
            const timer = setInterval(() => {
                current += increment;
                if (current >= targetValue) {
                    current = targetValue;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(current) + '+';
            }, 50);
        }
    });
}

// Setup food background animation
function setupFoodBackgroundAnimation() {
    const foodBg = document.querySelector('.floating-food-bg');
    const foodEmojis = ['🍔', '🍕', '🍟', '🥤', '🌮', '🍦', '🍩', '🍰', '🌭', '🥪', '🍗', '🥓'];
    
    // Clear any existing items
    foodBg.innerHTML = '';
    
    // Create 8-12 food items
    const itemCount = Math.floor(Math.random() * 5) + 8;
    
    for (let i = 0; i < itemCount; i++) {
        const item = document.createElement('div');
        item.className = 'food-bg-item';
        
        // Random emoji
        const emoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
        item.innerHTML = `<span>${emoji}</span>`;
        
        // Random position
        const left = Math.random() * 90;
        const top = Math.random() * 90;
        item.style.left = `${left}%`;
        item.style.top = `${top}%`;
        
        // Random size
        const size = 3 + Math.random() * 2;
        item.style.fontSize = `${size}rem`;
        
        // Random opacity
        const opacity = 0.05 + Math.random() * 0.1;
        item.style.opacity = opacity;
        
        // Random animation
        const duration = 20 + Math.random() * 20;
        const delay = Math.random() * 5;
        item.style.animation = `floatAround ${duration}s infinite linear ${delay}s`;
        
        foodBg.appendChild(item);
    }
    
    // Move items around periodically
    setInterval(() => {
        const items = document.querySelectorAll('.food-bg-item');
        items.forEach(item => {
            const left = Math.random() * 90;
            const top = Math.random() * 90;
            
            item.style.transition = 'left 40s linear, top 40s linear';
            item.style.left = `${left}%`;
            item.style.top = `${top}%`;
        });
    }, 40000);
}

// Setup back to top button
function setupBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Setup mobile menu
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            
            // Change icon
            const icon = this.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                document.body.style.overflow = 'hidden';
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking on a link
        const menuLinks = navLinks.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = '';
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = '';
            }
        });
    }
}

// Initialize on load
window.addEventListener('load', function() {
    // Add loaded class to body for animations
    document.body.classList.add('loaded');
    
    // Show home section
    setTimeout(() => {
        const homeSection = document.getElementById('home');
        if (homeSection) {
            homeSection.classList.add('active');
        }
    }, 100);
    
    // Re-initialize food background animation
    setTimeout(setupFoodBackgroundAnimation, 1000);
});
