// Modal control functions - Global scope
let currentImageIndex = 0;
let selectedColor = null;
let selectedSize = null;
let selectedQuantity = 1;

// Global variable for current product
let currentProduct = null;

// Cart functionality
function addToCart(product, selectedColor, selectedSize, quantity = 1) {
    console.log('Adding to cart:', product); // Debug log
    
    if (!product) {
        console.error('No product provided to addToCart');
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const cartItem = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.images ? product.images[0] : product.image,
        selectedColor: selectedColor || (product.colors ? product.colors[0] : 'Default'),
        selectedSize: selectedSize || (product.sizes ? product.sizes[0] : 'One Size'),
        quantity: parseInt(quantity) || 1
    };

    console.log('Adding item to cart:', cartItem); // Debug log
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showSuccessModal();
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

function showSuccessModal() {
    console.log('Showing success modal');
    const modal = document.getElementById('success-modal');
    
    if (!modal) {
        console.error('Success modal element not found');
        return;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function hideSuccessModal() {
    const modal = document.getElementById('success-modal');
    
    if (!modal) return;

    modal.classList.remove('flex');
    modal.classList.add('hidden');
}

function showProductModal(product) {
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    currentImageIndex = 0;
    selectedColor = null;
    selectedSize = null;
    selectedQuantity = 1;

    const modalContent = `
        <div class="flex flex-col md:flex-row gap-6 p-6">
            <!-- Image Gallery -->
            <div class="w-full md:w-1/2">
                <div class="relative rounded-lg overflow-hidden">
                    <img src="${product.images[0]}" alt="${product.name}" 
                        class="w-full h-[400px] object-cover" id="modal-main-image">
                    
                    ${product.images && product.images.length > 1 ? `
                        <button class="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 disabled:opacity-50" id="prev-image">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 disabled:opacity-50" id="next-image">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    ` : ''}
                </div>
                
                ${product.images && product.images.length > 1 ? `
                    <div class="flex gap-2 mt-4 overflow-x-auto" id="image-thumbnails">
                        ${product.images.map((img, idx) => `
                            <img src="${img}" alt="Thumbnail ${idx + 1}" 
                                class="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                onclick="updateModalMainImage(${idx})">
                        `).join('')}
                    </div>
                ` : ''}
            </div>

            <!-- Product Details -->
            <div class="w-full md:w-1/2">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">${product.name}</h2>
                <p class="text-gray-600 mb-6">${product.description}</p>
                
                <div class="space-y-6">
                    <div class="flex items-center justify-between">
                        <span class="text-3xl font-bold text-blue-600">$${product.price}</span>
                        <div class="flex items-center gap-2">
                            <span class="text-sm text-gray-500">Category:</span>
                            <span class="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                ${product.category}
                            </span>
                        </div>
                    </div>

                    <!-- Colors -->
                    <div>
                        <h3 class="font-medium text-gray-900 mb-2">Available Colors</h3>
                        <div class="flex gap-2">
                            ${(product.colors || []).map(color => `
                                <button class="w-8 h-8 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                                    style="background-color: ${color};"
                                    onclick="selectColor('${color}')"
                                    title="${color}">
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Sizes -->
                    <div>
                        <h3 class="font-medium text-gray-900 mb-2">Available Sizes</h3>
                        <div class="flex flex-wrap gap-2">
                            ${(product.sizes || []).map(size => `
                                <button class="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
                                    onclick="selectSize('${size}')">
                                    ${size}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Quantity -->
                    <div>
                        <h3 class="font-medium text-gray-900 mb-2">Quantity</h3>
                        <div class="flex items-center gap-2">
                            <button class="px-3 py-1 border rounded-lg hover:bg-gray-100" onclick="updateQuantity(-1)">-</button>
                            <span id="quantity-display" class="w-12 text-center">1</span>
                            <button class="px-3 py-1 border rounded-lg hover:bg-gray-100" onclick="updateQuantity(1)">+</button>
                        </div>
                    </div>

                    <!-- Add to Cart Button -->
                    <button onclick="addToCartFromModal(${JSON.stringify(product).replace(/"/g, '&quot;')})" 
                        class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <i class="fas fa-shopping-cart"></i>
                        <span>Add to Cart</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.querySelector('.modal-content').innerHTML = modalContent;
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Initialize modal functionality
    initializeModalControls(product);
}

function initializeModalControls(product) {
    const prevButton = document.getElementById('prev-image');
    const nextButton = document.getElementById('next-image');
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            currentImageIndex = Math.max(0, currentImageIndex - 1);
            updateModalImage(product.images[currentImageIndex]);
            updateNavigationButtons(product.images.length);
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            currentImageIndex = Math.min(product.images.length - 1, currentImageIndex + 1);
            updateModalImage(product.images[currentImageIndex]);
            updateNavigationButtons(product.images.length);
        });
    }

    updateNavigationButtons(product.images.length);
}

