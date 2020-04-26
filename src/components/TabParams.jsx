import React from 'react'

import SliderListItem from './SliderListItem';
import styles from './Sidebar.module.css'

const TabParams = ({ onInput, sliders }) => {

	function handleNew(e) {
		onInput('sliderNew');
	}

	return (
		<div className={styles.gridList}>
				<div onClick={handleNew} className={`${styles.newButton}`}>
					<i className={`fas fa-plus`} ></i>
				</div>
			{
				sliders.list.map(slider => (
					<SliderListItem key={slider.id} onInput={onInput} slider={slider} />
				))
			}
		</div>
	)
}

export default TabParams
