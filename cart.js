document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const itemTemplate = document.getElementById('cart-item-template');
    const checkoutButton = document.getElementById('checkout-button');

    function updateCartDisplay() {
        // Get cart from localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        console.log('Cart contents:', cart); // Debug log
        
        // Update cart count
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = cart.length;
        }

        // Clear current cart display
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
        }

        if (cart.length === 0) {
            if (emptyCartMessage) emptyCartMessage.classList.remove('hidden');
            if (cartItemsContainer) cartItemsContainer.classList.add('hidden');
            updateTotals(0);
            return;
        }

        if (emptyCartMessage) emptyCartMessage.classList.add('hidden');
        if (cartItemsContainer) cartItemsContainer.classList.remove('hidden');

        let total = 0;

        // Add each cart item
        cart.forEach((item, index) => {
            const cartItem = itemTemplate.content.cloneNode(true);
            
            // Set item details
            const img = cartItem.querySelector('img');
            const name = cartItem.querySelector('h3');
            const size = cartItem.querySelector('.selected-size');
            const color = cartItem.querySelector('.selected-color');
            const price = cartItem.querySelector('.item-price');
            const quantity = cartItem.querySelector('.quantity-display');
            
            if (img) img.src = item.image || 'placeholder.jpg';
            if (name) name.textContent = item.name;
            if (size) size.textContent = item.selectedSize || 'N/A';
            if (color) color.textContent = item.selectedColor || 'N/A';
            if (price) price.textContent = `$${(item.price * item.quantity).toFixed(2)}`;
            if (quantity) quantity.textContent = item.quantity;

            // Add event listeners
            const decreaseBtn = cartItem.querySelector('.decrease-quantity');
            const increaseBtn = cartItem.querySelector('.increase-quantity');
            const removeBtn = cartItem.querySelector('.remove-item');

            if (decreaseBtn) {
                decreaseBtn.addEventListener('click', () => updateQuantity(index, -1));
            }
            if (increaseBtn) {
                increaseBtn.addEventListener('click', () => updateQuantity(index, 1));
            }
            if (removeBtn) {
                removeBtn.addEventListener('click', () => removeItem(index));
            }

            total += item.price * item.quantity;
            cartItemsContainer.appendChild(cartItem);
        });

        updateTotals(total);
        setupCheckoutButton(cart);
    }

    function updateTotals(total) {
        if (subtotalElement) subtotalElement.textContent = `$${total.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    }

    function updateQuantity(index, change) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart[index]) {
            cart[index].quantity = Math.max(1, cart[index].quantity + change);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        }
    }

    function removeItem(index) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    }

    function setupCheckoutButton(cart) {
        if (!checkoutButton) return;
        
        checkoutButton.addEventListener('click', () => {
            let message = "🛍️ New Order:\n\n";
            
            cart.forEach(item => {
                message += `📦 ${item.name}\n`;
                message += `   - Quantity: ${item.quantity}\n`;
                message += `   - Size: ${item.selectedSize}\n`;
                message += `   - Color: ${item.selectedColor}\n`;
                message += `   - Price: $${(item.price * item.quantity).toFixed(2)}\n\n`;
            });

            message += `\n💰 Total: $${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}`;
            
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    }

    // Initialize cart display
    updateCartDisplay();
});
