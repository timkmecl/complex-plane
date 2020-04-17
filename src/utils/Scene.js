import GridClass, { getZAxisLabel } from './GridClass';
import { m } from '../utils/math';


const dataObjInit2d = {
	name: "",
	line: {
		color: "rgba(35, 110, 160, 0.8)"
	},
	mode: 'lines',
	type: 'scatter'
}
const dataObjInit3d = {
	name: "",
	line: {
		color: "rgba(35, 110, 160, 0.8)"
	},
	mode: 'lines',
	type: 'scatter3d'
}


export default class Scene {
	gridParams = [];
	scope;

	grids = [];

	plt2d; plt3d;
	component3;

	revision = 0;

	a3dAxesInfo;
	mode;

	limitInfo;

	data2d = [];
	data3d = [];

	setPlot(plt2d, plt3d) {
		this.plt2d = plt2d;
		this.plt3d = plt3d;

		this.grids.forEach(g => g.setPlot(plt2d, plt3d));
	}

	refresh(params, scope, component3) {
		this.gridParams = params;
		this.scope = scope;
		this.component3 = { ...component3 };

		this.gridParams.grids.forEach(gP => {
			let params = [{ ...gP[0] }, { ...gP[1] }, gP[2], gP[3], gP[4]]; // Zaradi poznejšega spreminjanja parametrov potrebujemo `kopijo` objektov
			let id = gP[2];
			let rev = gP[3];
			let err = gP[4];
			err[0] = null;

			let f;

			if (params[1].color.a !== undefined) {
				params[1].color.h = '=';
				let { r, g, b, a } = params[1].color;
				params[1].color.v = `rgb(${r},${g},${b})`;
				params[1].color.opacity = a;
			}

			try {
				// poskusi pretvoriti vse matematične zapise parametrov v številke
				if (params[0].funct == '') {
					params[0].funct = 'x';
				}
				let fCompiled = m.compile(params[0].funct);
				f = x => fCompiled.evaluate({ x, ...scope })

				params[0].center = m.evaluate(params[0].center, scope);
				params[0].angle = m.evaluate(params[0].angle, scope);
				params[0].psPerLine = m.evaluate(params[0].psPerLine, scope);
				params[0].width = m.evaluate(params[0].width, scope);
				params[0].nLinesV = m.evaluate(params[0].nLinesV, scope);
				params[0].height = params[0].height !== "=" ? m.evaluate(params[0].height, scope) : "=";
				params[0].nLinesH = params[0].nLinesH !== "=" ? m.evaluate(params[0].nLinesH, scope) : "=";
				params[1].color.h = params[1].color.h == "=" ? params[1].color.v : params[1].color.h;

			} catch (e) {
				console.error("Error during grid parameter recalculation: ", e.message);
				err[0] = e.message;
				return;
			}


			let index = this.grids.findIndex(g => g.id === id);

			let grid;
			if (index === -1) { // Če mreža s tem indeksom še ne obstaja, naredi novo
				grid = new GridClass;
				grid.setPlot(this.plt2d, this.plt3d);
				this.grids.push(grid);
			} else {
				grid = this.grids[index];
			}

			grid.refresh(params, scope, component3, f);
		})

		this.revision++;
	}


	recalculate() { // Na novo preračuna vse točke vseh mrež
		this.grids.forEach(grid => {
			if (grid.error[0] != null) return;
			if (grid.params.active == false) return;
			grid.recalculate();
		})
		this.recaluclateLimitInfo();
	}

	recalculateSpecific(id) {
		let index = this.grids.findIndex(g => g.id === id);
		if (index !== -1) {
			let grid = this.grids[index];
			if (grid.error[0] != null) return;
			grid.recalculate();
		}
		this.recaluclateLimitInfo();
	}

	redraw(mode) {
		this.mode = mode;
		let start = true;

		this.get3dAxesInfo();

		this.grids.forEach(grid => { // na novo pretvori točke vseh mrež v data
			if (start) {
				if (mode === '3d') {
					this.data3d = [];
				} else {
					this.data2d = [];
				}
				start = false;
			}

			if (grid.error[0] != null) return;
			if (grid.params.active == false) return;
			let newData = grid.redraw(mode, this.limitInfo);

			if (mode === '3d') {
				this.data3d = this.data3d.concat(newData);
			} else {
				this.data2d = this.data2d.concat(newData);
			}
		})
	}

