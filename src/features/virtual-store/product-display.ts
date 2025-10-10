import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Product } from '@/lib/products';

export class ProductDisplay {
  private product: Product;
  private position: { x: number; y: number; z: number };
  private group: THREE.Group;
  private productMesh: THREE.Mesh | null = null;
  private labelMesh: THREE.Mesh | null = null;
  private animationMixer: THREE.AnimationMixer | null = null;
  private hoverAnimation: THREE.AnimationAction | null = null;
  private loader: GLTFLoader;
  private tableIndex: number;

  constructor(product: Product, position: { x: number; y: number; z: number }, tableIndex: number) {
    this.product = product;
    this.position = position;
    this.group = new THREE.Group();
    this.group.position.set(position.x, position.y, position.z);
    this.tableIndex = tableIndex;

    this.loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.loader.setDRACOLoader(dracoLoader);
  }

  public async create(): Promise<void> {
    await this.loadTable();
    await this.createProductModel();
    this.createLabel();
    this.createHoverEffects();
  }

  private async loadTable(): Promise<void> {
    return new Promise((resolve, reject) => {
      const tableNumber = ((this.tableIndex % 6) + 1);
      const tablePath = `/models/tables/bar_table(${tableNumber}).glb`;

      console.log(`Loading table model: ${tablePath}`);

      this.loader.load(
        tablePath,
        (gltf) => {
          const tableModel = gltf.scene;

          tableModel.scale.set(0.06, 0.06, 0.06);
          tableModel.position.set(0, 0, 0);

          tableModel.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;

              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach(material => {
                    if (material instanceof THREE.MeshStandardMaterial) {
                      material.needsUpdate = true;
                    }
                  });
                } else if (child.material instanceof THREE.MeshStandardMaterial) {
                  child.material.needsUpdate = true;
                }
              }
            }
          });

