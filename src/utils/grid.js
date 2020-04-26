/*import {create, all, complex, add, subtract, multiply, exp} from 'mathjs';
const config_mjs = { };
const math = create(all, config_mjs);*/
import { m } from '../utils/math';
const {complex, add, subtract, multiply, exp} = m;

export function calculateParametric(from, to, stepSize, f, fParametric) {
	const lines = [[], []];

	let diff = (to - from) > 0;
	let dir;
	if (diff >= 0) {
		dir = 1;
	} else if (diff < 0) {
		dir = -1;
	}
	if (stepSize == 0) {
		stepSize = diff/10000;
	}

	const xx = [];
	const yy = [];
	for (let i = from; i <= to; i+= stepSize) {
		let x = fParametric(m.complex(i));
		let y = f(x);
		xx.push(x);
		yy.push(y);
	}
	lines[0].push([xx, yy]);

	let info = {
		re: {
			max: Math.max(from, to),
			min: Math.min(from, to),
		},
		im: {
			max: 0,
			min: 0,
		},
		abs: {
			max: Math.max(m.abs(from),
				m.abs(to)),
			min: Math.min(0, m.abs(from),
				m.abs(to))
		}
	};

	lines.push(info)
	return lines;
}

export function calculateLine(x1, x2, nPoints, f) {
	const xx = [];
	const yy = [];

	nPoints = Math.round(nPoints);

	const dx = multiply(subtract(x2, x1), 1 / (nPoints-1));

	for (let i = 0; i < nPoints; i++) {
		let x = add(x1, multiply(dx, i));
		let y = f(x);
		xx.push(x);
		yy.push(y);
	}
	return [xx, yy];
}

export function calculateCircle(center, radius, nPoints, f) {
	const xx = [];
	const yy = [];

	const phi = 2* m.pi/nPoints;

	for (let i = 0; i <= nPoints+1; i++) {
		let x = add(center, complex(radius*m.cos(i*phi), radius*m.sin(i*phi)));
		let y = f(x);
		xx.push(x);
		yy.push(y);
	}
	return [xx, yy];
}

export function calculateGrid(center, w, h, angle, nLinesV, nLinesH, psPerLine, f) {
	const lines = [[], []];

	let nPointsv = psPerLine * 2*h/(w+h)
	let nPointsh = psPerLine * 2*w/(w+h)

	let dv = h/(nLinesH-1);
	if (nLinesH == 1)
		dv = 0;

	let dh = w/(nLinesV-1);
	if (nLinesV == 1)
		dh = 0;

	const ang1 = exp(multiply(complex(0, 1), angle));
	const ang2 = exp(multiply(complex(0, 1), angle + m.pi / 2));

	const v1 = subtract(center, multiply(h/2, ang2));
	const v2 = add(center, multiply(h/2, ang2));

	const h1 = subtract(center, multiply(w/2, ang1));
	const h2 = add(center, multiply(w/2, ang1));


	for (let i = -(nLinesV-1)/2; i <= (nLinesV-1)/2; i++) { // vertikalne 
		let line1 = calculateLine(add(v1, multiply(i * dh, ang1)),
			add(v2, multiply(i * dh, ang1)), nPointsv, f);
		lines[1].push(line1);
	}

	for (let i = -(nLinesH-1)/2; i <= (nLinesH-1)/2; i++) { // horizontalne 
		let line1 = calculateLine(add(h1, multiply(i * dv, ang2)),
			add(h2, multiply(i * dv, ang2)), nPointsh, f);
		lines[0].push(line1);
	}

	let info = {
		re: {
			max: Math.max(add(v1, multiply(-w/2, ang1)).re,
				add(v1, multiply(w/2, ang1)).re,
				add(v2, multiply(-w/2, ang1)).re,
				add(v2, multiply(w/2, ang1)).re,),
			min: Math.min(add(v1, multiply(-w/2, ang1)).re,
			add(v1, multiply(w/2, ang1)).re,
			add(v2, multiply(-w/2, ang1)).re,
			add(v2, multiply(w/2, ang1)).re,),
		},
		im: {
			max: Math.max(add(v1, multiply(-w/2, ang1)).im,
				add(v1, multiply(w/2, ang1)).im,
				add(v2, multiply(-w/2, ang1)).im,
				add(v2, multiply(w/2, ang1)).im,),
			min: Math.min(add(v1, multiply(-w/2, ang1)).im,
				add(v1, multiply(w/2, ang1)).im,
				add(v2, multiply(-w/2, ang1)).im,
				add(v2, multiply(w/2, ang1)).im,),
		},
		abs: {
			max: Math.max(m.abs(add(v1, multiply(-w/2, ang1))),
				m.abs(add(v1, multiply(w/2, ang1))),
				m.abs(add(v2, multiply(-w/2, ang1))),
				m.abs(add(v2, multiply(w/2, ang1))),),
			min: Math.min(0, m.abs(add(v1, multiply(-w/2, ang1))),
				m.abs(add(v1, multiply(w/2, ang1))),
				m.abs(add(v2, multiply(-w/2, ang1))),
				m.abs(add(v2, multiply(w/2, ang1))),)
		}
	};

	lines.push(info)
	return lines;
}



export function calculateGridPolar(center, w, h, angle, nLinesV, nLinesH, psPerLine, f) {
	const lines = [[], []];

	let r = w;

	let nPointsr = psPerLine;

	let nPointsc = 0;
	if (nLinesV > 0) {
		nPointsc = psPerLine * 2 * m.pi / nLinesV;
	}


	const phi =  2*m.pi / nLinesH;
	const ii = complex(0, 1);

	for (let i = 0; i < nLinesH; i++) {
		let line1 = calculateLine(center,
			add(center, multiply(r, exp(multiply(ii, phi*i+angle)))), nPointsr, f);
		lines[0].push(line1);
	}

	let line1 = calculateCircle(center, 0.001*(w/nLinesV), nPointsc*0.01, f);
	lines[1].push(line1);

	for (let i = 1; i < nLinesV+1; i++) {
		let line1 = calculateCircle(center, i*r/nLinesV, nPointsc*i, f);
		lines[1].push(line1);
	}

	
	let info = {
		re: {
			max: m.add(center, complex(r, 0)).re,
			min: m.subtract(center, complex(r, 0)).re
		},
		im: {
			max: m.add(center, complex(0, r)).im,
			min: m.subtract(center, complex(0, r)).im
		},
		abs: {
			max: m.abs(center) +  m.abs(r),
			min: Math.max(0, m.abs(center) -  m.abs(r))
		}
	};

	lines.push(info)
	return lines;
}