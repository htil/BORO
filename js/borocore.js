import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Mesh,
  MeshBasicMaterial,
  DoubleSide,
  BoxGeometry,
  CylinderGeometry,
  AmbientLight,
  Color,
} from "three";

//import { TrackballControls } from "TrackballControls";
import { OrbitControls } from "OrbitControls";

export default class BoroCore {
  constructor() {
    this.renderer = new WebGLRenderer({ antialias: true });
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    this.meshObjects = {};
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    //this.meshObjects.robot.rotation.x += 0.01;
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  init() {
    this.setRenderer(window.innerWidth, window.innerHeight);
    this.setCamera(0, 0, 1000);
    this.createFloor();
    this.createRobot(0, -5, 75);
    this.createRobot(0, -5, 0);
    this.createControls();
    this.createLights();
    this.setScene();
    this.animate(0xcccccc);
  }

  addToWorld(mesh, id) {
    this.meshObjects[id] = mesh;
    this.scene.add(mesh);
  }

  setRenderer(width, height) {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    document.getElementById("container").appendChild(this.renderer.domElement);
  }

  setScene(backgroundColor) {
    this.scene.background = new Color(backgroundColor);
  }

  setCamera(x, y, z) {
    this.camera.position.set(x, y, z);
    this.scene.add(this.camera);
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 100;
    this.controls.maxDistance = 500;
    this.controls.maxPolarAngle = Math.PI / 2;
  }

  createFloor(width = 500, height = 20, depth = 500) {
    var geometry = new BoxGeometry(width, height, depth);
    //var material = new MeshBasicMaterial({ color: 0x0000ff });

    var material = new MeshBasicMaterial({
      color: 0x00ffff,
      flatShading: true,
      onBeforeCompile: (shader) => {
        shader.fragmentShader = `${shader.fragmentShader}`.replace(
          `vec4 diffuseColor = vec4( diffuse, opacity );`,
          `
            float chCount = 10.;
            float checker = (1. / chCount);
            float actualCheckers = 2. - checker;
            float halfChecker = checker * 0.5;
            vec2 bUv = (vUv * actualCheckers) - halfChecker;
            vec2 cUv = fract((bUv) * (chCount * 0.5)) - 0.5;
            float checkerVal = clamp(step(cUv.x * cUv.y, 0.), 0.25, 1.0);
            vec3 col = vec3(checkerVal+0.5);
            vec3 color = vec3(0.0);
            vec3 colorA = vec3(0.0,0.0,1);    
            color = mix(colorA, col, 0.85);
            vec4 diffuseColor = vec4( color, opacity ) ;
            `
        );
        console.log(shader.fragmentShader);
      },
    });

    material.defines = { USE_UV: "" };

    var floor = new Mesh(geometry, material);
    floor.material.side = DoubleSide;
    //floor.rotation.x = 90;
    floor.position.set(0, -20, 0);
    this.addToWorld(floor, "floor");
  }

  createLights() {
    /*
    const dirLight1 = new DirectionalLight(0xffffff);
    dirLight1.position.set(1, 1, 1);
    this.scene.add(dirLight1);

    const dirLight2 = new DirectionalLight(0x002288);
    dirLight2.position.set(-1, -1, -1);
    this.scene.add(dirLight2);
    */

    const ambientLight = new AmbientLight(0xffffff);
    this.scene.add(ambientLight);
  }

  createRobot(x = 0, y = 0, z = 0) {
    const geometry = new CylinderGeometry(10, 10, 10, 5, 1);
    const material = new MeshBasicMaterial({ color: 0xff0000 });
    let robot = new Mesh(geometry, material);
    robot.position.set(x, y, z);
    this.addToWorld(robot, "robot");
  }
}
