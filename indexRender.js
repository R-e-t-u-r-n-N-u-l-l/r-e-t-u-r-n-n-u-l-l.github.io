var offset 	= 0;
var delta   = 0.005;
var model;
// ratio : height / width
var ratio   = 3 / 4;

function initWebGL() {
  var gl = new WebGL([getWidth(), getWidth() * ratio], document.querySelector('#canvas_container'));

  var texture   = Loader.loadTexture('assets/randomNoise.png');
  var modelData = Loader.loadModel('assets/returnnull.obj');

  model = new Model(modelData, {texture: texture, shininess: 0.7, location: new Vector3D(0, 0, 4)});

  new PointLight('#3b3', '#2d2', new Vector3D(0, -5, -15));

  Renderer.startRendering('render');
}

function render() {
  model.rotate(0, offset, 0);
  model.moveTo(0, Math.sin(offset) / 2, 4);
  model.render();

  offset += delta;
}


function getWidth() {
  var container = document.querySelector('#canvas_container');
  return parseInt(container.getBoundingClientRect().width);
}

function resizeWebGL() {
  webGL.canvas.width  = getWidth();
  webGL.canvas.height = getWidth() * ratio;
  webGL.context.viewport(0, 0, webGL.canvas.width, webGL.canvas.height);
  WEBGL_SETTINGS.RATIO = getWidth() / getWidth();
}

window.onresize = resizeWebGL;
