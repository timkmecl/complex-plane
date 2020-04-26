import { create, all } from 'mathjs'
const config_mjs = { };
const math = create(all, config_mjs);


export const m = importCustom();


function importCustom() {
    math.import({
        Sum: bigSigma,
        S: bigSigma,
        sigma: bigSigma,
        Sigma: bigSigma,
        Product: bigPi,
        product: bigPi,
        P: bigPi,
        switch: switchF,
        interp: interp,
        interpolate: interp,
        rotate4d: rotate4d
      })
    return math;
}


function bigSigma(args, math, scope) {
    const str = args.map(function (arg) {
      return arg.toString()
    })
    let [ind, a, b, expr] = str;
  
    let s = 0;
    let exprCompiled = math.compile(expr);
  
    a = math.number(math.evaluate(a, scope));
    b = math.number(math.evaluate(b, scope));
    
    for(let i = a; i <= b; i++) {
      let plus = exprCompiled.evaluate({...scope, [ind]: i});
      s = math.add(s, plus);
    }
    return s;
  }
  bigSigma.rawArgs = true;
  //"Sum(n, 0, 3, Sum(j, 0, 5, j)) "
  
  function bigPi(args, math, scope) {
    const str = args.map(function (arg) {
      return arg.toString()
    })
    let [ind, a, b, expr] = str;
  
    let p = 1;
    let exprCompiled = math.compile(expr);
  
    a = math.number(math.evaluate(a, scope));
    b = math.number(math.evaluate(b, scope));
    
    for(let i = a; i <= b; i++) {
      let plus = exprCompiled.evaluate({...scope, [ind]: i});
      p = math.multiply(p, plus);
    }
    return p;
  }
  bigPi.rawArgs = true;

  function switchF(x) {
    return math.complex(x.im, x.re);
  }

  function interp(x, y, t) {
    return math.add(math.multiply(x, 1-t), math.multiply(y, t));
  }
  function rotate4d(z, phi) {
    return math.multiply(z, math.exp(math.complex(0, phi)))
  }