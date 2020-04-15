import React, { useState, useEffect } from 'react'


import { m } from '../utils/math';

import styles from './Sidebar.module.css'

const TabFunction = ({ onInput, fList, scope }) => {

	let [list, changeList] = useState({ list: fList.list, idNew: fList.idNew, textNew: "" });


	function handleChange(event) {
		let which = event.target.name;
		let text = event.target.value;

		if (which == 'newFunc') {
			changeList({ ...list, textNew: text });
		} else {
			let newList = [...list.list];
			let i = newList.findIndex(f => f.id == which);
			newList[i].text = text;
			newList[i].error = false;
			changeList({ ...list, list: newList });
		}
	}


	function handleKeyDown(e) {
		if (e.key === 'Enter') {
			handleFuncChange(e.target.name, e.target.value, true, e.target)
		}
	}

	function handleBlur(e) {
		handleFuncChange(e.target.name, e.target.value, false);
	}


	function handleFuncChange(id, text, change, target) {

		if (id === 'newFunc') id = -1;

		if (text === '') {
			changeList({
				...list, list: list.list.filter(f => f.id != id)
			})
			return;
		}

		let newList = [...list.list];
		let i = newList.findIndex(f => f.id == id);


		try {
			m.evaluate(text, { ...scope });

		} catch (err) {
			console.error(err.message);

			if (!change && id != -1) {
				newList[i].error = true;
				changeList({ ...list, list: newList });
			}
			return 'error';
		}

		if (change) {
			let func = m.evaluate(text, scope);
			let name;

			if (func != undefined && func.name != undefined) {
				newList = newList.map(f => {
					f.inactive = (f.name == func.name) ? true : f.inactive;
					return f;
				})
				name = func.name;
			}

			if (id != -1) {
				newList[i].name = name;
				newList[i].inactive = false;

				changeList({ ...list, list: newList });
			} else {
				newList = [{ id: list.idNew, text, name: name, inactive: false }, ...newList];
				changeList({
					list: newList, idNew: list.idNew + 1, textNew: ""
				});
			}
			onInput('functionChanged', { name, list: { ...list, list: newList } });
		}

		if (target) {
			target.blur();
		}
	}



	return (
		<div>
			<div className={styles.functionList}>
				<div className={`${styles.functionListItem} ${styles.functionListItemNew}`} >
					<input placeholder="f(x) = new function" type="text" name="newFunc" onChange={handleChange} onKeyDown={handleKeyDown} onBlur={handleBlur}
						value={list.textNew} ></input>
				</div>
				{
					list.list.map(func => (
						<div key={func.id} className={`${styles.functionListItem} ${func.error && styles.functionListItemError} ${func.inactive && styles.functionListItemInactive}`} >
							<input type="text" name={func.id} onChange={handleChange} onKeyDown={handleKeyDown} onBlur={handleBlur}
								value={func.text} ></input>
						</div>
					))
				}
			</div>
		</div>
	)
}

export default TabFunction
