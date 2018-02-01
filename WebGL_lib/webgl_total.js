// START: SETTINGS
  const WEBGL_SETTINGS = {
  	WEBGL: null,
  	FOV: 60 / 180 * Math.PI,
  	RATIO: 0.75,
  	NEAR: 0.1,
  	FAR: 100,
  	MAXIMUM_POINT_LIGHTS: 4,
  	MAXIMUM_DIRECTIONAL_LIGHTS: 4,
  	DEFAULT_TEXTURE: null,
  	RENDER_LOOP: null,
  }
// END: SETTINGS


// START: UTILITIES
  window.countFPS = (function() {
    var lastLoop = (new Date()).getMilliseconds();
    var count = 1;
    var fps = 0;

    return function () {
      var currentLoop = (new Date()).getMilliseconds();
      if (lastLoop > currentLoop) {
        fps = count;
        count = 1;
      } else {
        count += 1;
      }
      lastLoop = currentLoop;
      return fps / 2;
    };
  })();

  function lerp(a0, a1, w) {
  	return (1.0 - w) * a0 + w * a1;
  }

  Object.size = function(obj) {
      var size = 0, key;
      for (key in obj) {
          if (obj.hasOwnProperty(key)) size++;
      }
      return size;
  };

  function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
  }

  function HttpClient() {
    this.get = function(aUrl, aCallback) {
      var anHttpRequest = new XMLHttpRequest();
      anHttpRequest.onreadystatechange = function() {
        if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200) {
          aCallback(anHttpRequest.responseText);
        }
      }
      anHttpRequest.open( "GET", aUrl, true );
      anHttpRequest.send( null );
    }
  }

  String.prototype.startsWith = function(chars) {
    for(var i = 0; i < chars.length; i++) {
      if(this[i] != chars[i]) {
        return false;
      }
    }
    return true;
  }

  String.prototype.getWord = function(index) {
    var temp = this.split(' ');
    return temp[index];
  }

  function generateIDFromVectorArray(array) {
  	var id = '';
  	for(var vec of array) {
  		id += vec.x;
  		id += vec.y;
  		id += vec.z;
  	}

  	return id;
  }

  function toColorVector(color) {
  	if(color instanceof Vector3D) {
  		return color;
  	}

  	if(typeof color == 'string') {
  		if(color.split('#').join('') != color) {
  			// HEX COLOR CODE
  			var colorCode 	= color.substring(1);
  			var length		= colorCode.length * 2 / 6;
  			var division	= (length == 1 ? 15 : 255);
  			var vector 		= new Vector3D();
  				vector.x 	= parseInt(colorCode.substr(0, length), 			16) / division;
  				vector.y 	= parseInt(colorCode.substr(length, length), 		16) / division;
  				vector.z 	= parseInt(colorCode.substr(length * 2, length), 	16) / division;

  			return vector
  		}
  		else if(color.split('rgb').join('') != color) {
  			// RGB COLOR CODE
  			var colorCodes 	= color.split('rgb(').join('').split(')').join('').split(',');
  			var vector 		= new Vector3D();
  				vector.x 	= parseInt(colorCodes[0]) / 255;
  				vector.y 	= parseInt(colorCodes[1]) / 255;
  				vector.z 	= parseInt(colorCodes[2]) / 255;

  			return vector;
  		}
  		else
  			return new UnitVector(0);
  	}
  	return new UnitVector(0);
  }
// END: UTILITIES


