import * as THREE from 'three';
import { Product } from '@/lib/products';

export class ProductDisplay {
  private product: Product;
  private position: { x: number; y: number; z: number };
  private group: THREE.Group;
  private productMesh: THREE.Mesh | null = null;
  private labelMesh: THREE.Mesh | null = null;
  private animationMixer: THREE.AnimationMixer | null = null;
  private hoverAnimation: THREE.AnimationAction | null = null;

  constructor(product: Product, position: { x: number; y: number; z: number }) {
    this.product = product;
    this.position = position;
    this.group = new THREE.Group();
    this.group.position.set(position.x, position.y, position.z);
  }

  public async create(): Promise<void> {
    await this.createProductModel();
    this.createLabel();
    this.createHoverEffects();
  }

  private async createProductModel(): Promise<void> {
    // Создаем временную 3D модель продукта
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    // Определяем тип продукта по категории и создаем соответствующую модель
    const categoryName = this.product.category?.name?.toLowerCase() || '';
    
    if (categoryName.includes('мясо') || categoryName.includes('мясные') || categoryName.includes('колбаса')) {
      // Модель мясных изделий - цилиндр
      geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 8);
      material = new THREE.MeshLambertMaterial({ 
        color: 0x8B4513,
        transparent: true,
        opacity: 0.9
      });
    } else if (categoryName.includes('молоко') || categoryName.includes('молочные') || categoryName.includes('сыр')) {
      // Модель молочных продуктов - параллелепипед
      geometry = new THREE.BoxGeometry(0.4, 0.6, 0.3);
      material = new THREE.MeshLambertMaterial({ 
        color: 0xFFFFF0,
        transparent: true,
        opacity: 0.9
      });
    } else if (categoryName.includes('хлеб') || categoryName.includes('хлебобулочные') || categoryName.includes('выпечка')) {
      // Модель хлебобулочных изделий - овальная форма
      geometry = new THREE.SphereGeometry(0.4, 8, 6);
      geometry.scale(1, 0.6, 1.2);
      material = new THREE.MeshLambertMaterial({ 
        color: 0xDEB887,
        transparent: true,
        opacity: 0.9
      });
    } else if (categoryName.includes('овощи') || categoryName.includes('фрукты')) {
      // Модель овощей/фруктов - сфера
      geometry = new THREE.SphereGeometry(0.35, 12, 8);
      material = new THREE.MeshLambertMaterial({ 
        color: 0x228B22,
        transparent: true,
        opacity: 0.9
      });
    } else if (categoryName.includes('консервы') || categoryName.includes('варенье')) {
      // Модель консервов - цилиндр
      geometry = new THREE.CylinderGeometry(0.25, 0.25, 0.6, 12);
      material = new THREE.MeshLambertMaterial({ 
        color: 0xFF6347,
        transparent: true,
        opacity: 0.9
      });
    } else {
      // Универсальная модель - куб
      geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      material = new THREE.MeshLambertMaterial({ 
        color: 0xEE4C7C,
        transparent: true,
        opacity: 0.9
      });
    }

    this.productMesh = new THREE.Mesh(geometry, material);
    this.productMesh.position.y = 1.3; // Поднимаем над полкой
    this.productMesh.castShadow = true;
    this.productMesh.receiveShadow = true;
    
    // Добавляем userData для идентификации при клике
    this.productMesh.userData = { 
      type: 'product', 
      productId: this.product.id 
    };

    this.group.add(this.productMesh);

    // Создаем подставку/витрину
    const standGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 12);
    const standMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xC0C0C0,
      transparent: true,
      opacity: 0.7
    });
    
    const stand = new THREE.Mesh(standGeometry, standMaterial);
    stand.position.y = 1.05;
    stand.receiveShadow = true;
    
    this.group.add(stand);
  }

  private createLabel(): void {
    // Создаем табличку с названием типа продукции
    const labelGeometry = new THREE.PlaneGeometry(1.2, 0.4);
    const labelMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });

    this.labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
    
    // Определяем сторону продукта (левая или правая)
    const isLeftSide = this.position.x < 0;
    
    if (isLeftSide) {
      // Для левой стороны - табличка справа от продукта, повернута к правой стороне
      this.labelMesh.position.set(0.8, 0.8, 0);
      this.labelMesh.rotation.y = -Math.PI / 2; // Поворот к центру магазина
    } else {
      // Для правой стороны - табличка слева от продукта, повернута к левой стороне  
      this.labelMesh.position.set(-0.8, 0.8, 0);
      this.labelMesh.rotation.y = Math.PI / 2; // Поворот к центру магазина
    }
    
    this.group.add(this.labelMesh);

    // Добавляем рамку для таблички
    const frameGeometry = new THREE.PlaneGeometry(1.3, 0.5);
    const frameMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x333333,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    
    if (isLeftSide) {
      frame.position.set(0.8, 0.8, -0.01);
      frame.rotation.y = -Math.PI / 2;
    } else {
      frame.position.set(-0.8, 0.8, -0.01);
      frame.rotation.y = Math.PI / 2;
    }
    
    this.group.add(frame);
    
    // Добавляем текст на табличку
    this.createLabelText();
  }

  private createLabelText(): void {
    // Определяем тип продукции по категории
    const categoryName = this.product.category?.name?.toLowerCase() || '';
    let labelText = 'Produkty';
    
    if (categoryName.includes('мясо') || categoryName.includes('мясные') || categoryName.includes('колбаса')) {
      labelText = 'Výrobky z mäsa';
    } else if (categoryName.includes('молоко') || categoryName.includes('молочные') || categoryName.includes('сыр')) {
      labelText = 'Mliečne výrobky';
    } else if (categoryName.includes('хлеб') || categoryName.includes('хлебобулочные') || categoryName.includes('выпечка')) {
      labelText = 'Pečivo a chlieb';
    } else if (categoryName.includes('овощи') || categoryName.includes('фрукты')) {
      labelText = 'Ovocie a zelenina';
    } else if (categoryName.includes('консервы') || categoryName.includes('варенье')) {
      labelText = 'Konzervy a džemy';
    } else {
      labelText = 'Čerstvé produkty';
    }
    
    // Создаем canvas для текста
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    
    // Настройки текста
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Рисуем текст
    ctx.fillText(labelText, canvas.width / 2, canvas.height / 2);
    
    // Создаем текстуру из canvas
    const textTexture = new THREE.CanvasTexture(canvas);
    textTexture.needsUpdate = true;
    
    // Применяем текстуру к табличке
    if (this.labelMesh && this.labelMesh.material instanceof THREE.MeshLambertMaterial) {
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
      this.productMesh.position.y = 1.3 + Math.sin(time + this.position.x) * 0.02;
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