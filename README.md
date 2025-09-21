# Armoury Media Embed

A minimal WordPress plugin that transforms images into click-to-play video embeds. Just link any image to a video URL and the plugin handles the rest. No settings or configuration required.

## Features

- **Zero Configuration**: Works immediately upon activation
- **Privacy by Default**: Uses privacy-enhanced embeds (YouTube no-cookie, Vimeo DNT)
- **Performance First**: Videos load only when clicked, preserving page speed
- **Smart Loading**: Assets load only on pages with video links
- **Fully Accessible**: Keyboard navigation, screen reader support, focus management
- **Secure**: URL validation and sandboxed iframes
- **Responsive**: Works on all devices and orientations

## Supported Platforms

- **Bunny Stream** (iframe.mediadelivery.net)
- **Cloudflare Stream** (cloudflarestream.com)
- **YouTube** (youtube.com, youtu.be)
- **Vimeo** (vimeo.com)

## Installation

1. Upload to `/wp-content/plugins/armoury-media-embed/`
2. Activate through the WordPress admin panel
3. That's it - no configuration necessary

## Usage

1. Add an image to any post or page
2. Link the image to a supported video URL
3. Publish your content

The plugin automatically detects the video link and adds a play button overlay. Clicking the image replaces it with the embedded video and begins playback.

## Example Video URLs

- **YouTube**: `https://www.youtube.com/watch?v=VIDEO_ID` or `https://youtu.be/VIDEO_ID`
- **Vimeo**: `https://vimeo.com/VIDEO_ID`
- **Bunny Stream**: `https://iframe.mediadelivery.net/play/12345/video-id`
- **Cloudflare Stream**: `https://customer.cloudflarestream.com/video-id/watch`

## Privacy Mode

Privacy-enhanced embeds are **enabled by default** for GDPR compliance and user privacy:

- YouTube uses no-cookie domain (youtube-nocookie.com)
- Vimeo includes do-not-track parameter
- Reduced tracking across all providers

To disable privacy mode if needed:

```php
// In your theme's functions.php or a custom plugin
add_filter('ame_privacy_mode', '__return_false');
```

## Developer Customization

### Add Custom Providers

```php
add_filter('ame_providers', function($providers) {
    $providers['custom'] = [
        'pattern' => 'example.com/video',
        'embed'   => ['/video/', '/embed/'],
        'allowed_hosts' => ['example.com', 'cdn.example.com']
    ];
    return $providers;
});
```

### Modify Translations

The plugin is translation-ready and uses WordPress's standard localization system. To translate the plugin:

1. Use a translation plugin like Loco Translate
2. Create custom translations in `/wp-content/languages/plugins/`
3. Or use the provided `.pot` file with Poedit

The translatable strings include:
- "Play video" - Button accessibility label
- "Video player" - iframe title for screen readers  
- "Video could not be loaded" - Error message

## Accessibility Features

- Full keyboard navigation (Enter/Space to activate)
- Screen reader announcements for state changes
- Proper ARIA labels and roles
- Focus management after video loads
- High contrast mode support
- Reduced motion support

## Security Features

- URL validation against allowed hosts
- Sandboxed iframes with minimal permissions
- No direct database queries
- Escaped and sanitized output
- No user input processing

## Performance Optimization

- Conditional asset loading (CSS/JS load only when needed)
- Lightweight: ~5KB total (CSS + JS)
- Zero database queries
- Compatible with all caching plugins
- No render-blocking resources

## Requirements

- WordPress 6.0 or higher
- PHP 7.4 or higher
- Modern browser with JavaScript enabled

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

GPL v3 or later - see [LICENSE](LICENSE) file for details.

## Credits

Created by [Armoury Media](https://www.armourymedia.com/) - Secure websites for solo professionals.

## Changelog

### 1.0.0
- Initial release
- Zero-configuration click-to-play video embeds
- Support for YouTube, Vimeo, Bunny Stream, and Cloudflare Stream
- Privacy-by-default with YouTube no-cookie and Vimeo do-not-track
- Conditional asset loading for optimal performance
- Full accessibility support with keyboard navigation
- Security features including URL validation
- Responsive design with mobile optimization