// START: MAIN
  class WebGL {
  	constructor(dimensions, parent) {
  		this.buffers 	= [];
  		this.objects 	= [];
  		this.context;
  		this.shaders;
  		this.programInfo;

  		this.camera = new WebGL_Camera({location: new Vector3D(0, 0, -8)});
  		this.canvas = this.createCanvas(dimensions, parent);

  		this.LIGHTING 		= new Lighting();
  		this.INPUTHANDLER 	= new InputHandler();
  		this.VERTEXDRAWING 	= new VertexDrawing();

  		WEBGL_SETTINGS.WEBGL = this;
  		WEBGL_SETTINGS.DEFAULT_TEXTURE = Loader.loadTexture('Images/staticColor.png');

  		this.useShader(SHADERS.DEFAULT);
  	}

  	createCanvas(dimensions, parent) {
  		var screenDimensions = [window.innerWidth, window.innerHeight];

  		if(dimensions == null || dimensions == screenDimensions) {
  			dimensions = screenDimensions;
  			document.body.style.margin 		= '0px';
  			document.body.style.overflow 	= 'hidden';
  		}

  		var canvas 			= document.createElement('canvas');
  			canvas.width 	= dimensions[0];
  			canvas.height = dimensions[1];
  		  this.context	= canvas.getContext('webgl2') || canvas.getContext('experimental-webgl');

  		WEBGL_SETTINGS['RATIO'] = canvas.width / canvas.height;
  		WEBGL_SETTINGS['VERSION'] = (this.context instanceof WebGLRenderingContext ? 'webgl' : 'webgl2');

  		if(!this.context) {
  			console.error('WebGL could not be initialized...');
  			return;
  		}

  		parent == null ? document.body.appendChild(canvas) : parent.appendChild(canvas);

  		document.addEventListener('pointerlockchange', 		InputHandler.changePointerLockState, false);
  		document.addEventListener('mozpointerlockchange', 	InputHandler.changePointerLockState, false);
  		document.exitPointerLock = 	document.exitPointerLock ||
  									document.mozExitPointerLock;

  		return canvas;
  	}

  	addObject(coords, buffers, texture) {
  		var object 			= {};
  		object['x'] 		= coords[0];
  		object['y'] 		= coords[1];
  		object['z'] 		= coords[2];
  		object['buffers'] 	= buffers;
  		object['texture'] 	= texture;
  		object['rotation']	= new Vector3D(0, 0, 0);
  		object['location']	= new Vector3D(object['x'], object['y'], object['z']);

  		this.objects.push(object);
  		return object;
  	}

  	addBuffer(vertices, bufferData) {
  		this.buffers.push(this.getBuffer(vertices, bufferData));
  	}

  	getBuffer(vertices, bufferData) {
  		var context		= this.context;
  		var bufferOBJ 	= {};
  		var buffer 		= context.createBuffer();

  		if(bufferData['type'] == 'array' || bufferData['type'] == null) {
  			context.bindBuffer(context.ARRAY_BUFFER, buffer);
  			context.bufferData(context.ARRAY_BUFFER, new Float32Array(vertices), context.STATIC_DRAW);
  			var array_type = context.FLOAT;
  		}
  		else if(bufferData['type'] == 'element') {
  			context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, buffer);
  			context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertices), context.STATIC_DRAW);
  			var array_type = context.UNSIGNED_SHORT;
  		}

  		bufferOBJ['buffer'] 	= buffer;
  		bufferOBJ['name'] 		= bufferData['name'];
  		bufferOBJ['cols'] 		= bufferData['cols'];
  		bufferOBJ['type']		= array_type;
  		bufferOBJ['normalize']	= bufferData['normalize'] 	|| false;
  		bufferOBJ['stride']		= bufferData['stride']		|| 0;
  		bufferOBJ['offset']		= bufferData['offset']		|| 0;

  		return bufferOBJ;
  	}

  	addShaderProgram(shaderObject) {
  		var vs_Source		= shaderObject.vertex;
  		var fs_Source		= shaderObject.fragment;
  		var context			= this.context;
  		var programOBJ		= {};

  		var vertexShader 	= Loader.loadShader(context, context.VERTEX_SHADER, 	vs_Source);
  		var fragmentShader 	= Loader.loadShader(context, context.FRAGMENT_SHADER, 	fs_Source);

  		var shaderProgram 	= context.createProgram();

  		context.attachShader(shaderProgram, vertexShader);
  		context.attachShader(shaderProgram, fragmentShader);
  		context.linkProgram(shaderProgram);

  		context.deleteShader(vertexShader);
  		context.deleteShader(fragmentShader);

  		if (!context.getProgramParameter(shaderProgram, context.LINK_STATUS)) {
  			console.error('The shaderprogram could not be loaded.\n' + context.getProgramInfoLog(shaderProgram));
  			return;
  		}

  		programOBJ['program']	= shaderProgram;
  		programOBJ['v_shader']	= vertexShader;
  		programOBJ['f_shader']	= fragmentShader;

  		this.shaders = programOBJ;
  		this.setProgramInfo(shaderObject);
  	}

  	setProgramInfo(shaderObject) {
  		var attribs			= shaderObject.attribs;
  		var uniforms		= shaderObject.uniforms;
  		var shaderProgram 	= this.shaders.program;
  		var programInfo 	= { program: shaderProgram, attribLocations: {}, uniformLocations: {}};

  		for(var a in attribs) 	programInfo.attribLocations[WebGL.toPropertyName(attribs[a], 'a')] 	= this.context.getAttribLocation (shaderProgram, attribs[a]);
  		for(var u in uniforms) 	programInfo.uniformLocations[WebGL.toPropertyName(uniforms[u], 'u')]	= this.context.getUniformLocation(shaderProgram, uniforms[u]);

  		this.programInfo = programInfo;
  	}

  	useShader(shader) {
  		this.addShaderProgram(shader);
  	}

  	static toPropertyName(string, character) {
  		return string.replace(character, '').charAt(0).toLowerCase() + string.slice(2);
  	}
  }
// END: MAIN


// START: RENDERER
  class Renderer {
  	constructor() {}

  	static startRendering(funcName) {
  		Renderer.renderScene(funcName);
  		WEBGL_SETTINGS.RENDER_LOOP = window.requestAnimationFrame(function() {Renderer.renderScene(funcName)});
  	}

  	static stopRendering() {
  		window.cancelAnimationFrame(WEBGL_SETTINGS.RENDER_LOOP);
  	}

  	static renderScene(funcName) {
  		Renderer.clearCanvas();
  		WEBGL_SETTINGS.WEBGL.LIGHTING.render();
  		window[funcName]();
  		window.requestAnimationFrame(function() {Renderer.renderScene(funcName)});
  	}

  	static renderOnce(funcName) {
  		Renderer.clearCanvas();
  		WEBGL_SETTINGS.WEBGL.LIGHTING.render();
  		window[funcName]();
  	}

  	static clearCanvas() {
  		var context = WEBGL_SETTINGS.WEBGL.context;
  		context.clearColor(0.0, 0.0, 0.0, 1.0);
  		context.clearDepth(1.0);
  		context.enable(context.DEPTH_TEST);
  		context.enable(context.CULL_FACE);
  		context.depthFunc(context.LEQUAL);
  		context.cullFace(context.BACK);
  		context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
  	}

  	static createMatrices(object) {
  		var webGL = WEBGL_SETTINGS.WEBGL;

  		WEBGL_SETTINGS.WEBGL.context.uniform1f(
  				WEBGL_SETTINGS.WEBGL.programInfo.uniformLocations.shininess,
  				object.shininess
  			);

  		var projectionMatrix = mat4.create();
  		mat4.perspective(projectionMatrix,
  						 WEBGL_SETTINGS['FOV'],
  						 WEBGL_SETTINGS['RATIO'],
  						 WEBGL_SETTINGS['NEAR'],
  						 WEBGL_SETTINGS['FAR']);


  		mat4.translate(
  			projectionMatrix, projectionMatrix,
  			[	 webGL.camera.location.x,
  				-webGL.camera.location.y,
  				 webGL.camera.location.z,
  			]);


  		var modelViewMatrix = mat4.create();
  		mat4.identity(modelViewMatrix);
  		mat4.translate(modelViewMatrix, modelViewMatrix,
  			[
  				object.location.x,
  				object.location.y,
  				object.location.z,
  			]);

  		mat4.rotate(modelViewMatrix, modelViewMatrix, object.rotation.x, [1, 0, 0]);
  		mat4.rotate(modelViewMatrix, modelViewMatrix, object.rotation.y, [0, 1, 0]);
  		mat4.rotate(modelViewMatrix, modelViewMatrix, object.rotation.z, [0, 0, 1]);


  		mat4.translate(modelViewMatrix, modelViewMatrix, [webGL.camera.location.x, -webGL.camera.location.y, -webGL.camera.location.z]);
  		mat4.rotate(modelViewMatrix, modelViewMatrix, webGL.camera.rotation.x, [1, 0, 0]);
  		mat4.rotate(modelViewMatrix, modelViewMatrix, webGL.camera.rotation.y, [0, 1, 0]);
  		mat4.translate(modelViewMatrix, modelViewMatrix, [-webGL.camera.location.x, webGL.camera.location.y, webGL.camera.location.z]);


  		var normalMatrix = mat4.create();
  		mat4.invert(normalMatrix, modelViewMatrix);
  		mat4.transpose(normalMatrix, normalMatrix);


  		Renderer.bindBuffers(webGL, object.buffers);
  		webGL.context.useProgram(webGL.programInfo.program);

  		webGL.context.uniformMatrix4fv(
  				webGL.programInfo.uniformLocations.projectionMatrix,
  				false,
  				projectionMatrix);
  		webGL.context.uniformMatrix4fv(
  				webGL.programInfo.uniformLocations.modelViewMatrix,
  				false,
  				modelViewMatrix);
  		webGL.context.uniformMatrix4fv(
  				webGL.programInfo.uniformLocations.normalMatrix,
  				false,
  				normalMatrix);
  	}

  	static bindBuffers(webGL, buffers) {
  		var context = webGL.context;
  		var elements = [];
  		for(var b in buffers) {
  			var buffer 			= buffers[b];

  			var numComponents 	= buffer.cols;
  			var type 			= buffer.type;
  			var normalize 		= buffer.normalize;
  			var stride 			= buffer.stride;
  			var offset 			= buffer.offset;

  			if(type == context.FLOAT) {
  				context.bindBuffer(context.ARRAY_BUFFER, buffer.buffer);
  				context.vertexAttribPointer(
  					webGL.programInfo.attribLocations[buffer.name.charAt(0).toLowerCase() + buffer.name.slice(1)],
  					numComponents,
  					type,
  					normalize,
  					stride,
  					offset);
  				context.enableVertexAttribArray(
  					webGL.programInfo.attribLocations[buffer.name.charAt(0).toLowerCase() + buffer.name.slice(1)]);
  			}
  			else if(type == context.UNSIGNED_SHORT) {
  				elements.push(buffer);
  			}
  		}

  		for(var e in elements) {
  			context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, elements[e].buffer);
  		}
  	}
  }
