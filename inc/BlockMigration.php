<?php
/**
 * Block Migration Manager
 * 
 * @package block-markup-migrator
 */

declare ( strict_types = 1 );

namespace Jdamner\BlockMarkupMigrator;

use WP_CLI;
use WP_Block;

/**
 * Block Migrations
 */
class BlockMigration { 

	/**
	 * Init Hooks
	 */
	public function init(): void {
		if ( class_exists( 'WP_CLI' ) ) {
			WP_CLI::add_command( 'blocks migrate', [ $this, 'handle_migration' ] );
		}
	}

	/**
	 * Handle Migration
	 */
	public function handle_migration(): void {
		$post_types = get_post_types( [ 'public' => true ], 'names' );
		foreach ( $post_types as $post_type ) {
			
			$maybe_errors = $this->migrate_post_type( $post_type );
		}

		if ( is_wp_error( $maybe_errors ) ) {
			foreach ( $maybe_errors->get_error_messages() as $error_message ) {
				WP_CLI::warning( $error_message );
			}
		} else {
			WP_CLI::success( 'Migration complete' );
		}
	}

	/**
	 * Migrate Post Type
	 *
	 * @param string $post_type The post type to migrate.
	 * 
	 * @return true|\WP_Error True on success, WP_Error on failure.
	 */
	public function migrate_post_type( string $post_type ): bool|\WP_Error {
		$posts = get_posts(
			[
				'post_type' => $post_type,
				'posts_per_page' => -1,
			] 
		);

		if ( empty( $posts ) ) {
			return true;
		}

		$progress = WP_CLI\Utils\make_progress_bar( sprintf( 'Migrating %s', $post_type ), count( $posts ) );

		$error_holder = new \WP_Error();

		foreach ( $posts as $post ) {
			$blocks = parse_blocks( $post->post_content );
			\WP_CLI::debug( sprintf( 'Migrating %s', $post->ID ) );
			$new_blocks = [];
			
			foreach ( $blocks as $parsed_block ) {
				$new_blocks[] = $this->migrate_block( $parsed_block, $post );
			}
			
			$new_content = serialize_blocks( $new_blocks );
			
			$success = null;
			
			if ( $new_content !== $post->post_content ) {
				
				$success = wp_update_post(
					[
						'ID' => $post->ID,
						'post_content' => $new_content,
					], 
					true
				);
				if ( is_wp_error( $success ) ) { 
					$error_holder->merge_from( $success );
				}
			}   
			$progress->tick();
		}
		$progress->finish();

		return $error_holder->has_errors() ? $error_holder : true;
	}

	/**
	 * Migrate Block
	 * 
	 * @param array    $parsed_block The parsed block.
	 * @param \WP_Post $post The block to migrate.
	 * 
	 * @return array The migrated block.
	 */
	public function migrate_block( array $parsed_block, \WP_Post $post ): array { 

		$parent_block = null;
		$source_block = $parsed_block;
		$context = [
			'postId' => $post->ID, 
			'postType' => $post->post_type,
		];

		/**
		 * Filters for the block data
		 * 
		 * @see `wp-includes/blocks.php::render_block()` for more information on the filters used below. 
		 */
		
		$pre_render = apply_filters( 'pre_render_block', null, $parsed_block, $parent_block );
		if ( ! is_null( $pre_render ) ) {
			return $parsed_block;
		}

		$parsed_block = apply_filters( 'render_block_data', $parsed_block, $source_block, $parent_block );
		$context = apply_filters( 'render_block_context', $context, $parsed_block, null );

		/**
		 * Apply the block migration filter - this is where the block migration logic will be implemented by
		 * any migration classes that need to. 
		 * 
		 * @param array    $parsed_block The parsed block.
		 * @param WP_Block $block The block to instance.
		 */
		return apply_filters( 'bmm_migrate_block', $parsed_block, new WP_Block( $parsed_block, $context ) );
	}
}
