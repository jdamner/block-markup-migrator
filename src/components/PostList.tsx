import React from 'react';

import {
	Spinner,
	__experimentalText as Text, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	__experimentalUseNavigator as useNavigator, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	__experimentalNavigatorButton as NavigatorButton, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	Flex,
} from '@wordpress/components';

import { __ } from '@wordpress/i18n';

import { useSelectPosts } from '../data/post';

const PostList = () => {
	const { params } = useNavigator();
	const { postType } = params;

	const posts = useSelectPosts( postType.toString() );

	if ( ! posts ) {
		return <Spinner />;
	}

	return (
		<Flex direction={ 'column' }>
			{ posts.map( ( post ) => (
				<Flex direction={ 'row' } key={ post.id }>
					<Text>{ post.title.rendered }</Text>

					<NavigatorButton
						// disabled={ ! post.hasDiff }
						variant="secondary"
						key={ post.id }
						path={ '/' + postType + '/' + post.id }
					>
						{ post.hasDiff
							? __( 'Review Changes' )
							: __( 'No Changes' ) }
					</NavigatorButton>
				</Flex>
			) ) }
		</Flex>
	);
};

export default PostList;