// END: RENDERER


// START: CAMERA
  class WebGL_Camera {
  	constructor(data) {
  		this.location = data.location || new UnitVector(0);
  		this.rotation = data.rotation || new UnitVector(0);

  		this.updateDirections();
  	}

  	updateDirections() {
  		this.FORWARD 	= new Vector3D(-Math.sin(this.rotation.y), 0,  Math.cos(this.rotation.y));
  		this.RIGHT		= new Vector3D(-Math.cos(this.rotation.y), 0, -Math.sin(this.rotation.y))
  		this.UP			= new Vector3D(0, 1, 0);

  		this.FORWARD.normalize();
  		this.RIGHT.normalize();
  		this.UP.normalize();

  		this.BACKWARD	= Vector3D.mult(this.FORWARD.copy(), -1);
  		this.LEFT		= Vector3D.mult(this.RIGHT.copy(), -1);
  		this.DOWN		= Vector3D.mult(this.UP.copy(), -1);
  	}

  	move(x, y, z, t = 1) {
  		if(x == 0 && y == 0 && z == 0)
  			return;
  		if(y == undefined)
  			var location = new UnitVector(x);
  		else if(z == undefined)
  			var location = Vector3D.mult(y, x);
  		else
  			var location = new Vector3D(x, y, z);

  		location.mult(t);
  		this.location.add(location);
  	}
  	rotate(x, y, z, t = 1) {
  		if(x == 0 && y == 0 && z == 0)
  			return;
  		if(y == undefined)
  			var rotation = new UnitVector(x);
  		else
  			var rotation = new Vector3D(x, y, z);

  		rotation.mult(t);
  		this.rotation.add(rotation);
  		this.updateDirections();
  	}

  	moveTo(x, y, z) {
  		if(x == 0 && y == 0 && z == 0)
  			return;
  		if(y == undefined)
  			var location = new UnitVector(x);
  		else
  			var location = new Vector3D(x, y, z);

  		this.location = location.copy();
  	}
  	rotateTo(x, y, z) {
  		if(x == 0 && y == 0 && z == 0)
  			return;
  		if(y == undefined)
  			var rotation = new UnitVector(x);
  		else
  			var rotation = new Vector3D(x, y, z);

  		this.rotation = rotation.copy();
  		this.updateDirections();
  	}

  	rotateWithPointerLock(e) {
  		WEBGL_SETTINGS.WEBGL.camera.rotate(e.movementY / 1000, e.movementX / 1000, 0);
  	}
  }
// END: CAMERA


