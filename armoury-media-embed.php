<?php
/**
 * Plugin Name:       Armoury Media Embed
 * Plugin URI:        https://www.armourymedia.com/
 * Description:       Click-to-play video embeds for images linked to streaming videos. Improves page load performance.
 * Version:           1.0.0
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
	// Only proceed if we are on a single post, page, or custom post type.
	if ( ! is_singular() ) {
		return;
	}

	$post = get_post();
	// Post object should exist on singular pages, but check just in case.
	if ( ! $post ) {
		return;
	}

	// Define providers and allow them to be filtered.
	$providers = apply_filters( 'ame_providers', array(
		'bunny' => array(
			'pattern' => 'iframe.mediadelivery.net/play',
			'embed'   => array( '/play/', '/embed/' ),
		),
		'cloudflare' => array(
			'pattern' => 'cloudflarestream.com',
			'embed'   => array( '/watch', '/iframe?autoplay=true' ),
		),
		'youtube' => array(
			'pattern' => 'youtube.com/watch|youtu.be/',
			'embed'   => 'youtube',
		),
		'vimeo' => array(
			'pattern' => 'vimeo.com',
			'embed'   => 'vimeo',
		),
	) );

	// Build a list of patterns to search for in the content.
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

	// If no video link is found in the content, do not load assets.
	if ( ! $content_has_video_link ) {
		return;
	}

	// Enqueue styles.
	wp_enqueue_style(
		'armoury-media-embed',
		plugin_dir_url( __FILE__ ) . 'assets/css/am-embed.css',
		array(),
		'1.0.0'
	);

	// Enqueue script.
	wp_enqueue_script(
		'armoury-media-embed',
		plugin_dir_url( __FILE__ ) . 'assets/js/am-embed.js',
		array(),
		'1.0.0',
		true
	);

	// Pass provider config and translatable strings to JavaScript.
	wp_localize_script(
		'armoury-media-embed',
		'ameConfig',
		array(
			'providers' => $providers,
			'i18n'      => array(
				'playVideo'  => esc_attr__( 'Play video', 'armoury-media-embed' ),
				'videoPlayer' => esc_attr__( 'Video player', 'armoury-media-embed' ),
			),
		)
	);
} );
