/**
 * Armoury Media Embed
 *
 * @package ArmouryMediaEmbed
 * @since 1.0.0
 * @version 1.0.0
 */

(function() {
    'use strict';

    const config = window.ameConfig || {};
    const processed = new WeakSet();

    /**
     * Initialize when DOM is ready.
     */
    function init() {
        const selectors = buildSelectors();
        if (!selectors) return;

        document.querySelectorAll(selectors).forEach(setupVideoLink);

        // Watch for dynamically added content.
        if (window.MutationObserver) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes.length) {
                        document.querySelectorAll(selectors).forEach(setupVideoLink);
                    }
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    /**
     * Build CSS selectors from provider patterns.
     */
    function buildSelectors() {
        if (!config.providers) return null;

        const selectors = [];
        Object.values(config.providers).forEach(provider => {
            provider.pattern.split('|').forEach(pattern => {
                selectors.push(`a[href*="${pattern}"]`);
            });
        });
        return selectors.join(', ');
    }

    /**
     * Setup video link for click-to-play.
     */
    function setupVideoLink(link) {
        const img = link.querySelector('img');
        // Skip if already processed or no image inside.
        if (processed.has(link) || !img) return;
        processed.add(link);

        // Add class and play button.
        link.classList.add('ame-video-link');
        const playButton = document.createElement('div');
        playButton.className = 'ame-play-button';
        link.appendChild(playButton);

        // Create a more descriptive ARIA label.
        const i18n = config.i18n || { playVideo: 'Play video' };
        let ariaLabel = i18n.playVideo;
        if (img.alt) {
            ariaLabel += `: ${img.alt}`;
        }
        link.setAttribute('aria-label', ariaLabel);
        
        link.setAttribute('role', 'button');
        link.setAttribute('tabindex', '0');

        // Handle click.
        link.addEventListener('click', function(e) {
            e.preventDefault();
            embedVideo(this);
        });

        // Handle keyboard.
        link.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                embedVideo(this);
            }
        });
    }

    /**
     * Embed video in place of link.
     */
    function embedVideo(link) {
        const embedUrl = getEmbedUrl(link.href);
        if (!embedUrl) return;

        // Create wrapper and add loading state.
        const wrapper = document.createElement('div');
        wrapper.className = 'ame-video-wrapper ame-loading';

        // Create and add loader spinner.
        const loader = document.createElement('div');
        loader.className = 'ame-loader';
        wrapper.appendChild(loader);

        // Create iframe.
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.title = config.i18n?.videoPlayer || 'Video player';

        // When iframe is loaded, remove the loader and show the video.
        iframe.onload = () => {
            wrapper.classList.remove('ame-loading');
            loader.remove();
        };

        // Add iframe to wrapper and replace the original link in the DOM.
        wrapper.appendChild(iframe);
        link.parentNode.replaceChild(wrapper, link);
    }

    /**
     * Convert video URL to embed URL.
     */
    function getEmbedUrl(url) {
        if (!config.providers) return null;

        for (const provider of Object.values(config.providers)) {
            const patterns = provider.pattern.split('|');
            for (const pattern of patterns) {
                if (url.includes(pattern)) {
                    // Handle special transformations.
                    if (provider.embed === 'youtube') {
                        return transformYouTubeUrl(url);
                    }
                    if (provider.embed === 'vimeo') {
                        return transformVimeoUrl(url);
                    }
                    // Simple replacement.
                    if (Array.isArray(provider.embed)) {
                        return url.replace(provider.embed[0], provider.embed[1]);
                    }
                }
            }
        }
        return null;
    }

    /**
     * Transform YouTube URL.
     */
    function transformYouTubeUrl(url) {
        let videoId = null;

        // Handle youtube.com/watch?v=ID
        const watchMatch = url.match(/[?&]v=([^&]+)/);
        if (watchMatch) {
            videoId = watchMatch[1];
        }

        // Handle youtu.be/ID
        const shortMatch = url.match(/youtu\.be\/([^?]+)/);
        if (shortMatch) {
            videoId = shortMatch[1];
        }

        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
    }

    /**
     * Transform Vimeo URL.
     */
    function transformVimeoUrl(url) {
        const match = url.match(/vimeo\.com\/(\d+)/);
        return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1` : null;
    }

    // Initialize.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
