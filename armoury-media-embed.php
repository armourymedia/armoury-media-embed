<?php
/**
 * Plugin Name:       Armoury Media Embed
 * Plugin URI:        https://www.armourymedia.com/
 * Description:       Click-to-play video embeds for images linked to streaming videos. Improves page load performance.
 * Version:           1.0.1
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Armoury Media
 * Author URI:        https://www.armourymedia.com/
 * License:           GPL v3 or later
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       armoury-media-embed
 * Domain Path:       /languages
 *
 * @package ArmouryMediaEmbed
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueue frontend assets and configuration.
 *
 * This function conditionally loads assets only on singular pages where a
 * video link is detected in the post content, improving performance.
 *
 * @since 1.0.0
 * @return void
 */
add_action( 'wp_enqueue_scripts', function() {
	// Only proceed on singular pages with a valid post object.
	if ( ! is_singular() || ! $post = get_post() ) {
		return;
	}

	// Define providers with security constraints and allow filtering.
	$providers = apply_filters( 'ame_providers', array(
		'bunny' => array(
			'pattern' => 'iframe.mediadelivery.net/play',
			'embed'   => array( '/play/', '/embed/' ),
			'allowed_hosts' => array( 'iframe.mediadelivery.net' ),
		),
		'cloudflare' => array(
			'pattern' => 'cloudflarestream.com',
			'embed'   => array( '/watch', '/iframe?autoplay=true' ),
			'allowed_hosts' => array( 'cloudflarestream.com', 'customer.cloudflarestream.com' ),
		),
	) );

	// Build patterns to search for in content.
	$patterns = array();
	foreach ( $providers as $provider ) {
		$patterns = array_merge( $patterns, explode( '|', $provider['pattern'] ) );
	}

	// Check if any provider pattern exists in the post content.
	$content_has_video_link = false;
	foreach ( $patterns as $pattern ) {
		if ( strpos( $post->post_content, $pattern ) !== false ) {
			$content_has_video_link = true;
			break;
		}
	}

	// Bail if no video links found.
	if ( ! $content_has_video_link ) {
		return;
	}

	// Get plugin version for cache busting.
	$plugin_data = get_file_data( __FILE__, array( 'Version' => 'Version' ) );
	$version = $plugin_data['Version'] ?? '1.0.1';

	// Enqueue styles.
	wp_enqueue_style(
		'armoury-media-embed',
		plugin_dir_url( __FILE__ ) . 'assets/css/am-embed.css',
		array(),
		$version
	);

	// Enqueue script.
	wp_enqueue_script(
		'armoury-media-embed',
		plugin_dir_url( __FILE__ ) . 'assets/js/am-embed.js',
		array(),
		$version,
		true
	);

	// Prepare configuration for JavaScript.
	$config = array(
		'providers' => $providers,
		'i18n'      => array(
			'playVideo'    => esc_attr__( 'Play video', 'armoury-media-embed' ),
			'videoPlayer'  => esc_attr__( 'Video player', 'armoury-media-embed' ),
			'loadError'    => esc_attr__( 'Video could not be loaded', 'armoury-media-embed' ),
		),
	);

	// Pass configuration to JavaScript.
	wp_localize_script( 'armoury-media-embed', 'ameConfig', $config );
} );

/**
 * Load plugin text domain for translations.
 *
 * @since 1.0.0
 * @return void
 */
add_action( 'init', function() {
	load_plugin_textdomain(
		'armoury-media-embed',
		false,
		dirname( plugin_basename( __FILE__ ) ) . '/languages'
	);
} );
