import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { AdminApiService } from '../../../core/api/admin-api.service';
import type {
  BandResponse,
  BandWriteRequest,
  CategoryAdmin,
  CategoryWriteRequest,
  TagResponse,
  TagWriteRequest,
} from '../../../core/api/admin.models';
import { problemMessage } from '../../../core/api/problem';
import { CategoryStore } from '../../../core/category-store';

type TaxonomyTab = 'categories' | 'bands' | 'tags';

@Component({
  selector: 'app-admin-taxonomy-page',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-taxonomy-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTaxonomyPage implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly categoryStore = inject(CategoryStore);

  protected readonly tab = signal<TaxonomyTab>('categories');
  protected readonly categories = signal<CategoryAdmin[]>([]);
  protected readonly bands = signal<BandResponse[]>([]);
  protected readonly tags = signal<TagResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);

  protected readonly editingCategoryId = signal<number | null>(null);
  protected readonly editingBandId = signal<number | null>(null);
  protected readonly editingTagId = signal<number | null>(null);

  protected readonly bandQuery = signal('');
  protected readonly tagQuery = signal('');

  protected readonly filteredBands = computed(() => {
    const query = this.bandQuery().trim().toLowerCase();
    if (!query) {
      return this.bands();
    }
    return this.bands().filter(
      (band) =>
        band.name.toLowerCase().includes(query) ||
        band.slug.toLowerCase().includes(query),
    );
  });

  protected readonly filteredTags = computed(() => {
    const query = this.tagQuery().trim().toLowerCase();
    if (!query) {
      return this.tags();
    }
    return this.tags().filter(
      (tag) =>
        tag.name.toLowerCase().includes(query) ||
        tag.slug.toLowerCase().includes(query),
    );
  });

  protected readonly categoryForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    slug: ['', [Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(300)]],
    sortOrder: [0, [Validators.min(0)]],
  });

  protected readonly bandForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    slug: ['', [Validators.maxLength(120)]],
    country: ['', [Validators.maxLength(80)]],
    formedYear: this.formBuilder.control<number | null>(null, [
      Validators.min(1900),
      Validators.max(2100),
    ]),
    genre: ['', [Validators.maxLength(60)]],
    website: ['', [Validators.maxLength(300)]],
    bandcampUrl: ['', [Validators.maxLength(300)]],
    spotifyUrl: ['', [Validators.maxLength(300)]],
  });

  protected readonly tagForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    slug: ['', [Validators.maxLength(80)]],
  });

  ngOnInit(): void {
    this.loadAll();
  }

  protected selectTab(tab: TaxonomyTab): void {
    this.tab.set(tab);
    this.error.set(null);
    this.notice.set(null);
  }

  // Categorías ---------------------------------------------------------
  protected editCategory(category: CategoryAdmin): void {
    this.editingCategoryId.set(category.id);
    this.categoryForm.setValue({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      sortOrder: category.sortOrder,
    });
  }

  protected cancelCategory(): void {
    this.editingCategoryId.set(null);
    this.categoryForm.reset({
      name: '',
      slug: '',
      description: '',
      sortOrder: 0,
    });
  }

  protected saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    const value = this.categoryForm.getRawValue();
    const request: CategoryWriteRequest = {
      name: value.name.trim(),
      slug: value.slug.trim() || null,
      description: value.description.trim() || null,
      sortOrder: value.sortOrder,
    };
    const id = this.editingCategoryId();

    this.run(
      id ? this.api.updateCategory(id, request) : this.api.createCategory(request),
      id ? 'Categoría actualizada' : 'Categoría creada',
      () => {
        this.cancelCategory();
        this.loadCategories();
        this.categoryStore.reload().subscribe();
      },
    );
  }

  protected removeCategory(category: CategoryAdmin): void {
    if (!confirm(`¿Eliminar la categoría «${category.name}»?`)) {
      return;
    }
    this.run(
      this.api.deleteCategory(category.id),
      'Categoría eliminada',
      () => {
        if (this.editingCategoryId() === category.id) {
          this.cancelCategory();
        }
        this.loadCategories();
        this.categoryStore.reload().subscribe();
      },
    );
  }

  // Bandas -------------------------------------------------------------
  protected editBand(band: BandResponse): void {
    this.editingBandId.set(band.id);
    this.bandForm.setValue({
      name: band.name,
      slug: band.slug,
      country: band.country ?? '',
      formedYear: band.formedYear ?? null,
      genre: band.genre ?? '',
      website: band.website ?? '',
      bandcampUrl: band.bandcampUrl ?? '',
      spotifyUrl: band.spotifyUrl ?? '',
    });
  }

  protected cancelBand(): void {
    this.editingBandId.set(null);
    this.bandForm.reset({
      name: '',
      slug: '',
      country: '',
      formedYear: null,
      genre: '',
      website: '',
      bandcampUrl: '',
      spotifyUrl: '',
    });
  }

  protected saveBand(): void {
    if (this.bandForm.invalid) {
      this.bandForm.markAllAsTouched();
      return;
    }
    const value = this.bandForm.getRawValue();
    const request: BandWriteRequest = {
      name: value.name.trim(),
      slug: value.slug.trim() || null,
      country: value.country.trim() || null,
      formedYear: value.formedYear === null ? null : Number(value.formedYear),
      genre: value.genre.trim() || null,
      website: value.website.trim() || null,
      bandcampUrl: value.bandcampUrl.trim() || null,
      spotifyUrl: value.spotifyUrl.trim() || null,
    };
    const id = this.editingBandId();

    this.run(
      id ? this.api.updateBand(id, request) : this.api.createBand(request),
      id ? 'Banda actualizada' : 'Banda creada',
      () => {
        this.cancelBand();
        this.loadBands();
      },
    );
  }

  protected removeBand(band: BandResponse): void {
    if (!confirm(`¿Eliminar la banda «${band.name}»?`)) {
      return;
    }
    this.run(this.api.deleteBand(band.id), 'Banda eliminada', () => {
      if (this.editingBandId() === band.id) {
        this.cancelBand();
      }
      this.loadBands();
    });
  }

  // Etiquetas ----------------------------------------------------------
  protected editTag(tag: TagResponse): void {
    this.editingTagId.set(tag.id);
    this.tagForm.setValue({ name: tag.name, slug: tag.slug });
  }

  protected cancelTag(): void {
    this.editingTagId.set(null);
    this.tagForm.reset({ name: '', slug: '' });
  }

  protected saveTag(): void {
    if (this.tagForm.invalid) {
      this.tagForm.markAllAsTouched();
      return;
    }
    const value = this.tagForm.getRawValue();
    const request: TagWriteRequest = {
      name: value.name.trim(),
      slug: value.slug.trim() || null,
    };
    const id = this.editingTagId();

    this.run(
      id ? this.api.updateTag(id, request) : this.api.createTag(request),
      id ? 'Etiqueta actualizada' : 'Etiqueta creada',
      () => {
        this.cancelTag();
        this.loadTags();
      },
    );
  }

  protected removeTag(tag: TagResponse): void {
    if (!confirm(`¿Eliminar la etiqueta «${tag.name}»?`)) {
      return;
    }
    this.run(this.api.deleteTag(tag.id), 'Etiqueta eliminada', () => {
      if (this.editingTagId() === tag.id) {
        this.cancelTag();
      }
      this.loadTags();
    });
  }

  private loadAll(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      categories: this.api.listCategories(),
      bands: this.api.listBands(),
      tags: this.api.listTags(),
    }).subscribe({
      next: ({ categories, bands, tags }) => {
        this.categories.set(categories);
        this.bands.set(bands);
        this.tags.set(tags);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(problemMessage(error, 'No se pudo cargar la taxonomía'));
      },
    });
  }

  private loadCategories(): void {
    this.api.listCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (error: unknown) =>
        this.error.set(problemMessage(error, 'No se pudieron cargar las categorías')),
    });
  }

  private loadBands(): void {
    this.api.listBands().subscribe({
      next: (bands) => this.bands.set(bands),
      error: (error: unknown) =>
        this.error.set(problemMessage(error, 'No se pudieron cargar las bandas')),
    });
  }

  private loadTags(): void {
    this.api.listTags().subscribe({
      next: (tags) => this.tags.set(tags),
      error: (error: unknown) =>
        this.error.set(problemMessage(error, 'No se pudieron cargar las etiquetas')),
    });
  }

  private run(action: Observable<unknown>, message: string, after: () => void): void {
    if (this.saving()) {
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.notice.set(null);
    action.subscribe({
      next: () => {
        this.saving.set(false);
        this.notice.set(message);
        after();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.error.set(problemMessage(error, 'La operación no se pudo completar'));
      },
    });
  }
}
