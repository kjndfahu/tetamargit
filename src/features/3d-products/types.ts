export interface Product3D {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

export interface ScrollRotationState {
  rotation: number;
  progress: number;
}