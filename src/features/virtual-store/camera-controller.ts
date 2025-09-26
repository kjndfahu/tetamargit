import * as THREE from 'three';

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private container: HTMLElement;
  private productPositions: THREE.Vector3[] = [];
  private currentSection: number = 0;
  private targetPosition: THREE.Vector3;
  private targetLookAt: THREE.Vector3;
  private isAnimating: boolean = false;
  private mouse: THREE.Vector2;
  private isMouseDown: boolean = false;
  private mouseSpeed: number = 0.002;

  constructor(camera: THREE.PerspectiveCamera, container: HTMLElement) {
    this.camera = camera;
    this.container = container;
    this.targetPosition = camera.position.clone();
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
    // Убираем блокировку для более отзывчивой навигации

    const scrollDirection = deltaY > 0 ? 1 : -1;
    
    // Определяем новую секцию - теперь по количеству продуктов + 1 (общий вид)
    const sectionsCount = this.productPositions.length + 1;
    let newSection = this.currentSection + scrollDirection;
    
    // Ограничиваем диапазон секций
    newSection = Math.max(0, Math.min(sectionsCount - 1, newSection));
    
    if (newSection !== this.currentSection) {
      this.navigateToSection(newSection);
    }
  }

  public navigateToSection(sectionIndex: number): void {
    if (sectionIndex === this.currentSection || sectionIndex < 0 || sectionIndex >= this.productPositions.length) return;
    
    this.currentSection = sectionIndex;
    this.isAnimating = true;

    // Все секции фокусируются на конкретных продуктах
    const productIndex = sectionIndex;
    const productPos = this.productPositions[productIndex];
    
    if (!productPos) {
      console.warn(`No product position found for section ${sectionIndex}`);
      return;
    }
    
    // Позиционируем камеру перед продуктом
    const cameraDistance = 4;
    const cameraHeight = 2.5;
    
    // Определяем сторону (левая или правая) для правильного позиционирования камеры
    const isLeftSide = productPos.x < 0;
    
    // Позиция камеры - ближе к центру от продукта
    const cameraPos = new THREE.Vector3();
    if (isLeftSide) {
      // Для левых продуктов - камера справа от них
      cameraPos.set(productPos.x + cameraDistance, cameraHeight, productPos.z);
    } else {
      // Для правых продуктов - камера слева от них
      cameraPos.set(productPos.x - cameraDistance, cameraHeight, productPos.z);
    }
    
    // Смотрим на продукт
    const lookAtPos = new THREE.Vector3().copy(productPos);
    lookAtPos.y = 1.3; // Высота продукта
    
    const targetSection = { 
      position: cameraPos, 
      lookAt: lookAtPos 
    };

    this.animateToPosition(targetSection.position, targetSection.lookAt);
  }

  private animateToPosition(targetPos: THREE.Vector3, targetLookAt: THREE.Vector3): void {
    const startPosition = this.camera.position.clone();
    const startLookAt = this.targetLookAt.clone();
    
    const duration = 1200; // 1.2 секунды для более быстрой навигации
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