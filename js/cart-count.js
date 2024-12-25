// Function to update cart count across all pages
function updateCartCount() {
    if (!window.cartManager) {
        console.error('Cart manager not initialized');
        return;
    }

    const cartCount = window.cartManager.getTotalCount();
    
    // Update all cart count elements
    const cartCountElements = document.querySelectorAll('.cart-count, #cart-count, #mobile-cart-count');
    cartCountElements.forEach(element => {
        if (element) {
            element.textContent = cartCount;
            element.style.display = cartCount > 0 ? 'inline-block' : 'none';
        }
    });
}

// Initialize cart count
function initializeCartCount() {
    // Initial update
    updateCartCount();

    // Listen for cart updates
    window.addEventListener('cartUpdated', () => {
        updateCartCount();
    });

    // Update when tab becomes visible
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            updateCartCount();
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCartCount);
} else {
    initializeCartCount();
}

// Export function for use in other scripts
window.updateCartCount = updateCartCount;
