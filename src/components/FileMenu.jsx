import React from 'react'

import styles from './Sidebar.module.css'

const FileMenu = ({handleSave, handleLoad}) => {
	function save() {
		const s = {a: 1, b: {c:2, d: "9"}};

		const [content, name] = handleSave();
		const url ="data:text/json;charset=utf-8," + encodeURIComponent(content);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${name}.cmplx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
	}

	function open(e) {
		const file = e.target.files[0];
		if (file == undefined) return;

		const reader = new FileReader();
		reader.onload = f => {
			try {
			const j = JSON.parse(f.target.result);
			if (j.createdBy !== 'complex-plane') {
				console.error('Wrong file type');
				return;
			} else {
				handleLoad(j);
			}
		} catch (err) {
			console.error('Error during file parsing: ', err.message);
		}
		};

		reader.readAsText(file, 'UTF-8');
	}

	return (
		<div className={styles.fileMenu}>
			<div className={styles.fileMenuRow}>
				<div onClick={save} className={`${styles.newButton}`}>
					<i className={`fas fa-save`} ></i>
				</div>
				<div className={`${styles.newButton}`}>
					<label htmlFor="upload">
						<i className={`fas fa-folder-open`} ></i>
					</label>
					<input type="file" accept=".cmplx" name="upload" id="upload" className={styles.upload} onChange={open} />
				</div>
			</div>
		</div>
	)
}

export default FileMenu
