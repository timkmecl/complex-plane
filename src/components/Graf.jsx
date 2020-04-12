
import React, {useState, useEffect, useRef} from "react";

//import Plotly from 'plotly.js';
import Plot from "react-plotly.js";
import { create, all } from 'mathjs'

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











const Graf = ({grid, mode, revision}) => {

  let [plt2d, setPlt2d] = useState({
    data: [],
    layout: layoutInit2d,
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
  
  
  useEffect(() => {
    grid.setPlot(plt2d, plt3d);
  }, []);
  


  // Pretvorba med pogledi
  //const prevMode = usePrevious(mode);
  useEffect(() => {
    console.log(grid.mode);
    if (grid.mode === '3d') {
       
        
        let   {rangeX, rangeY, rangeZ, aspectratio, aspectmode, zaxis_title} = grid.a3dAxesInfo;
        console.log(rangeZ, aspectratio, zaxis_title);
        let newLayout = plt3d.layout;
        //let scene = newLayout.scene;

        newLayout.scene.xaxis.range = rangeX;
        newLayout.scene.yaxis.range = rangeY;
        newLayout.scene.zaxis.range = rangeZ;
        newLayout.scene.zaxis.title = zaxis_title;
        newLayout.scene.aspectmode = aspectmode;
        newLayout.scene.aspectratio = aspectratio;
        
        /*newLayout.scene = {
          ...newLayout.scene,
          aspectmode: aspectmode,
          aspectratio: aspectratio,
          zaxis: {
            range: rangeZ,
            title: zaxis_title
          }
        }
        console.log(newLayout.scene);*/

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
        //let newData = linesToData('3d', lines, component3z);
        setPlt3d({...plt3d, layout:newLayout});
      }
    
  }, [grid.mode, grid.a3dAxesInfo]);

  useEffect(() => {
    setPlt2d({...plt2d, data:grid.data2d});
  }, [grid.data2d]);
  useEffect(() => {
    setPlt3d({...plt3d, data:grid.data3d});
  }, [grid.data3d]);



  const update2d = (figure) => {
    setPlt2d({config:plt2d.config, ...figure});
  };
  const update3d = (figure) => {
    setPlt3d({config:plt3d.config, ...figure});
  };

  console.log(revision)
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
        revision={revision}
        onInitialized={update2d}
        onUpdate={update2d}
      />)
  }
}

export default Graf