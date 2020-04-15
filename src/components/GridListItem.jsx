import React from 'react'


import styles from './Sidebar.module.css'

const GridListItem = ({grid, onInput }) => {
	return (
		<div key={grid[3]} className={styles.grid}>
			<div className={styles.gridTypeSelector}>
				<span className={`${styles.gridTypeSelectorItem} ${grid[0].gridType === 'cartesian' && styles.gridTypeSelectorItemSelected}`}
				>
					<i className="fas fa-th"></i>
				</span>
				<span className={`${styles.gridTypeSelectorItem} ${grid[0].gridType === 'polar' && styles.gridTypeSelectorItemSelected}`}
				>
					<i className="fas fa-bullseye"></i>
				</span>
				<span className={`${styles.gridTypeSelectorItem} ${grid[0].gridType === 'parametric' && styles.gridTypeSelectorItemSelected}`}
				>
					<i className={`fab fa-glide-g  ${styles.flippedIcon}`} ></i>
				</span>
			</div>

			<div className={`${styles.formGroup}`} >
				<label htmlFor="a" >x &rarr;</label>
				<input type="text" name={`function`} value={grid[0].funct} placeholder="< f(x) >"></input>
			</div>
			<div className={`${styles.formGroup}`} >
				<label htmlFor="a" >center: </label>
				<input type="text" name={`center`} value={grid[0].center} placeholder="< 0 + 0i >"></input>
			</div>
			<div className={`${styles.formGroup} ${styles.formGroupWide}`} >
				<label htmlFor="a" >size: </label>
				<input type="text" name={`size-w`} value={grid[0].width} placeholder="< w >"></input>
				<span>&#215;</span>
				<input type="text" name={`size-h`} value={grid[0].height} placeholder="< h >"></input>
			</div>
			<div className={`${styles.formGroup} ${styles.formGroupWide}`} >
				<label htmlFor="a" >lines: </label>
				<input type="text" name={`nLines-v`} value={grid[0].nLinesV} placeholder="< v >"></input>
				<span>&#215;</span>
				<input type="text" name={`nLines-h`} value={grid[0].nLinesH} placeholder="< h >"></input>
			</div>
		</div>
	)
}

export default GridListItem
