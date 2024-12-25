class ShoppingCart {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCartDisplay();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.updateCartDisplay();
        });

        // Listen for cart updates
        window.addEventListener('cartUpdated', () => {
            this.updateCartDisplay();
        });
    }

    updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cart-items');
        if (!cartItemsContainer) {
            console.log('Cart items container not found');
            return;
        }

        const cart = window.cartManager?.items || [];
        
        if (!cart || cart.length === 0) {
            cartItemsContainer.innerHTML = '<tr><td colspan="6" class="empty-cart">Your cart is empty</td></tr>';
            this.updateTotal(0);
            this.updateCheckoutButton(true);
            return;
        }

        let total = 0;
        cartItemsContainer.innerHTML = cart.map(item => {
            const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
            total += itemTotal;
            
            return `
                <tr>
                    <td>
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.name}" 
                                 onerror="this.src='images/placeholder.png'" 
                                 loading="lazy">
                        </div>
                    </td>
                    <td>
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                        </div>
                    </td>
                    <td>$${parseFloat(item.price).toFixed(2)}</td>
                    <td class="quantity-cell">
                        <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', -1)">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', 1)">+</button>
                    </td>
                    <td>$${itemTotal.toFixed(2)}</td>
                    <td>
                        <button class="remove-btn" onclick="cart.removeFromCart('${item.id}')">
                            <i class="far fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        this.updateTotal(total);
        this.updateCheckoutButton(false);
    }

    updateTotal(total) {
        const totalElement = document.getElementById('cart-total');
        if (totalElement) {
            totalElement.textContent = `$${total.toFixed(2)}`;
        }
    }

    updateCheckoutButton(isEmpty) {
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = isEmpty;
            checkoutBtn.classList.toggle('disabled', isEmpty);
        }
    }

    updateQuantity(productId, change) {
        if (window.cartManager) {
            cartManager.updateQuantity(productId, change);
            this.updateCartDisplay();
        }
    }

    removeFromCart(productId) {
        if (window.cartManager) {
            cartManager.removeItem(productId);
            this.updateCartDisplay();
        }
    }

    clearCart() {
        if (window.cartManager) {
            cartManager.clearCart();
            this.updateCartDisplay();
        }
    }
}

// Initialize cart and make it globally available
const cart = new ShoppingCart();
window.cart = cart;
