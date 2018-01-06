class WebGL_Camera{constructor(c){this.location=c.location||new UnitVector(0),this.rotation=c.rotation||new UnitVector(0)}track(c,d,f){d==void 0&&(f=c.z,d=c.y,c=c.x);var g=this.location,h=-Math.PI+Math.atan2(g.y-d,g.z-f),j=0.5*Math.PI+Math.atan2(g.z-f,g.x-c),k=0.5*Math.PI+Math.atan2(g.y-d,g.x-c);this.rotation=new Vector3D(h,j,0)}}class WebGL{constructor(c,d){this.buffers=[],this.objects=[],this.context,this.shaders,this.programInfo,this.camera=new WebGL_Camera({}),this.canvas=this.createCanvas(c,d),WEBGL_SETTINGS.WEBGL=this}createCanvas(c,d){var f=[window.innerWidth,window.innerHeight];return((null==c||c==f)&&(c=f,document.body.style.margin='0px',document.body.style.overflow='hidden'),this.canvas=document.createElement('canvas'),this.canvas.width=c[0],this.canvas.height=c[1],this.context=this.canvas.getContext('webgl'),WEBGL_SETTINGS.RATIO=this.canvas.width/this.canvas.height,!this.context)?void console.error('WebGL could not be initialized...'):(null==d?document.body.appendChild(this.canvas):d.appendChild(this.canvas),addEventListener('keydown',InputHandler.registerKey),addEventListener('keyup',InputHandler.registerKey),this.canvas)}addObject(c,d,f){var g={};return g.x=c[0],g.y=c[1],g.z=c[2],g.buffers=d,g.texture=f,g.rotation=new Vector3D(0,0,0),g.location=new Vector3D(g.x,g.y,g.z),this.objects.push(g),g}addBuffer(c,d){this.buffers.push(this.getBuffer(c,d))}getBuffer(c,d){var f=this.context,g={},h=f.createBuffer();if('array'==d.type||null==d.type){f.bindBuffer(f.ARRAY_BUFFER,h),f.bufferData(f.ARRAY_BUFFER,new Float32Array(c),f.STATIC_DRAW);var j=f.FLOAT}else if('element'==d.type){f.bindBuffer(f.ELEMENT_ARRAY_BUFFER,h),f.bufferData(f.ELEMENT_ARRAY_BUFFER,new Uint16Array(c),f.STATIC_DRAW);var j=f.UNSIGNED_SHORT}return g.buffer=h,g.name=d.name,g.cols=d.cols,g.type=j,g.normalize=d.normalize||!1,g.stride=d.stride||0,g.offset=d.offset||0,g}addShaderProgram(c){var d=c.vertex,f=c.fragment,g=this.context,h={},j=Loader.loadShader(g,g.VERTEX_SHADER,d),k=Loader.loadShader(g,g.FRAGMENT_SHADER,f),l=g.createProgram();return g.attachShader(l,j),g.attachShader(l,k),g.linkProgram(l),g.deleteShader(j),g.deleteShader(k),g.getProgramParameter(l,g.LINK_STATUS)?void(h.program=l,h.v_shader=j,h.f_shader=k,this.shaders=h,this.setProgramInfo(c)):void console.error('The shaderprogram could not be loaded.\n'+g.getProgramInfoLog(l))}setProgramInfo(c){var d=c.attribs,f=c.uniforms,g=this.shaders.program,h={program:g,attribLocations:{},uniformLocations:{}};for(var j in d)h.attribLocations[WebGL.toPropertyName(d[j],'a')]=this.context.getAttribLocation(g,d[j]);for(var k in f)h.uniformLocations[WebGL.toPropertyName(f[k],'u')]=this.context.getUniformLocation(g,f[k]);this.programInfo=h}useShader(c){this.addShaderProgram(c)}static toPropertyName(c,d){return c.replace(d,'').charAt(0).toLowerCase()+c.slice(2)}}window.countFPS=function(){var c=new Date().getMilliseconds(),d=1,f=0;return function(){var g=new Date().getMilliseconds();return c>g?(f=d,d=1):d+=1,c=g,f}}();class Geometry{constructor(c,d){this.location=c.location||new UnitVector(0),this.rotation=c.rotation||new UnitVector(0),this.dimensions=c.dimensions||new UnitVector(1),this.shininess=c.shininess||0,this.transformations={location:this.location,rotation:this.rotation,scale:this.dimensions},'object'==typeof d?(this.geometry=d,this.vertexCount=this.geometry.indices.length):(this.geometry=Geometry.getGeometry(d),this.vertexCount=this.geometry.vertices.length/2),c.texture!=void 0&&this.bindTexture(c.texture),this.createBuffers()}translate(c,d,f){var g=void 0==d?new UnitVector(c):new Vector3D(c,d,f);this.transformations.location.equals(g)||(this.transformations.location=g)}rotate(c,d,f){var g=void 0==d?new UnitVector(c):new Vector3D(c,d,f);this.transformations.rotation.equals(g)||(this.rotation=g)}scale(c,d,f){var g;if(g=void 0==d?new UnitVector(c):new Vector3D(c,d,f),!this.transformations.scale.equals(g)){this.transformations.scale=g;for(var h=JSON.parse(JSON.stringify(this.geometry)),j=0;j<this.geometry.vertices.length;j+=3)h.vertices[j+0]*=this.transformations.scale.x,h.vertices[j+1]*=this.transformations.scale.y,h.vertices[j+2]*=this.transformations.scale.z;this.updateVertexBuffer(h.vertices)}}updateVertexBuffer(c){this.buffers.push(webGL.getBuffer(c,{name:'vertexPosition',cols:3}))}createBuffers(){this.buffers=[],this.updateVertexBuffer(this.geometry.vertices),null!=webGL.programInfo.attribLocations.vertexNormal&&this.buffers.push(webGL.getBuffer(this.geometry.normals,{name:'VertexNormal',cols:3})),null!=webGL.programInfo.attribLocations.textureCoord&&this.buffers.push(webGL.getBuffer(this.geometry.textures,{name:'textureCoord',cols:2})),this.buffers.push(webGL.getBuffer(this.geometry.indices,{name:'indices',cols:6,type:'element'}))}bindTexture(c){this.texture=c}render(){var c=WEBGL_SETTINGS.WEBGL.context;Renderer.createMatrices(this),c.activeTexture(c.TEXTURE0),c.bindTexture(c.TEXTURE_2D,this.texture),c.uniform1i(WEBGL_SETTINGS.WEBGL.programInfo.uniformLocations.sampler,0);var d=c.UNSIGNED_SHORT;c.drawElements(c.TRIANGLES,this.vertexCount,d,0)}static getGeometry(c){return JSON.parse(JSON.stringify(geometry))[c]}static drawBox(c){var d=new Box(c);d.bindTexture(c.texture),d.render()}static drawPyramid(c){var d=new Pyramid(c);d.bindTexture(c.texture),d.render()}static drawExperiment(c){var d=new Experiment(c);d.bindTexture(c.texture),d.render()}static drawPlane(c){var d=new Plane(c);d.bindTexture(c.texture),d.render()}}class Box extends Geometry{constructor(c){super(c,'BOX')}}class Pyramid extends Geometry{constructor(c){super(c,'PYRAMID')}}class Experiment extends Geometry{constructor(c){super(c,'EXPERIMENT')}}class Plane extends Geometry{constructor(c){null==c.dimensions?c.dimensions=new Vector3D(1,1,0):c.dimensions.z=0,super(c,'BOX')}}class Custom extends Geometry {constructor(modelData, data) {super(data, modelData);}}var keysDown=[];class InputHandler{constructor(){}static registerKey(c){var d=c.keyCode;-1==keysDown.indexOf(d)?keysDown.push(d):keysDown.splice(keysDown.indexOf(d),1)}static isDown(c){return-1!=keysDown.indexOf(c)}}class Lighting{constructor(c,d){this.uNames=c,this.values=d}render(){for(var c in this.uNames)WEBGL_SETTINGS.WEBGL.context.uniform3f(WEBGL_SETTINGS.WEBGL.programInfo.uniformLocations[this.uNames[c]],this.values[c].x,this.values[c].y,this.values[c].z)}static AmbientLight(c){var d=new AmbientLight(c);d.render()}static PointLight(c,d,f){var g=new PointLight(c,d,f);g.render()}static DirectionalLight(c,d,f){var g=new DirectionalLight(c,d,f);g.render()}}function toColorVector(c){if(c instanceof Vector3D)return c;if('string'==typeof c){if(c.split('#').join('')!=c){var d=c.substring(1),f=2*d.length/6,g=1==f?15:255,h=new Vector3D;return h.x=parseInt(d.substr(0,f),16)/g,h.y=parseInt(d.substr(f,f),16)/g,h.z=parseInt(d.substr(2*f,f),16)/g,h}if(c.split('rgb').join('')!=c){var j=c.split('rgb(').join('').split(')').join('').split(','),h=new Vector3D;return h.x=parseInt(j[0])/255,h.y=parseInt(j[1])/255,h.z=parseInt(j[2])/255,h}return new UnitVector(0)}return new UnitVector(0)}class AmbientLight extends Lighting{constructor(c){super(['ambientLight'],[toColorVector(c)])}}class PointLight extends Lighting{constructor(c,d,f){super(['pointLightDiffuseColor','pointLightSpecColor','pointLightVector'],[toColorVector(c),toColorVector(d),f])}}class DirectionalLight extends Lighting{constructor(c,d,f){super(['directionalLightDiffuseColor','directionalLightSpecColor','directionalLightVector'],[toColorVector(c),toColorVector(d),f])}}class Loader{constructor(){}static loadFromOBJ(c){var d=new FileReader;d.onload=function(){var f=d.result;console.log(f)},d.readAsText(new File(c))}static loadTexture(c){var d=WEBGL_SETTINGS.WEBGL.context,f=d.createTexture();d.bindTexture(d.TEXTURE_2D,f);var g=0,h=d.RGBA,m=d.RGBA,n=d.UNSIGNED_BYTE,o=new Uint8Array([0,0,0,0]);d.texImage2D(d.TEXTURE_2D,g,h,1,1,0,m,n,o);var p=new Image;return p.onload=function(){d.bindTexture(d.TEXTURE_2D,f),d.pixelStorei(d.UNPACK_FLIP_Y_WEBGL,!0),d.texImage2D(d.TEXTURE_2D,g,h,m,n,p),Loader.isPowerOf2(p.width)&&Loader.isPowerOf2(p.height)?d.generateMipmap(d.TEXTURE_2D):(d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_S,d.CLAMP_TO_EDGE),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_T,d.CLAMP_TO_EDGE),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_MIN_FILTER,d.LINEAR_MIPMAP_NEAREST),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_MAG_FILTER,d.LINEAR))},p.crossOrigin='anonymous',p.src=c,f}static loadShader(c,d,f){var g=c.createShader(d);return c.shaderSource(g,f),c.compileShader(g),c.getShaderParameter(g,c.COMPILE_STATUS)?g:(console.error('The shader could not be loaded.\n'+c.getShaderInfoLog(g)),void c.deleteShader(g))}static loadModel(c){var d,f=new XMLHttpRequest;return f.open('GET',c,!1),f.onreadystatechange=function(){4===f.readyState&&(200===f.status||0==f.status)&&(d=f.responseText)},f.send(null),Loader.handleObj(d)}static handleObj(c){var d=c.replace(/\t/g,'');d=c.split('\n');var f=[],g=[],h=[],j=[],k,l,m,n;try{for(var o of d)if(o.startsWith('v '))f.push({x:parseFloat(o.getWord(1)),y:parseFloat(o.getWord(2)),z:parseFloat(o.getWord(3))});else if(o.startsWith('vt '))h.push({x:parseFloat(o.getWord(1)),y:parseFloat(o.getWord(2))});else if(o.startsWith('vn '))g.push({x:parseFloat(o.getWord(1)),y:parseFloat(o.getWord(2)),z:parseFloat(o.getWord(3))});else if(o.startsWith('f ')){m=Array(2*f.length),l=Array(3*f.length);break}for(var o of d)if(o.startsWith('f ')){var p=o.split(' '),q=p[1].split('/'),r=p[2].split('/'),s=p[3].split('/');Loader.processVertex(q,j,h,g,m,l),Loader.processVertex(r,j,h,g,m,l),Loader.processVertex(s,j,h,g,m,l)}}catch(A){console.error('Failed to load OBJ-file.'+A)}var k=Array(3*f.length),n=Array(j.length),t=0;for(var v of f)k[t++]=v.x,k[t++]=v.y,k[t++]=v.z;for(var w=0;w<j.length;w++)n[w]=j[w];return{vertices:k,normals:l,textures:m,indices:n}}static processVertex(c,d,f,g,h,j){var k=parseInt(c[0])-1;if(d.push(k),0<f.length){var l=f[parseInt(c[1])-1];h[2*k]=l.x,h[2*k+1]=l.y}var m=g[parseInt(c[2])-1];j[3*k]=m.x,j[3*k+1]=m.y,j[3*k+2]=m.z}static isPowerOf2(c){return 0==(c&c-1)}}function HttpClient(){this.get=function(c,d){var f=new XMLHttpRequest;f.onreadystatechange=function(){4==f.readyState&&200==f.status&&d(f.responseText)},f.open('GET',c,!0),f.send(null)}}String.prototype.startsWith=function(c){for(var d=0;d<c.length;d++)if(this[d]!=c[d])return!1;return!0},String.prototype.getWord=function(c){var d=this.split(' ');return d[c]};class Renderer{constructor(){}static clearCanvas(r=0,g=0,b=0,a=1){var c=WEBGL_SETTINGS.WEBGL.context;c.clearColor(r,g,b,a),c.clearDepth(1),c.enable(c.DEPTH_TEST),c.depthFunc(c.LEQUAL),c.clear(c.COLOR_BUFFER_BIT|c.DEPTH_BUFFER_BIT)}static createMatrices(c){var d=WEBGL_SETTINGS.WEBGL;WEBGL_SETTINGS.WEBGL.context.uniform1f(WEBGL_SETTINGS.WEBGL.programInfo.uniformLocations.shininess,c.shininess);var f=mat4.create();mat4.perspective(f,WEBGL_SETTINGS.FOV,WEBGL_SETTINGS.RATIO,WEBGL_SETTINGS.NEAR,WEBGL_SETTINGS.FAR);var g=mat4.create();mat4.identity(g),mat4.rotate(g,g,-d.camera.rotation.x,[1,0,0]),mat4.rotate(g,g,d.camera.rotation.y,[0,1,0]),mat4.rotate(g,g,d.camera.rotation.z,[0,0,1]),mat4.translate(g,g,[d.camera.location.x,-d.camera.location.y,d.camera.location.z]),mat4.translate(g,g,[d.camera.location.x+c.location.x+c.transformations.location.x,d.camera.location.y+c.location.y+c.transformations.location.y,d.camera.location.z-c.location.z-c.transformations.location.z]),mat4.rotate(g,g,c.rotation.x,[1,0,0]),mat4.rotate(g,g,c.rotation.y,[0,1,0]),mat4.rotate(g,g,c.rotation.z,[0,0,1]);var h=mat4.create();mat4.invert(h,g),mat4.transpose(h,h),Renderer.bindBuffers(d,c.buffers),d.context.useProgram(d.programInfo.program),d.context.uniformMatrix4fv(d.programInfo.uniformLocations.projectionMatrix,!1,f),d.context.uniformMatrix4fv(d.programInfo.uniformLocations.modelViewMatrix,!1,g),d.context.uniformMatrix4fv(d.programInfo.uniformLocations.normalMatrix,!1,h)}static bindBuffers(c,d){var f=c.context,g=[];for(var h in d){var j=d[h],k=j.cols,l=j.type,m=j.normalize,n=j.stride,o=j.offset;l==f.FLOAT?(f.bindBuffer(f.ARRAY_BUFFER,j.buffer),f.vertexAttribPointer(c.programInfo.attribLocations[j.name.charAt(0).toLowerCase()+j.name.slice(1)],k,l,m,n,o),f.enableVertexAttribArray(c.programInfo.attribLocations[j.name.charAt(0).toLowerCase()+j.name.slice(1)])):l==f.UNSIGNED_SHORT&&g.push(j)}for(var p in g)f.bindBuffer(f.ELEMENT_ARRAY_BUFFER,g[p].buffer)}}const WEBGL_SETTINGS={WEBGL:null,FOV:60/180*Math.PI,RATIO:0.75,NEAR:0.1,FAR:100,MAXIMUM_AMT_LIGHTS:1};geometry={BOX:{vertices:[-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1],normals:[0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0],indices:[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23],textures:[0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1]},PYRAMID:{vertices:[-1,-1,1,1,-1,1,0,1,0,0,1,0,-1,-1,-1,0,1,0,0,1,0,1,-1,-1,0,0,0,0,0,0,0,0,0,0,0,0,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,0,1,0,0,1,0,1,-1,1,-1,-1,-1,-1,-1,1,0,1,0,0,1,0],normals:[0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0],indices:[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23],textures:[0,0,1,0,0.5,1,0,0.5,1,0,1,0,0.5,1,0,0,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,1,1,1,0,1,0.5,0,0,0,0,1,0,1,1,0,1]},EXPERIMENT:{vertices:[1,-1,-1,1,-1,1,-1,-1,1,-1,-1,-1,1,1,-1,1,1,1,-1,1,1,-1,1,-1],normals:[0,-1,0,0,1,0,1,0,0,0,0,1,-1,0,0,0,0,-1],indices:[1,3,4,8,6,5,5,2,1,6,3,2,7,4,3,1,8,5,1,2,3,8,7,6,5,6,2,6,7,3,7,8,4,1,4,8]}};var SHADERS={DEFAULT:{vertex:`precision mediump float;
			 attribute vec4 aVertexPosition;

			 uniform mat4 uModelViewMatrix;
			 uniform mat4 uProjectionMatrix;

			 void main() {
			   gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
			 }`,fragment:`precision mediump float;
			 void main() {
			   gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
			 }`,attribs:['aVertexPosition'],uniforms:['uProjectionMatrix','uModelViewMatrix']},TEXTURE:{vertex:`precision mediump float;
			 attribute vec4 aVertexPosition;
			 attribute vec2 aTextureCoord;

			 uniform mat4 uModelViewMatrix;
			 uniform mat4 uProjectionMatrix;

			 varying vec2 vTextureCoord;

			 void main(void) {
			   gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
			   vTextureCoord = aTextureCoord;
			 }`,fragment:`precision mediump float;
			 varying vec2 vTextureCoord;
			 uniform sampler2D uSampler;
			 void main(void) {
			   gl_FragColor = texture2D(uSampler, vTextureCoord);
			 }`,attribs:['aVertexPosition','aTextureCoord'],uniforms:['uProjectionMatrix','uModelViewMatrix','uSampler']},PER_VERTEX_LIGHTING:{vertex:`const int maxLights 	= `+WEBGL_SETTINGS.MAXIMUM_AMT_LIGHTS+`;
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
			 }`,fragment:`precision mediump float;
			 varying vec2 vTextureCoord;
			 varying vec3 vLighting;

			 uniform sampler2D uSampler;

			 void main(void) {
			   vec4 fragmentColor = texture2D(uSampler, vTextureCoord);
			   gl_FragColor = vec4(fragmentColor.rgb * vLighting, fragmentColor.a);
			 }`,attribs:['aVertexPosition','aVertexNormal','aTextureCoord'],uniforms:['uProjectionMatrix','uModelViewMatrix','uNormalMatrix','uAmbientLight','uDirectionalLightColor','uDirectionalLightVector','uPointLightColor','uPointLightVector','uSampler']},PER_FRAGMENT_LIGHTING:{vertex:`attribute vec4 aVertexPosition;
			 attribute vec3 aVertexNormal;
			 attribute vec2 aTextureCoord;

			 uniform mat4 uModelViewMatrix;
			 uniform mat4 uProjectionMatrix;
			 uniform mat4 uNormalMatrix;

			 varying vec2 vTextureCoord;
			 varying vec4 vTransformedNormal;
			 varying vec4 vPosition;

			 void main(void) {
		       vPosition = uModelViewMatrix * aVertexPosition;
			   gl_Position = uProjectionMatrix * vPosition;
			   vTextureCoord = aTextureCoord;
			   vTransformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
			 }`,fragment:`precision mediump float;
			 varying vec2 vTextureCoord;
			 varying vec4 vTransformedNormal;
			 varying vec4 vPosition;

			 uniform float uShininess;

			 uniform vec3 uAmbientLight;

			 uniform vec3 uPointLightVector;
			 uniform vec3 uPointLightSpecColor;
			 uniform vec3 uPointLightDiffuseColor;

			 uniform vec3 uDirectionalLightVector;
			 uniform vec3 uDirectionalLightSpecColor;
			 uniform vec3 uDirectionalLightDiffuseColor;

			 uniform sampler2D uSampler;

			 void main(void) {
			   vec3 lightWeighting;

			   vec3 normal = normalize(vTransformedNormal.xyz);
			   vec3 eyeDir = normalize(-vPosition.xyz);

			   vec3 pointLightDirection 				= normalize(uPointLightVector - vPosition.xyz);
			   vec3 pointLightReflectDir 				= reflect(-pointLightDirection, normal);
			   float pointLightSpecularLightWeighting 	= pow(max(dot(pointLightReflectDir, eyeDir), 0.0), 1.0 / uShininess);
			   float pointLightDiffusedLightWeighting = max(dot(normal, pointLightDirection), 0.0);

			   vec3 directionalLightDirection 				= normalize(uDirectionalLightVector - vPosition.xyz);
			   vec3 directionalLightReflectDir 				= reflect(-directionalLightDirection, normal);
			   float directionalLightSpecularLightWeighting = pow(max(dot(directionalLightReflectDir, eyeDir), 0.0), 1.0 / uShininess);
			   float directionalLightDiffusedLightWeighting = max(dot(normal, directionalLightDirection), 0.0);

			   lightWeighting = uAmbientLight +
								uDirectionalLightSpecColor * directionalLightSpecularLightWeighting +
								uDirectionalLightDiffuseColor * directionalLightDiffusedLightWeighting +
								uPointLightSpecColor * pointLightSpecularLightWeighting +
								uPointLightDiffuseColor * pointLightDiffusedLightWeighting;

			   vec4 fragmentColor;
			   fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
			   gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a);
			 }`,attribs:['aVertexPosition','aVertexNormal','aTextureCoord'],uniforms:['uProjectionMatrix','uModelViewMatrix','uNormalMatrix','uAmbientLight','uDirectionalLightDiffuseColor','uDirectionalLightSpecColor','uDirectionalLightVector','uPointLightDiffuseColor','uPointLightSpecColor','uPointLightVector','uShininess','uSampler']}};class Vector3D{constructor(c,d,f){this.x=c,this.y=d,this.z=f}add(c){this.x+=c.x,this.y+=c.y,this.z+=c.z}sub(c){this.x-=c.x,this.y-=c.y,this.z-=c.z}div(c){this.x/=c,this.y/=c,this.z/=c}mult(c){this.x*=c,this.y*=c,this.z*=c}fastMag(){return this.x*this.x+this.y*this.y*this.z*this.z}mag(){return Math.sqrt(this.x*this.x+this.y*this.y*this.z*this.z)}normalize(){return this.div(this.mag())}equals(c){return this.x==c.x&&this.y==c.y&&this.z==c.z}copy(){return new Vector3D(this.x,this.y,this.z)}dot(c){return this.x*c.x+this.y*c.y+this.z*c.z}static add(c,d){c.x+=d.x,c.y+=d.y,c.z+=d.z}static sub(c,d){c.x-=d.x,c.y-=d.y,c.z-=d.z}static div(c,d){c.x/=d,c.y/=d,c.z/=d}static mult(c,d){c.x*=d,c.y*=d,c.z*=d}static fastMag(c){return c.x*c.x+c.y*c.y*c.z*c.z}static mag(c){return Math.sqrt(c.x*c.x+c.y*c.y*c.z*c.z)}static normalize(c){return Vector3D.div(c,Vector3D.mag(c))}static equals(c,d){return c.x==d.x&&c.y==d.y&&c.z==d.z}static copy(c){return new Vector3D(c.x,c.y,c.z)}}class UnitVector extends Vector3D{constructor(c){super(c,c,c)}}
