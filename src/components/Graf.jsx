
import React, {useState, useEffect, useRef} from "react";

import Plotly from 'plotly.js';
import Plot from "react-plotly.js";
import { create, all } from 'mathjs'
import { calculateGrid } from '../utils/grid';

const config_mjs = { };
const math = create(all, config_mjs);
/*
import Plotly from "plotly.js-basic-dist";

import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);*/

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}



// ===== Config za Plotly

const layoutInit2d = {
  title: null,
  autosize: true,
  uirevision: 1,
  showlegend: false,
  hovermode: 'closest',
  dragmode: 'pan',
  margin: {
    l: 45,
    r: 0,
    b: 30,
    t: 0,
    pad: 4
  },
  xaxis: {
    nticks: 10,
    range: [-5, 5]
  },
  yaxis: {
    scaleanchor: "x",
    range: [-5, 5],
  },
}

const configInit2d={
  responsive: true,
  scrollZoom: true,
  displayModeBar: true,
  displaylogo: false,
  modeBarButtonsToRemove: [
    'lasso2d', 'toggleSpikelines', 'hoverCompareCartesian', 'hoverClosestCartesian', 'resetCameraLastSave3d'
  ],
};

const dataObjInit2d = {
  name: "",
  line: {
    color: "rgba(35, 110, 160, 0.8)"
  },
  mode: 'lines',
  type: 'scattergl'
}

// za 3d
const layoutInit3d = {
  title: null,
  autosize: true,
  uirevision: 1,
  showlegend: false,
  hovermode: 'closest',
  dragmode: 'turntable',
  margin: {
    l: 0,
    r: 0,
    b: 0,
    t: 0,
    pad: 4
  },
  xaxis: {
    nticks: 10,
    range: [-5, 5]
  },
  yaxis: {
    scaleanchor: "x",
    range: [-5, 5],
  },
  scene: {
    xaxis:{title: 'Re(f(x))'},
    yaxis:{title: 'Im(f(x))'},
    zaxis:{title: 'z'},
    aspectmode:'cube',
    camera: {
      eye: {
        x: -0.2,//0
        y: -1.8,//-0.00001,
        z: 1.//2
      }
    }
  }
}

const dataObjInit3d = {
  name: "",
  line: {
    //color: "rgba(35, 110, 160, 0.8)"
  },
  mode: 'lines',
  type: 'scatter3d'
}











const Graf = ({f, grid, mode, component3z}) => {

  let [plt2d, setPlt2d] = useState({
    data: [],
    layout: layoutInit2d,
    revision: 1,
    config: configInit2d,/*{...configInit2d,
      modeBarButtonsToAdd: [{
        name: 'Reset view',
        icon: Plotly.Icons.home,
        click: () => {
          console.log("clicka", plt2d, setPlt2d);
          setPlt2d((plt2d) => {
            console.log("click", plt2d);
            let newLayout = plt2d.layout;
            //newLayout.yaxis.range = [-5, 5];
            newLayout.xaxis.range = [-5, 5];
            return {...plt2d, revision:plt2d.revision+1, layout: newLayout}
          })
        }
      }]},*/
    uirevision: 1
  })
  let [plt3d, setPlt3d] = useState({
    data: [],
    layout: layoutInit3d,
    config: configInit2d,
    uirevision: 1
  })

  let [lines, setLines] = useState()
  
  

  // Preračunavanje vseh točk
  useEffect(() => {
    console.log("Recalculating");
    let lines1 = calculateGrid(grid.center, grid.nh, grid.nv, grid.angle, grid.space, grid.psPerSpace/5, 
      f);
    redraw(lines1, plt2d, setPlt2d, plt3d, setPlt3d, mode, component3z);
    setLines(lines1);
  }, [f, grid]);

  useEffect(() => {
    console.log("zaxis changed");
    if (lines != undefined) {
      redraw(lines, plt2d, setPlt2d, plt3d, setPlt3d, mode, component3z);
    }
  }, [component3z.zAxis, component3z.color]);


  // Pretvorba med pogledi
  const prevMode = usePrevious(mode);
  useEffect(() => {
    console.log(prevMode, mode);
    if (lines != undefined) {
      if (mode === '2d') {
        let newData = linesToData('2d', lines);
        let newLayout = plt2d.layout;
        setPlt2d({...plt2d, data:newData, layout:newLayout});

      } else if (mode === '3d') {

        let lengthX = Math.abs(plt2d.layout.xaxis.range[0] - plt2d.layout.xaxis.range[1])
        let lengthY = Math.abs(plt2d.layout.yaxis.range[0] - plt2d.layout.yaxis.range[1])
        let rangeX = [-5, 5];
        let rangeY = [-5, 5];
        if (lengthX > lengthY) {
          let center = (plt2d.layout.yaxis.range[0] + plt2d.layout.yaxis.range[1])/2
          rangeX = plt2d.layout.xaxis.range;
          rangeY = [center - lengthX/2, center + lengthX/2]
        } else {
          let center = (plt2d.layout.xaxis.range[0] + plt2d.layout.xaxis.range[1])/2
          rangeY = plt2d.layout.yaxis.range;
          rangeX = [center - lengthY/2, center + lengthY/2]
        }
        let [rangeZ, aspectZ] = getZRange(lines, component3z, lengthX);

        let newLayout = plt3d.layout;
        newLayout.uirevision++;
        newLayout.scene.xaxis.range = rangeX;
        newLayout.scene.yaxis.range = rangeY;
        newLayout.scene.zaxis.title = getZAxisLabel(component3z);
        
        newLayout.scene.zaxis.range = rangeZ;
        newLayout.scene.aspectratio = aspectZ;
        newLayout.scene.aspectmode = 'manual';

        /*let layout3d = {
          ...plt3d.layout,
          uirevision: plt3d.layout.uirevision+1,
          scene: {
            ...layoutInit3d.scene,
            xaxis:{title: 'Re(f(x))', range: xrange,},
            yaxis:{title: 'Im(f(x))', range: yrange,},
            zaxis:{title: getZAxisLabel(component3z)},
          }
        };*/
        let newData = linesToData('3d', lines, component3z);
        setPlt3d({...plt3d, data:newData, layout:newLayout});
      }
    }
  }, [mode]);



  const update2d = (figure) => {
    setPlt2d({config:plt2d.config, revision: plt2d.revision	, ...figure});
  };
  const update3d = (figure) => {
    setPlt3d({config:plt3d.config, ...figure});
  };

  console.log(plt2d.revision)
  if (mode === '3d'){
    return (
      <Plot key={3}
        style={{width: '100%', height: '100%'}}
        data={plt3d.data}
        layout={plt3d.layout}
        config={plt3d.config}
        useResizeHandler={true}
        onInitialized={update3d}
        onUpdate={update3d}
      />)
  } else {
    return (
      <Plot key={2}
        style={{width: '100%', height: '100%'}}
        data={plt2d.data}
        layout={plt2d.layout}
        config={plt2d.config}
        useResizeHandler={true}
        revision={plt2d.revision}
        onInitialized={update2d}
        onUpdate={update2d}
      />)
  }
}

