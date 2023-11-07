import React from 'react';
import { Fragment, useState } from '@wordpress/element';
import App from './App';

import { replace as icon } from '@wordpress/icons';

import { registerPlugin } from '@wordpress/plugins';
import { PluginMoreMenuItem } from '@wordpress/edit-post';
import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const Plugin = () => {
	const [ isPanelOpened, setIsPanelOpened ] = useState( false );

	return (
		<Fragment>
			<PluginMoreMenuItem icon={ icon } onClick={ () => setIsPanelOpened(true) }>
				{ __( 'Block Markup Migrator' ) }
			</PluginMoreMenuItem>

			{ isPanelOpened && (
				<Modal
					title={ __( 'Block Markup Migrator' ) }
					isFullScreen={ true }
					onRequestClose={ () => setIsPanelOpened( false ) }
				>
					<App />
				</Modal>
			) }
		</Fragment>
	);
};

registerPlugin( 'block-migrator', {
	render: Plugin,
} );
