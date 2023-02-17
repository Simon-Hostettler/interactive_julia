const canvasElement = document.querySelector("canvas");
const angleSlider = document.getElementById("angleinput");
const angleValue = document.getElementById("rangeValue");
const iterSlider = document.getElementById("iterinput");
const rotateSwitch = document.getElementById("rotateSwitch");
const canvasContext = canvasElement.getContext("2d");
let CVS_WIDTH = canvasElement.getBoundingClientRect().width;
let CVS_HEIGHT = canvasElement.getBoundingClientRect().height;
canvasElement.width = CVS_WIDTH;
canvasElement.height = CVS_HEIGHT;
const canvasImageData = canvasContext.createImageData(CVS_WIDTH, CVS_HEIGHT);
canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

import init from "../pkg/interactive_julia.js";
let mousex;
let mousey;

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width, // relationship bitmap vs. element for x
    scaleY = canvas.height / rect.height; // relationship bitmap vs. element for y

  return {
    x: (evt.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY, // been adjusted to be relative to element
  };
}

let rustWasm;
let lastTimeStamp = 0.0;
let wasStopped = true;
let angle = 0.0;

const runWasm = async () => {
  rustWasm = await init();

  let lastFrame = null;

  const draw = () => {
    rustWasm.generate_image(iterSlider.value, CVS_WIDTH, CVS_HEIGHT, angle);
    rustWasm.iteration_points(
      iterSlider.value,
      CVS_WIDTH,
      CVS_HEIGHT,
      angle,
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
  };

  const drawAnimation = (timestamp) => {
    let deltaTime = 0.0;
    if (!wasStopped) {
      deltaTime = timestamp - lastTimeStamp;
    }
    wasStopped = false;
    lastTimeStamp = timestamp;

    draw();
    angle = (angle + (deltaTime / 20000.0) * 2.0 * Math.PI) % (2.0 * Math.PI);
    angleSlider.value = angle;
    angleValue.innerText = angle.toFixed(3);
    lastFrame = requestAnimationFrame(drawAnimation);
  };

  canvasElement.addEventListener(
    "click",
    function (evt) {
      var mousePos = getMousePos(canvasElement, evt);
      mousex = mousePos.x;
      mousey = mousePos.y;
      draw();
    },
    false
  );

  angleSlider.addEventListener(
    "input",
    function (evt) {
      angle = parseFloat(angleSlider.value);
      draw();
    },
    false
  );

  iterSlider.addEventListener(
    "input",
    function (evt) {
      draw();
    },
    false
  );

  rotateSwitch.addEventListener(
    "change",
    function (evt) {
      if (!rotateSwitch.checked) {
        cancelAnimationFrame(lastFrame);
        wasStopped = true;
      } else {
        lastFrame = requestAnimationFrame(drawAnimation);
      }
    },
    false
  );

  draw();
};

runWasm();
