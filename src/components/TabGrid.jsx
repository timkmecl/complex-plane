import React from 'react'

import GridListItem from './GridListItem';
import styles from './Sidebar.module.css'

const TabGrid = ({ onInput, gridParams }) => {

	function handleNew(e) {
		onInput('gridNew');
	}

	return (
		<div className={styles.gridList}>
				<div onClick={handleNew} className={`${styles.newButton}`}>
					<i className={`fas fa-plus`} ></i>
				</div>
			{
				gridParams.grids.map(grid => (
					<GridListItem key={grid[2]} onInput={onInput} grid={grid} />
				))
			}
		</div>
	)
}

export default TabGrid