	recaluclateLimitInfo() { // ugotovi največji razpon glede na dimenzije (pomebno za usklajenost barv različnih mrež)
		this.limitInfo = { im: {}, re: {}, abs: {} };
		this.grids.forEach((grid, i) => {
			if (grid.error[0] != null) return;
			if (grid.params.active == false) return;
			let info = grid.info;
			console.log(i);
			if (i == 0) {
				this.limitInfo = { im: { ...info.im }, re: { ...info.re }, abs: { ...info.abs } };
			} else {
				const update = ax => {
					if (info[ax].min < this.limitInfo[ax].min) {
						this.limitInfo[ax].min = info[ax].min;
					}
					if (info[ax].max > this.limitInfo[ax].max) {
						this.limitInfo[ax].max = info[ax].max;
					}
				}
				update('re');
				update('im');
				update('abs');
			}
		})
	}


	get3dAxesInfo() {
		let rangeZ;
		let rangeX = [-5, 5];
		let rangeY = [-5, 5];
		let aspectratio = 0;
		let aspectmode = "cube";
		let zaxis_title = this.getZAxisLabel(this.component3);

		if (this.plt2d.layout != undefined) {
			let lengthX = Math.abs(this.plt2d.layout.xaxis.range[0] - this.plt2d.layout.xaxis.range[1])
			let lengthY = Math.abs(this.plt2d.layout.yaxis.range[0] - this.plt2d.layout.yaxis.range[1])

			if (lengthX > lengthY) {
				let center = (this.plt2d.layout.yaxis.range[0] + this.plt2d.layout.yaxis.range[1]) / 2
				rangeX = this.plt2d.layout.xaxis.range;
				rangeY = [center - lengthX / 2, center + lengthX / 2]
			} else {
				let center = (this.plt2d.layout.xaxis.range[0] + this.plt2d.layout.xaxis.range[1]) / 2
				rangeY = this.plt2d.layout.yaxis.range;
				rangeX = [center - lengthY / 2, center + lengthY / 2]
			}

			[rangeZ, aspectratio] = this.getZRange(Math.max(lengthX, lengthY));
			aspectmode = "manual";
		}

		this.a3dAxesInfo = { rangeX, rangeY, rangeZ, aspectratio, aspectmode, zaxis_title };
	}

	getZRange(lengthXY) {
		let info = this.limitInfo;
		let zMin = 0;
		let zMax = 0;
		if (this.component3.zAxis === 're') {
			zMin = info.re.min;
			zMax = info.re.max;
		} else if (this.component3.zAxis === 'im') {
			zMin = info.im.min;
			zMax = info.im.max;
		} else if (this.component3.zAxis === 'abs') {
			zMin = info.abs.min;
			zMax = info.abs.max;
		} else if (this.component3.zAxis === 'arg') {
			zMin = -3.141593;
			zMax = 3.141593;
		}

		if (this.component3.hybrid && (this.component3.zAxis === 're' || this.component3.zAxis === 'im')) {
			zMin = Math.min(info.re.min, info.im.min);
			zMax = Math.max(info.re.max, info.im.max);
		}

		if (zMin - zMax == 0) {
			zMax = 0.001;
		}

		let lengthZ = zMax - zMin;
		let rangeZ = [zMin, zMax];
		let aspect = { x: 1, y: 1, z: lengthZ / lengthXY };

		return [rangeZ, aspect];
	}
	getZAxisLabel(component3) {
		if (component3.zAxis === 'im') {
			return 'Im(x)';
		} else if (component3.zAxis === 're') {
			return 'Re(x)';
		} else if (component3.zAxis === 'abs') {
			return 'abs(x)';
		} else if (component3.zAxis === 'arg') {
			return 'arg(x)';
		}
	}


	delete(id) {
		this.grids = this.grids.filter(g => g.id != id);
	}
}