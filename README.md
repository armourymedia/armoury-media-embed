# Armoury Media Embed

A minimal WordPress plugin that transforms images into click-to-play video embeds. Just link any image to a video play URL and the plugin handles the rest. No settings or configuration required.

## Features

- **Zero Configuration**: Works immediately upon activation
- **Performance First**: Videos load when image is clicked
- **Smart Loading**: Assets only load on pages with video links
- **Accessible**: Keyboard navigation and screen reader support
- **Responsive**: Works on all devices and orientations

## Supported Platforms

- **Bunny Stream** (iframe.mediadelivery.net)
- **Cloudflare Stream** (cloudflarestream.com)
- **YouTube** (youtube.com, youtu.be)
- **Vimeo** (vimeo.com)

## Installation

1. Upload to `/wp-content/plugins/armoury-media-embed/`
2. Activate through the WordPress admin panel.
3. That's it (no configuration necessary).

## Usage

1. Add an image to any post or page.
2. Link the image to a supported video URL.
3. Publish your post, page, or CPT.

The plugin automatically detects the video link and adds a play button overlay. Clicking the image replaces it with the embedded video and begins video playback.

## Example video play URLs

- **YouTube**: `https://www.youtube.com/watch?v=VIDEO_ID` or `https://youtu.be/VIDEO_ID`
- **Vimeo**: `https://vimeo.com/VIDEO_ID`
- **Bunny Stream**: `https://iframe.mediadelivery.net/play/12345/video-id`
- **Cloudflare Stream**: `https://customer.cloudflarestream.com/video-id/watch`

## Developer Customization

While the plugin requires no configuration, you can use the following filter to add your own video hosting provider:

```php
// Customize provider configuration
add_filter('ame_providers', function($providers) {
    // Add a custom provider
    $providers['custom'] = [
        'pattern' => 'example.com/video',
        'embed'   => ['video/', 'embed/']
    ];
    return $providers;
});
```

## Requirements

- WordPress 6.0+
- PHP 7.4+

## License

GPL v3 or later

## Credits

Created by [Armoury Media](https://www.armourymedia.com/) - Secure websites for solo professionals.
