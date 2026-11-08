import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminApiService } from '../../../core/api/admin-api.service';
import type { MediaAsset } from '../../../core/api/admin.models';
import { problemMessage } from '../../../core/api/problem';
import { formatShortDate } from '../../../core/format';

@Component({
  selector: 'app-admin-media-page',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-media-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMediaPage implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly media = signal<MediaAsset[]>([]);
  protected readonly loading = signal(true);
  protected readonly uploading = signal(false);
  protected readonly savingId = signal<number | null>(null);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly page = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly totalElements = signal(0);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly filePreview = signal<string | null>(null);
  protected readonly editingId = signal<number | null>(null);

  protected readonly search = new FormControl('', { nonNullable: true });

  protected readonly uploadForm = this.formBuilder.nonNullable.group({
    altText: [''],
    credit: [''],
  });

  protected readonly editForm = this.formBuilder.nonNullable.group({
    altText: [''],
    credit: [''],
  });

  constructor() {
    this.search.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page.set(0);
        this.load();
      });

    this.destroyRef.onDestroy(() => this.releasePreview());
  }

  ngOnInit(): void {
    this.load();
  }

  protected onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.releasePreview();
    this.selectedFile.set(file);
    if (file) {
      this.filePreview.set(URL.createObjectURL(file));
    }
  }

  protected upload(): void {
    const file = this.selectedFile();
    if (!file || this.uploading()) {
      return;
    }
    this.uploading.set(true);
    this.error.set(null);
    this.notice.set(null);

    const value = this.uploadForm.getRawValue();
    this.api
      .uploadMedia(file, value.altText.trim() || undefined, value.credit.trim() || undefined)
      .subscribe({
        next: () => {
          this.uploading.set(false);
          this.notice.set('Imagen subida y variantes generadas');
          this.resetUpload();
          this.page.set(0);
          this.load();
        },
        error: (error: unknown) => {
          this.uploading.set(false);
          this.error.set(problemMessage(error, 'No se pudo subir la imagen'));
        },
      });
  }

  protected startEdit(asset: MediaAsset): void {
    this.editingId.set(asset.id);
    this.editForm.setValue({
      altText: asset.altText ?? '',
      credit: asset.credit ?? '',
    });
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.editForm.reset({ altText: '', credit: '' });
  }

  protected saveEdit(asset: MediaAsset): void {
    if (this.savingId() !== null) {
      return;
    }
    const value = this.editForm.getRawValue();
    this.savingId.set(asset.id);
    this.error.set(null);
    this.api
      .updateMedia(asset.id, {
        altText: value.altText.trim() || null,
        credit: value.credit.trim() || null,
      })
      .subscribe({
        next: (updated) => {
          this.savingId.set(null);
          this.notice.set('Medio actualizado');
          this.media.update((assets) =>
            assets.map((item) => (item.id === updated.id ? updated : item)),
          );
          this.cancelEdit();
        },
        error: (error: unknown) => {
          this.savingId.set(null);
          this.error.set(problemMessage(error, 'No se pudo actualizar el medio'));
        },
      });
  }

  protected remove(asset: MediaAsset): void {
    if (
      !confirm(
        '¿Eliminar esta imagen y sus variantes? Si se usa como portada, la operación fallará.',
      )
    ) {
      return;
    }
    this.deletingId.set(asset.id);
    this.error.set(null);
    this.notice.set(null);
    this.api.deleteMedia(asset.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.notice.set('Medio eliminado');
        if (this.editingId() === asset.id) {
          this.cancelEdit();
        }
        if (this.media().length === 1 && this.page() > 0) {
          this.page.update((page) => page - 1);
        }
        this.load();
      },
      error: (error: unknown) => {
        this.deletingId.set(null);
        this.error.set(problemMessage(error, 'No se pudo eliminar el medio'));
      },
    });
  }

  protected go(page: number): void {
    if (page < 0 || (this.totalPages() > 0 && page >= this.totalPages())) {
      return;
    }
    this.page.set(page);
    this.load();
  }

  protected thumbFor(asset: MediaAsset): string {
    return asset.variants.find((variant) => variant.kind === 'thumb')?.url ?? asset.url;
  }

  protected copyUrl(asset: MediaAsset): void {
    if (!navigator.clipboard) {
      this.error.set('Este navegador no permite copiar al portapapeles');
      return;
    }
    navigator.clipboard
      .writeText(asset.url)
      .then(() => this.notice.set('URL copiada al portapapeles'))
      .catch(() => this.error.set('No se pudo copiar la URL'));
  }

  protected sizeLabel(bytes: number): string {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  protected date(value: string | null | undefined): string {
    return formatShortDate(value);
  }

  protected hasPrev(): boolean {
    return this.page() > 0;
  }

  protected hasNext(): boolean {
    return this.page() + 1 < this.totalPages();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .listMedia(this.page(), 24, this.search.value.trim() || undefined)
      .subscribe({
        next: (result) => {
          this.media.set(result.content);
          this.totalPages.set(result.totalPages);
          this.totalElements.set(result.totalElements);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.loading.set(false);
          this.error.set(problemMessage(error, 'No se pudo cargar la biblioteca'));
        },
      });
  }

  private resetUpload(): void {
    this.uploadForm.reset({ altText: '', credit: '' });
    this.selectedFile.set(null);
    this.releasePreview();
    const input = this.fileInput()?.nativeElement;
    if (input) {
      input.value = '';
    }
  }

  private releasePreview(): void {
    const url = this.filePreview();
    if (url) {
      URL.revokeObjectURL(url);
      this.filePreview.set(null);
    }
  }
}
