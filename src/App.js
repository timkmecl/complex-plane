import React, { useState, useEffect } from 'react';
import styles from './App.module.css';

import { m } from './utils/math';
import Scene from './utils/Scene';

import Graf from './components/Graf.jsx';
import Sidebar from './components/Sidebar.jsx'


const scopeInit = {};
m.evaluate("f(x) = sin(x)", scopeInit);
m.evaluate("a=0", scopeInit);

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

    stepSizeParametric: 0.01,
    functParametric: '',
    fromParametric: -1,
    toParametric: 1,
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
  let [sliders, setSliders] = useState({
    list: [
      { id: 0, name: 'a', value: 0, left: -1, right: 1, stepSize: 0.01 }],
    nextId: 1
  });
  let [lastSliderChangeRev, setLastSliderChangeRev] = useState([0]);

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

        stepSizeParametric: 0.01,
        functParametric: '',
        fromParametric: -1,
        toParametric: 1,
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
      }, 0, 0, []], // id, revision(ni v uporabi), errors
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
  let [component3, setComponent3] = useState({
    zAxis: 're', color: 'auto', hybrid: false,
    colorscale: 'RdBu', 
    base: 'f', baseIdZ: 5
  });

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
      case '2d3d': { // prestavljanje med 2d in 3d
        if (content == '2d') {
          scene.redraw('2d');
          setMode('2d')
        } else if (content == '3d') {
          scene.redraw('3d');
          setMode('3d')
        }

        break;
      }

      case 'component3': { // z os in barva v 3d
        let newComp3 = { ...component3 };
        newComp3[content.which] = content.option;
        setComponent3(newComp3);

        scene.refresh(gridParams, { ...scope }, newComp3);
        scene.redraw(mode);

        break;
      }

      case 'functionChanged': { // spreminjanje funkcije
        setFList(content.list);

        scene.refresh(gridParams, { ...scope }, component3);
        scene.recalculate()
        scene.redraw(mode);

        break;
      }

      case 'gridParamChanged': { // spreminjanje parametrov mrež ob tipkanju
        let index = gridParams.grids.findIndex(g => g[2] == content.id);
        gridParams.grids[index][0][content.name] = content.value;
        setGridParams(gridParams);

        break;
      }

      case 'gridParamChangedCommit': { // preračunavanje mreže z novimi parametri
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

      case 'gridToggleVisible': { // Dodatne opcije pri mrežah
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
        gridParams.grids[index][1].color = {
          ...gridParams.grids[index][1].color,
          ...content.color
        };
        setGridParams(gridParams);
        scene.refresh(gridParams, { ...scope }, component3);
        scene.redraw(mode);

        break;
      }
      case 'gridDelete': {
        gridParams.grids = gridParams.grids.filter(g => g[2] != content.id);
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

      case 'sliderNew': {
        let newId = sliders.nextId;
        let newSlider = { id: newId, name: '', value: 0, left: -1, right: 1, stepSize: 0.01 };
        sliders.nextId++;
        sliders.list = [newSlider, ...sliders.list];
        setSliders(sliders);

        break;
      }
      case 'sliderChanged': {
        let index = sliders.list.findIndex(slider => slider.id == content.id);
        sliders.list[index][content.name] = content.value;
        setSliders(sliders);

        break;
      }
      case 'sliderChangeCommit': {
        lastSliderChangeRev[0] = revision;
        setLastSliderChangeRev(lastSliderChangeRev);
        let curRev = revision;
        
        try {
          scope[content.sliderName] = m.evaluate(content.sliderValue, scope);
        } catch (err) {
          console.log(err.name);
          return;
        }
        setTimeout(() => {
          if (lastSliderChangeRev[0] === curRev) {
            scene.refresh(gridParams, { ...scope }, component3);
            scene.recalculate();
            scene.redraw(mode);
            setRevision(rev => rev + 1);
          }
        }, 0);

        break;
      }
    }

    setRevision(rev => rev + 1);
  }



  return (
    <div className={styles.App}>
      <Graf scene={scene} mode={mode} revision={revision} />
      <Sidebar onInput={onInput} config={{ sliders, mode, gridParams, component3, fList, scope }} />
    </div>
  );
}

export default App;
