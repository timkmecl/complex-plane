import { calculateGrid, calculateGridPolar } from './grid';

import { m } from '../utils/math';
import { create, all } from 'mathjs';
const config_mjs = {};
const math = create(all, config_mjs);




export default class Grid {

	dataObjInit2d = {
		name: "",
		line: {
			color: "rgba(35, 110, 160, 0.8)"
		},
		mode: 'lines',
		type: 'scatter'
	}
	dataObjInit3d = {
		name: "",
		line: {
			color: "rgba(35, 110, 160, 0.8)"
		},
		mode: 'lines',
		type: 'scatter3d'
	}



	plt2d; plt3d;
	params = { center: 0, nh: 0, nv: 0, angle: 0, space: 0, psPerSpace: 0, color: true };
	component3;
	f;
	id;
	error;

	revision = 0;
	a3dAxesInfo;
	mode;

	lines;
	data2d = [];
	data3d = [];

	setPlot(plt2d, plt3d) {
		this.plt2d = plt2d;
		this.plt3d = plt3d;
	}

	refresh(params, scope, component3, f) {
		this.params = { ...params[0], ...params[1] };
		this.id = params[2];
		this.error = params[4];

		this.f = f;


		if (this.params.component3.zAxis === 'auto') {
			this.component3 = { ...component3 };
		} else {
			this.component3 = { ...this.params.component3 };
		}

		if (this.component3.color === 'auto') {
			if (this.component3.zAxis === 're') {
				this.component3.color = 'im';
			} else if (this.component3.zAxis === 'im') {
				this.component3.color = 're';
			} else if (this.component3.zAxis === 'abs') {
				this.component3.color = 'arg';
			} else if (this.component3.zAxis === 'arg') {
				this.component3.color = 'abs';
			}
		}

		this.revision++;
	}


	recalculate() {
		console.log(`${this.id} _ Recalculating`);
		let height = this.params.height === '=' ? this.params.width : this.params.height;
		let nLinesH = this.params.nLinesH === '=' ? this.params.nLinesV : this.params.nLinesH;
		if (this.params.gridType === 'cartesian') {
			this.lines = calculateGrid(this.params.center, this.params.width, height, this.params.angle, this.params.nLinesV, nLinesH, this.params.psPerLine, this.f);
		} else if (this.params.gridType === 'polar') {
			this.lines = calculateGridPolar(this.params.center, this.params.width, height, this.params.angle, this.params.nLinesV, nLinesH, this.params.psPerLine, this.f);
		}
		this.info = this.lines[2];
	}

	redraw(mode, globalInfo) {
		if (this.params.active) {
			console.log(`${this.id} _ Redrawing: ${mode}`);

			if (mode === '3d' && this.plt2d != undefined) {
				this.data3d = this.linesToData3d(globalInfo);
				this.mode = mode;
				return this.data3d;

			} else if (mode === '2d') {
				this.data2d = this.linesToData2d();
				this.mode = mode;
				return this.data2d;
			}
		}
		return [];
	}


	linesToData2d() {
		let newData = [];
		this.lines[0].forEach((line) => {
			this.addLineToData2d(newData, line, '--', this.params.color.h);
		})
		this.lines[1].forEach((line) => {
			this.addLineToData2d(newData, line, '|', this.params.color.v);
		})
		return newData;
	}

	addLineToData2d(data, line, name, color) {
		let [xx, yy] = line;
		let x = yy.map((e) => e.re);
		let y = yy.map((e) => e.im);
		let text = xx.map((e, i) => `f( ${math.format(e, 2)} )<br><i>${math.format(yy[i], 2)}</i>`);

		data.push({
			...this.dataObjInit2d, name, x, y, hovertemplate: text,
			opacity: this.params.color.opacity,
			line: {
				color: color,
				width: this.params.color.width
			},
		});
	}


	linesToData3d(globalInfo) {
		let newData = [];
		let info = this.lines[2];
		this.lines[0].forEach((line) => {
			this.addLineToData3d(newData, line, '--', info, this.params.color.h, globalInfo);
		})
		this.lines[1].forEach((line) => {
			this.addLineToData3d(newData, line, '|', info, this.params.color.v, globalInfo);
		})
		return newData;
	}


