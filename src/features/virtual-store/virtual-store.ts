import * as THREE from 'three';
import { Product } from '@/lib/products';
import { StoreEnvironment } from './store-environment';
import { ProductDisplay } from './product-display';
import { CameraController } from './camera-controller';
import { EventEmitter } from './event-emitter';

export class VirtualStore extends EventEmitter {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private environment: StoreEnvironment;
  private productDisplays: ProductDisplay[] = [];
  private cameraController: CameraController;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private products: Product[];
  private container: HTMLElement;
  private animationId: number | null = null;
  private hasEnteredStore: boolean = false;

  constructor(container: HTMLElement, products: Product[]) {
    super();
    this.container = container;
    this.products = products;
    this.scene = new THREE.Scene();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.initRenderer();
    this.initCamera();
    this.initLighting();
    this.initEventListeners();

    this.environment = new StoreEnvironment(this.scene);
    this.cameraController = new CameraController(this.camera, this.container);
  }

  private initRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.autoClear = true;
    this.renderer.sortObjects = true;
    
    this.container.appendChild(this.renderer.domElement);
  }

  private initCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    
    // Начальная позиция камеры - перед входом в магазин
    this.camera.position.set(0, 2, 8);
    this.camera.lookAt(0, 1, 0);
  }

  private initLighting(): void {
    // Ambient light для общего освещения
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    // Directional light для теней
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    this.scene.add(directionalLight);

    // Point lights для витрин
    const pointLight1 = new THREE.PointLight(0xffffff, 0.6, 10);
    pointLight1.position.set(-3, 3, 0);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.6, 10);
    pointLight2.position.set(3, 3, 0);
    this.scene.add(pointLight2);
  }

  private initEventListeners(): void {
    // Обработка кликов мыши
    this.container.addEventListener('click', this.onMouseClick.bind(this));
    
    // Обработка изменения размера окна
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Обработка скролла для навигации по секциям
    this.container.addEventListener('wheel', this.onWheel.bind(this));
  }

  private onMouseClick(event: MouseEvent): void {
    // Ak sme ešte nevošli do obchodu, spustíme vstup
    if (!this.hasEnteredStore) {
      console.log('Clicking to enter store...');
      this.enterStore();
      return;
    }

    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Проверяем пересечения с продуктами
    const intersectableObjects: THREE.Object3D[] = [];
    this.productDisplays.forEach(display => {
      intersectableObjects.push(...display.getInteractableObjects());
    });

    const intersects = this.raycaster.intersectObjects(intersectableObjects, true);
    
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      const productDisplay = this.productDisplays.find(display => 
        display.getInteractableObjects().includes(clickedObject)
      );
      
      if (productDisplay) {
        this.emit('productClick', productDisplay.getProduct());
      }
    }
  }

  private onWindowResize(): void {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  private onWheel(event: WheelEvent): void {
    event.preventDefault();
    if (!this.hasEnteredStore) {
      return;
    }
    this.cameraController.handleScroll(event.deltaY);
  }

  public async init(): Promise<void> {
    try {
      // Создаем окружение магазина
      await this.environment.create();
      
      // Создаем витрины с продуктами
      await this.createProductDisplays();
      
      // Настраиваем контроллер камеры
      this.cameraController.setProductPositions(
        this.productDisplays.map(display => display.getPosition())
      );
      
      // Запускаем анимационный цикл
      this.animate();
      
      // Небольшая задержка перед завершением загрузки
      setTimeout(() => {
        this.emit('loadingComplete');
      }, 500);
    } catch (error) {
      console.error('Error initializing virtual store:', error);
      this.emit('loadingComplete'); // Завершаем загрузку даже при ошибке
    }
  }

  private async createProductDisplays(): Promise<void> {
    const positions = [
      // Левая сторона (3 продукта)
      { x: -6, y: 0, z: -3 },
      { x: -6, y: 0, z: 0 },
      { x: -6, y: 0, z: 3 },
      
      // Правая сторона (3 продукта)
      { x: 6, y: 0, z: -3 },
      { x: 6, y: 0, z: 0 },
      { x: 6, y: 0, z: 3 }
    ];

    // Используем только первые 6 продуктов и позиций
    const maxProducts = Math.min(6, this.products.length, positions.length);
    
    for (let i = 0; i < maxProducts; i++) {
      const product = this.products[i];
      const position = positions[i];
      
      const productDisplay = new ProductDisplay(product, position);
      await productDisplay.create();
      
      this.scene.add(productDisplay.getGroup());
      this.productDisplays.push(productDisplay);
    }
    
  }

  public hasUserEnteredStore(): boolean {
    return this.hasEnteredStore;
  }

  public navigateToSection(sectionIndex: number): void {
    this.cameraController.navigateToSection(sectionIndex);
    this.emit('sectionChange', sectionIndex);
  }

  public enterStore(): void {
    if (this.hasEnteredStore) return;
    
    console.log('Entering store...');
    this.hasEnteredStore = true;
    this.cameraController.enterStore();
    setTimeout(() => {
      console.log('Store entered successfully');
      this.emit('storeEntered');
    }, 500);
  }

  public exitStore(): void {
    if (!this.hasEnteredStore) return;
    
    console.log('Exiting store...');
    this.hasEnteredStore = false;
    this.cameraController.exitStore();
    setTimeout(() => {
      console.log('Store exited successfully');
      this.emit('exitStore');
    }, 500);
  }
  private animate(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
    
    // Обновляем контроллер камеры
    this.cameraController.update();
    
    // Обновляем анимации продуктов
    this.productDisplays.forEach(display => display.update());
    
    // Очищаем буферы перед рендерингом
    this.renderer.clear();
    
    // Рендерим сцену
    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Очищаем ресурсы
    this.productDisplays.forEach(display => display.dispose());
    this.environment.dispose();
    this.cameraController.dispose();
    
    // Удаляем обработчики событий
    this.removeAllListeners();
    
    // Очищаем renderer
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
    
    // Очищаем сцену
    this.scene.clear();
  }
}