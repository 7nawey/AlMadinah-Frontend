import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslationAssistantService } from '../../../core/services/translation-assistant.service';
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../../../core/models';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css']
})
export class AdminCategoriesComponent implements OnInit {
  categories: CategoryDto[] = [];
  loading = false;
  showForm = false;
  editing = false;

  form = {
    id: '',
    nameAr: '',
    nameEn: '',
    description: ''
  };

  // Image
  imageFile: File | null = null;
  imagePreview: string | null = null;
  existingImageUrl: string | null = null;

  // Translation suggestions
  nameArSuggestion = '';
  nameEnSuggestion = '';

  constructor(
    private api: ApiService,
    public i18n: I18nService,
    private toast: ToastService,
    private translation: TranslationAssistantService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  onNameArChange(): void {
    this.nameEnSuggestion = this.translation.getSuggestion(this.form.nameAr, this.form.nameEn);
  }

  onNameEnChange(): void {
    this.nameArSuggestion = this.translation.getSuggestion(this.form.nameEn, this.form.nameAr);
  }

  applySuggestion(field: 'ar' | 'en'): void {
    if (field === 'en' && this.nameEnSuggestion) {
      this.form.nameEn = this.nameEnSuggestion;
      this.nameEnSuggestion = '';
    } else if (field === 'ar' && this.nameArSuggestion) {
      this.form.nameAr = this.nameArSuggestion;
      this.nameArSuggestion = '';
    }
  }

  clearSuggestion(field: 'ar' | 'en'): void {
    if (field === 'en') this.nameEnSuggestion = '';
    else this.nameArSuggestion = '';
  }

  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imageFile = null;
    this.imagePreview = null;
    this.existingImageUrl = null;
  }

  loadCategories(): void {
    this.loading = true;
    this.api.getCategories().subscribe({
      next: (res) => {
        this.categories = res.data ?? [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openAdd(): void {
    this.showForm = true;
    this.editing = false;
    this.form = { id: '', nameAr: '', nameEn: '', description: '' };
    this.imageFile = null;
    this.imagePreview = null;
    this.existingImageUrl = null;
    this.nameArSuggestion = '';
    this.nameEnSuggestion = '';
  }

  edit(c: CategoryDto): void {
    this.showForm = true;
    this.editing = true;
    this.form = { id: c.id, nameAr: c.nameAr, nameEn: c.nameEn || '', description: c.description || '' };
    this.imageFile = null;
    this.imagePreview = null;
    this.existingImageUrl = c.imageUrl ?? null;
    this.nameArSuggestion = '';
    this.nameEnSuggestion = '';
  }

  save(): void {
    if (this.editing) {
      const data: UpdateCategoryDto = {
        id: this.form.id,
        nameAr: this.form.nameAr,
        nameEn: this.form.nameEn || this.form.nameAr,
        description: this.form.description || undefined,
        isActive: true
      };
      this.api.updateCategory(this.form.id, data, this.imageFile || undefined).subscribe({
        next: () => {
          this.showForm = false;
          this.loadCategories();
          this.toast.success(this.i18n.lang === 'ar' ? 'تم التحديث' : 'Updated');
        },
        error: (err) => {
          // If 415 Unsupported Media Type, backend still uses [FromBody]
          if (err.status === 415) {
            this.toast.error(this.i18n.lang === 'ar'
              ? 'الـ Backend يستخدم [FromBody] — غيّره لـ [FromForm] في CategoriesController'
              : 'Backend uses [FromBody] — change to [FromForm] in CategoriesController');
          } else {
            this.toast.error(this.i18n.lang === 'ar' ? 'فشل التحديث' : 'Failed');
          }
        }
      });
    } else {
      const data: CreateCategoryDto = {
        nameAr: this.form.nameAr,
        nameEn: this.form.nameEn || this.form.nameAr,
        description: this.form.description || undefined
      };
      this.api.createCategory(data, this.imageFile || undefined).subscribe({
        next: () => {
          this.showForm = false;
          this.loadCategories();
          this.toast.success(this.i18n.lang === 'ar' ? 'تم الإنشاء' : 'Created');
        },
        error: (err) => {
          if (err.status === 415) {
            this.toast.error(this.i18n.lang === 'ar'
              ? 'الـ Backend يستخدم [FromBody] — غيّره لـ [FromForm] في CategoriesController'
              : 'Backend uses [FromBody] — change to [FromForm] in CategoriesController');
          } else {
            this.toast.error(this.i18n.lang === 'ar' ? 'فشل الإنشاء' : 'Failed');
          }
        }
      });
    }
  }

  delete(id: string): void {
    if (!confirm(this.i18n.lang === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) return;
    this.api.deleteCategory(id).subscribe({
      next: () => { this.loadCategories(); this.toast.success(this.i18n.lang === 'ar' ? 'تم الحذف' : 'Deleted'); },
      error: () => this.toast.error(this.i18n.lang === 'ar' ? 'فشل الحذف' : 'Failed')
    });
  }
}