export default Graf







function redraw(lines, plt2d, setPlt2d, plt3d, setPlt3d, mode, component3z) {
  console.log(`Redrawing: ${mode}`);
  if(mode === '3d'){
    setPlt3d({...plt3d, 
      layout: updateZRange(plt3d, lines, component3z), 
      data: linesToData('3d', lines, component3z)});
  } else {
    setPlt2d({...plt2d, data:linesToData('2d', lines)});
  }
}



function updateZRange(plt3d, lines, component3z) {
  let newLayout = plt3d.layout;
  newLayout.scene.zaxis.title = getZAxisLabel(component3z);
  if (plt3d.layout.scene.xaxis.range != undefined) {
    let [rangeZ, aspectZ] = getZRange(lines, component3z, plt3d.layout.scene.xaxis.range[1]-plt3d.layout.scene.xaxis.range[0]);
    newLayout.scene.zaxis.range = rangeZ;
    newLayout.scene.aspectratio = aspectZ;
    newLayout.scene.aspectmode = 'manual';
  }
  return newLayout;
}

function getZRange(lines, component3z, lengthXY) {
  let info = lines[2];
  let zMin = 0;
  let zMax = 0;
  if (component3z.zAxis === 're') {
    zMin = info.re.min;
    zMax = info.re.max;
  } else if (component3z.zAxis === 'im') {
    zMin = info.im.min;
    zMax = info.im.max;
  } else if (component3z.zAxis === 'abs') {
    zMin = 0;
    zMax = Math.sqrt(info.re.max*info.re.max + info.im.max*info.im.max);
  }
  let lengthZ = zMax - zMin;
  let rangeZ = [zMin, zMax];
  let aspect = {x:1, y:1, z:lengthZ / lengthXY};

  return [rangeZ, aspect];
}







function linesToData(mode, lines, component3z) {
  let newData = [];
  if (mode === '2d'){
    lines[0].forEach((line) => {
      addLineToData2d(newData, line, `rgba(70, 50, 140, 1})`, '--');
    })
    lines[1].forEach((line) => {
      addLineToData2d(newData, line, `rgba(40, 130, 175, 1})`, '|');
    })
  } else if (mode === '3d') {
    let info = lines[2];
    lines[0].forEach((line) => {
      addLineToData3d(newData, line, `rgba(70, 50, 140, 1})`, '--', component3z, info);
    })
    lines[1].forEach((line) => {
      addLineToData3d(newData, line, `rgba(40, 130, 175, 1})`, '|', component3z, info);
    })
  }
  return newData;
}

function addLineToData2d(data, line, color, name) {
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

function addLineToData3d(data, line, color, name, component3z, info) {
  let [xx, yy] = line;
  let x = yy.map((e) => e.re);
  let y = yy.map((e) => e.im);
  let text = xx.map((e, i) => `f( ${math.format(e, 2)} )<br><i>${math.format(yy[i], 2)}</i>`);

  let z = 0;
  let c = 0;
  
  if (component3z.zAxis === 'im') {
    z = xx.map((e) => e.im);
  } else if (component3z.zAxis === 're'){
    z = xx.map((e) => e.re);
  } else if (component3z.zAxis === 'abs'){
    z = xx.map((e) => math.abs(e));
  }

  let line1 = {};
  if (component3z.color !== false){
    let cmin = 0;
    let cmax = 0;
    if (component3z.color === 'im') {
      c = xx.map((e) => e.im);
      cmin = info.im.min;
      cmax = info.im.max;
    } else if (component3z.color === 're'){
      c = xx.map((e) => e.re);
      cmin = info.re.min;
      cmax = info.re.max;
    } else if (component3z.color === 'arg'){
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

function getZAxisLabel(component3z) {
    if( component3z.zAxis === 'im'){
      return 'Im(x)';
    } else if( component3z.zAxis === 're') {        
      return 'Re(x)';
    }else if( component3z.zAxis === 're') {        
      return 'abs(x)';
    }
}