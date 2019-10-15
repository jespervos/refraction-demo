import '../styles/index.scss';
import loadTexture from '~/scripts/util/texture-loader';
import loadModel from '~/scripts/util/model-loader';
import * as THREE from 'three';
import BackfaceMaterial from './backface-material';
import RefractionMaterial from './refraction-material';

class App {
	constructor() {
		this.animate = this.animate.bind(this);
		this.resize = this.resize.bind(this);

		this.vp = {
			width: window.innerWidth,
			height: window.innerHeight,
			dpr: devicePixelRatio || 1
		}

		this.setup();
	}

	async setup() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 75, this.vp.width / this.vp.height, 0.1, 1000 );
		this.orthoCamera = new THREE.OrthographicCamera( this.vp.width / - 2, this.vp.width / 2, this.vp.height / 2, this.vp.height / - 2, 1, 1000 );

		this.orthoCamera.layers.set(1);

		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.renderer.setSize( this.vp.width, this.vp.height );
		this.renderer.setPixelRatio(this.vp.dpr);
		this.renderer.autoClear = false;
		document.body.appendChild( this.renderer.domElement );

		this.envFbo = new THREE.WebGLRenderTarget(this.vp.width * this.vp.dpr, this.vp.height * this.vp.dpr)
		this.backfaceFbo = new THREE.WebGLRenderTarget(this.vp.width * this.vp.dpr, this.vp.height * this.vp.dpr)

		const tex = await loadTexture('public/texture.jpg');
		this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial({map: tex}));
		this.quad.layers.set(1);
		this.quad.scale.set(this.vp.height*2, this.vp.height, 1);
		this.scene.add(this.quad);

		this.refractionMaterial = new RefractionMaterial({
			envMap: this.envFbo.texture,
			backfaceMap: this.backfaceFbo.texture,
			resolution: [this.vp.width*this.vp.dpr, this.vp.height*this.vp.dpr]
		})

		this.backfaceMaterial = new BackfaceMaterial();

		const sphere = new THREE.SphereBufferGeometry(2, 64, 64);
		const box = new THREE.BoxBufferGeometry(2,2,2);
		this.cube = new THREE.Mesh(box, this.refractionMaterial);
		this.mesh = this.cube;

		// let {model} = await loadModel('public/Robot Girl Bust.gltf');
		// model = model.children[0];
		// model.scale.set(0.03,0.03,0.03);
		// model.rotation.x = Math.PI*-0.5;
		// model.position.y = -2;
		// this.cube = new THREE.Object3D();
		// this.cube.add(model);
		// this.mesh = model;

		let {model} = await loadModel('public/ruby xanh trong suot.gltf');
		model = model.children[0];
		model.scale.set(0.1,0.1,0.1);
		// model.rotation.x = Math.PI*-0.5;
		model.position.y = -1.5;
		this.cube = new THREE.Object3D();
		this.cube.add(model);
		this.mesh = model;

		this.scene.add(this.cube);

		this.camera.position.z = 5;
		this.orthoCamera.position.z = 5;

		window.addEventListener('resize', this.resize);

		// window.addEventListener('mousemove', e => {
		// 	console.log((e.clientX-this.vp.width*0.5)/this.vp.width)
		// 	this.cube.position.set(
		// 		(e.clientX-this.vp.width*0.5) / (this.vp.width*0.1),
		// 		(e.clientY-this.vp.height*0.5)*-1 / (this.vp.height*0.1),
		// 		0
		// 	);
		// })

		this.animate();
	}

	animate() {
		requestAnimationFrame( this.animate );

		this.renderer.setClearColor(0x000000);
		this.renderer.clear();

		this.cube.rotation.x += 0.005;
		this.cube.rotation.y += 0.005;

		// render env to fbo
		this.renderer.setRenderTarget(this.envFbo);
		this.renderer.render( this.scene, this.orthoCamera );

		// render cube backfaces to fbo
		this.mesh.material = this.backfaceMaterial;
		this.renderer.setRenderTarget(this.backfaceFbo);
		this.renderer.clearDepth();
		this.renderer.render( this.scene, this.camera );

		// render env to screen
		this.renderer.setRenderTarget(null);
		this.renderer.render( this.scene, this.orthoCamera );
		this.renderer.clearDepth();

		// render cube with refraction material to screen
		this.mesh.material = this.refractionMaterial;
		this.renderer.render( this.scene, this.camera );
	};

	resize() {
		this.vp.width = window.innerWidth;
		this.vp.height = window.innerHeight;

		this.renderer.setSize(this.vp.width, this.vp.height);
		this.envFbo.setSize(this.vp.width * this.vp.dpr, this.vp.height * this.vp.dpr);
		this.backfaceFbo.setSize(this.vp.width * this.vp.dpr, this.vp.height * this.vp.dpr);

		this.quad.scale.set(this.vp.height*2, this.vp.height, 1);

		this.cube.material.uniforms.resolution.value = [this.vp.width*this.vp.dpr, this.vp.height*this.vp.dpr];

		this.camera.aspect = this.vp.width / this.vp.height;
		this.camera.updateProjectionMatrix();

		this.orthoCamera.left = this.vp.width / - 2;
		this.orthoCamera.right = this.vp.width / 2;
		this.orthoCamera.top = this.vp.height / 2;
		this.orthoCamera.bottom = this.vp.height / - 2;
		this.orthoCamera.updateProjectionMatrix();
	}
}

const app = new App();