function updateModalMainImage(index) {
    const mainImage = document.getElementById('modal-main-image');
    const product = currentProduct;
    if (mainImage && product && product.images) {
        currentImageIndex = index;
        mainImage.src = product.images[index];
        updateNavigationButtons(product.images.length);
    }
}

function updateModalImage(imageSrc) {
    const mainImage = document.getElementById('modal-main-image');
    if (mainImage) {
        mainImage.src = imageSrc;
    }
}

function updateNavigationButtons(totalImages) {
    const prevButton = document.getElementById('prev-image');
    const nextButton = document.getElementById('next-image');
    
    if (prevButton) {
        prevButton.disabled = currentImageIndex === 0;
        prevButton.classList.toggle('opacity-50', currentImageIndex === 0);
    }
    if (nextButton) {
        nextButton.disabled = currentImageIndex === totalImages - 1;
        nextButton.classList.toggle('opacity-50', currentImageIndex === totalImages - 1);
    }
}

function selectColor(color) {
    selectedColor = color;
    // Update UI to show selected color
    document.querySelectorAll('[onclick^="selectColor"]').forEach(btn => {
        btn.classList.toggle('ring-2', btn.getAttribute('onclick').includes(color));
        btn.classList.toggle('ring-blue-500', btn.getAttribute('onclick').includes(color));
    });
}

function selectSize(size) {
    selectedSize = size;
    // Update UI to show selected size
    document.querySelectorAll('[onclick^="selectSize"]').forEach(btn => {
        btn.classList.toggle('bg-blue-600', btn.getAttribute('onclick').includes(size));
        btn.classList.toggle('text-white', btn.getAttribute('onclick').includes(size));
    });
}

function updateQuantity(change) {
    const display = document.getElementById('quantity-display');
    if (display) {
        selectedQuantity = Math.max(1, selectedQuantity + change);
        display.textContent = selectedQuantity;
    }
}

function addToCartFromModal(product) {
    if (!selectedColor || !selectedSize) {
        alert('Please select both color and size');
        return;
    }
    addToCart(product, selectedColor, selectedSize, selectedQuantity);
    hideProductModal();
}

function hideProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        // Reset modal state
        currentImageIndex = 0;
        selectedColor = null;
        selectedSize = null;
        selectedQuantity = 1;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize elements
    const searchInput = document.getElementById('search-input');
    const colorFilter = document.getElementById('color-filter');
    const categoryFilter = document.getElementById('category-filter');
    const sizeFilter = document.getElementById('size-filter');
    const productsContainer = document.getElementById('products-container');
    const noProductsMessage = document.getElementById('no-products');
    const modal = document.getElementById('product-modal');
    const closeModal = document.getElementById('close-modal');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    let products = [];

    // Fetch products from products.json
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            populateFilters(products);
            displayProducts(products);
            updateCartCount();
        })
        .catch(error => console.error('Error:', error));

    // Populate filters with unique values from products
    function populateFilters(products) {
        if (!products || !products.length) return;

        // Get unique values
        const uniqueColors = new Set();
        const uniqueCategories = new Set();
        const uniqueSizes = new Set();

        products.forEach(product => {
            if (product.colors && Array.isArray(product.colors)) {
                product.colors.forEach(color => uniqueColors.add(color));
            }
            if (product.category) {
                uniqueCategories.add(product.category);
            }
            if (product.sizes && Array.isArray(product.sizes)) {
                product.sizes.forEach(size => uniqueSizes.add(size));
            }
        });

        // Helper function to populate select elements
        function populateSelect(selectElement, values) {
            if (!selectElement) return;
            
            selectElement.innerHTML = '<option value="">All</option>';
            [...values].sort().forEach(value => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                selectElement.appendChild(option);
            });
        }

        // Populate all filter dropdowns
        populateSelect(colorFilter, uniqueColors);
        populateSelect(categoryFilter, uniqueCategories);
        populateSelect(sizeFilter, uniqueSizes);
    }

    // Filter products based on all criteria
    function filterProducts() {
        const searchQuery = searchInput?.value?.toLowerCase() || '';
        const selectedColor = colorFilter?.value || '';
        const selectedCategory = categoryFilter?.value || '';
        const selectedSize = sizeFilter?.value || '';

        const filtered = products.filter(product => {
            // Search term filter
            const matchesSearch = !searchQuery || 
                product.name.toLowerCase().includes(searchQuery) || 
                product.description.toLowerCase().includes(searchQuery);

            // Color filter
            const matchesColor = !selectedColor || 
                (product.colors && product.colors.some(color => color.toLowerCase() === selectedColor.toLowerCase()));

            // Category filter
            const matchesCategory = !selectedCategory || 
                (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase());

            // Size filter
            const matchesSize = !selectedSize || 
                (product.sizes && product.sizes.some(size => size.toLowerCase() === selectedSize.toLowerCase()));

            return matchesSearch && matchesColor && matchesCategory && matchesSize;
        });

        displayProducts(filtered);
    }

    // Display products in the grid
    function displayProducts(productsToShow) {
        if (!productsContainer) return;
        
        productsContainer.innerHTML = '';
        
        if (!productsToShow || productsToShow.length === 0) {
            if (noProductsMessage) {
                noProductsMessage.classList.remove('hidden');
            }
            return;
        }

        if (noProductsMessage) {
            noProductsMessage.classList.add('hidden');
        }

        productsToShow.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300';
            
            const mainImage = product.images && product.images.length > 0 ? product.images[0] : 'placeholder.jpg';
            const colors = product.colors || [];
            const sizes = product.sizes || [];

            productCard.innerHTML = `
                <div class="relative overflow-hidden aspect-square cursor-pointer" onclick="showProductModal(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                    <img src="${mainImage}" alt="${product.name}" 
                        class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        onerror="this.src='placeholder.jpg'">
                    ${product.images && product.images.length > 1 ? `
                        <div class="absolute bottom-2 right-2 bg-white bg-opacity-90 rounded-lg px-2 py-1 text-sm text-gray-600">
                            <i class="fas fa-images mr-1"></i>${product.images.length}
                        </div>
                    ` : ''}
                    <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <div class="absolute top-2 left-2 flex gap-1">
                        ${product.category ? `
                            <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                ${product.category}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div class="p-4">
                    <h3 class="font-semibold text-lg mb-1 text-gray-800">${product.name}</h3>
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">${product.description}</p>
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xl font-bold text-blue-600">$${product.price}</span>
                        <div class="flex items-center gap-2">
                            ${colors.map(color => `
                                <div class="w-4 h-4 rounded-full border border-gray-200" 
                                    style="background-color: ${color};" 
                                    title="${color}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex gap-1">
                            ${sizes.map(size => `
                                <span class="text-xs px-2 py-1 bg-gray-100 rounded-md">${size}</span>
                            `).join('')}
                        </div>
                        <button onclick="event.stopPropagation(); addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')}, null, null, 1)" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2">
                            <i class="fas fa-shopping-cart"></i>
                            <span>Add</span>
                        </button>
                    </div>
                </div>
            `;
            
            productsContainer.appendChild(productCard);
        });
    }

    // Event Listeners for Modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            hideProductModal();
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideProductModal();
            }
        });
    }

    // Add event listeners
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
    if (colorFilter) {
        colorFilter.addEventListener('change', filterProducts);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    if (sizeFilter) {
        sizeFilter.addEventListener('change', filterProducts);
    }

    // Initialize navbar functionality
    setupMobileMenu();
    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll(); // Initial call
});

