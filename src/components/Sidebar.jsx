import React, {useState} from 'react'

import TabView from './TabView'
import TabFunction from './TabFunction'
import TabGrid from './TabGrid'
import TabParams from './TabParams'

import styles from './Sidebar.module.css'

const Sidebar = ({onInput, config}) => {
	const [selectedTab, setSelectedTab] = useState(1);
	
	return (
		<div className={styles.sidebar}>
			<div className={styles.menu}>
				<div className={styles.menuContainer}>
					<div onClick={() => setSelectedTab(0)} 
					className={`${styles.menuItem} ${selectedTab===0 && styles.menuItemSelected}`}>
						<i className="fas fa-eye"></i>
					</div>
					<div onClick={() => setSelectedTab(1)} 
					className={`${styles.menuItem} ${selectedTab===1 && styles.menuItemSelected}`}>
						<i className="fas fa-square-root-alt"></i>
					</div>
					<div onClick={() => setSelectedTab(2)} 
					className={`${styles.menuItem} ${selectedTab===2 && styles.menuItemSelected}`}>
						<i className="fas fa-border-all"></i>
					</div>
					<div onClick={() => setSelectedTab(3)} 
					className={`${styles.menuItem} ${selectedTab===3 && styles.menuItemSelected}`}>
						<i className="fas fa-sliders-h"></i>
					</div>
				</div>
			</div>
			<div className={styles.content}>
				{selectedTab===0 && <TabView onInput={onInput} mode={config.mode} component3={config.component3} />}
				{selectedTab===1 && <TabFunction fList={config.fList} scope={config.scope} onInput={onInput}/>}
				{selectedTab===2 && <TabGrid onInput={onInput} gridParams={config.gridParams} />}
				{selectedTab===3 && <TabParams />}
			</div>
		</div>
	)
}

export default Sidebar
