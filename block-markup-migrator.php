<?php
/**
 * Plugin Name: Block Markup Migrator
 * Plugin URI:
 * Description: Migrates the markup of blocks to the new format.
 * Version: 0.0.1
 * Author: James Amner <jdamner@me.com>
 * Author URI: https://amner.me
 * 
 * @package block-markup-migrator
 */

declare ( strict_types = 1 );

namespace Jdamner\BlockMarkupMigrator;

// Exit if accessed directly, or if we're not in WP. 
if ( ! defined( 'ABSPATH' ) || ! function_exists( 'add_action' ) ) {
	exit;
}

add_action( 
	'admin_enqueue_scripts', 
	function () { 
		$asset = require plugin_dir_path( __FILE__ ) . 'build/index.asset.php';

		// Enqueue CSS dependencies.
		foreach ( $asset['dependencies'] ?? [] as $dep ) {
			wp_enqueue_style( $dep );
		}

		wp_enqueue_script(
			'block-markup-migrator',
			plugins_url( 'build/index.js', __FILE__ ),
			$asset['dependencies'] ?? [],
			$asset['version'] ?? '1.0.0',
			true
		);
	}
);

add_action(
	'plugins_loaded', 
	function () { 
		require_once __DIR__ . './inc/BlockMigration.php';
		( new BlockMarkupMigrator() )->init();
	}
);