          this.group.add(tableModel);
          console.log(`Table ${tableNumber} loaded successfully`);
          resolve();
        },
        undefined,
        (error) => {
          console.error(`Error loading table ${tablePath}:`, error);
          resolve();
        }
      );
    });
  }

  private async createProductModel(): Promise<void> {
    // Создаем временную 3D модель продукта
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    // Определяем тип продукта по категории и создаем соответствующую модель
    const categoryName = this.product.category?.name?.toLowerCase() || '';
    
    if (categoryName.includes('mäso') || categoryName.includes('mäsové') || categoryName.includes('klobása')) {
      geometry = new THREE.CylinderGeometry(0.21, 0.21, 0.56, 8);
      material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    } else if (categoryName.includes('mlieko') || categoryName.includes('mliečne') || categoryName.includes('syr')) {
      geometry = new THREE.BoxGeometry(0.28, 0.42, 0.21);
      material = new THREE.MeshLambertMaterial({ color: 0xFFFFF0 });
    } else if (categoryName.includes('chlieb') || categoryName.includes('pečivo') || categoryName.includes('výpečka')) {
      geometry = new THREE.SphereGeometry(0.28, 8, 6);
      geometry.scale(1, 0.6, 1.2);
      material = new THREE.MeshLambertMaterial({ color: 0xDEB887 });
    } else if (categoryName.includes('zelenina') || categoryName.includes('ovocie')) {
      geometry = new THREE.SphereGeometry(0.245, 8, 6);
      material = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    } else if (categoryName.includes('konzervy') || categoryName.includes('džem')) {
      geometry = new THREE.CylinderGeometry(0.175, 0.175, 0.42, 8);
      material = new THREE.MeshLambertMaterial({ color: 0xFF6347 });
    } else {
      geometry = new THREE.BoxGeometry(0.35, 0.35, 0.35);
      material = new THREE.MeshLambertMaterial({ color: 0xEE4C7C });
    }

    this.productMesh = new THREE.Mesh(geometry, material);
    this.productMesh.position.y = 1.1;
    this.productMesh.castShadow = true;
    this.productMesh.receiveShadow = true;

    // Добавляем userData для идентификации при клике
    this.productMesh.userData = {
      type: 'product',
      productId: this.product.id
    };

    this.group.add(this.productMesh);
  }

  private createLabel(): void {
    const labelGeometry = new THREE.PlaneGeometry(1.2, 0.4);
    const labelMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    });

    this.labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
    
    // Определяем сторону продукта (левая или правая)
    const isLeftSide = this.position.x < 0;
    
    if (isLeftSide) {
      // Для левой стороны - табличка справа от продукта, повернута к правой стороне
      this.labelMesh.position.set(0.8, 0.8, 0);
      this.labelMesh.rotation.y = Math.PI / 2; // Поворот к центру магазина (исправлен)
    } else {
      // Для правой стороны - табличка слева от продукта, повернута к левой стороне  
      this.labelMesh.position.set(-0.8, 0.8, 0);
      this.labelMesh.rotation.y = -Math.PI / 2; // Поворот к центру магазина
    }
    
    this.group.add(this.labelMesh);

    // Добавляем рамку для таблички
    // Добавляем текст на табличку
    this.createLabelText();
  }

  private createLabelText(): void {
    // Определяем тип продукции по категории
    const categoryName = this.product.category?.name?.toLowerCase() || '';
    let labelText = 'Produkty';
    
    if (categoryName.includes('mäso') || categoryName.includes('mäsové') || categoryName.includes('klobása')) {
      labelText = 'Výrobky z mäsa';
    } else if (categoryName.includes('mlieko') || categoryName.includes('mliečne') || categoryName.includes('syr')) {
      labelText = 'Mliečne výrobky';
    } else if (categoryName.includes('chlieb') || categoryName.includes('pečivo') || categoryName.includes('výpečka')) {
      labelText = 'Pečivo a chlieb';
    } else if (categoryName.includes('zelenina') || categoryName.includes('ovocie')) {
      labelText = 'Ovocie a zelenina';
    } else if (categoryName.includes('konzervy') || categoryName.includes('džem')) {
      labelText = 'Konzervy a džemy';
    } else {
      labelText = 'Čerstvé produkty';
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    
    // Заливаем фон белым цветом
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Рисуем текст
    ctx.fillText(labelText, canvas.width / 2, canvas.height / 2);
    
    // Создаем текстуру из canvas
    const textTexture = new THREE.CanvasTexture(canvas);
    
    // Применяем текстуру к табличке
    if (this.labelMesh && this.labelMesh.material instanceof THREE.MeshLambertMaterial) {
      this.labelMesh.material.color.setHex(0xffffff);
      this.labelMesh.material.map = textTexture;
      this.labelMesh.material.needsUpdate = true;
    }
  }

  private createHoverEffects(): void {
    if (!this.productMesh) return;

    // Создаем анимацию вращения при наведении
    this.animationMixer = new THREE.AnimationMixer(this.productMesh);
    
    // Создаем keyframes для анимации
    const times = [0, 1];
    const rotationValues = [0, Math.PI * 2];
    
    const rotationTrack = new THREE.NumberKeyframeTrack(
      '.rotation[y]',
      times,
      rotationValues
    );
    
    const clip = new THREE.AnimationClip('hover', 1, [rotationTrack]);
    this.hoverAnimation = this.animationMixer.clipAction(clip);
    this.hoverAnimation.loop = THREE.LoopRepeat;
  }

  public startHoverAnimation(): void {
    if (this.hoverAnimation) {
      this.hoverAnimation.play();
    }
  }

  public stopHoverAnimation(): void {
    if (this.hoverAnimation) {
      this.hoverAnimation.stop();
    }
  }

  public update(): void {
    if (this.animationMixer) {
      this.animationMixer.update(0.016); // ~60fps
    }

    // Легкое покачивание продукта
    if (this.productMesh) {
      const time = Date.now() * 0.001;
      this.productMesh.rotation.y += 0.005;
      this.productMesh.position.y = 1.1 + Math.sin(time + this.position.x) * 0.02;
    }
  }

  public getInteractableObjects(): THREE.Object3D[] {
    return this.productMesh ? [this.productMesh] : [];
  }

  public getProduct(): Product {
    return this.product;
  }

  public getPosition(): THREE.Vector3 {
    return this.group.position.clone();
  }

  public getGroup(): THREE.Group {
    return this.group;
  }

  public dispose(): void {
    if (this.animationMixer) {
      this.animationMixer.stopAllAction();
    }

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
  }
}