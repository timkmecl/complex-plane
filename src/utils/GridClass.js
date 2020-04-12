import { calculateGrid } from '../utils/grid';

import { create, all, complex, add, subtract, multiply, exp } from 'mathjs';
const config_mjs = {};
const math = create(all, config_mjs);


const dataObjInit2d = {
	name: "",
	line: {
		color: "rgba(35, 110, 160, 0.8)"
	},
	mode: 'lines',
	type: 'scattergl'
}
const dataObjInit3d = {
	name: "",
	line: {
		color: "rgba(35, 110, 160, 0.8)"
	},
	mode: 'lines',
	type: 'scatter3d'
}

export default class Grid {

	plt2d; plt3d;
	params = {center: 0, nh:0, nv:0, angle:0, space:0, psPerSpace:0, color:true};
	component3;
	f;
	type;

	revision = 0;
	a3dAxesInfo;
	mode;

	lines;
	data2d = [];
	data3d = [];


	constructor(type) {
		this.type = type;
	}

	setPlot(plt2d, plt3d) {
		this.plt2d = plt2d;
		this.plt3d = plt3d;
	}

	refresh(params, f, component3) {
		this.params = params;
		this.f = f;
		this.component3 = component3;

		this.revision++;
	}


	recalculate() {
		console.log("Recalculating");
		if (this.type === 'cartesian') {
			this.lines = calculateGrid(this.params.center, this.params.nh, this.params.nv, this.params.angle, this.params.space, this.params.psPerSpace, this.f);
		} else if (this.type === 'polar') {

		}
	}

	redraw(mode) {
		console.log(`Redrawing: ${mode}`);
		//console.log(plt2d, plt3d);

		if (mode ==='3d' && this.plt2d != undefined) {
			this.data3d = this.linesToData3d();
			this.get3dAxesInfo();
			this.mode = mode;
			return this.data;

		} else if (mode === '2d') {
			this.data2d = this.linesToData2d();
			this.mode = mode;
			return this.data2d;
		}
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
			...dataObjInit2d, name, x, y, hovertemplate: text,
			line: {
				color: color,
				width: 2
			},
		});
	}


	linesToData3d() {
		let newData = [];
		let info = this.lines[2];
		this.lines[0].forEach((line) => {
			this.addLineToData3d(newData, line, '--', info, this.params.color.h);
		})
		this.lines[1].forEach((line) => {
			this.addLineToData3d(newData, line, '|', info, this.params.color.v);
		})
		return newData;
	}

	
	addLineToData3d(data, line, name, info, color) {
		let [xx, yy] = line;
		let x = yy.map((e) => e.re);
		let y = yy.map((e) => e.im);
		let text = xx.map((e, i) => `f( ${math.format(e, 2)} )<br><i>${math.format(yy[i], 2)}</i>`);
	
		let z = 0;
		let c = 0;
		
		if (this.component3.zAxis === 'im') {
			z = xx.map((e) => e.im);
		} else if (this.component3.zAxis === 're'){
			z = xx.map((e) => e.re);
		} else if (this.component3.zAxis === 'abs'){
			z = xx.map((e) => math.abs(e));
		}
	
		let line1 = {};
		if (this.component3.color !== false){
			let cmin = 0;
			let cmax = 0;
			if (this.component3.color === 'im') {
				c = xx.map((e) => e.im);
				cmin = info.im.min;
				cmax = info.im.max;
			} else if (this.component3.color === 're'){
				c = xx.map((e) => e.re);
				cmin = info.re.min;
				cmax = info.re.max;
			} else if (this.component3.color === 'arg'){
				c = xx.map((e) => math.arg(e));
				cmin = -3.141593;
				cmax = 3.141593;
			} 
	
			line1 = {
				width: 4,
				color: c,
				colorscale: 'Viridis',
				cmin, cmax};
		} else {
			line1= {
				color: color,
				width: 4
			};
		}
	
		data.push({
			...dataObjInit3d, name, x, y, z, hovertemplate: text,
			line: line1
		});
	}



	get3dAxesInfo() {
		let rangeZ;
		let rangeX = [-5, 5];
		let rangeY = [-5, 5];
		let aspectratio = 0;
		let aspectmode = "cube";
		let zaxis_title = getZAxisLabel(this.component3);
		
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
				
			[rangeZ, aspectratio] = this.getZRange(lengthX);
			aspectmode = "manual";
		}

		this.a3dAxesInfo =  {rangeX, rangeY, rangeZ, aspectratio, aspectmode, zaxis_title};
		console.log("ZrangeInfo")
	}

	getZRange(lengthXY) {
		let info = this.lines[2];
		let zMin = 0;
		let zMax = 0;
		if (this.component3.zAxis === 're') {
			zMin = info.re.min;
			zMax = info.re.max;
		} else if (this.component3.zAxis === 'im') {
			zMin = info.im.min;
			zMax = info.im.max;
		} else if (this.component3.zAxis === 'abs') {
			zMin = 0;
			zMax = Math.sqrt(info.re.max*info.re.max + info.im.max*info.im.max);
		}
		let lengthZ = zMax - zMin;
		let rangeZ = [zMin, zMax];
		let aspect = {x:1, y:1, z:lengthZ / lengthXY};
	
		return [rangeZ, aspect];
	}
}




function getZAxisLabel(component3z) {
	if( component3z.zAxis === 'im'){
		return 'Im(x)';
	} else if( component3z.zAxis === 're') {        
		return 'Re(x)';
	}else if( component3z.zAxis === 're') {        
		return 'abs(x)';
	}
}