// START: GEOMETRY
  class Geometry {
  	constructor(data = {}, type) {
  		this.location 	= data['location'] 		|| new UnitVector(0);
  		this.rotation 	= data['rotation'] 		|| new UnitVector(0);
  		this.scaleFac	= data['scale'] 		|| new UnitVector(1);
  		this.shininess	= data['shininess']		|| 0.1;

  		this.buffers = [];



  		if(typeof type != 'object') {
  			this.geometry	= Geometry.getGeometry(type);
  			this.vertexCount = this.geometry.indices.length / 2;
  		}
  		else {
  			this.geometry = type;
  			this.vertexCount = this.geometry.indices.length;
  		}

  		if(data.texture == undefined)
  			this.bindTexture(WEBGL_SETTINGS.DEFAULT_TEXTURE);
  		else
  			this.bindTexture(data.texture);


  		this.createBuffers();
  	}

  	move(x, y, z) {
  		if(x == 0 && y == 0 && z == 0)
  			return;
  		if(y == undefined)
  			var location = new UnitVector(x);
  		else
  			var location = new Vector3D(x, y, z);

  		this.location.add(location);
  	}
  	rotate(x, y, z) {
  		if(x == 0 && y == 0 && z == 0)
  			return;
  		if(y == undefined)
  			var rotation = new UnitVector(x);
  		else
  			var rotation = new Vector3D(x, y, z);

  		this.rotation = rotation;
  	}
  	scale(x, y, z) {
  		if(y == undefined)
  			var scaleFac = new UnitVector(x);
  		else
  			var scaleFac = new Vector3D(x, y, z);

  		if(this.scaleFac.equals(scaleFac) || scaleFac.equals(new UnitVector(0)))
  			return;
  		else
  			this.scaleFac = scaleFac.copy();

  		this.updateVertexBuffer();
  	}

  	moveTo(x, y, z) {
  		if(x == 0 && y == 0 && z == 0)
  			return;
  		if(y == undefined)
  			var location = new UnitVector(x);
  		else
  			var location = new Vector3D(x, y, z);

  		this.location = location.copy();
  	}
  	rotateTo(x, y, z) {
  		if(x == 0 && y == 0 && z == 0)
  			return;
  		if(y == undefined)
  			var rotation = new UnitVector(x);
  		else
  			var rotation = new Vector3D(x, y, z);

  		this.rotation = rotation.copy();
  	}
  	scaleTo(x, y, z) {
  		if(x == 0 && y == 0 && z == 0)
  			return;
  		if(y == undefined)
  			var scaleFac = new UnitVector(x);
  		else
  			var scaleFac = new Vector3D(x, y, z);

  		if(this.scaleFac.equals(scaleFac))
  			return;

  		this.scaleFac = scaleFac.copy();
  		this.updateVertexBuffer();
  	}


  	updateVertexBuffer() {
  		for(var i = 0; i < this.geometry.vertices.length; i += 3) {
  			this.geometry.vertices[i + 0] *= this.scaleFac.x;
  			this.geometry.vertices[i + 1] *= this.scaleFac.y;
  			this.geometry.vertices[i + 2] *= this.scaleFac.z;
  		}
  		this.buffers.splice(0, 1);
  		this.buffers.unshift(WEBGL_SETTINGS.WEBGL.getBuffer(this.geometry.vertices, {name: 'vertexPosition', cols: 3}));
  	}

  	createBuffers() {
  		this.buffers = [];
  		this.updateVertexBuffer();

  		if(WEBGL_SETTINGS.WEBGL.programInfo.attribLocations.vertexNormal != null)
  			this.buffers.push(WEBGL_SETTINGS.WEBGL.getBuffer(this.geometry.normals, 	{name: 'VertexNormal', 		cols: 3}));

  		if(WEBGL_SETTINGS.WEBGL.programInfo.attribLocations.textureCoord != null)
  			this.buffers.push(WEBGL_SETTINGS.WEBGL.getBuffer(this.geometry.textures, 	{name: 'textureCoord', 		cols: 2}));

  		this.buffers.push(WEBGL_SETTINGS.WEBGL.getBuffer(this.geometry.indices, 		{name: 'indices', 			cols: 6, type: 'element'}));
  	}

  	bindTexture(texture) {
  		this.texture = texture;
  	}

  	render(mode = 'TRIANGLES') {
  		var context = WEBGL_SETTINGS.WEBGL.context;

  		Renderer.createMatrices(this);

  		context.activeTexture(context.TEXTURE0);
  		context.bindTexture(context.TEXTURE_2D, this.texture);
  		context.uniform1i(WEBGL_SETTINGS.WEBGL.programInfo.uniformLocations.sampler, 0);

  		var type 	= context.UNSIGNED_SHORT;
  		var offset 	= 0;
//  	context.drawElementsInstanced(context[mode], this.vertexCount, type, offset, 1);
  		context.drawElements(context[mode], this.vertexCount, type, offset, 1);
  	}
  }

  class Model extends Geometry {
  	constructor(modelData, data) {
  		super(data, modelData);
  	}
  }
// END: GEOMETRY


// START: LIGHTING
  class Lighting {
  	constructor() {
  		this.ambientLight 	= {x: 0.25, y: 0.25, z: 0.25};
  		this.pointLights 	= {};
  		this.dirLights	 	= {};

  		this.pointLightUniforms = ['pointLightDiffuseColor', 'pointLightSpecColor', 'pointLightVector', 'pointLightAttenuation'];
  		this.dirLightUniforms	= ['directionalLightDiffuseColor', 'directionalLightSpecColor', 'directionalLightVector'];
  	}

  	render() {
  	  // RENDERING THE AMBIENTLIGHT
  		WEBGL_SETTINGS.WEBGL.context.uniform3f(
  			WEBGL_SETTINGS.WEBGL.programInfo.uniformLocations['ambientLight'],
  			this.ambientLight.x,
  			this.ambientLight.y,
  			this.ambientLight.z
  		)
  	  // RENDERING THE OTHER LIGHTS
  		this.renderPointLights();
  		this.renderDirectionalLights();

  	}

  	renderPointLights() {
  		if(Object.keys(WEBGL_SETTINGS.WEBGL.LIGHTING.pointLights).length == 0)
  			return;

  		var lights = [[], [], [], []];

  		for (var property in this.pointLights) {
  			if (this.pointLights.hasOwnProperty(property)) {
  				var val = this.pointLights[property].values;
  				for(var i in val)
  					lights[i].push(val[i].x, val[i].y, val[i].z);
  			}
  		}

  		for(var i in this.pointLightUniforms) {
  			WEBGL_SETTINGS.WEBGL.context.uniform3fv(
  				WEBGL_SETTINGS.WEBGL.programInfo.uniformLocations[this.pointLightUniforms[i]],
  				lights[i]
  			)
  		}
  	}

  	renderDirectionalLights() {
  		if(Object.keys(WEBGL_SETTINGS.WEBGL.LIGHTING.dirLights).length == 0)
  			return;

  		var lights = [[], [], [], []];

  		for (var property in this.dirLights) {
  			if (this.dirLights.hasOwnProperty(property)) {
  				var val = this.dirLights[property].values;
  				for(var i in val)
  					lights[i].push(val[i].x, val[i].y, val[i].z);
  			}
  		}

  		for(var i in this.dirLightUniforms) {
  			WEBGL_SETTINGS.WEBGL.context.uniform3fv(
  				WEBGL_SETTINGS.WEBGL.programInfo.uniformLocations[this.dirLightUniforms[i]],
  				lights[i]
  			)
  		}
  	}

  	static AmbientLight(color) {
  		WEBGL_SETTINGS.WEBGL.LIGHTING.ambientLight = toColorVector(color);
  	}
  }

  class Light {
  	constructor(difColor, specColor, vector, attenuation = new Vector3D(1, 0, 0), array) {
  		var light = WEBGL_SETTINGS.WEBGL.LIGHTING;

  		vector.z *= -1;

  		this.values = [toColorVector(difColor), toColorVector(specColor), vector, attenuation];
  		this.id		= generateIDFromVectorArray(this.values);

  		if(light[array][this.id] == undefined)
  			light[array][this.id] = this;
  		else
  			return;
  	}

  	remove() {
  		delete WEBGL_SETTINGS.WEBGL.LIGHTING[array][this.id];
  	}

  	move(x, y, z) {
  		this.values[2].x += x;
  		this.values[2].y += y;
  		this.values[2].z += z;
  	}

  	setLocation(x, y, z) {
  		this.values[2].x = x;
  		this.values[2].y = y;
  		this.values[2].z = z;
  	}
  }

  class PointLight extends Light {
  	constructor(difColor, specColor, vector, attenuation) {
  		super(difColor, specColor, vector, attenuation, 'pointLights');
  	}
  }
  class DirectionalLight {
  	constructor(difColor, specColor, vector) {
  		var light = WEBGL_SETTINGS.WEBGL.LIGHTING;

  		this.values = [toColorVector(difColor), toColorVector(specColor), vector];
  		this.id		= generateIDFromVectorArray(this.values);

  		if(light.dirLights[this.id] == undefined)
  			light.dirLights[this.id] = this;
  		else
  			return;
  	}

  	remove() {
  		delete WEBGL_SETTINGS.WEBGL.LIGHTING.dirLights[this.id];
  	}
  }
