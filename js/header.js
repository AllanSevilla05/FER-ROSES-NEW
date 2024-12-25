// Initialize cart manager if not already initialized
if (!window.cartManager) {
    window.cartManager = new CartManager();
}

// Update cart count function
function updateCartCount() {
    if (!window.cartManager) {
        console.error('Cart manager not initialized');
        return;
    }

    const cartCount = window.cartManager.getTotalCount();
    console.log('Updating cart count:', cartCount);
    
    // Update all cart count elements
    const cartCountElements = document.querySelectorAll('[id^="cart-count"]');
    cartCountElements.forEach(element => {
        if (element) {
            element.textContent = cartCount;
            element.style.display = cartCount > 0 ? 'inline-block' : 'none';
        }
    });
}

// Initialize when DOM is ready
function initializeHeader() {
    console.log('Initializing header...');
    
    // Initial cart count update
    updateCartCount();

    // Listen for cart updates
    window.addEventListener('cartUpdated', () => {
        console.log('Cart updated event received');
        updateCartCount();
    });

    // Update when tab becomes visible
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            console.log('Tab became visible, updating cart');
            updateCartCount();
        }
    });

    // Mobile menu functionality
    const bar = document.getElementById('bar');
    const close = document.getElementById('close');
    const nav = document.getElementById('navbar');

    if (bar) {
        bar.addEventListener('click', () => {
            nav.classList.add('active');
        });
    }

    if (close) {
        close.addEventListener('click', () => {
            nav.classList.remove('active');
        });
    }
}

// Initialize immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHeader);
} else {
    initializeHeader();
}
