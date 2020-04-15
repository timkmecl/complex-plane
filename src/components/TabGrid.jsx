import React from 'react'

import GridListItem from './GridListItem';

import styles from './Sidebar.module.css'

const TabGrid = ({ onInput, gridParams }) => {

	return (
		<div className={styles.gridList}>
			{
				gridParams.grids.map(grid => (
					<GridListItem onInput={onInput} grid={grid} />
				))
			}
		</div>
	)
}

export default TabGrid
