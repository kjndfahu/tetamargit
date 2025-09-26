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
    if (this.isAnimating) return;

    const scrollDirection = deltaY > 0 ? 1 : -1;
    
    // Определяем новую секцию
    const sectionsCount = 5; // Фиксированное количество секций
    let newSection = this.currentSection + scrollDirection;
    
    // Ограничиваем диапазон секций
    newSection = Math.max(0, Math.min(sectionsCount - 1, newSection));
    
    if (newSection !== this.currentSection) {
      this.navigateToSection(newSection);
    }
  }

  public navigateToSection(sectionIndex: number): void {
    if (sectionIndex === this.currentSection) return;
    
    this.currentSection = sectionIndex;
    this.isAnimating = true;

    // Вычисляем позицию камеры для данной секции
    const sectionPositions = [
      // Вход в магазин
      { position: new THREE.Vector3(0, 2.5, 8), lookAt: new THREE.Vector3(0, 1.5, 0) },
      // Левая сторона
      { position: new THREE.Vector3(-6, 2.5, 0), lookAt: new THREE.Vector3(-4, 1.5, 0) },
      // Правая сторона  
      { position: new THREE.Vector3(6, 2.5, 0), lookAt: new THREE.Vector3(4, 1.5, 0) },
      // Центр магазина
      { position: new THREE.Vector3(0, 3.5, 0), lookAt: new THREE.Vector3(0, 1.5, 0) },
      // Задняя часть
      { position: new THREE.Vector3(0, 2.5, -6), lookAt: new THREE.Vector3(0, 1.5, -3) }
    ];

    const targetSection = sectionPositions[Math.min(sectionIndex, sectionPositions.length - 1)];
    
    this.animateToPosition(targetSection.position, targetSection.lookAt);
  }

  private animateToPosition(targetPos: THREE.Vector3, targetLookAt: THREE.Vector3): void {
    const startPosition = this.camera.position.clone();
    const startLookAt = this.targetLookAt.clone();
    
    const duration = 1500; // 1.5 секунды
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
    this.camera.position.lerp(this.targetPosition, 0.02);
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