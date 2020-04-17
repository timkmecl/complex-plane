import React, { useState, useEffect } from 'react';
import styles from './App.module.css';

import { complex } from 'mathjs';
import { m } from './utils/math';
import GridClass from './utils/GridClass';
import Scene from './utils/Scene';

import Graf from './components/Graf.jsx';
import Sidebar from './components/Sidebar.jsx'


const scopeInit = {};
m.evaluate("f(x) = sin(x)", scopeInit);

const newGridTemplate = [
  {
    active: true,
    gridType: 'cartesian',

    funct: '',
    center: "0 + 0i",
    angle: 0,
    psPerLine: 200,

    width: "4",
    height: '=',
    nLinesV: 5,
    nLinesH: '=',
  },
  {
    color: {
      v: 'rgba(70, 50, 140, 1)',
      h: 'rgba(40, 130, 175, 1)',
      opacity: 1,
      width: 2,
      r: 70,
      g: 50,
      b: 140,
    },
    component3: {
      zAxis: 'auto',
      color: 'auto'
    }
  }
]


function App() {
  // Seznam vseh funkcij (v text obliki, dejanske funkcije shranjene v scope)
  let [fList, setFList] = useState({ list: [{ text: "f(x) = sin(x)", id: 0, name: 'f' }], idNew: 1 });
  let [scope] = useState(scopeInit);

  // Seznam vseh parametrov mrež
  let [gridParams, setGridParams] = useState({
    grids: [[
      {
        active: true,
        gridType: 'cartesian',

        funct: 'f(x)',
        center: "0",
        angle: 0,
        psPerLine: 200,

        width: "5",
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
          r: 70,
          g: 50,
          b: 140,
        },
        component3: {
          zAxis: 'auto',
          color: 'auto',
        }
      }, 0, 0, []],
    ],

    nextId: 1,
    revision: 0,
    component3: { zAxis: 're', color: 'auto' }
  });
  // Scene object (dejanske mreže, skrbi za računanje točk)
  let [scene] = useState(
    new Scene()
  );

  let [mode, setMode] = useState('2d');
  let [component3, setComponent3] = useState({ zAxis: 're', color: 'auto', hybrid: true, });

  let [revision, setRevision] = useState(0)
  let [rev2] = useState(0)




  // Preračunavanje vseh točk
  useEffect(() => {
    scene.refresh(gridParams, { ...scope }, component3);
    scene.recalculate()
    scene.redraw(mode);
    setRevision(revision + 1);
  }, [rev2]);



  function onInput(action, content) {
    switch (action) {
      case '2d3d': {
        if (content == '2d') {
          scene.redraw('2d');
          setMode('2d')
        } else if (content == '3d') {
          scene.redraw('3d');
          setMode('3d')
        }
       
        break;
      }

      case 'component3': {
        let newComp3 = { ...component3 };
        newComp3[content.which] = content.option;
        setComponent3(newComp3);

        scene.refresh(gridParams, { ...scope }, newComp3);
        scene.redraw(mode);
       
        break;
      }

      case 'functionChanged': {
        setFList(content.list);

        scene.refresh(gridParams, { ...scope }, component3);
        scene.recalculate()
        scene.redraw(mode);
       
        break;
      }

      case 'gridParamChanged': { 
        let index = gridParams.grids.findIndex(g => g[2] == content.id);
        gridParams.grids[index][0][content.name] = content.value;
        setGridParams(gridParams);

       break;
      }

      case 'gridParamChangedCommit': {
        scene.refresh(gridParams, { ...scope }, component3);
        scene.recalculateSpecific(content.id);
        scene.redraw(mode);
       
        break;
      }


      case 'gridNew': {
        let newId = gridParams.nextId;
        let newGrid = [{ ...newGridTemplate[0] }, { ...newGridTemplate[1] }, newId, 0, []];
        gridParams.nextId++;
        gridParams.grids = [newGrid, ...gridParams.grids];
        setGridParams(gridParams);
        scene.refresh(gridParams, { ...scope }, component3);
        scene.recalculateSpecific(newId);
        scene.redraw(mode);
       
        break;
      }

      case 'gridToggleVisible': {
        let index = gridParams.grids.findIndex(g => g[2] == content.id);
        gridParams.grids[index][0].active = !gridParams.grids[index][0].active;
        setGridParams(gridParams);
        scene.refresh(gridParams, { ...scope }, component3);
        scene.recalculateSpecific(content.id);
        scene.redraw(mode);
       
        break;
      }
      case 'gridChangeColor': {
        let index = gridParams.grids.findIndex(g => g[2] == content.id);
        gridParams.grids[index][1].color = {...gridParams.grids[index][1].color,
          ...content.color};
        setGridParams(gridParams);
        scene.refresh(gridParams, { ...scope }, component3);
        scene.redraw(mode);
       
        break;
      }
      case 'gridDelete': {
        gridParams.grids = gridParams.grids.filter(g => g[2]!= content.id);
        setGridParams(gridParams);
        scene.delete(content.id);
        scene.refresh(gridParams, { ...scope }, component3);
        scene.redraw(mode);
       
        break;
      }
      case 'gridCopy': {
        let index = gridParams.grids.findIndex(g => g[2] == content.id);

        let newId = gridParams.nextId;
        let newGrid = [{ ...gridParams.grids[index][0] }, { ...gridParams.grids[index][1] }, newId, gridParams.grids[index][3], []];
        gridParams.nextId++;
        gridParams.grids = [
          ...gridParams.grids.slice(0, index),
          newGrid,
          ...gridParams.grids.slice(index)
        ];
        console.log(newId, index, gridParams.grids);
        setGridParams(gridParams);
        scene.refresh(gridParams, { ...scope }, component3);
        scene.recalculateSpecific(newId);
        scene.redraw(mode);
       
        break;
      }


    }

    setRevision(revision + 1);
  }



  return (
    <div className={styles.App}>
      <Graf scene={scene} mode={mode} revision={revision} />
      <Sidebar onInput={onInput} config={{ mode, gridParams, component3, fList, scope }} />
    </div>
  );
}

export default App;
