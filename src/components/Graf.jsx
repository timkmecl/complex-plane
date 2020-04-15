
import React, {useState, useEffect} from "react";

import styles from "./Graf.module.css";

import Plot from "react-plotly.js";
/*
import Plotly from "plotly.js-basic-dist";
import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);*/



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
    b: 23,
    t: 0,
    pad: 4
  },
  xaxis: {
    range: [-5, 5],
    tickfont: {
      color: "#666"
    },
    zerolinecolor: "#555",
  },
  yaxis: {
    scaleanchor: "x",
    range: [-5, 5],
    ticksuffix:"i",
    tickfont: {
      color: "#666"
    },
    zerolinecolor: "#555",
  },
  
}

const configInit={
  responsive: true,
  scrollZoom: true,
  displayModeBar: true,
  displaylogo: false,
  modeBarButtonsToRemove: [
    'lasso2d', 'toggleSpikelines', 'hoverCompareCartesian', 'hoverClosestCartesian', 'resetCameraLastSave3d'
  ],
  toImageButtonOptions: {
    format: 'png',
    filename: 'ComplexF',
    height: 720,
    width: 720,
    scale: 3
  }
};

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

const Graf = ({grid, mode, revision}) => {

  let [plt2d, setPlt2d] = useState({
    data: [],
    layout: layoutInit2d,
    config: configInit,
    uirevision: 1
  })
  let [plt3d, setPlt3d] = useState({
    data: [],
    layout: layoutInit3d,
    config: configInit,
    uirevision: 1
  })

  let [lines, setLines] = useState()
  
  
  useEffect(() => {
    grid.setPlot(plt2d, plt3d);
  }, []);
  

  useEffect(() => {
    console.log(grid.mode);
    if (grid.mode === '3d') {
        let   {rangeX, rangeY, rangeZ, aspectratio, aspectmode, zaxis_title} = grid.a3dAxesInfo;
        let newLayout = plt3d.layout;

        newLayout.scene.xaxis.range = rangeX;
        newLayout.scene.yaxis.range = rangeY;
        newLayout.scene.zaxis.range = rangeZ;
        newLayout.scene.zaxis.title = zaxis_title;
        newLayout.scene.aspectmode = aspectmode;
        newLayout.scene.aspectratio = aspectratio;
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


  return (
    <div className={styles.Graf}>{
        (mode === '3d') ?
          <Plot key={3}
            style={{ width: '100%', height: '100%' }}
            data={plt3d.data}
            layout={plt3d.layout}
            config={plt3d.config}
            useResizeHandler={true}
            onInitialized={update3d}
            onUpdate={update3d}
          /> 
          :
          <Plot key={2}
            style={{ width: '100%', height: '100%' }}
            data={plt2d.data}
            layout={plt2d.layout}
            config={plt2d.config}
            useResizeHandler={true}
            revision={revision}
            onInitialized={update2d}
            onUpdate={update2d}
          />
      }</div>
  )
}

export default Graf