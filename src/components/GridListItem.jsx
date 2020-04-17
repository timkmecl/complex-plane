import React, { useState } from 'react'
import { ChromePicker } from 'react-color';


import styles from './Sidebar.module.css'
import cpStyles from './ColorPicker.module.css'





const GridListItem = ({ grid, onInput }) => {
	let [changeCount, setChangeCount] = useState(0);
	let [showPicker, setShowPicker] = useState(false);
	let [color, setColor] = useState({
		r: grid[1].color.r,
		g: grid[1].color.g,
		b: grid[1].color.b,
		a: grid[1].color.a,
	});

	const id = grid[2]

	function handleChange(event) {
		let name = event.target.name;
		let value = event.target.value;

		setChangeCount(changeCount + 1);

		// posodobi parametre, a ne preračuna na novo
		onInput('gridParamChanged', { name, value, id });
	}

	function handleTypeChange(type) {
		onInput('gridParamChanged', { name: 'gridType', value: type, id });
		onInput('gridParamChangedCommit', { id });
	}

	function handleKeyDown(e) {
		if (e.key === 'Enter') {
			e.target.blur();
		}
	}

	function handleBlur(e) {
		// zahteva novo preračunanje, če je prišlo do sprememb parametrov
		if (changeCount > 0) {
			setChangeCount(0);
			onInput('gridParamChangedCommit', { id });
		}
	}

	function toggleVisibility() {
		if (grid[4][0] == null) {
			onInput('gridToggleVisible', { id });
		}
	}


	function toggleColorpicker() {
		setShowPicker(!showPicker);
	};
	function closeColorpicker() {
		setShowPicker(false);
		onInput('gridChangeColor', { id, color });
	};
	function changeColor(clr) {
		setColor(clr.rgb);
	}



	return (
		<div key={grid[2]} className={`${styles.grid} ${grid[4][0] != null && styles.gridError}`}>
			<div className={`${styles.gridTopMenu}`}>
				<div onClick={toggleVisibility} className={`${styles.gridTopMenuItem} ${styles.gridTopMenuVisibility}`}>
					<i className={grid[4][0] == null ? (grid[0].active ? `fas fa-eye` : `fas fa-eye-slash`) : `fas fa-low-vision`} ></i>
				</div>
				<div className={`${styles.gridTopMenuRight}`}>
					<div onClick={toggleColorpicker} className={`${styles.gridTopMenuItem}`}>
						<i className={`fas fa-palette`} ></i>
					</div>
					<div onClick={() => onInput('gridCopy', { id })} className={`${styles.gridTopMenuItem}`}>
						<i className={`fas fa-copy`} ></i>
					</div>
					<div onClick={() => onInput('gridDelete', { id })} className={`${styles.gridTopMenuItem}`}>
						<i className={`fas fa-trash`} ></i>
					</div>
					{showPicker ? <div className={cpStyles.popover}>
						<div className={cpStyles.cover} onClick={closeColorpicker} />
						<ChromePicker color={color} onChange={changeColor} />
					</div> : null}
				</div>
			</div>

			<div className={`${styles.formGroup}`} >
				<label htmlFor="a" >x &rarr;</label>
				<input type="text" name={`funct`} value={grid[0].funct} onChange={handleChange} onKeyDown={handleKeyDown} onBlur={handleBlur} placeholder="< f(x) >"></input>
			</div>

			<div className={styles.gridTypeSelector}>
				<span onClick={() => handleTypeChange('cartesian')} className={`${styles.gridTypeSelectorItem} ${grid[0].gridType === 'cartesian' && styles.gridTypeSelectorItemSelected}`}
				>
					<i className="fas fa-th"></i>
				</span>
				<span onClick={() => handleTypeChange('polar')} className={`${styles.gridTypeSelectorItem} ${grid[0].gridType === 'polar' && styles.gridTypeSelectorItemSelected}`}
				>
					<i className="fas fa-bullseye"></i>
				</span>
				<span onClick={() => handleTypeChange('parametric')} className={`${styles.gridTypeSelectorItem} ${grid[0].gridType === 'parametric' && styles.gridTypeSelectorItemSelected}`}
				>
					<i className={`fab fa-glide-g  ${styles.flippedIcon}`} ></i>
				</span>
			</div>


			<div className={`${styles.formGroup}`} >
				<label htmlFor="a" >center: </label>
				<input type="text" name={`center`} value={grid[0].center} onChange={handleChange} onKeyDown={handleKeyDown} onBlur={handleBlur} placeholder="< 0 + 0i >"></input>
			</div>
			<div className={`${styles.formGroup} ${styles.formGroupWide}`} >
				<label htmlFor="a" >size: </label>
				<input type="text" name={`width`} value={grid[0].width} onChange={handleChange} onKeyDown={handleKeyDown} onBlur={handleBlur} placeholder="< w >"></input>
				<span>&#215;</span>
				<input type="text" name={`height`} value={grid[0].height} onChange={handleChange} onKeyDown={handleKeyDown} onBlur={handleBlur} placeholder="< h >"></input>
			</div>
			<div className={`${styles.formGroup} ${styles.formGroupWide}`} >
				<label htmlFor="a" >lines: </label>
				<input type="text" name={`nLinesV`} value={grid[0].nLinesV} onChange={handleChange} onKeyDown={handleKeyDown} onBlur={handleBlur} placeholder="< #v >"></input>
				<span>&#215;</span>
				<input type="text" name={`nLinesH`} value={grid[0].nLinesH} onChange={handleChange} onKeyDown={handleKeyDown} onBlur={handleBlur} placeholder="< #h >"></input>
			</div>
		</div>
	)
}

export default GridListItem
