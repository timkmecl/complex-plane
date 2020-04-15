import React, { useState, useEffect } from 'react';
import styles from './App.module.css';

import { complex } from 'mathjs';
import { m } from './utils/math';
import GridClass from './utils/GridClass';

import Graf from './components/Graf.jsx';
import Sidebar from './components/Sidebar.jsx'


const scopeInit = {};
m.evaluate("f(x) = sin(x)", scopeInit);


function App() {
  let [fList, setFList] = useState({ list: [{ text: "f(x) = sin(x)", id: 0, name: 'f' }], idNew: 1 });
  let [scope, setScope] = useState(scopeInit);
  
  let [gridParams, setGridParams] = useState({
    grids: [[
      {
        gridType: 'cartesian',
        funct: 'f(x)',
        center: complex(0, 0),
        angle: 0,
        psPerLine: 200,

        width: 10,
        height: '=',
        nLinesV: 11,
        nLinesH: '=',
      },
      {
        color: {
          v: 'rgba(70, 50, 140, 1)',
          h: 'rgba(40, 130, 175, 1)',
          opacity: 1,
          width: 2,
        },
        component3: {
          zAxis: 'auto',
          color: 'auto'
        }
      }, 0, 0, []],],

    nextId: 1,
    revision: 0,
    component3: { zAxis: 're', color: 'auto' }
  });
  let [grid] = useState(
    new GridClass()
  );

  let [mode, setMode] = useState('2d');
  let [component3, setComponent3] = useState({ zAxis: 're', color: 'auto' });

  let [revision, setRevision] = useState(0)

  //m.evaluate(fList.list[0].text, scope)
  


  // Preračunavanje vseh točk
  useEffect(() => {
    console.log("aaa", scope)
    grid.refresh(gridParams.grids[0], {...scope}, component3);
    grid.recalculate()
    grid.redraw(mode);
    setRevision(revision + 1);
  }, [gridParams]);



  function onInput(action, content) {
    switch (action) {
      case '2d3d':
        if (content == '2d') {
          grid.redraw('2d');
          setMode('2d')
        } else if (content == '3d') {
          grid.redraw('3d');
          setMode('3d')
        }
        break;

      case 'component3':
        console.log(content);
        let newComp3 = { ...component3 };
        newComp3[content.which] = content.option;
        setComponent3(newComp3);

        grid.refresh(gridParams.grids[0], {...scope}, newComp3);
        grid.redraw(mode);
        break;

      case 'functionChanged':
        setFList(content.list);
        console.log("App", m.evaluate("f(1)", {...scope}));

        grid.refresh(gridParams.grids[0], scope, component3);
        grid.recalculate()
        grid.redraw(mode);
    }

    setRevision(revision + 1);
  }



  return (
    <div className={styles.App}>
      <Graf grid={grid} mode={mode} revision={revision} />
      <Sidebar onInput={onInput} config={{mode, gridParams, component3, fList, scope }} />
    </div>
  );
}

export default App;
