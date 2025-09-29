export interface ImageInfo {
  width: number;
  height: number;
  aspectRatio: number;
  size: number;
  type: string;
  src: string;
}

export interface ImageOptions {
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
  backgroundColor?: string;
}

export interface ImageTransformOptions extends ImageOptions {
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rotate?: number;
  flip?: 'horizontal' | 'vertical' | 'both';
  blur?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
}

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  // Основные методы обработки изображений
  async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      
      img.src = src;
    });
  }

  async getImageInfo(src: string): Promise<ImageInfo> {
    const img = await this.loadImage(src);
    const response = await fetch(src);
    const blob = await response.blob();
    
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      aspectRatio: img.naturalWidth / img.naturalHeight,
      size: blob.size,
      type: blob.type,
      src
    };
  }

  async resizeImage(
    src: string,
    options: ImageOptions = {}
  ): Promise<string> {
    const img = await this.loadImage(src);
    const { maxWidth, maxHeight, maintainAspectRatio = true, quality = 0.8, format = 'jpeg' } = options;

    let { width, height } = this.calculateDimensions(
      img.naturalWidth,
      img.naturalHeight,
      maxWidth,
      maxHeight,
      maintainAspectRatio
    );

    this.canvas.width = width;
    this.canvas.height = height;

    // Очищаем canvas
    this.ctx.clearRect(0, 0, width, height);

    // Рисуем изображение
    this.ctx.drawImage(img, 0, 0, width, height);

    return this.canvas.toDataURL(`image/${format}`, quality);
  }

  async cropImage(
    src: string,
    crop: { x: number; y: number; width: number; height: number },
    options: ImageOptions = {}
  ): Promise<string> {
    const img = await this.loadImage(src);
    const { quality = 0.8, format = 'jpeg' } = options;

    this.canvas.width = crop.width;
    this.canvas.height = crop.height;

    // Очищаем canvas
    this.ctx.clearRect(0, 0, crop.width, crop.height);

    // Рисуем обрезанную часть изображения
    this.ctx.drawImage(
      img,
      crop.x, crop.y, crop.width, crop.height,
      0, 0, crop.width, crop.height
    );

    return this.canvas.toDataURL(`image/${format}`, quality);
  }

  async rotateImage(
    src: string,
    angle: number,
    options: ImageOptions = {}
  ): Promise<string> {
    const img = await this.loadImage(src);
    const { quality = 0.8, format = 'jpeg' } = options;

    // Вычисляем размеры повернутого изображения
    const radians = (angle * Math.PI) / 180;
    const cos = Math.abs(Math.cos(radians));
    const sin = Math.abs(Math.sin(radians));
    
    const width = img.naturalWidth * cos + img.naturalHeight * sin;
    const height = img.naturalWidth * sin + img.naturalHeight * cos;

    this.canvas.width = width;
    this.canvas.height = height;

    // Очищаем canvas
    this.ctx.clearRect(0, 0, width, height);

    // Перемещаем в центр и поворачиваем
    this.ctx.translate(width / 2, height / 2);
    this.ctx.rotate(radians);
    this.ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    return this.canvas.toDataURL(`image/${format}`, quality);
  }

  async flipImage(
    src: string,
    direction: 'horizontal' | 'vertical' | 'both',
    options: ImageOptions = {}
  ): Promise<string> {
    const img = await this.loadImage(src);
    const { quality = 0.8, format = 'jpeg' } = options;

    this.canvas.width = img.naturalWidth;
    this.canvas.height = img.naturalHeight;

    // Очищаем canvas
    this.ctx.clearRect(0, 0, img.naturalWidth, img.naturalHeight);

    // Применяем трансформации
    if (direction === 'horizontal' || direction === 'both') {
      this.ctx.scale(-1, 1);
      this.ctx.translate(-img.naturalWidth, 0);
    }
    
    if (direction === 'vertical' || direction === 'both') {
      this.ctx.scale(1, -1);
      this.ctx.translate(0, -img.naturalHeight);
    }

    // Рисуем изображение
    this.ctx.drawImage(img, 0, 0);

    return this.canvas.toDataURL(`image/${format}`, quality);
  }

  async applyFilters(
    src: string,
    filters: {
      blur?: number;
      brightness?: number;
      contrast?: number;
      saturation?: number;
      hue?: number;
    },
    options: ImageOptions = {}
  ): Promise<string> {
    const img = await this.loadImage(src);
    const { quality = 0.8, format = 'jpeg' } = options;

    this.canvas.width = img.naturalWidth;
    this.canvas.height = img.naturalHeight;

    // Очищаем canvas
    this.ctx.clearRect(0, 0, img.naturalWidth, img.naturalHeight);

    // Применяем фильтры
    if (filters.blur) {
      this.ctx.filter = `blur(${filters.blur}px)`;
    }
    
    if (filters.brightness !== undefined) {
      this.ctx.filter = `${this.ctx.filter} brightness(${filters.brightness}%)`;
    }
    
    if (filters.contrast !== undefined) {
      this.ctx.filter = `${this.ctx.filter} contrast(${filters.contrast}%)`;
    }
    
    if (filters.saturation !== undefined) {
      this.ctx.filter = `${this.ctx.filter} saturate(${filters.saturation}%)`;
    }
    
    if (filters.hue !== undefined) {
      this.ctx.filter = `${this.ctx.filter} hue-rotate(${filters.hue}deg)`;
    }

    // Рисуем изображение
    this.ctx.drawImage(img, 0, 0);

    // Сбрасываем фильтры
    this.ctx.filter = 'none';

    return this.canvas.toDataURL(`image/${format}`, quality);
  }

  async transformImage(
    src: string,
    options: ImageTransformOptions
  ): Promise<string> {
    let result = src;

    // Применяем трансформации по порядку
    if (options.crop) {
      result = await this.cropImage(result, options.crop, options);
    }

    if (options.rotate) {
      result = await this.rotateImage(result, options.rotate, options);
    }

    if (options.flip) {
      result = await this.flipImage(result, options.flip, options);
    }

    // Применяем фильтры
    const filters: any = {};
    if (options.blur !== undefined) filters.blur = options.blur;
    if (options.brightness !== undefined) filters.brightness = options.brightness;
    if (options.contrast !== undefined) filters.contrast = options.contrast;
    if (options.saturation !== undefined) filters.saturation = options.saturation;
    if (options.hue !== undefined) filters.hue = options.hue;

    if (Object.keys(filters).length > 0) {
      result = await this.applyFilters(result, filters, options);
    }

    // Изменяем размер в конце
    if (options.maxWidth || options.maxHeight) {
      result = await this.resizeImage(result, options);
    }

    return result;
  }

  // Приватные методы
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth?: number,
    maxHeight?: number,
    maintainAspectRatio: boolean = true
  ): { width: number; height: number } {
    let width = originalWidth;
    let height = originalHeight;

    if (maintainAspectRatio) {
      if (maxWidth && width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (maxHeight && height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
    } else {
      if (maxWidth) width = maxWidth;
      if (maxHeight) height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }
}

// Утилиты для работы с изображениями
export const imageProcessor = new ImageProcessor();

export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return imageProcessor.loadImage(src);
};

export const getImageInfo = (src: string): Promise<ImageInfo> => {
  return imageProcessor.getImageInfo(src);
};

export const resizeImage = (src: string, options?: ImageOptions): Promise<string> => {
  return imageProcessor.resizeImage(src, options);
};

export const cropImage = (
  src: string,
  crop: { x: number; y: number; width: number; height: number },
  options?: ImageOptions
): Promise<string> => {
  return imageProcessor.cropImage(src, crop, options);
};

export const rotateImage = (src: string, angle: number, options?: ImageOptions): Promise<string> => {
  return imageProcessor.rotateImage(src, angle, options);
};

export const flipImage = (
  src: string,
  direction: 'horizontal' | 'vertical' | 'both',
  options?: ImageOptions
): Promise<string> => {
  return imageProcessor.flipImage(src, direction, options);
};

export const applyFilters = (
  src: string,
  filters: {
    blur?: number;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    hue?: number;
  },
  options?: ImageOptions
): Promise<string> => {
  return imageProcessor.applyFilters(src, filters, options);
};

export const transformImage = (src: string, options: ImageTransformOptions): Promise<string> => {
  return imageProcessor.transformImage(src, options);
};

// Утилиты для работы с изображениями
export const createImageUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

export const revokeImageUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

export const downloadImage = (src: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = src;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const copyImageToClipboard = async (src: string): Promise<boolean> => {
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    
    if (navigator.clipboard && navigator.clipboard.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
};

export const generatePlaceholder = (
  width: number,
  height: number,
  text: string = 'Image',
  options: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
  } = {}
): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = width;
  canvas.height = height;
  
  const {
    backgroundColor = '#f0f0f0',
    textColor = '#666666',
    fontSize = Math.min(width, height) / 10
  } = options;
  
  // Рисуем фон
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  // Рисуем текст
  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.fillText(text, width / 2, height / 2);
  
  return canvas.toDataURL();
};

export const lazyLoadImage = (
  img: HTMLImageElement,
  src: string,
  placeholder?: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (placeholder) {
      img.src = placeholder;
    }
    
    const imageLoader = new Image();
    imageLoader.onload = () => {
      img.src = src;
      resolve();
    };
    imageLoader.onerror = reject;
    imageLoader.src = src;
  });
};

export const createImageThumbnail = (
  src: string,
  size: number = 150,
  options?: ImageOptions
): Promise<string> => {
  return resizeImage(src, {
    maxWidth: size,
    maxHeight: size,
    maintainAspectRatio: true,
    quality: 0.7,
    ...options
  });
};

export const validateImage = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  return validTypes.includes(file.type) && file.size <= maxSize;
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const compressImage = (
  file: File,
  quality: number = 0.8,
  maxWidth?: number,
  maxHeight?: number
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        let { width, height } = img;
        
        if (maxWidth || maxHeight) {
          const aspectRatio = width / height;
          
          if (maxWidth && width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }
          
          if (maxHeight && height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
