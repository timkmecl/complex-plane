import {create, all, complex, add, subtract, multiply, exp} from 'mathjs';
const config_mjs = { };
const math = create(all, config_mjs);

export function calculateLine(x1, x2, nPoints, f) {
	const xx = [];

	const yy = [];

	for (let i = 0; i <= nPoints; i++) {
		let x = add(x1, multiply(subtract(x2, x1), i / nPoints));
		let y = f(x);
		xx.push(x);
		yy.push(y);
	}
	return [xx, yy];
}

export function calculateGrid(center, nh, nv, angle, space, psPerSpace, f) {
	const lines = [[], []];

	let nPointsv = psPerSpace * nh * 2
	let nPointsh = psPerSpace * nv * 2

	const lenh = nv * space;
	const lenv = nh * space;

	const ang1 = exp(multiply(complex(0, 1), angle));
	const ang2 = exp(multiply(complex(0, 1), angle + math.pi / 2));

	const v1 = subtract(center, multiply(lenh, ang1));
	const v2 = add(center, multiply(lenh, ang1));

	const h1 = subtract(center, multiply(lenv, ang2));
	const h2 = add(center, multiply(lenv, ang2));

	let lineh = calculateLine(v1, v2, nPointsh, f);
	let linev = calculateLine(h1, h2, nPointsv, f);
	lines[0].push(lineh);
	lines[1].push(linev);

	for (let i = 1; i <= nh; i++) { // horizontalne 
		let line1 = calculateLine(add(v1, multiply(i * space, ang2)),
			add(v2, multiply(i * space, ang2)), nPointsh, f);
		let line2 = calculateLine(subtract(v1, multiply(i * space, ang2)),
			subtract(v2, multiply(i * space, ang2)), nPointsh, f);
		lines[0].push(line1, line2);
	}
	for (let i = 1; i <= nv; i++) { // vertikalne
		let line1 = calculateLine(add(h1, multiply(i * space, ang1)),
			add(h2, multiply(i * space, ang1)), nPointsv, f);
		let line2 = calculateLine(subtract(h1, multiply(i * space, ang1)),
			subtract(h2, multiply(i * space, ang1)), nPointsv, f);
		lines[1].push(line1, line2);
	}

	let info = {
		re: {
			max: Math.max(add(v1, multiply(nh * space, ang2)).re,
				add(v2, multiply(nh * space, ang2)).re,
				subtract(v1, multiply(nh * space, ang2)).re,
				subtract(v2, multiply(nh * space, ang2)).re,),
			min: Math.min(add(v1, multiply(nh * space, ang2)).re,
				add(v2, multiply(nh * space, ang2)).re,
				subtract(v1, multiply(nh * space, ang2)).re,
				subtract(v2, multiply(nh * space, ang2)).re),
		},
		im: {
			max: Math.max(add(v1, multiply(nh * space, ang2)).im,
				add(v2, multiply(nh * space, ang2)).im,
				subtract(v1, multiply(nh * space, ang2)).im,
				subtract(v2, multiply(nh * space, ang2)).im),
			min: Math.min(add(v1, multiply(nh * space, ang2)).im,
				add(v2, multiply(nh * space, ang2)).im,
				subtract(v1, multiply(nh * space, ang2)).im,
				subtract(v2, multiply(nh * space, ang2)).im),
		},
		abs: {
			max: Math.max(math.abs(add(v1, multiply(nh * space, ang2))),
				math.abs(add(v2, multiply(nh * space, ang2))),
				math.abs(subtract(v1, multiply(nh * space, ang2))),
				math.abs(subtract(v2, multiply(nh * space, ang2)))),
			min: Math.min(math.abs(add(v1, multiply(nh * space, ang2))),
				math.abs(add(v2, multiply(nh * space, ang2))),
				math.abs(subtract(v1, multiply(nh * space, ang2))),
				math.abs(subtract(v2, multiply(nh * space, ang2))))
		}
	};

	lines.push(info)
	return lines;
}