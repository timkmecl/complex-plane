import React, {useState} from 'react'

import styles from './Sidebar.module.css'

const TabView = ({ onInput, mode, component3 }) => {
	let [baseIdHeight, setBaseIdHeight] = useState(component3.baseIdZ)

	function change3dOptions(event) {
		let which = event.target.name;
		let selected = event.target.value;
		let option;

		switch (which) {
			case 'base': {
				option = selected === 'x' ? 'id' : 'f';
				break;
			}
			case 'baseIdZ': {
				option = Math.abs(selected);
				if (isNaN(option)) option = 0;
				break;
			}
			case 'hybrid': {
				option = selected === 'on';
				break;
			}
			case 'colorscale': {
				switch (selected) {
					case 'Green':
						option = 'Viridis';
						break;
					case 'Heat':
						option = 'RdBu';
						break;
					case 'Spectrum':
						option = 'Portland';
						break;
				}
			}
			default: {
				switch (selected) {
					case 'Re(x)':
						option = 're';
						break;
					case 'Im(x)':
						option = 'im';
						break;
					case 'abs(x)':
						option = 'abs';
						break;
					case 'arg(x)':
						option = 'arg';
						break;
					case 'none':
						option = 'none';
						break;
					default:
						if (selected.startsWith('auto')) {
							option = 'auto'
						}
				}
			}
		}

		onInput('component3', { option, which });
	}

	function set3dOptions(option) {
		let selected = '';
		switch (option) {
			case 're':
				selected = 'Re(x)';
				break;
			case 'im':
				selected = 'Im(x)';
				break;
			case 'abs':
				selected = 'abs(x)';
				break;
			case 'arg':
				selected = 'arg(x)';
				break;
			case 'none':
				selected = 'none';
				break;
			case 'auto':
				selected = setColorAuto();
				break;
		}
		return selected;
	}
	function setColormapOptions(option) {
		let selected = '';
		switch (option) {
			case 'Viridis':
				selected = 'Green';
				break;
			case 'RdBu':
				selected = 'Heat';
				break;
			case 'Portland':
				selected = 'Spectrum';
				break;
		}
		return selected;
	}

	function setColorAuto() {
		let label = '[';
		if (component3.zAxis === 're') {
			label += 'im';
		} else if (component3.zAxis === 'im') {
			label += 're';
		} else if (component3.zAxis === 'abs') {
			label += 'arg';
		} else if (component3.zAxis === 'arg') {
			label += 'abs';
		} else {
			label += 'none';
		}
		label += ']';
		return label;
	}

	function handleKeyDownHeight(e) {
		if (e.key === 'Enter') {
			e.target.blur();
		}
	}

	function handleBlurHeight(e) {
		change3dOptions({target:{name: 'baseIdZ', value: baseIdHeight}});
	}


	return (
		<div>

			<div className={styles.formGroup}>
				<label htmlFor="base">Base plane:</label>
				<select name="base" value={component3.base === 'id' ? 'x' : 'f(x)'} onChange={change3dOptions}>
					<option>x</option>
					<option>f(x)</option>
				</select>
			</div>


			<div className={styles.dimensionsSelector}>
				<span className={`${styles.dimensionsSelectorItem} ${mode == '2d' && styles.dimensionsSelectorItemSelected}`}
					onClick={() => onInput('2d3d', '2d')}>
					<i className="far fa-square"></i>
				</span>
				<span className={`${styles.dimensionsSelectorItem} ${mode == '3d' && styles.dimensionsSelectorItemSelected}`}
					onClick={() => onInput('2d3d', '3d')}>
					<i className="fas fa-cube"></i>
				</span>
			</div>

			{mode === '3d' &&
				<div className={styles.viewOptions}>
					<div className={styles.formGroup}>
						<label htmlFor="zAxis">3rd dimension:</label>
						<select name="zAxis" value={set3dOptions(component3.zAxis)} onChange={change3dOptions}>
							<option>Re(x)</option>
							<option>Im(x)</option>
							<option>abs(x)</option>
							<option>arg(x)</option>
							<option>none</option>
						</select>
					</div>

					{component3.base === 'id' &&
						<div className={styles.formGroup}>
							<label htmlFor="baseIdZ">Height:</label>
							<input name="baseIdZ" type="text" onChange={(e) => setBaseIdHeight(e.target.value)} onKeyDown={handleKeyDownHeight} onBlur={handleBlurHeight} value={baseIdHeight} />
						</div>
					}

					<div className={styles.formGroup}>
						<label htmlFor="hybrid">Double view:</label>
						<select name="hybrid" value={component3.hybrid ? 'on' : 'off'} onChange={change3dOptions}>
							<option>off</option>
							<option>on</option>
						</select>
					</div>

					<hr />

					<div className={styles.formGroup}>
						<label htmlFor="color">Color dimension:</label>
						<select name="color" value={set3dOptions(component3.color)} onChange={change3dOptions}>
							<option>auto {setColorAuto()}</option>
							<option>Re(x)</option>
							<option>Im(x)</option>
							<option>abs(x)</option>
							<option>arg(x)</option>
							<option>none</option>
						</select>
					</div>

					<div className={styles.formGroup}>
						<label htmlFor="colorscale">Colormap:</label>
						<select name="colorscale" value={setColormapOptions(component3.colorscale)} onChange={change3dOptions}>
							<option>Green</option>
							<option>Heat</option>
							<option>Spectrum</option>
						</select>
					</div>
				</div>
			}

		</div>
	)
}

export default TabView
