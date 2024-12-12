document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const adminPanel = document.getElementById('admin-panel');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const loginError = document.getElementById('login-error');

    const ADMIN_PASSWORD = '45086932';

    // Handle login
    loginBtn.addEventListener('click', () => {
        if (passwordInput.value === ADMIN_PASSWORD) {
            loginForm.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            loadProducts();
        } else {
            loginError.classList.remove('hidden');
            passwordInput.value = '';
        }
    });

    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
        loginError.classList.add('hidden');
    });

    // Image preview functionality
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('image-preview');

    imageInput.addEventListener('change', () => {
        imagePreview.innerHTML = '';
        [...imageInput.files].forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.classList.add('w-full', 'h-32', 'object-cover', 'rounded-lg', 'shadow-sm');
                imagePreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    });

    // Size input functionality
    const sizesContainer = document.getElementById('sizes-container');
    const addSizeBtn = document.getElementById('add-size');

    addSizeBtn.addEventListener('click', () => {
        const sizeGroup = document.createElement('div');
        sizeGroup.classList.add('flex', 'items-center', 'gap-2');
        
        const input = document.createElement('input');
        input.type = 'text';
        input.classList.add('size-input', 'px-4', 'py-2', 'border', 'border-gray-300', 'rounded-lg', 'w-24', 
            'focus:ring-2', 'focus:ring-blue-500', 'focus:border-blue-500', 'transition-all');
        input.placeholder = 'Size';

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.classList.add('text-red-500', 'hover:text-red-700', 'transition-all');
        removeBtn.textContent = '✕';
        removeBtn.onclick = () => sizeGroup.remove();

        sizeGroup.appendChild(input);
        sizeGroup.appendChild(removeBtn);
        sizesContainer.insertBefore(sizeGroup, addSizeBtn);
    });

    // Color input functionality
    const colorsContainer = document.getElementById('colors-container');
    const addColorBtn = document.getElementById('add-color');

    addColorBtn.addEventListener('click', () => {
        const colorGroup = document.createElement('div');
        colorGroup.classList.add('color-input-group', 'flex', 'items-center', 'gap-2');
        
        const input = document.createElement('input');
        input.type = 'color';
        input.classList.add('color-input', 'w-24', 'h-10', 'rounded', 'cursor-pointer');

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.classList.add('remove-color', 'text-red-500', 'hover:text-red-700', 'transition-all');
        removeBtn.textContent = '✕';
        removeBtn.onclick = () => colorGroup.remove();

        colorGroup.appendChild(input);
        colorGroup.appendChild(removeBtn);
        colorsContainer.insertBefore(colorGroup, addColorBtn);
    });

    // Product form submission
    const productForm = document.getElementById('product-form');
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('name');
        const priceInput = document.getElementById('price');
        const descriptionInput = document.getElementById('description');
        const categoryInput = document.getElementById('category');

        const formData = new FormData();
        formData.append('name', nameInput.value);
        formData.append('price', priceInput.value);
        formData.append('description', descriptionInput.value);
        formData.append('category', categoryInput.value);

        // Append all images
        [...imageInput.files].forEach(file => {
            formData.append('images', file);
        });

        // Append sizes
        const sizes = [...document.querySelectorAll('.size-input')]
            .map(input => input.value.trim())
            .filter(Boolean);
        formData.append('sizes', JSON.stringify(sizes));

        // Append colors
        const colors = [...document.querySelectorAll('.color-input')]
            .map(input => input.value)
            .filter(Boolean);
        formData.append('colors', JSON.stringify(colors));

        try {
            const response = await fetch('/api/add-product', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.error) {
                alert('Error adding product: ' + result.error);
            } else {
                alert('Product added successfully!');
                productForm.reset();
                imagePreview.innerHTML = '';
                loadProducts();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding product. Please try again.');
        }
    });

    // Load and display products
    const loadProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const products = await response.json();
            
            const tbody = document.getElementById('product-table-body');
            tbody.innerHTML = '';
            
            products.forEach((product, index) => {
                const tr = document.createElement('tr');
                
                // Create product cell with image and name
                const productCell = document.createElement('td');
                productCell.classList.add('px-6', 'py-4', 'whitespace-nowrap');
                productCell.innerHTML = `
                    <div class="flex items-center">
                        <div class="h-10 w-10 flex-shrink-0">
                            <img class="h-10 w-10 rounded-full object-cover" 
                                src="${product.images[0] || ''}" 
                                alt="${product.name}">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${product.name}</div>
                        </div>
                    </div>
                `;
                
                // Create price cell
                const priceCell = document.createElement('td');
                priceCell.classList.add('px-6', 'py-4', 'whitespace-nowrap');
                priceCell.innerHTML = `
                    <div class="text-sm text-gray-900">$${product.price}</div>
                `;
                
                // Create sizes cell
                const sizesCell = document.createElement('td');
                sizesCell.classList.add('px-6', 'py-4');
                sizesCell.innerHTML = `
                    <div class="flex flex-wrap gap-1">
                        ${product.sizes.map(size => 
                            `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                ${size}
                            </span>`
                        ).join('')}
                    </div>
                `;
                
                // Create colors cell
                const colorsCell = document.createElement('td');
                colorsCell.classList.add('px-6', 'py-4');
                colorsCell.innerHTML = `
                    <div class="flex flex-wrap gap-1">
                        ${product.colors.map(color => 
                            `<div class="w-6 h-6 rounded-full" style="background-color: ${color};" title="${color}"></div>`
                        ).join('')}
                    </div>
                `;
                
                // Create category cell
                const categoryCell = document.createElement('td');
                categoryCell.classList.add('px-6', 'py-4', 'whitespace-nowrap');
                categoryCell.innerHTML = `
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ${product.category}
                    </span>
                `;
                
                // Create actions cell
                const actionsCell = document.createElement('td');
                actionsCell.classList.add('px-6', 'py-4', 'whitespace-nowrap', 'text-right', 'text-sm', 'font-medium');
                actionsCell.innerHTML = `
                    <button class="text-red-600 hover:text-red-900 delete-btn">Delete</button>
                `;
                
                actionsCell.querySelector('.delete-btn').addEventListener('click', () => deleteProduct(index));
                
                tr.appendChild(productCell);
                tr.appendChild(priceCell);
                tr.appendChild(sizesCell);
                tr.appendChild(colorsCell);
                tr.appendChild(categoryCell);
                tr.appendChild(actionsCell);
                
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    // Delete product functionality
    const deleteProduct = async (index) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        try {
            const response = await fetch(`/api/products/${index}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            alert(result.message);
            loadProducts();
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting product. Please try again.');
        }
    };

    // Check if already logged in (you might want to implement proper session management)
    if (sessionStorage.getItem('adminLoggedIn')) {
        loginForm.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        loadProducts();
    }
});
