import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

const getFlowerScene = (engine, audio, audioData) => {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.08, 0.08, 0.08, 1);
  scene.autoClear = true

  const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 10, -20), scene);
  camera.setTarget(BABYLON.Vector3.Zero());

  const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 2;

  let flower;
  BABYLON.SceneLoader.ImportMesh(
    null,
    '/assets/flower/',
    '12974_crocus_flower_v1_l3.obj',
    scene,
    (meshes) => {
      flower = meshes[0];
      flower.rotation.x = -1 * Math.PI / 2;
      flower.position.y -= 12;
      flower.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
      flower.material.wireframe = true;
      scene.freezeActiveMeshes();
      scene.autoClearDepthAndStencil = false;
      return scene;
    },
  );

  const sparkles = new BABYLON.ParticleSystem("particles", 1000, scene);
  sparkles.particleTexture = new BABYLON.Texture("/assets/flower/flare.png", scene);
  sparkles.emitter = BABYLON.Vector3.Zero(); // the starting location
  sparkles.color1 = new BABYLON.Color4(168 / 255.0, 117 / 255, 1.0, 1.0);
  sparkles.color2 = new BABYLON.Color4(219 / 255, 120 / 255, 1, 0.8);
  sparkles.Color3 = new BABYLON.Color4(1, 1, 1, 1);
  sparkles.Color4 = new BABYLON.Color4(1, 1, 0, 1);
  sparkles.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
  sparkles.emitRate = 2000;
  sparkles.minLifeTime = 0.1;
  sparkles.maxLifeTime = 0.8;
  sparkles.minSize = 0.05;
  sparkles.maxSize = 0.4;
  sparkles.createConeEmitter(6, Math.PI / 2);
  sparkles.minEmitPower = 0.5;
  sparkles.maxEmitPower = 2;
  sparkles.updateSpeed = 0.002;
  sparkles.emitter = new BABYLON.Vector3(0, -0.5, 0.5);
  sparkles.start();

  const sampleSize = 50;
  let sum = 0;
  let avg = 0;
  let rotationSpeed = 0;
  scene.registerBeforeRender(() => {
    if (audioData.analyser && audio && !audio.paused) {
      audioData.analyser.getByteFrequencyData(audioData.signal);

      // averaging amplitude of 50 first chunk of frequencies
      // to use as reference for visual changes
      sum = 0;
      for (let i = 0; i < sampleSize; i++) {
        sum += audioData.signal[i];
      }
      avg = (sum / (sampleSize * 1.0)) / 255
      sparkles.emitRate = 2000 * avg;
      sparkles.minEmitPower = 5 * avg;
      sparkles.maxEmitPower = 20 * avg;
      sparkles.updateSpeed = 0.01 * avg;

      // Speeding down to create a smooth effect
      if (rotationSpeed < 0.002) rotationSpeed += 0.000005
      if (flower) {
        flower.rotation.y += rotationSpeed;
      }

    } else {
      if (rotationSpeed > 0) {
        if (rotationSpeed > 0) rotationSpeed -= 0.000005
        if (rotationSpeed < 0) rotationSpeed = 0;
        if (flower) {
          flower.rotation.y += rotationSpeed;
        }
      }
      sparkles.emitRate = 0;
    }
  });

  return scene;
};

export {
  getFlowerScene,
};
