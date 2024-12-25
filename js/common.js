// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart if available
    if (typeof cart !== 'undefined') {
        cart.init();
    }

    // Update cart count from localStorage even if cart object isn't loaded
    const updateCartCount = () => {
        try {
            const savedCart = localStorage.getItem('cart');
            const items = savedCart ? JSON.parse(savedCart) : [];
            const count = items.reduce((total, item) => total + (item.quantity || 0), 0);

            const cartCount = document.getElementById('cart-count');
            const mobileCartCount = document.getElementById('mobile-cart-count');
            
            if (cartCount) {
                cartCount.textContent = count || '';
                cartCount.style.display = count ? 'flex' : 'none';
            }
            
            if (mobileCartCount) {
                mobileCartCount.textContent = count || '';
                mobileCartCount.style.display = count ? 'flex' : 'none';
            }
        } catch (error) {
            console.error('Error updating cart count:', error);
        }
    };

    // Update count immediately
    updateCartCount();

    // Listen for storage changes to update count across tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'cart') {
            updateCartCount();
        }
    });
});
