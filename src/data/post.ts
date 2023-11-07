import type { Page, Post } from '@wordpress/core-data';

import { useSelect, dispatch } from '@wordpress/data';
import { store as CoreStore } from '@wordpress/core-data';
import { store as NoticesStore } from '@wordpress/notices';

import { __ } from '@wordpress/i18n';

import { parse, serialize } from '@wordpress/blocks';

/**
 * Supported post-type slugs.
 */
const supportedPostTypes = [ 'page', 'post' ];

/**
 * Supported post-types as a union type.
 */
export type SupportedPostType = {
	hasDiff?: boolean;
	acceptChanges?: () => void;
} & ( Post | Page );

/**
 * Gets all posts of a given post-type.
 *
 * @param {string}                postType The post-type to work with
 * @param {Record< string, any >} query    Any query parameters to pass to the API
 *
 * @return {SupportedPostType[] | null | undefined} An array of supported post-types
 */
export const useSelectPosts = (
	postType: string,
	query: Record< string, any > = {
		per_page: -1,
	}
): SupportedPostType[] | null | undefined => {
	return useSelect(
		( select ) => {
			const { getEntityRecords } = select( CoreStore );
			return getEntityRecords(
				'postType',
				postType,
				query
			) as SupportedPostType[];
		},
		[ postType, query ]
	)
		?.map( ( post ) => {
			return {
				...post,
				hasDiff:
					post.content.raw !== serialize( parse( post.content.raw ) ),
				acceptChanges: () => {
					dispatch( CoreStore )
						.saveEntityRecord( 'postType', postType, {
							...post,
							content: {
								raw: serialize( parse( post.content.raw ) ),
							},
						} )
						.then( () => {
							dispatch( NoticesStore ).createSuccessNotice(
								__( 'Changes accepted' )
							);
						} );
				},
			};
		} )
		.sort( ( a, b ) => {
			if ( a.hasDiff === b.hasDiff ) return 0;
			if ( a.hasDiff ) return -1;
			return 1;
		} );
};

/**
 * Gets a single post of a given post-type by ID.
 *
 * @param {string} id       The post ID
 * @param {string} postType The post-type to work with
 * @return {SupportedPostType | null | undefined} A supported post-type
 */
export const usePostData = (
	id: string,
	postType: string
): SupportedPostType | null | undefined => {
	return useSelectPosts( postType )?.find(
		( post ) => post.id.toString() === id
	);
};

/**
 * Gets all supported post-types.
 *
 * @return {SupportedPostType[] | null | undefined} An array of supported post-types
 */
export const usePostTypes = (): SupportedPostType[] | undefined | null => {
	return useSelect( ( select ) => {
		const { getEntityRecords } = select( CoreStore );
		return getEntityRecords( 'root', 'postType' );
	}, [] )?.filter( isSupportedPostType );
};

/**
 * Checks if an object is a supported post-type. (type-guard)
 *
 * @param {unknown} object Any object to check if it is a supported post-type
 * @return {boolean} Whether the object is a supported post-type or not
 */
const isSupportedPostType = (
	object: unknown
): object is SupportedPostType => {
	return (
		typeof object === 'object' &&
		object !== null &&
		'slug' in object &&
		typeof object.slug === 'string' &&
		supportedPostTypes.includes( object.slug )
	);
};
