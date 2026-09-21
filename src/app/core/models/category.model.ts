export interface CategoryDto {
  id: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

// NOTE: Backend DTOs have IFormFile Image but controller uses [FromBody].
// To support image upload, backend CategoriesController needs [FromForm] instead of [FromBody].
// Until then, frontend sends FormData and backend will work immediately after that change.
export interface CreateCategoryDto {
  nameAr: string;
  nameEn: string;
  description?: string;
  // image?: File; // sent via FormData, not JSON
}

export interface UpdateCategoryDto {
  id: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  isActive: boolean;
  // image?: File; // sent via FormData, not JSON
}
