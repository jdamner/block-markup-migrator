import React from 'react';
import {
	Spinner,
	__experimentalNavigatorButton as NavigatorButton, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	Flex,
} from '@wordpress/components';
import { chevronRight } from '@wordpress/icons';
import { usePostTypes } from '../data/post';

const PostTypeList = () => {
	const postTypes = usePostTypes();

	if ( ! postTypes ) {
		return <Spinner />;
	}

	return (
		<Flex direction={ 'column' }>
			{ postTypes.map( ( postTypeOption ) => (
				<NavigatorButton
					variant="tertiary"
					icon={ chevronRight }
					iconPosition="left"
					key={ postTypeOption.slug }
					path={ '/' + postTypeOption.slug }
				>
					{ postTypeOption.labels.name }
				</NavigatorButton>
			) ) }
		</Flex>
	);
};

export default PostTypeList;