// END: LIGHTING


// START: INPUTHANDLER
  class InputHandler {
  	constructor() {
  		this.io_data = {
  			keysDown: [],
  			mouse	: {x: null, y: null, coords: [], leftMouseDown: false, rightMouseDown: false, event: null},
  			pointerLock: false,
  		};
  	};

  	static enableKeyInput() {
  		addEventListener('keydown', 	InputHandler.registerKeyDown);
  		addEventListener('keyup', 		InputHandler.registerKeyUp);
  	}
  	static enableMouseInput() {
  		WEBGL_SETTINGS.WEBGL.canvas.addEventListener('click', InputHandler.requestPointerLock);
  	}


  	// KEY EVENTS
  	static registerKeyDown(e) {
  		var keysDown = WEBGL_SETTINGS.WEBGL.INPUTHANDLER.io_data.keysDown;
  		var key = e.keyCode;
  		keysDown.indexOf(key) == -1 ? keysDown.push(key) : 1;
  	}
  	static registerKeyUp(e) {
  		var keysDown = WEBGL_SETTINGS.WEBGL.INPUTHANDLER.io_data.keysDown;
  		var key = e.keyCode;
  		keysDown.indexOf(key) == -1 ? 1 : keysDown.splice(keysDown.indexOf(key), 1);
  	}

  	static isDown(key) {
  		var keysDown = WEBGL_SETTINGS.WEBGL.INPUTHANDLER.io_data.keysDown;
  		return keysDown.indexOf(key) != -1;
  	}


  	// POINTERLOCK EVENTS //
  	static requestPointerLock() {
  		var canvas = WEBGL_SETTINGS.WEBGL.canvas;
  		canvas.requestPointerLock = canvas.requestPointerLock ||
  									canvas.mozRequestPointerLock;

  		canvas.removeEventListener('click', InputHandler.requestPointerLock);
  		canvas.requestPointerLock();
  	}

  	static changePointerLockState() {
  		var canvas = WEBGL_SETTINGS.WEBGL.canvas;
  		var camera = WEBGL_SETTINGS.WEBGL.camera;

  		if(document.pointerLockElement == canvas ||
  			document.mozPointerLockElement == canvas) {
  			canvas.addEventListener("mousedown", 	InputHandler.updateMouseData, false);
  			canvas.addEventListener("mousemove", 	camera.rotateWithPointerLock, false);
  			canvas.addEventListener("mouseup", 		InputHandler.updateMouseData, false);
  		} else {
  			canvas.removeEventListener("mousedown", InputHandler.updateMouseData, false);
  			canvas.removeEventListener("mousemove", camera.rotateWithPointerLock, false);
  			canvas.removeEventListener("mouseup", 	InputHandler.updateMouseData, false);

  			InputHandler.enableMouseInput();
  		}
  	}

  	static updateMouseData(e) {
  		var IO_DATA = WEBGL_SETTINGS.WEBGL.INPUTHANDLER.io_data;
  		IO_DATA.mouse.x 		= e.movementX;
  		IO_DATA.mouse.y 		= e.movementY;
  		IO_DATA.mouse.coords 	= [e.movementX, e.movementY];
  		IO_DATA.mouse.leftMouseDown  = (e.button == 0 ? true : false);
  		IO_DATA.mouse.rightMouseDown = (e.button == 2 ? true : false);
  		IO_DATA.mouse.event = e;
  	}

  	static getMouseData() {
  		return WEBGL_SETTINGS.WEBGL.INPUTHANDLER.io_data.mouse;
  	}
  }
// END: INPUTHANDLER


