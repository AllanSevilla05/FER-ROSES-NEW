// Global Cart System
const CartSystem = {
    debug: true,
    storageKey: 'ferflowers_cart_v2',
    _initialized: false,
    
    log(...args) {
        if (this.debug) {
            console.log('[CartSystem]', ...args);
        }
    },

    error(...args) {
        console.error('[CartSystem]', ...args);
    },

    // Initialize the cart system
    init() {
        if (this._initialized) {
            this.log('Cart system already initialized');
            return this;
        }

        this.log('Initializing cart system...');
        
        // Create cart manager if it doesn't exist
        if (!window.cartManager) {
            this.log('Creating cart manager');
            window.cartManager = new CartManager();
        }

        // Set up event listeners
        this.setupEventListeners();
        
        // Initial cart update
        this.updateAllCartCounts();
        
        this._initialized = true;
        this.log('Cart system initialized');
        
        // Make CartSystem globally available
        window.CartSystem = this;
        
        return this;
    },

    // Set up all event listeners
    setupEventListeners() {
        this.log('Setting up event listeners');
        
        // Listen for cart updates
        window.addEventListener('cartUpdated', (e) => {
            this.log('Cart updated event received', e.detail);
            this.updateAllCartCounts();
            this.saveToStorage();
        });

        // Listen for storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.log('Storage updated in another tab');
                this.syncFromStorage();
            }
        });

        // Update when tab becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.log('Tab visible, syncing cart');
                this.syncFromStorage();
            }
        });

        // Handle page load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onPageLoad());
        } else {
            this.onPageLoad();
        }
    },

    // Handle page load
    onPageLoad() {
        this.log('Page loaded');
        this.syncFromStorage();
        this.setupMobileMenu();
    },

    // Sync cart from storage
    syncFromStorage() {
        if (!window.cartManager) return;
        
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.log('Loading from storage:', stored);
            
            if (!stored) return;
            
            const cart = JSON.parse(stored);
            if (Array.isArray(cart)) {
                window.cartManager.items = cart;
                this.updateAllCartCounts();
                this.log('Cart synced from storage:', cart);
            }
        } catch (error) {
            this.error('Error syncing from storage:', error);
        }
    },

    // Save cart to storage
    saveToStorage() {
        if (!window.cartManager) return;
        
        try {
            const items = window.cartManager.items;
            if (Array.isArray(items)) {
                const cartData = JSON.stringify(items);
                localStorage.setItem(this.storageKey, cartData);
                this.log('Cart saved to storage:', cartData);
            }
        } catch (error) {
            this.error('Error saving to storage:', error);
        }
    },

    // Update all cart count elements
    updateAllCartCounts() {
        if (!window.cartManager) {
            this.error('Cart manager not initialized');
            return;
        }

        const count = window.cartManager.getTotalCount();
        this.log('Updating cart count:', count);

        // Update all cart count elements
        document.querySelectorAll('[id^="cart-count"]').forEach(element => {
            if (element) {
                element.textContent = count.toString();
                element.style.display = count > 0 ? 'inline-block' : 'none';
                this.log('Updated cart count element:', element.id);
            }
        });
    },

    // Set up mobile menu
    setupMobileMenu() {
        const bar = document.getElementById('bar');
        const close = document.getElementById('close');
        const nav = document.getElementById('navbar');

        if (bar) {
            bar.addEventListener('click', () => {
                nav?.classList.add('active');
            });
        }

        if (close) {
            close.addEventListener('click', () => {
                nav?.classList.remove('active');
            });
        }
    },

    // Add item to cart
    addItem(item) {
        if (!window.cartManager) {
            this.error('Cart manager not initialized');
            return false;
        }

        try {
            const success = window.cartManager.addItem(item);
            if (success) {
                this.saveToStorage();
                this.log('Item added to cart:', item);
                return true;
            }
        } catch (error) {
            this.error('Error adding item:', error);
        }
        return false;
    },

    // Remove item from cart
    removeItem(itemId) {
        if (!window.cartManager) {
            this.error('Cart manager not initialized');
            return false;
        }

        try {
            const success = window.cartManager.removeItem(itemId);
            if (success) {
                this.saveToStorage();
                this.log('Item removed from cart:', itemId);
                return true;
            }
        } catch (error) {
            this.error('Error removing item:', error);
        }
        return false;
    },

    // Update item quantity
    updateQuantity(itemId, quantity) {
        if (!window.cartManager) {
            this.error('Cart manager not initialized');
            return false;
        }

        try {
            const success = window.cartManager.updateQuantity(itemId, quantity);
            if (success) {
                this.saveToStorage();
                this.log('Item quantity updated:', itemId, quantity);
                return true;
            }
        } catch (error) {
            this.error('Error updating quantity:', error);
        }
        return false;
    },

    // Clear cart
    clearCart() {
        if (!window.cartManager) {
            this.error('Cart manager not initialized');
            return false;
        }

        try {
            const success = window.cartManager.clearCart();
            if (success) {
                this.saveToStorage();
                this.log('Cart cleared');
                return true;
            }
        } catch (error) {
            this.error('Error clearing cart:', error);
        }
        return false;
    },

    // Get cart total
    getTotal() {
        if (!window.cartManager) {
            this.error('Cart manager not initialized');
            return 0;
        }

        try {
            const total = window.cartManager.getTotalPrice();
            this.log('Cart total:', total);
            return total;
        } catch (error) {
            this.error('Error getting total:', error);
            return 0;
        }
    }
};

// Initialize cart system
CartSystem.init();
