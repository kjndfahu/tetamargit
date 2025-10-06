import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export class StoreEnvironment {
  private scene: THREE.Scene;
  private group: THREE.Group;
  private loader: GLTFLoader;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.loader = new GLTFLoader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.loader.setDRACOLoader(dracoLoader);
  }

  public async create(): Promise<void> {
    try {
      await this.loadCustomModel();
      this.scene.add(this.group);
    } catch (error) {
      console.error('Failed to load custom model:', error);
      throw error; // Don't fallback, show the error
    }
  }

  private async loadCustomModel(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Loading custom store model from /models/1.glb...');
      this.loader.load(
        '/models/1.glb',
        (gltf) => {
          console.log('Successfully loaded custom store model');
          
          // Add the loaded model to our group
          const model = gltf.scene;

          // Scale the model - reduced by 50%
          model.scale.setScalar(0.6);
          // Lower the model position (Y and Z)
          model.position.set(0, -3, -7.5);
          model.rotation.y = Math.PI / 2;
          
          // Enable shadows for all meshes in the model
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              // Ensure materials are properly configured
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach(material => {
                    if (material instanceof THREE.MeshStandardMaterial) {
                      material.metalness = 0.1;
                      material.roughness = 0.8;
                      material.needsUpdate = true;
                    }
                  });
                } else if (child.material instanceof THREE.MeshStandardMaterial) {
                  child.material.metalness = 0.1;
                  child.material.roughness = 0.8;
                  child.material.needsUpdate = true;
                }
              }
            }
          });
          
          this.group.add(model);
          console.log('Custom model added to scene successfully');
          resolve();
        },
        (progress) => {
          const percentage = progress.total > 0 ? (progress.loaded / progress.total * 100) : 0;
          console.log('Loading progress:', percentage.toFixed(1) + '%');
        },
        (error) => {
          console.error('Error loading GLB model:', error);
          console.error('Make sure the file /models/1.glb exists and is accessible');
          reject(error);
        }
      );
    });
  }

  private createProceduralEnvironment(): void {
    console.log('Creating fallback procedural environment');
    
    this.createFloor();
    this.createWalls();
    this.createCeiling();
    this.createShelves();
    this.createDecorations();
  }

  private createFloor(): void {
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    
    // Создаем текстуру плитки
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Рисуем плитку
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, 512, 512);
    
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 8; i++) {
      const pos = (i / 8) * 512;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, 512);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(512, pos);
      ctx.stroke();
    }
    
    const floorTexture = new THREE.CanvasTexture(canvas);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(4, 4);
    
    const floorMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xf0f0f0,
      map: floorTexture
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    
    this.group.add(floor);
  }

  private createWalls(): void {
    const wallHeight = 4;
    const wallGeometry = new THREE.PlaneGeometry(20, wallHeight);
    const wallMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xfafafa,
      side: THREE.DoubleSide
    });

    // Задняя стена
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.set(0, wallHeight / 2, -10);
    this.group.add(backWall);

    // Левая стена
    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(-10, wallHeight / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    this.group.add(leftWall);
    
    // Правая стена
    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.position.set(10, wallHeight / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    this.group.add(rightWall);
  }

  private createCeiling(): void {
    const ceilingGeometry = new THREE.PlaneGeometry(20, 20);
    const ceilingMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff
    });
    
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.y = 4;
    ceiling.rotation.x = Math.PI / 2;
    
    this.group.add(ceiling);
  }

  private createShelves(): void {
    const shelfMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    
    // Создаем полки вдоль стен
    const shelfPositions = [
      // Левая стена
      { x: -9, y: 1, z: -2, rotation: 0 },
      { x: -9, y: 1, z: 0, rotation: 0 },
      { x: -9, y: 1, z: 2, rotation: 0 },
      
      // Правая стена
      { x: 9, y: 1, z: -2, rotation: 0 },
      { x: 9, y: 1, z: 0, rotation: 0 },
      { x: 9, y: 1, z: 2, rotation: 0 },
    ];

    shelfPositions.forEach(pos => {
      const shelfGeometry = new THREE.BoxGeometry(2, 0.1, 1.5);
      const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
      shelf.position.set(pos.x, pos.y, pos.z);
      shelf.rotation.y = pos.rotation;
      shelf.castShadow = true;
      shelf.receiveShadow = true;
      
      this.group.add(shelf);
      
      // Добавляем вертикальные опоры
      const supportGeometry = new THREE.BoxGeometry(0.1, 2, 0.1);
      const support1 = new THREE.Mesh(supportGeometry, shelfMaterial);
      support1.position.set(pos.x - 0.9, 1, pos.z - 0.7);
      this.group.add(support1);
      
      const support2 = new THREE.Mesh(supportGeometry, shelfMaterial);
      support2.position.set(pos.x - 0.9, 1, pos.z + 0.7);
      this.group.add(support2);
    });
  }

  private createDecorations(): void {
    // Добавляем декоративные элементы
    
    // Вывеска магазина
    const signGeometry = new THREE.PlaneGeometry(6, 1);
    const signMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xEE4C7C,
      transparent: true,
      opacity: 0.9
    });
    
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, 3.5, -9.9);
    this.group.add(sign);
    
    // Корзины для покупок (декоративные)
    const basketGeometry = new THREE.CylinderGeometry(0.3, 0.25, 0.4, 8);
    const basketMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    
    for (let i = 0; i < 3; i++) {
      const basket = new THREE.Mesh(basketGeometry, basketMaterial);
      basket.position.set(-8 + i * 0.5, 0.2, 8);
      basket.castShadow = true;
      this.group.add(basket);
    }
  }

  public dispose(): void {
    // Очищаем все материалы и геометрии
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    
    this.scene.remove(this.group);
  }
}