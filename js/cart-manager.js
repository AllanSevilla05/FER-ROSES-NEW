class CartManager {
    constructor() {
        console.log('Initializing CartManager');
        this.items = [];
        this.loadCart();
    }

    loadCart() {
        try {
            const savedCart = localStorage.getItem('cart');
            console.log('Loading cart:', savedCart);
            this.items = savedCart ? JSON.parse(savedCart) : [];
            this.updateCartCount();
        } catch (error) {
            console.error('Error loading cart:', error);
            this.items = [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.items));
            console.log('Saved cart:', this.items);
            this.updateCartCount();
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    updateCartCount() {
        const count = this.getTotalCount();
        console.log('Updating cart count:', count);
        
        document.querySelectorAll('#cart-count').forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'inline-block' : 'none';
        });
    }

    addItem(item) {
        console.log('Adding item:', item);
        
        if (!item || !item.id) {
            console.error('Invalid item');
            return;
        }

        const existingItem = this.items.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity = (parseInt(existingItem.quantity) || 0) + 1;
            console.log('Updated quantity for existing item');
        } else {
            this.items.push({
                ...item,
                quantity: 1
            });
            console.log('Added new item');
        }

        this.saveCart();
    }

    removeItem(itemId) {
        console.log('Removing item:', itemId);
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCart();
    }

    updateQuantity(itemId, quantity) {
        console.log('Updating quantity:', itemId, quantity);
        const item = this.items.find(i => i.id === itemId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }

    clearCart() {
        console.log('Clearing cart');
        this.items = [];
        this.saveCart();
    }

    getTotalCount() {
        return this.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    }

    getTotalPrice() {
        return this.items.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);
    }
}

// Initialize cart manager globally
if (!window.cartManager) {
    console.log('Creating global cart manager');
    window.cartManager = new CartManager();
}
