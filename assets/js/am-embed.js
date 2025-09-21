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

        processVideoLinks(selectors);

        // Watch for dynamically added content.
        if (window.MutationObserver) {
            const observer = new MutationObserver((mutations) => {
                const hasNewNodes = mutations.some(m => m.addedNodes.length > 0);
                if (hasNewNodes) {
                    processVideoLinks(selectors);
                }
            });
            observer.observe(document.body, { 
                childList: true, 
                subtree: true 
            });
        }
    }

    /**
     * Process all video links on the page.
     */
    function processVideoLinks(selectors) {
        document.querySelectorAll(selectors).forEach(link => {
            if (isValidVideoLink(link)) {
                setupVideoLink(link);
            }
        });
    }

    /**
     * Validate video link for security.
     */
    function isValidVideoLink(link) {
        if (!link.href || processed.has(link)) return false;
        
        try {
            const url = new URL(link.href);
            
            // Find matching provider
            for (const provider of Object.values(config.providers)) {
                if (!provider.allowed_hosts) continue;
                
                // Check if hostname is in allowed list
                const isAllowed = provider.allowed_hosts.some(host => 
                    url.hostname === host || url.hostname.endsWith('.' + host)
                );
                
                if (isAllowed) return true;
            }
        } catch (e) {
            // Invalid URL
            return false;
        }
        
        return false;
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
        if (!img) return;
        
        processed.add(link);

        // Add class and create play button.
        link.classList.add('ame-video-link');
        const playButton = document.createElement('div');
        playButton.className = 'ame-play-button';
        link.appendChild(playButton);

        // Setup accessibility.
        const i18n = config.i18n || {};
        let ariaLabel = i18n.playVideo || 'Play video';
        if (img.alt) {
            ariaLabel += `: ${img.alt}`;
        }
        
        link.setAttribute('aria-label', ariaLabel);
        link.setAttribute('role', 'button');
        link.setAttribute('tabindex', '0');

        // Event handlers.
        link.addEventListener('click', handleVideoClick);
        link.addEventListener('keydown', handleVideoKeydown);
    }

    /**
     * Handle video link click.
     */
    function handleVideoClick(e) {
        e.preventDefault();
        embedVideo(this);
    }

    /**
     * Handle keyboard interaction.
     */
    function handleVideoKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            embedVideo(this);
        }
    }

    /**
     * Embed video in place of link.
     */
    function embedVideo(link) {
        try {
            const embedUrl = getEmbedUrl(link.href);
            if (!embedUrl) {
                console.warn('AME: Could not generate embed URL for', link.href);
                return;
            }

            // Create wrapper with loading state.
            const wrapper = document.createElement('div');
            wrapper.className = 'ame-video-wrapper ame-loading';

            // Create loader.
            const loader = document.createElement('div');
            loader.className = 'ame-loader';
            loader.setAttribute('aria-label', 'Loading video');
            wrapper.appendChild(loader);

            // Create iframe.
            const iframe = document.createElement('iframe');
            iframe.src = embedUrl;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
            iframe.allowFullscreen = true;
            iframe.title = config.i18n?.videoPlayer || 'Video player';
            
            // Set sandbox for additional security (allows required features).
            iframe.sandbox = 'allow-scripts allow-same-origin allow-presentation allow-popups';

            // Handle iframe load success.
            iframe.onload = () => {
                wrapper.classList.remove('ame-loading');
                loader.remove();
                
                // Announce to screen readers.
                announceToScreenReader(config.i18n?.videoPlayer || 'Video player loaded');
            };

            // Handle iframe load error.
            iframe.onerror = () => {
                wrapper.classList.remove('ame-loading');
                wrapper.classList.add('ame-error');
                loader.textContent = config.i18n?.loadError || 'Video could not be loaded';
                loader.setAttribute('role', 'alert');
            };

            // Add iframe and replace link.
            wrapper.appendChild(iframe);
            link.parentNode.replaceChild(wrapper, link);
            
            // Focus management for accessibility.
            iframe.focus();
            
        } catch (error) {
            console.error('AME: Error embedding video', error);
        }
    }

    /**
     * Convert video URL to embed URL.
     */
    function getEmbedUrl(url) {
        if (!config.providers) return null;

        try {
            const urlObj = new URL(url);
            
            for (const [key, provider] of Object.entries(config.providers)) {
                const patterns = provider.pattern.split('|');
                
                for (const pattern of patterns) {
                    if (url.includes(pattern)) {
                        // Validate against allowed hosts.
                        if (provider.allowed_hosts) {
                            const isAllowed = provider.allowed_hosts.some(host => 
                                urlObj.hostname === host || urlObj.hostname.endsWith('.' + host)
                            );
                            if (!isAllowed) continue;
                        }
                        
                        // Handle special transformations.
                        if (provider.embed === 'youtube') {
                            return transformYouTubeUrl(url, urlObj);
                        }
                        if (provider.embed === 'vimeo') {
                            return transformVimeoUrl(url, urlObj);
                        }
                        
                        // Simple replacement.
                        if (Array.isArray(provider.embed)) {
                            return url.replace(provider.embed[0], provider.embed[1]);
                        }
                    }
                }
            }
        } catch (e) {
            console.error('AME: Invalid URL', e);
        }
        
        return null;
    }

    /**
     * Transform YouTube URL with privacy mode by default.
     */
    function transformYouTubeUrl(url, urlObj) {
        let videoId = null;

        // Handle youtube.com/watch?v=ID
        const watchMatch = urlObj.searchParams.get('v');
        if (watchMatch) {
            videoId = watchMatch;
        } else {
            // Handle youtu.be/ID
            const shortMatch = url.match(/youtu\.be\/([^?]+)/);
            if (shortMatch) {
                videoId = shortMatch[1];
            }
        }

        if (!videoId) return null;

        // Use privacy-enhanced mode by default (can be disabled via filter).
        const domain = config.privacy_mode !== false ? 'youtube-nocookie.com' : 'youtube.com';
        return `https://www.${domain}/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
    }

    /**
     * Transform Vimeo URL with privacy by default.
     */
    function transformVimeoUrl(url, urlObj) {
        const match = url.match(/vimeo\.com\/(\d+)/);
        if (!match) return null;
        
        const videoId = match[1];
        let embedUrl = `https://player.vimeo.com/video/${encodeURIComponent(videoId)}?autoplay=1`;
        
        // Add do-not-track by default (can be disabled via filter).
        if (config.privacy_mode !== false) {
            embedUrl += '&dnt=1';
        }
        
        return embedUrl;
    }

    /**
     * Announce message to screen readers.
     */
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'screen-reader-text';
        announcement.style.position = 'absolute';
        announcement.style.left = '-9999px';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }

    // Initialize based on DOM state.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
