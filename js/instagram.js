// Instagram Feed
const instagramToken = 'YOUR_INSTAGRAM_TOKEN'; // You'll need to replace this with your actual token
const instagramContainer = document.getElementById('instagram-container');

async function fetchInstagramFeed() {
    try {
        const response = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url&access_token=${instagramToken}`);
        const data = await response.json();
        
        if (data.data) {
            displayInstagramFeed(data.data);
        }
    } catch (error) {
        console.error('Error fetching Instagram feed:', error);
    }
}

function displayInstagramFeed(posts) {
    posts.slice(0, 6).forEach(post => {
        const imageUrl = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;
        const postElement = document.createElement('div');
        postElement.className = 'instagram-item';
        
        postElement.innerHTML = `
            <a href="${post.permalink}" target="_blank">
                <img src="${imageUrl}" alt="${post.caption || 'Instagram post'}" loading="lazy">
                <div class="instagram-overlay">
                    <i class="fab fa-instagram"></i>
                </div>
            </a>
        `;
        
        instagramContainer.appendChild(postElement);
    });
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchInstagramFeed);
