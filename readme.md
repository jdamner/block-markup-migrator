# Block Markup Migrator

The Block Editor in WP fails to provide a way to migrate markup for  existing content when it needs to change. This is especially difficult for custom theme developers, who often resort to using server-side rendering as the default behaviour for all blocks to ensure they can update the markup for their blocks down the line. This behaviour is not ideal as it loses all the performance benefits of a static site. This package aims to provde two solutions. 

---

## Interactive
This plugin aims to provide a way for all existing blocks to be migrated  o new markup with minimal user interaction. It does this by providingan interface in the block-editor that loads each pages content and presents a diff-view of the new and old markup. Once accepted, the new markup is saved. 

### Usage
In the block editor, select the **Block Markup Migrator** from the three-dot menu in the top-right of the editor. This will open where you can select which pages or posts you wish to migrate and review and accept the changes.

### Limitations
At the moment, this plugin only supports migrating markup for `Pages` and `Posts`. Other post-types could be supported in future releases. 

### Adding support for your blocks
The migrator works through the WP standard for deprecating block markup and migrating it to a new markup. See [the guide](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-deprecation/) for more information on how to provide a migration function within your block.

Providing this migration will support all users of your block, not just those who happen to use this plugin. This plugin is only intended to provide a quick interface for migrating all posts quickly.

---

## Bulk Changes
There's also a `wp` CLI script that will enable markup changes to be performed on all post content. This should be used in conjunction with providing an interactive migration solution, unless you have absolte strict controls to run this script before any blocks are loaded in the editor and see the dreaded markup validation editor. 

### Usage
Running `wp blocks migrate` from your command line should migrate the blocks. If you don't have the `wp` command available, see [the guide](https://make.wordpress.org/cli/handbook/guides/installing/) on installing WP CLI. 

### Limitations
Since this is a PHP based migration, you'll not have access to lots of things you can have access to via JS - this _shouldn't_ cause an issue since your block markup is static HTML, but I'm interested in any limitations of this approach. 

### Adding support for your blocks
A migration should be registered to the `bmm_migrate_block` filter, which receives the parsed block array (see [WP Block Parser](https://github.com/WordPress/WordPress/blob/master/wp-includes/class-wp-block-parser.php)) along with an instantiated `WP_Block` object. 

Example:
```php
add_filter(
	'bmm_migrate_block',
	function ( array $parsed_block, WP_Block $block ): array {
		// Add your block migration logic here. Example:
		
		// Bail early if the block isn't our target block. 
		if ( 'example/block' !== $block->name ) {
			return $parsed_block;
		}

		// Check if the block needs the changes, bail early as necessary. 
		if ( isset( $parsed_block['attrs']['specialAttribute '] ) ) { 
			return $parsed_block; 
		}

		// We need to set the default value for the attribute, and update the inner HTML. 
		$parsed_block['attrs']['specialAttribute'] = 'example';

		// The WP_HTML_Tag_Processor allows for modifying HTML safely.
		$processor = new WP_HTML_Tag_Processor( $parsed_block['innerHTML'] );

		if ( $processor->next_tag() ) {
			$processor->add_class( 'has-special-attribute-example' );
		}

		$parsed_block['innerHTML'] = $processor->get_updated_html();

		return $parsed_block;
	},
	10,
	2
);
```

Remember, the priority of adding to the filter will affect how your migration runs so be sure to test thoroughly. This change will apply to _all_ blocks that meet your logic, so has signficant risk of causing damage if used  without adequeate testing. 

---

## Contributing
Contributions are welcome. Please open an issue or pull request if you have any suggestions or improvements. All that's needed is `docker` and `npm` installed. See the `scripts` section of `package.json` for how to get started.

Run `npm ci` to install dependencies, followed by `npm run env:start` to start a local WP environment. Lastly, run `npm run start` to start the compilation of assets.

## Todo

 - [ ] Add support for other post-types (we can extend the `SupportedPostType` type so that it validates any post-types we retrieve from the API have all the required fields we need, and we discard any others).
 - [ ] Add support for migrating all posts of a given post-type at once. This should be a simple UI implementation as the functionality is already there by calling `acceptChanges()` on each retrieved post.
 - [ ] Better support for notification of success/failure of any migration. Currently we use the standard WP notices API, but because we run the plugin in a full-screen modal the notification is obscured. This will need some thought.
 - [ ] Add tests. There's actually relatively little logic in this plugin, so it's not a big job. 
 - [ ] Remove unstable WP dependencies. Currently we use some `@wordpress/components` unstable components - they provide the navigation stack which is pretty fundamental, and writing our own would be time consuming. Assuming the unstable components become stable we'll be in a good place. We're not doing anything particularly crazy, it's mostly the routing navigation functions. 
 - [ ] Pagination. Currently we get _all_ posts, which is probably fine for most sites, but we should add pagination to the API call to avoid any issues with large sites.

## License
This plugin is provided as is, with no warranty or guarantee. 
