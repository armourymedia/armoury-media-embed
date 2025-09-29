# Armoury Media Embed

A minimal WordPress plugin that transforms images into click-to-play video embeds. Just link any image to a video URL and the plugin handles the rest. No settings or configuration required.

## Features

- **Zero Configuration**: Works immediately upon activation
- **Performance First**: Videos load only when clicked, preserving page speed
- **Smart Loading**: Assets load only on pages with video links
- **Fully Accessible**: Keyboard navigation, screen reader support, focus management
- **Secure**: URL validation and sandboxed iframes with restricted permissions
- **Responsive**: Works on all devices and orientations

## Supported Platforms

- **Bunny Stream** (iframe.mediadelivery.net)
- **Cloudflare Stream** (cloudflarestream.com)

## Installation

1. Upload to `/wp-content/plugins/armoury-media-embed/`
2. Activate through the WordPress admin panel
3. That's it - no configuration necessary

## Usage

1. Add an image to any post or page
2. Link the image to a supported video URL
3. Publish your content

The plugin automatically detects the video link and adds a play button overlay. Clicking the image replaces it with the embedded video and begins playback.

**Note**: Only images linked to recognized video platforms will be transformed. Other linked images remain unchanged.

## Example Video URLs

- **Bunny Stream**: `https://iframe.mediadelivery.net/play/12345/video-id`
- **Cloudflare Stream**: `https://customer-xxxxx.cloudflarestream.com/video-id/watch`

## Developer Customization

### Add Custom Providers

Register additional video providers using the `ame_providers` filter:

```php
add_filter('ame_providers', function($providers) {
    // Add support for Wistia videos
    $providers['wistia'] = [
        'pattern' => 'wistia.com/medias|wistia.net',
        'embed'   => 'wistia',  // Use special handler
        'allowed_hosts' => ['fast.wistia.com', 'fast.wistia.net']
    ];
    
    // Add support for self-hosted videos with simple URL replacement
    $providers['selfhosted'] = [
        'pattern' => 'videos.example.com/watch',
        'embed'   => ['/watch/', '/embed/'],  // Replace /watch/ with /embed/
        'allowed_hosts' => ['videos.example.com']
    ];
    
    return $providers;
});
```

**Provider configuration keys**:
- `pattern`: String to detect in content (pipe-separated for multiple patterns)
- `embed`: Either an array for simple replacement `[search, replace]` or a string identifier for special handlers
- `allowed_hosts`: Array of allowed domains for security validation

**Note**: For providers requiring complex URL transformations, you'll need to add a corresponding JavaScript handler.

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

- **URL Validation**: Only transforms links to approved video hosts
- **Sandboxed iframes**: Restrictive permissions prevent invasive features
  - Blocks forms, pop-ups, and tracking features
  - Allows only essential playback functionality
- **No Database Queries**: Zero attack surface for SQL injection
- **Escaped Output**: All dynamic content is properly sanitized
- **No User Input Processing**: Plugin only reads existing content

## Performance Optimization

- Conditional asset loading (CSS/JS load only when needed)
- Lightweight: ~5KB total (CSS + JS)
- Zero database queries
- Compatible with all caching plugins
- No render-blocking resources
- Videos load only on demand (click-to-play)

## Troubleshooting

### Video not transforming into embed

1. Verify the image is linked to a supported video platform
2. Check that the video URL is publicly accessible
3. Ensure JavaScript is enabled in the browser
4. Check browser console for any error messages

### Video won't play after clicking

- Some browsers block autoplay - users may need to click play again
- Verify the video hasn't been removed or made private
- Check if the video platform is experiencing issues

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

### 1.0.1
- Removed YouTube and Vimeo support
- Simplified codebase by removing provider-specific transformations
- Improved security and performance with streamlined provider list
- Updated documentation to reflect supported platforms

### 1.0.0
- Initial release
- Zero-configuration click-to-play video embeds
- Support for YouTube, Vimeo, Bunny Stream, and Cloudflare Stream
- Privacy-by-default with YouTube no-cookie and Vimeo do-not-track
- Conditional asset loading for optimal performance
- Full accessibility support with keyboard navigation
- Security features including URL validation and restrictive sandboxing
- Responsive design with mobile optimization
