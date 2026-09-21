export interface UpdateCategoryOrderDto {
  categoryId: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface UpdateFeaturedProductDto {
  productId: string;
  isFeatured: boolean;
  isPinned: boolean;
  displayOrder: number;
}

export interface HomePageConfigDto {
  categories: CategoryOrderDto[];
  featuredProducts: FeaturedProductDto[];
}

export interface CategoryOrderDto {
  id: string;
  nameAr: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface FeaturedProductDto {
  id: string;
  nameAr: string;
  imageUrl?: string;
  isFeatured: boolean;
  isPinned: boolean;
  displayOrder: number;
}
