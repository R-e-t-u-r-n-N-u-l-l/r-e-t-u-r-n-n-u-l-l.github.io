var offset 	= 0;

// ratio : height / width
var ratio   = 9 / 16;

function initWebGL() {
  var container  = document.querySelector('#canvas_container');
  var width      = getWidth();
	webGL 		     = new WebGL([width, width * ratio], container);
  resizeWebGL();
	webGL.camera.location = new Vector3D(0, 0, -5);
	webGL.useShader(SHADERS.PER_FRAGMENT_LIGHTING);

  var texture = Loader.loadTexture('assets/randomNoise.png');
	var model 	= Loader.loadModel('assets/returnnull.obj');
		  custom  = new Custom(model, {location: new Vector3D(0, 0, 0), texture: texture, shininess: 1});

	draw();
}

function draw() {
	Renderer.clearCanvas(0, 0, 0, 0);
  Lighting.AmbientLight('#000');
	Lighting.PointLight('#2f2', '#dfd', new Vector3D(0, 0, 10))
	custom.rotate(0, offset / 1.5, 0);
	custom.scale(2, 2 / ratio, 2);
	custom.location.y = Math.sin(offset / 3);
	custom.render();
	offset += 0.03;
	requestAnimationFrame(draw);
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
