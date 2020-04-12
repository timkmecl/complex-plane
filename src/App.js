import React , { useState, useEffect } from 'react';
import './App.css';
import Graf from './components/Graf.jsx';
import {complex} from 'mathjs';

import { create, all } from 'mathjs'
const config_mjs = { };
const math = create(all, config_mjs);

function App() {
  let [ftext, setFtext] = useState("sin(x)");
  let [grid, setGrid] = useState({
    center: complex(0, 0), 
    nh: 5, 
    nv: 5, 
    angle: 0,
    space: 1, 
    psPerSpace: 100
  });
  let [mode, setMode] = useState('2d');
  let [component3z, setComponent3z] = useState({zAxis: 're', color: true});


  useEffect(() => {
    math.import({
      Sum: bigSigma,
      S: bigSigma,
      sigma: bigSigma,
      Sigma: bigSigma,
      Product: bigPi,
      product: bigPi,
      P: bigPi,
    })
  }, [])


  let fCompiled = math.compile(ftext);
  let f = x => fCompiled.evaluate({x})
  //console.log(f(x));

  let compColor = false;
  if (component3z.color === true) {
    if (component3z.zAxis === 're') {
      compColor = 'im';
    } else if (component3z.zAxis === 'im') {
      compColor = 're';
    } else if (component3z.zAxis === 'abs') {
      compColor = 'arg';
    }
  } else if (component3z.color !== false) {
    compColor = component3z.color;
  }
  let component3z2 = {...component3z, color: compColor};
  //return null;
  return (
    <Graf grid={grid} f={f} mode={mode} component3z={component3z2} />
  );
}

export default App;









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
//"Sum(n, 0, 3, Sum(j, 0, 5, j)) "