// Format cart items for WhatsApp message
function formatCartForWhatsApp() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = 0;
    
    // Create message header
    let message = "🛍️ *New Order Details*\n\n";
    
    // Add each cart item
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        message += `*${index + 1}. ${item.name}*\n`;
        message += `   • Price: $${item.price}\n`;
        message += `   • Quantity: ${item.quantity}\n`;
        message += `   • Size: ${item.selectedSize}\n`;
        message += `   • Color: ${item.selectedColor}\n`;
        message += `   • Subtotal: $${itemTotal}\n\n`;
    });
    
    // Add total
    message += `\n*Total Order Amount: $${total.toFixed(2)}*\n\n`;
    
    // Add customer note
    message += "Please confirm my order. Thank you! 😊";
    
    return encodeURIComponent(message);
}

// Handle WhatsApp checkout
function checkoutViaWhatsApp() {
    const whatsappNumber = "201024911062"; // Added country code for Egypt
    const message = formatCartForWhatsApp();
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
}

// Event listeners for filters
if (searchInput) searchInput.addEventListener('input', filterProducts);
if (priceRange) priceRange.addEventListener('input', filterProducts);
document.querySelectorAll('.size-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', filterProducts);
});

// Initialize cart count
updateCartCount();

// Update cart count on page load
updateCartCount();

// Add event listener for success modal close button
const successModalCloseBtn = document.querySelector('#success-modal button');
if (successModalCloseBtn) {
    successModalCloseBtn.addEventListener('click', hideSuccessModal);
}

// Add event listener for clicking outside success modal
const successModal = document.getElementById('success-modal');
if (successModal) {
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            hideSuccessModal();
        }
    });
}

// Update quick add to cart buttons
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const productCard = e.target.closest('.product-card');
        const productId = productCard.dataset.productId;
        const product = products.find(p => p.id === productId);
        if (product) {
            addToCart(product);
        }
    });
});

// Add event listener for WhatsApp checkout button
const whatsappCheckoutBtn = document.getElementById('whatsapp-checkout');
if (whatsappCheckoutBtn) {
    whatsappCheckoutBtn.addEventListener('click', checkoutViaWhatsApp);
}

// Navbar scroll effect
function handleNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    if (window.scrollY > 50) {
        navbar.classList.add('shadow-xl', 'bg-white/95', 'backdrop-blur-sm');
        navbar.classList.remove('shadow-lg');
    } else {
        navbar.classList.remove('shadow-xl', 'bg-white/95', 'backdrop-blur-sm');
        navbar.classList.add('shadow-lg');
    }
}

// Mobile menu functionality
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.fa-bars').parentElement;
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuContent = mobileMenu.querySelector('.fixed');
    const closeMenuBtn = document.getElementById('close-mobile-menu');

    function openMobileMenu() {
        mobileMenu.classList.remove('hidden');
        setTimeout(() => {
            mobileMenuContent.classList.remove('translate-x-full');
        }, 10);
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileMenuContent.classList.add('translate-x-full');
        setTimeout(() => {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
    }

    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', closeMobileMenu);
    }

    if (mobileMenu) {
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                closeMobileMenu();
            }
        });
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}
