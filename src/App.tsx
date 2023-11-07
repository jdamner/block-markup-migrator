import React from 'react';

import {
	Card,
	CardBody,
	CardFooter,
	__experimentalNavigatorToParentButton as NavigatorToParentButton, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	__experimentalNavigatorProvider as NavigatorProvider, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	__experimentalNavigatorScreen as NavigatorScreen, // eslint-disable-line @wordpress/no-unsafe-wp-apis
} from '@wordpress/components';

import { __ } from '@wordpress/i18n';

import SelectedPost from './components/SelectedPost';
import PostList from './components/PostList';
import PostTypeList from './components/PostTypeList';

/**
 * This is the main entry point for the Block Markup Migrator.
 *
 * It is called from src/index.ts which handles registering the plugin
 * and controlling if the UI should be rendered or not.
 */
const App = () => {
	const ScreenWithNavigationControls = ( {
		children,
	}: {
		children: React.ReactNode;
	} ) => {
		return (
			<Card>
				<CardBody>{ children }</CardBody>
				<CardFooter>
					<NavigatorToParentButton variant="secondary">
						{ __( 'Back' ) }
					</NavigatorToParentButton>
				</CardFooter>
			</Card>
		);
	};

	return (
		<NavigatorProvider initialPath="/">
			<NavigatorScreen path="/">
				<PostTypeList />
			</NavigatorScreen>

			<NavigatorScreen path="/:postType">
				<ScreenWithNavigationControls>
					<PostList />
				</ScreenWithNavigationControls>
			</NavigatorScreen>

			<NavigatorScreen path={ '/:postType/:id' }>
				<ScreenWithNavigationControls>
					<SelectedPost />
				</ScreenWithNavigationControls>
			</NavigatorScreen>
		</NavigatorProvider>
	);
};

export default App;