// START: LOADERS
  class Loader {
  	constructor() {};

  	static loadTexture(path) {
  		var context = WEBGL_SETTINGS.WEBGL.context;
  		var texture = context.createTexture();
  		context.bindTexture(context.TEXTURE_2D, texture);

  		var level 			= 0;
  		var internalFormat 	= context.RGBA;
  		var width			= 1;
  		var height			= 1;
  		var border			= 0;
  		var sourceFormat	= context.RGBA;
  		var srcType			= context.UNSIGNED_BYTE;
  		var pixel			= new Uint8Array([0, 0, 0, 0]);
  		context.texImage2D(context.TEXTURE_2D, level, internalFormat, width, height, border, sourceFormat, srcType, pixel);

  		var image = new Image();
  		image.onload = function() {

  			context.bindTexture(context.TEXTURE_2D, texture);
  			context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, true);
  			context.texImage2D(context.TEXTURE_2D, level, internalFormat, sourceFormat, srcType, image);

  			if(isPowerOf2(image.width) && isPowerOf2(image.height)) {
  				context.generateMipmap(context.TEXTURE_2D);
  			}
  			else {
  				context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, 		context.CLAMP_TO_EDGE);
  				context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, 		context.CLAMP_TO_EDGE);
  				context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, 	context.LINEAR_MIPMAP_NEAREST);
  				context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, 	context.LINEAR);
  			}
  		}

  		image.crossOrigin = 'anonymous';
  		image.src = path;
  		return texture;
  	}

  	static loadShader(context, type, source) {
  		var shader = context.createShader(type);

  		context.shaderSource(shader, source);
  		context.compileShader(shader);

  		if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
  			console.error('The shader could not be loaded.\n' + context.getShaderInfoLog(shader));
  			context.deleteShader(shader);
  			return;
  		}

  		return shader;
  	}

  	static loadModel(path) {
  		var modelData;

  		var rawFile = new XMLHttpRequest();
  		rawFile.open("GET", path, false);
  		rawFile.onreadystatechange = function () {
  			if(rawFile.readyState === 4) {
  				if(rawFile.status === 200 || rawFile.status == 0) {
  					modelData = rawFile.responseText;
  				}
  			}
  		}
  		try {
  			rawFile.send(null);
  		} catch(err) {
  			console.error('Oops, that file doesn\'t seem to exist!');
  			return {};
  		}

  		return Loader.handleObj(modelData);
  	}

  	static handleObj(string) {
  		var objArray 	= string.replace(/\t/g, '');
  			objArray 	= string.split('\n');

  		var vertices = [];
  		var normals  = [];
  		var textures = [];
  		var indices  = [];

  		var verticesArray;
  		var normalsArray;
  		var textureArray;
  		var indicesArray;

  		try {
  			for(var line of objArray) {
  				if(line.startsWith('v ')) {
  					vertices.push({x: parseFloat(line.getWord(1)), y: parseFloat(line.getWord(2)), z: parseFloat(line.getWord(3))})
  				}
  				else if(line.startsWith('vt ')) {
  					textures.push({x: parseFloat(line.getWord(1)), y: parseFloat(line.getWord(2))});
  				}
  				else if(line.startsWith('vn ')) {
  					normals.push({x: parseFloat(line.getWord(1)), y: parseFloat(line.getWord(2)), z: parseFloat(line.getWord(3))})
  				}
  			}

  			textureArray = new Array(vertices.length * 2);
  			normalsArray = new Array(vertices.length * 3);

  			for(var line of objArray) {
  				if(!line.startsWith('f ')) {
  					continue;
  				}

  				var currentLine = line.split(' ');
  				var vertex1		= currentLine[1].split('/');
  				var vertex2		= currentLine[2].split('/');
  				var vertex3		= currentLine[3].split('/');

  				Loader.processVertex(vertex1, indices, textures, normals, textureArray, normalsArray);
  				Loader.processVertex(vertex2, indices, textures, normals, textureArray, normalsArray);
  				Loader.processVertex(vertex3, indices, textures, normals, textureArray, normalsArray);
  			}
  		} catch(err) {
  			console.error('Failed to load OBJ-file.' + err);
  		}

  		var verticesArray 	= new Array(vertices.length * 3);
  		var indicesArray	= new Array(indices.length);

  		var vertexPointer 	= 0;
  		for(var vertex of vertices) {
  			verticesArray[vertexPointer++] = vertex.x;
  			verticesArray[vertexPointer++] = vertex.y;
  			verticesArray[vertexPointer++] = vertex.z;
  		}
  		for(var i = 0; i < indices.length; i++) {
  			indicesArray[i] = indices[i];
  		}

  		return {
  			vertices	: verticesArray,
  			normals		: normalsArray,
  			textures	: textureArray,
  			indices		: indicesArray
  		};
  	}

  	static processVertex(vertexData, indices, textures, normals, textureArray, normalsArray) {
          var currentVertexPointer = parseInt(vertexData[0]) - 1;
          indices.push(currentVertexPointer);

  		if(textures.length > 0 && vertexData[1] != '') {
  			var currentTex = textures[parseInt(vertexData[1]) - 1];
  			textureArray[currentVertexPointer * 2] 		= currentTex.x;
  			textureArray[currentVertexPointer * 2 + 1] 	= currentTex.y;
  		}
          var currentNorm = normals[parseInt(vertexData[2]) - 1];
          normalsArray[currentVertexPointer * 3] 		= currentNorm.x;
          normalsArray[currentVertexPointer * 3 + 1] 	= currentNorm.y;
          normalsArray[currentVertexPointer * 3 + 2] 	= currentNorm.z;
      }


  }
// END: LOADERS


// START: VECTORS
  class Vector3D {
  	constructor(x, y, z) {
  		this.x = x;
  		this.y = y;
  		this.z = z;
  	}


  	// NON-STATIC METHODS
  	add(v2) {
  		this.x += v2.x;
  		this.y += v2.y;
  		this.z += v2.z;
  	}

  	sub(v2) {
  		this.x -= v2.x;
  		this.y -= v2.y;
  		this.z -= v2.z;
  	}

  	div(num) {
  		this.x /= num;
  		this.y /= num;
  		this.z /= num;
  	}

  	mult(num) {
  		this.x *= num;
  		this.y *= num;
  		this.z *= num;
  	}

  	fastMag() {
  		return this.x * this.x + this.y * this.y + this.z * this.z;
  	}

  	mag() {
  		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  	}

  	normalize() {
  		return this.div(this.mag());
  	}

  	equals(v2) {
  		if(this.x == v2.x && this.y == v2.y && this.z == v2.z)
  			return true;
  		return false;
  	}

  	copy() {
  		return new Vector3D(this.x, this.y, this.z);
  	}

  	dot(v2) {
  		return this.x * v2.x + this.y * v2.y + this.z * v2.z;
  	}

  	// STATIC METHODS
  	static add(v1, v2) {
  		var vec = new UnitVector(0);
  		vec.x = v1.x + v2.x;
  		vec.y = v1.y + v2.y;
  		vec.z = v1.z + v2.z;
  		return vec;
  	}

  	static sub(v1, v2) {
  		var vec = new UnitVector(0);
  		vec.x = v1.x - v2.x;
  		vec.y = v1.y - v2.y;
  		vec.z = v1.z - v2.z;
  		return vec;
  	}

  	static div(v1, num) {
  		var vec = new UnitVector(0);
  		vec.x = v1.x / num;
  		vec.y = v1.y / num;
  		vec.z = v1.z / num;
  		return vec;
  	}

  	static mult(v1, num) {
  		var vec = new UnitVector(0);
  		vec.x = v1.x * num;
  		vec.y = v1.y * num;
  		vec.z = v1.z * num;
  		return vec;
  	}

  	static fastMag(v1) {
  		return v1.x * v1.x + v1.y * v1.y * v1.z * v1.z;
  	}

  	static mag(v1) {
  		return Math.sqrt(v1.x * v1.x + v1.y * v1.y * v1.z * v1.z);
  	}

  	static normalize(v1) {
  		return Vector3D.div(v1, Vector3D.mag(v1));
  	}

  	static equals(v1, v2) {
  		return (v1.x == v2.x && v1.y == v2.y && v1.z == v2.z);
  	}

  	static copy(v1) {
  		return new Vector3D(v1.x, v1.y, v1.z);
  	}
  }


  class UnitVector extends Vector3D {
  	constructor(value) {
  		super(value, value, value);
  	}
  }
