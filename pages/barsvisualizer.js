

import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

const getBarsScene = (engine, audio, audioData) => {
  const scene = new BABYLON.Scene(engine);
  var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 10, -20), scene);
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.position.x -= 5;
  scene.clearColor = new BABYLON.Color3(0.08, 0.08, 0.08);
  scene.autoClear = true

  const glowMaterial = new BABYLON.StandardMaterial("glowMaterial", scene);
  glowMaterial.diffuseColor = new BABYLON.Color3(1, 0, 1);
  glowMaterial.specularColor = new BABYLON.Color3(0.5, 0.1, 0.87);
  glowMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.2, 0.8);
  glowMaterial.ambientColor = new BABYLON.Color3(0.33, 0.1, 0.83);

  const boxes = [[],[],[]];
  let r, g, b;
  const barsCount = 50;
  const start = -15;
  const spacing = 0.2;
  const end =  25 - (spacing * barsCount);
  const size = 0.2;
  new BABYLON.GlowLayer("glow", scene);
  boxes.forEach((row, idx) => {
    switch(idx) {
      case 0:
        r = 0.2, g = 0.4314, b = 1.0;
        break;
      case 1:
        r = 0.6, g = 0.2, b = 0.9;
        break;
      case 2:
        r = 0.8, g = 0.1, b = 0.8;
        break;
    }
    for (let j = 0; j < barsCount; j ++) {
      const box = BABYLON.MeshBuilder.CreateBox(`b${idx}-${j}`, {size}, scene);
      box.position.y = - 0.1;
      box.position.x += start + (size * j) + (spacing * j);
      box.position.z -= idx * (size + spacing);
      box.scaling.y = 0;
      glowMaterial.emissiveColor = new BABYLON.Color3(r, g, b);
      r -= 0.0015, g -= 0.0015, b -= 0.0015;
      box.material = glowMaterial;
      row.push(box);
      glowMaterial = glowMaterial.clone();
    }
  })


  // Code in this function will run ~60 times per second
  scene.registerBeforeRender(() => {
    if (audioData.analyser) {
      audioData.analyser.getByteFrequencyData(audioData.signal);
      for (let i = 0; i < boxes[0].length; i++) {
        boxes[0][i].scaling.y = (audioData.signal[i] / 255) * 60;
        boxes[1][i].scaling.y = (audioData.signal[i] / 255) * 40;
        boxes[2][i].scaling.y = (audioData.signal[i] / 255) * 20;
      }
    }
  });

  return scene;
};

export {
  getBarsScene,
};
