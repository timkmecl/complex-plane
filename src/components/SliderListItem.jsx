import React, { useState } from 'react'

import { m } from '../utils/math';
import styles from './Sidebar.module.css'


const SliderListItem = ({ onInput, slider, scope }) => {
	let [changeCount, setChangeCount] = useState(0);
	let [error, setError] = useState(!checkValidName(slider.name));
	const id = slider.id;

	function handleKeyDown(e) {
		if (e.key === 'Enter') {
			e.target.blur();
		}
	}

	function handleBlur(e) {
		// zahteva novo preračunanje, če je prišlo do sprememb parametrov
		if (changeCount > 0) {
			setChangeCount(0);
			if (e.target.name === 'name') {
				if (checkValidName(e.target.value)){
					setError(false);
					onInput('sliderChangeCommit', { id, sliderName:slider.name, sliderValue:slider.value });
				}else {
					setError(true);
				}
			} else {
				onInput('sliderChangeCommit', { id,  sliderName:slider.name, sliderValue:slider.value });
			}
		}
	}

	function handleChange(e) {
		let name = e.target.name;
		let value = e.target.value;
		if (name === 'name' || name === 'value')
			setChangeCount(changeCount + 1);

		// posodobi parametre, a ne preračuna na novo
		onInput('sliderChanged', { name, value, id });
	}

	function handleSliderChange(e) {
		let value = e.target.value;
		if (!error) {
			onInput('sliderChanged', { name:'value', value, id });
			onInput('sliderChangeCommit', { id, sliderName:slider.name, sliderValue:Number(value) });
		}
	}

	function getParam(p) {

		let value;
		try {
			value = m.evaluate(slider[p], {...scope});
		} catch (err) {
			console.error(p, err.name);
		}
		return value;
	}

	return (
		<div className={`${styles.listItem} ${error && styles.listItemError}`}>
			<div className={`${styles.formGroup} ${styles.sliderHead}`} >
				<input type="text" name={`name`} value={slider.name} onChange={handleChange} onKeyDown={handleKeyDown} onBlur={handleBlur} placeholder="< a >"></input>
				<label htmlFor="value" >=</label>
				<input type="text" name={`value`} value={slider.value} onChange={handleChange} onKeyDown={handleKeyDown} onBlur={handleBlur} placeholder="< 0 >"></input>
			</div>
			
			<div className={styles.sliderContainer}>
			<input type="text" name={`left`} value={slider.left} onChange={handleChange} onKeyDown={handleKeyDown} onBlur={handleBlur} placeholder='< from >'></input>
				<input onChange={handleSliderChange} name='value' type="range" min={getParam('left')} max={getParam('right')} value={getParam('value')} step={getParam('stepSize')} className={styles.slider}></input>
				<input type="text" name={`right`} value={slider.right} onChange={handleChange} onKeyDown={handleKeyDown} onBlur={handleBlur} placeholder=' < to >'></input>
			</div>

			<div className={`${styles.formGroup}`} >
				<label htmlFor="stepSize" >step size: </label>
				<input type="text" name={`stepSize`} value={slider.stepSize} onChange={handleChange} onKeyDown={handleKeyDown} onBlur={handleBlur} placeholder="< 0.1 >"></input>
			</div>
		</div>
	)
}

export default SliderListItem


function checkValidName(name) {
	const regex =/^[^a-zA-Z_$]|[^0-9a-zA-Z_$]/g;
	return !regex.test(name)  && name.length > 0;
}