// END: VECTORS


// START: VERTEXDRAWING
  class Vertex extends Vector3D {
  	constructor(x, y, z) {
  		super(x, y, z);

  		if(WEBGL_SETTINGS.WEBGL.VERTEXDRAWING.active) {
  			WEBGL_SETTINGS.WEBGL.VERTEXDRAWING.vertices.push(this);
  		}
  	}
  }

  class VertexDrawing {
  	constructor() {
  		this.active 		= false;
  		this.vertices 		= [];
  		this.currentName 	= '';

  		this.models			= {};
  	};

  	static beginShape(name) {
  		WEBGL_SETTINGS.WEBGL.VERTEXDRAWING.vertices 	= [];
  		WEBGL_SETTINGS.WEBGL.VERTEXDRAWING.active 		= true;
  		WEBGL_SETTINGS.WEBGL.VERTEXDRAWING.currentName 	= name || '';

  	}
  	static saveShape(name) {
  		return WEBGL_SETTINGS.WEBGL.VERTEXDRAWING.models[name];
  	}
  	static endShape() {
  		WEBGL_SETTINGS.WEBGL.VERTEXDRAWING.active = false;
  		var indices		= [];
  		var vertices 	= WEBGL_SETTINGS.WEBGL.VERTEXDRAWING.vertices;
  		var data		= {
  			vertices: 	[],
  			indices: 	[],
  			normals: 	[],
  			textures: 	[],
  		};

  		for(var index = 0; index < vertices.length; index++) {
  			var v1 = vertices[index];

  			data.vertices.push(v1.x, v1.y, v1.z);
  			data.indices.push(index);

  			data.normals.push(1, 1, 1);
  			data.textures.push(1, 0, 1);
  		}

  		var model = new Model(data, {});
  		model.render();

  		if(WEBGL_SETTINGS.WEBGL.VERTEXDRAWING.currentName === '') {
  			return;
  		}

  		WEBGL_SETTINGS.WEBGL.VERTEXDRAWING.models[WEBGL_SETTINGS.WEBGL.VERTEXDRAWING.currentName] = model;
  	}
  }
// END: VERTEXDRAWING


