import React, { useEffect } from 'react';
import {
	Button,
	Flex,
	TabPanel,
	Spinner,
	SandBox,
	__experimentalNavigatorToParentButton as NavigatorToParentButton, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	__experimentalUseNavigator as useNavigator, // eslint-disable-line @wordpress/no-unsafe-wp-apis
} from '@wordpress/components';

import { parse, serialize } from '@wordpress/blocks';

import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { usePostData } from '../data/post';
import { __ } from '@wordpress/i18n';

const SelectedPost = () => {
	const { params, goToParent } = useNavigator();
	const { postType, id } = params;

	// Get the post from the store
	const post = usePostData( id.toString(), postType.toString() );

	useEffect( () => {
		// After the changes are accepted, go back to the parent screen
		if ( post && ! post.hasDiff ) {
			goToParent();
		}
	} );

	if ( ! post ) {
		return <Spinner />;
	}

	const migratedContent = serialize( parse( post.content.raw ) );

	return (
		<>
			<TabPanel
				tabs={ [
					{
						name: 'html',
						title: __( 'HTML' ),
					},
					{
						name: 'preview',
						title: __( 'Preview' ),
					},
				] }
			>
				{ ( tab ) => (
					<>
						{ tab.name === 'html' && (
							<ReactDiffViewer
								oldValue={ post.content.raw }
								newValue={ migratedContent }
								splitView={ true }
								leftTitle={ __( "Original Content" ) }
								rightTitle={ __( "New Content" ) }
								disableWordDiff={ false }
								compareMethod={ DiffMethod.WORDS_WITH_SPACE }
							/>
						) }
						{ tab.name === 'preview' && (
							<Flex style={ { marginTop: '2rem' } }>
								<SandBox html={ post.content.raw } />
								<SandBox html={ migratedContent } />
							</Flex>
						) }
					</>
				) }
			</TabPanel>
			<Flex style={ { marginTop: '2rem' } } justify="end">
				<NavigatorToParentButton variant="secondary" isDestructive>
					{ __( 'Reject' ) }
				</NavigatorToParentButton>
				<Button variant="primary" onClick={ post.acceptChanges }>
					{ __( 'Accept' ) }
				</Button>
			</Flex>
		</>
	);
};

export default SelectedPost;
