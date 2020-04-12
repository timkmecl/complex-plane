import React , { useState, useEffect } from 'react';
import './App.css';
import Graf from './components/Graf.jsx';
import {complex} from 'mathjs';

import GridClass  from './utils/GridClass';

import { create, all } from 'mathjs'
const config_mjs = { };
const math = create(all, config_mjs);

function App() {
  let [ftext, setFtext] = useState("sin(x)");
  let [gridParams, setGridParams] = useState([{
      center: complex(0, 0),
      nh: 5,
      nv: 5,
      angle: 0,
      space: 1,
      psPerSpace: 20,
    },
    {
      color: {
        v: 'rgba(70, 50, 140, 1)',
        h: 'rgba(40, 130, 175, 1)'
      },
      component3: {
        zAxis: 'auto',
        color: 'auto'
      }
    }]);
  let [grid] = useState(
    new GridClass('cartesian')
  );
  let [revision, setRevision] = useState(0)
  let [mode, setMode] = useState('2d');
  let [component3z, setComponent3z] = useState({zAxis: 're', color: 'auto'});
  

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

  

  // Preračunavanje vseh točk
  useEffect(() => {
    grid.refresh(gridParams, f, component3z);
    grid.recalculate()
    grid.redraw(mode);
    setRevision(revision+1);
  }, [ftext, gridParams[0]]);

  useEffect(() => {
    grid.refresh(gridParams, f, component3z);
    grid.redraw(mode);
    setRevision(revision+1);
  }, [component3z.zAxis, component3z.color, mode, gridParams[1]]);


  return (
    <Graf grid={grid} mode={mode} revision={revision} />
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