// START: SHADERS
  var SHADERS = {
  	COLOR	: {
  		vertex 		:
  			`precision mediump float;
  			 attribute vec4 aVertexPosition;

  			 uniform mat4 uModelViewMatrix;
  			 uniform mat4 uProjectionMatrix;

  			 void main() {
  			   gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  			 }`,
  		fragment	:
  			`precision mediump float;
  			 void main() {
  			   gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  			 }`,
  		attribs		: ["aVertexPosition"],
  		uniforms	: ["uProjectionMatrix", "uModelViewMatrix"],
  	},

  	TEXTURE	: {
  		vertex 		:
  			`precision mediump float;
  			 attribute vec4 aVertexPosition;
  			 attribute vec2 aTextureCoord;

  			 uniform mat4 uModelViewMatrix;
  			 uniform mat4 uProjectionMatrix;

  			 varying vec2 vTextureCoord;

  			 void main(void) {
  			   gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  			   vTextureCoord = aTextureCoord;
  			 }`,
  		fragment	:
  			`precision mediump float;
  			 varying vec2 vTextureCoord;
  			 uniform sampler2D uSampler;
  			 void main(void) {
  			   gl_FragColor = texture2D(uSampler, vTextureCoord);
  			 }`,
  		attribs		: ["aVertexPosition", "aTextureCoord"],
  		uniforms	: ["uProjectionMatrix", "uModelViewMatrix", "uSampler"],
  	},

  	PER_VERTEX_LIGHTING : {
  		vertex		:
  			`const int maxLights 	= ` + WEBGL_SETTINGS['MAXIMUM_AMT_LIGHTS'] + `;
  			 precision mediump float;

  			 attribute vec4 aVertexPosition;
  			 attribute vec3 aVertexNormal;
  			 attribute vec2 aTextureCoord;

  			 uniform mat4 uNormalMatrix;
  			 uniform mat4 uModelViewMatrix;
  			 uniform mat4 uProjectionMatrix;

  			 uniform vec3 uAmbientLight;

  			 uniform vec3 uDirectionalLightColor[maxLights];
  			 uniform vec3 uDirectionalLightVector[maxLights];

  			 uniform vec3 uPointLightColor[maxLights];
  			 uniform vec3 uPointLightVector[maxLights];

  			 varying vec2 vTextureCoord;
  			 varying vec3 vLighting;

  			 void main(void) {
  			   vec4 vPosition						= uModelViewMatrix * aVertexPosition;
  			   gl_Position 							= uProjectionMatrix * vPosition;
  			   vTextureCoord 						= aTextureCoord;
  			   vec4 transformedNormal 				= uNormalMatrix * vec4(aVertexNormal, 1.0);

  			   for(int i = 0; i < maxLights; i++) {
  				 vec3 pointLightDirection 			= normalize(uPointLightVector[i] - vPosition.xyz);
  				 float directionalLightWeight 		= max(dot(transformedNormal.xyz, normalize(uDirectionalLightVector[i])), 0.0);
  				 float pointLightWeight		 		= max(dot(transformedNormal.xyz, normalize(pointLightDirection)), 0.0);
  				 vLighting	 					   += uAmbientLight + (uDirectionalLightColor[i] * directionalLightWeight) + (uPointLightColor[i] * pointLightWeight);
  			   }

  			   vLighting = vLighting / vec3(maxLights);
  			 }`,
  		fragment	:
  			`precision mediump float;
  			 varying vec2 vTextureCoord;
  			 varying vec3 vLighting;

  			 uniform sampler2D uSampler;

  			 void main(void) {
  			   vec4 fragmentColor = texture2D(uSampler, vTextureCoord);
  			   gl_FragColor = vec4(fragmentColor.rgb * vLighting, fragmentColor.a);
  			 }`,
  		attribs		: ["aVertexPosition", "aVertexNormal", "aTextureCoord"],
  		uniforms	: ["uProjectionMatrix", "uModelViewMatrix", "uNormalMatrix", "uAmbientLight", "uDirectionalLightColor", "uDirectionalLightVector", "uPointLightColor", "uPointLightVector", "uSampler"],
  	},

  	DEFAULT : {
  		vertex		:
  			`attribute vec4 aVertexPosition;
  			 attribute vec3 aVertexNormal;
  			 attribute vec2 aTextureCoord;

  			 uniform mat4 uModelViewMatrix;
  			 uniform mat4 uProjectionMatrix;
  			 uniform mat4 uNormalMatrix;

  			 uniform vec3 uScale;

  			 varying vec2 vTextureCoord;
  			 varying vec4 vTransformedNormal;
  			 varying vec4 vPosition;

  			 void main(void) {
  		       vPosition 			= uModelViewMatrix * aVertexPosition;
  			   gl_Position 			= uProjectionMatrix * vPosition;
  			   vTextureCoord		= aTextureCoord;
  			   vTransformedNormal 	= uNormalMatrix * vec4(aVertexNormal, 1.0);
  			 }`,
  		fragment	:
  			`const int maxPointLights 	= ` + WEBGL_SETTINGS['MAXIMUM_POINT_LIGHTS'] + `;
  			 const int maxDirLights 	= ` + WEBGL_SETTINGS['MAXIMUM_DIRECTIONAL_LIGHTS'] + `;

  			 precision mediump float;

  			 varying vec2 vTextureCoord;
  			 varying vec4 vTransformedNormal;
  			 varying vec4 vPosition;

  			 uniform float uShininess;

  			 uniform vec3 uAmbientLight;

  			 uniform vec3 uPointLightVector[maxPointLights];
  			 uniform vec3 uPointLightSpecColor[maxPointLights];
  			 uniform vec3 uPointLightDiffuseColor[maxPointLights];
  			 uniform vec3 uPointLightAttenuation[maxPointLights];

  			 uniform vec3 uDirectionalLightVector[maxDirLights];
  			 uniform vec3 uDirectionalLightSpecColor[maxDirLights];
  			 uniform vec3 uDirectionalLightDiffuseColor[maxDirLights];

  			 uniform sampler2D uSampler;

  			 void main(void) {
  			   vec3 lightWeighting;
  			   vec3 totalPointLighting;
  			   vec3 totalDirLighting;

  			   vec3 normal = normalize(vTransformedNormal.xyz);
  			   vec3 eyeDir = normalize(-vPosition.xyz);

  			   for(int i = 0; i < maxPointLights; i++) {
  				   float dist 	= length(uPointLightVector[i] - vPosition.xyz);
  				   float attFac 	= uPointLightAttenuation[i].x + uPointLightAttenuation[i].y * dist + uPointLightAttenuation[i].z * dist * dist;
  				   if(attFac == 0.0)
  				     attFac = 1.0;
  			     vec3 pointLightDirection 						= normalize(uPointLightVector[i] - vPosition.xyz);
  			     vec3 pointLightReflectDir 						= reflect(pointLightDirection, normal);
  			     float pointLightSpecularLightWeighting 		= pow(max(dot(pointLightReflectDir, eyeDir), 0.0), 1.0 / uShininess);
  			     float pointLightDiffusedLightWeighting 		= max(dot(normal, pointLightDirection), 0.0);

  				 totalPointLighting += (uPointLightSpecColor[i] * pointLightSpecularLightWeighting + uPointLightDiffuseColor[i] * pointLightDiffusedLightWeighting) / attFac;
  			   }

  			   for(int i = 0; i < maxDirLights; i++) {
  			     vec3 directionalLightDirection 					= normalize(uDirectionalLightVector[i] - vPosition.xyz);
  			     vec3 directionalLightReflectDir 					= reflect(-directionalLightDirection, normal);
  			     float directionalLightSpecularLightWeighting		= pow(max(dot(directionalLightReflectDir, eyeDir), 0.0), 1.0 / uShininess);
  			     float directionalLightDiffusedLightWeighting	 	= max(dot(normal, directionalLightDirection), 0.0);

  				 totalDirLighting += uDirectionalLightSpecColor[i] * directionalLightSpecularLightWeighting + uDirectionalLightDiffuseColor[i] * directionalLightDiffusedLightWeighting;
  			   }

  			   lightWeighting = uAmbientLight +
  								totalDirLighting +
  								totalPointLighting;

  			   vec4 fragmentColor;
  			   fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
  			   gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a);
  			 }`,
  		attribs		: ["aVertexPosition", "aVertexNormal", "aTextureCoord"],
  		uniforms	: ["uScale", "uProjectionMatrix", "uModelViewMatrix", "uNormalMatrix", "uAmbientLight", "uDirectionalLightDiffuseColor", "uDirectionalLightSpecColor", "uDirectionalLightVector", "uPointLightDiffuseColor", "uPointLightSpecColor", "uPointLightVector", "uPointLightAttenuation", "uShininess", "uSampler"],
  	},
  }
// END: SHADERS
