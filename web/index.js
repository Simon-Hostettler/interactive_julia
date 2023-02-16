let CVS_WIDTH = 1920;
let CVS_HEIGHT = 1080;

const canvasElement = document.querySelector("canvas");
const angleSlider = document.getElementById("angleinput");
const iterSlider = document.getElementById("iterinput");
canvasElement.width = CVS_WIDTH;
canvasElement.height = CVS_HEIGHT;
const canvasContext = canvasElement.getContext("2d");
const canvasImageData = canvasContext.createImageData(CVS_WIDTH, CVS_HEIGHT);
canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

import init from "../pkg/interactive_julia.js";
let mousex;
let mousey;

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width, // relationship bitmap vs. element for x
    scaleY = canvas.height / rect.height; // relationship bitmap vs. element for y

  console.log("scale at: ", scaleX, scaleY);
  return {
    x: (evt.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY, // been adjusted to be relative to element
  };
}

canvasElement.addEventListener(
  "click",
  function (evt) {
    var mousePos = getMousePos(canvasElement, evt);
    mousex = mousePos.x;
    mousey = mousePos.y;
    console.log("clicked at: ", mousex, mousey);
  },
  false
);

let rustWasm;

const runWasm = async () => {
  rustWasm = await init();

  const draw = (timestamp) => {
    rustWasm.generate_image(iterSlider.value, CVS_WIDTH, CVS_HEIGHT, angleSlider.value);
    rustWasm.iteration_points(
      iterSlider.value,
      CVS_WIDTH,
      CVS_HEIGHT,
      angleSlider.value,
      mousex,
      mousey
    );

    const outputPointer = rustWasm.get_output_buffer_pointer();
    const pointPointer = rustWasm.get_point_buffer_pointer();

    const wasmByteMemoryArray = new Uint8Array(rustWasm.memory.buffer);
    const wasmPointArray = new Uint32Array(
      rustWasm.memory.buffer,
      pointPointer,
      iterSlider.value * 2
    );

    const imageDataArray = wasmByteMemoryArray.slice(
      outputPointer,
      outputPointer + CVS_WIDTH * CVS_HEIGHT * 4
    );

    canvasImageData.data.set(imageDataArray);

    canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

    canvasContext.putImageData(canvasImageData, 0, 0);

    let p1x = wasmPointArray[0],
      p1y = wasmPointArray[1];

    let hue = 0;

    canvasContext.strokeStyle = "DeepPink";
    canvasContext.lineWidth = "2";
    canvasContext.beginPath();
    canvasContext.moveTo(p1x, p1y);

    for (let i = 1; i < iterSlider.value; i++) {
      p1x = wasmPointArray[2 * i];
      p1y = wasmPointArray[2 * i + 1];

      if (p1x == 0 && p1y == 0) break;

      canvasContext.lineTo(p1x, p1y);
    }
    canvasContext.stroke();

    requestAnimationFrame(draw);
  };

  requestAnimationFrame(draw);
};

runWasm();
