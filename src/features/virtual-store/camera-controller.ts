import * as THREE from 'three';

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private container: HTMLElement;
  private productPositions: THREE.Vector3[] = [];
  private currentSection: number = 0;
  private targetPosition: THREE.Vector3;
  private targetLookAt: THREE.Vector3;
  private isAnimating: boolean = false;
  private _hasEnteredStore: boolean = false;
  private mouse: THREE.Vector2;
  private isMouseDown: boolean = false;
  private mouseSpeed: number = 0.002;

  constructor(camera: THREE.PerspectiveCamera, container: HTMLElement) {
    this.camera = camera;
    this.container = container;
    // Начальная позиция - перед входом в магазин - берем из текущей позиции камеры
    this.targetPosition = this.camera.position.clone();
    this.targetLookAt = new THREE.Vector3(0, 1, 0);
    this.mouse = new THREE.Vector2();

    this.initMouseControls();
  }

  private initMouseControls(): void {
    this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.container.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.container.addEventListener('mouseleave', this.onMouseUp.bind(this));
  }

  private onMouseDown(event: MouseEvent): void {
    this.isMouseDown = true;
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isMouseDown) return;

    const deltaX = event.clientX - this.mouse.x;
    const deltaY = event.clientY - this.mouse.y;

    // Поворот камеры вокруг цели
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(this.camera.position.clone().sub(this.targetLookAt));
    
    spherical.theta -= deltaX * this.mouseSpeed;
    spherical.phi += deltaY * this.mouseSpeed;
    
    // Ограничиваем вертикальный угол
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
    
    const newPosition = new THREE.Vector3();
    newPosition.setFromSpherical(spherical);
    newPosition.add(this.targetLookAt);
    
    this.targetPosition.copy(newPosition);

    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
  }

  private onMouseUp(): void {
    this.isMouseDown = false;
  }

  public setProductPositions(positions: THREE.Vector3[]): void {
    this.productPositions = positions;
  }

  public handleScroll(deltaY: number): void {
    if (!this._hasEnteredStore || this.isAnimating) return;

    const scrollDirection = deltaY > 0 ? 1 : -1;
    const totalSections = this.productPositions.length + 1; // +1 for overview position
    
    if (totalSections === 0) return;
    
    let newSection = this.currentSection + scrollDirection;
    
    // Циклическая навигация включая обзорную позицию
    if (newSection >= totalSections) {
      newSection = 0;
    } else if (newSection < 0) {
      newSection = totalSections - 1;
    }
    
    if (newSection !== this.currentSection) {
      this.navigateToSection(newSection);
    }
  }
  public enterStore(): void {
    if (this._hasEnteredStore) {
      console.log('Already entered store, skipping...');
      return;
    }

    console.log('CameraController: Starting enter store animation');
    console.log('Current camera position:', this.camera.position);

    this._hasEnteredStore = true;
    this.isAnimating = true;
    this.currentSection = 0;

    const entrancePosition = new THREE.Vector3(0, 2, 6);
    const entranceLookAt = new THREE.Vector3(0, 1, 0);

    console.log('Target entrance position:', entrancePosition);

    this.animateToPosition(entrancePosition, entranceLookAt, 2000, () => {
      console.log('Enter store animation complete');
      this.isAnimating = false;
      this.targetPosition.copy(entrancePosition);
      this.targetLookAt.copy(entranceLookAt);
    });
  }

  public hasEnteredStore(): boolean {
    return this._hasEnteredStore;
  }

  public exitStore(): void {
    if (!this._hasEnteredStore) return;
    
    this._hasEnteredStore = false;
    this.isAnimating = true;
    this.currentSection = 0;
    
    // Возвращаемся к начальной позиции - перед входом в магазин
    const exitPosition = new THREE.Vector3(0, 2, 12);
    const exitLookAt = new THREE.Vector3(0, 1, 0);
    
    this.animateToPosition(exitPosition, exitLookAt, 2000, () => {
      this.isAnimating = false;
    });
  }
  public navigateToSection(sectionIndex: number): void {
    if (!this._hasEnteredStore) return;
    
    const totalSections = this.productPositions.length + 1; // +1 for overview
    if (sectionIndex === this.currentSection || sectionIndex < 0 || sectionIndex >= totalSections) return;
    
    // Предотвращаем навигацию во время анимации входа
    if (this.isAnimating) return;
    
    this.currentSection = sectionIndex;
    this.isAnimating = true;

    // Если это последняя секция - показываем обзорную позицию
    if (sectionIndex === this.productPositions.length) {
      const overviewPos = new THREE.Vector3(0, 1.8, 6);
      const overviewLookAt = new THREE.Vector3(0, 1, 0);
      
      this.animateToPosition(overviewPos, overviewLookAt, 1500, () => {
        this.isAnimating = false;
      });
      return;
    }
    
    const productPos = this.productPositions[sectionIndex];
    if (!productPos) {
      this.isAnimating = false;
      return;
    }
    
    const cameraDistance = 3.5;
    const cameraHeight = 1.8;
    
    const isLeftSide = productPos.x < 0;
    
    const cameraPos = new THREE.Vector3();
    if (isLeftSide) {
      cameraPos.set(productPos.x + cameraDistance, cameraHeight, productPos.z);
    } else {
      cameraPos.set(productPos.x - cameraDistance, cameraHeight, productPos.z);
    }
    
    const lookAtPos = new THREE.Vector3().copy(productPos);
    lookAtPos.y = 1;
    
    this.animateToPosition(cameraPos, lookAtPos, 1000, () => {
      this.isAnimating = false;
    });
  }

  private animateToPosition(targetPos: THREE.Vector3, targetLookAt: THREE.Vector3, duration: number = 1200, onComplete?: () => void): void {
    const startPosition = this.camera.position.clone();
    const startLookAt = this.targetLookAt.clone();
    
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Используем easing функцию для плавной анимации
      const easeProgress = this.easeInOutCubic(progress);
      
      // Интерполируем позицию камеры
      this.targetPosition.lerpVectors(startPosition, targetPos, easeProgress);
      this.targetLookAt.lerpVectors(startLookAt, targetLookAt, easeProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isAnimating = false;
        if (onComplete) onComplete();
      }
    };

    animate();
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  public update(): void {
    // Плавно перемещаем камеру к целевой позиции
    this.camera.position.lerp(this.targetPosition, 0.05);
    this.camera.lookAt(this.targetLookAt);
    this.camera.updateMatrixWorld();
  }

  public dispose(): void {
    this.container.removeEventListener('mousedown', this.onMouseDown.bind(this));
    this.container.removeEventListener('mousemove', this.onMouseMove.bind(this));
    this.container.removeEventListener('mouseup', this.onMouseUp.bind(this));
    this.container.removeEventListener('mouseleave', this.onMouseUp.bind(this));
  }
}