// Inject required scripts for cart functionality
(function() {
    console.log('Initializing cart functionality...');
    
    // Helper function to load script
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                console.log(`Script ${src} already loaded`);
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log(`Loaded ${src}`);
                resolve();
            };
            script.onerror = () => {
                console.error(`Error loading ${src}`);
                reject();
            };
            document.head.appendChild(script);
        });
    }

    // Load cart manager
    loadScript('/js/cart-manager.js')
        .then(() => {
            console.log('Cart manager loaded');
            if (!window.cartManager) {
                window.cartManager = new CartManager();
            }
        })
        .catch(error => {
            console.error('Error initializing cart:', error);
        });
})();
