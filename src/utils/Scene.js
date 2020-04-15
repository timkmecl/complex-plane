import GridClass from './GridClass';
import { m } from './utils/math';


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
		this.component3 = component3;

		this.gridParams.forEach(gP => {
			let params = [[...gP[0]], [...gP[1]]];
			let id = gP[2];
			let rev = gP[3];
			let err = gP[4];

			try {
				params[0].center = m.evaluate(params[0].center, scope);
				params[0].angle = m.evaluate(params[0].angle, scope);
				params[0].psPerLine = m.evaluate(params[0].psPerLine, scope);
				params[0].width = m.evaluate(params[0].width, scope);
				params[0].nLinesV = m.evaluate(params[0].nLinesV, scope);
				params[0].height = params[0].height !== "=" ? m.evaluate(params[0].width, scope) : "=";
				params[0].nLinesH = params[0].nLines !== "=" ? m.evaluate(params[0].nLinesV, scope) : "=";

			} catch (e) {
				console.error(e);
				err[0] = e;
				return;
			}


			let index = this.grids.findIndex(g => g.id === id);

			let grid;
			if (index === -1) {
				grid = new GridClass;
				grid.setPlot(this.plt2d, this.plt3d);
				this.grids.push(grid);
			} else {
				grid = this.grids[index];
			}

			grid.refresh(params, scope, component3);
		})


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
		this.grids.forEach(grid => {
			grid.recalculate();
		})
	}

	redraw(mode) {
		let start = true;

		this.grids.forEach(grid => {
			let newData = grid.redraw(mode);

			if (start) {
				if (mode === '3d') {
					this.data3d = {};
				} else {
					this.data2d = {}
				}
				this.a3dAxesInfo = grid.a3dAxesInfo;
			} else {
				update3dAxesInfo(grid.a3dAxesInfo);
			}

			if (mode === '3d') {
				this.data3d = this.data3d.concat(newData);
			} else {
				this.data2d = this.data2d.concat(newData);
			}
		})
	}

	update3dAxesInfo(newAI) {
		this.a3dAxesInfo.rangeX = newAI.rangeX;
		this.a3dAxesInfo.rangeY = newAI.rangeY;
		if (newAI.rangeZ > this.a3dAxesInfo.rangeZ) {
			this.a3dAxesInfo.rangeZ = newAI.rangeZ;
			this.a3dAxesInfo.aspectratio = newAI.aspectratio;
		}
		if (aspectmode == "manual") {
			this.a3dAxesInfo.aspectmode = "manual";
		} 
		this.a3dAxesInfo.zaxis_title = this.getZAxisLabel(component3);
	}

	getZAxisLabel(component3z) {
		if (component3z.zAxis === 'im') {
			return 'Im(x)';
		} else if (component3z.zAxis === 're') {
			return 'Re(x)';
		} else if (component3z.zAxis === 'abs') {
			return 'abs(x)';
		} else if (component3z.zAxis === 'arg') {
			return 'arg(x)';
		}
	}
}