	addLineToData3d(data, line, name, info, color, globalInfo) {
		let [xx, yy] = line;
		let x = yy.map((e) => e.re);
		let y = yy.map((e) => e.im);
		let text = xx.map((e, i) => `f( ${math.format(e, 2)} )<br><i>${math.format(yy[i], 2)}</i>`);

		let z = 0;
		let c = 0;

		let isZDefined = true;
		if (this.component3.zAxis === 'im') {
			z = xx.map((e) => e.im);
		} else if (this.component3.zAxis === 're') {
			z = xx.map((e) => e.re);
		} else if (this.component3.zAxis === 'abs') {
			z = xx.map((e) => math.abs(e));
		} else if (this.component3.zAxis === 'arg') {
			z = xx.map((e) => math.arg(e));
		} else {
			z = xx.map((e) => 0);
			isZDefined = false;
		}

		let line1 = {};
		if (this.component3.color !== 'none' && isZDefined == true) {
			let cmin = 0;
			let cmax = 0;
			if (this.component3.color === 'im') {
				c = xx.map((e) => e.im);
				cmin = globalInfo.im.min;
				cmax = globalInfo.im.max;
			} else if (this.component3.color === 're') {
				c = xx.map((e) => e.re);
				cmin = globalInfo.re.min;
				cmax = globalInfo.re.max;
			} else if (this.component3.color === 'arg') {
				c = xx.map((e) => math.arg(e));
				cmin = -3.141593;
				cmax = 3.141593;
			} else if (this.component3.color === 'abs') {
				c = xx.map((e) => math.abs(e));
				cmin = globalInfo.abs.min;
				cmax = globalInfo.abs.max;
			}

			line1 = {
				width: this.params.color.width * 2,
				color: c,
				colorscale: 'Viridis',
				cmin, cmax
			}
		} else {
			line1 = {
				color: color,
				width: this.params.color.width * 2
			};
		}

		data.push({
			...this.dataObjInit3d, name, x, y, z, hovertemplate: text,
			opacity: this.params.color.opacity,
			line: line1
		});

		if (this.component3.hybrid) {
			let [xx, yy] = line;
			let x = yy.map((e) => e.re);
			let y = yy.map((e) => e.im);
			let text = xx.map((e, i) => `f( ${math.format(e, 2)} )<br><i>${math.format(yy[i], 2)}</i>`);

			let z = 0;
			let c = 0;

			let isZDefined = true;
			if (this.component3.zAxis === 'im') {
				z = xx.map((e) => e.re);
			} else if (this.component3.zAxis === 're') {
				z = xx.map((e) => e.im);
			} else if (this.component3.zAxis === 'arg') {
				z = xx.map((e) => -3.141593);
				isZDefined = false;
			} else {
				z = xx.map((e) => 0);
				isZDefined = false;
			}

			let line1 = {};
			if (this.component3.color !== 'none' && isZDefined == true) {
				let cmin = 0;
				let cmax = 0;
				if (this.component3.color === 'im') {
					c = xx.map((e) => e.re);
					cmin = globalInfo.re.min;
					cmax = globalInfo.re.max;
				} else if (this.component3.color === 're') {
					c = xx.map((e) => e.im);
					cmin = globalInfo.im.min;
					cmax = globalInfo.im.max;
				} else if (this.component3.color === 'arg') {
					c = xx.map((e) => math.arg(e));
					cmin = -3.141593;
					cmax = 3.141593;
				} else if (this.component3.color === 'abs') {
					c = xx.map((e) => math.abs(e));
					cmin = globalInfo.abs.min;
					cmax = globalInfo.abs.max;
				}

				line1 = {
					width: this.params.color.width * 2,
					color: c,
					colorscale: 'Viridis',
					cmin, cmax,
				}
			} else {
				line1 = {
					color: color,
					width: this.params.color.width * 2,
				};
			}

			data.push({
				...this.dataObjInit3d, name, x, y, z,
				hoverinfo: 'skip',
				opacity: this.params.color.opacity*0.2,
				line: line1
			});
		}
	}

}