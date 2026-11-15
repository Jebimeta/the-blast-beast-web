import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminApiService } from '../../../core/api/admin-api.service';
import type {
  BandResponse,
  ReleaseAdmin,
  ReleaseKind,
  ReleaseWriteRequest,
} from '../../../core/api/admin.models';
import { problemMessage } from '../../../core/api/problem';
import {
  RELEASE_TYPES,
  formatReleaseDate,
  releaseTypeLabel,
} from '../../radar/radar.utils';

@Component({
  selector: 'app-admin-release-page',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-release-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReleasePage implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly releases = signal<ReleaseAdmin[]>([]);
  protected readonly bands = signal<BandResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly query = signal('');
  protected readonly editingId = signal<number | null>(null);

  protected readonly releaseTypes = RELEASE_TYPES;
  protected readonly typeLabel = releaseTypeLabel;
  protected readonly fullDate = formatReleaseDate;

  protected readonly filteredReleases = computed(() => {
    const query = this.query().trim().toLowerCase();
    if (!query) {
      return this.releases();
    }
    return this.releases().filter(
      (release) =>
        release.title.toLowerCase().includes(query) ||
        release.artistName.toLowerCase().includes(query) ||
        (release.label ?? '').toLowerCase().includes(query),
    );
  });

  protected readonly releaseForm = this.formBuilder.nonNullable.group({
    title: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200),
      ],
    ],
    artistName: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(160),
      ],
    ],
    bandId: this.formBuilder.control<number | null>(null),
    type: this.formBuilder.nonNullable.control<ReleaseKind>('album', [
      Validators.required,
    ]),
    releaseDate: ['', [Validators.required]],
    genre: ['', [Validators.maxLength(80)]],
    label: ['', [Validators.maxLength(120)]],
    listenUrl: [
      '',
      [Validators.maxLength(600), Validators.pattern(/^https?:\/\/.+/i)],
    ],
    notes: ['', [Validators.maxLength(500)]],
    featured: [false],
    hidden: [false],
  });

  ngOnInit(): void {
    this.load();
  }

  protected edit(release: ReleaseAdmin): void {
    this.editingId.set(release.id);
    this.error.set(null);
    this.notice.set(null);
    this.releaseForm.setValue({
      title: release.title,
      artistName: release.artistName,
      bandId: release.bandId ?? null,
      type: release.type,
      releaseDate: release.releaseDate,
      genre: release.genre ?? '',
      label: release.label ?? '',
      listenUrl: release.listenUrl ?? '',
      notes: release.notes ?? '',
      featured: release.featured,
      hidden: release.hidden,
    });
  }

  protected cancel(): void {
    this.editingId.set(null);
    this.releaseForm.reset({
      title: '',
      artistName: '',
      bandId: null,
      type: 'album',
      releaseDate: '',
      genre: '',
      label: '',
      listenUrl: '',
      notes: '',
      featured: false,
      hidden: false,
    });
    this.error.set(null);
  }

  protected save(): void {
    if (this.releaseForm.invalid) {
      this.releaseForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.notice.set(null);

    const value = this.releaseForm.getRawValue();
    const request: ReleaseWriteRequest = {
      ...value,
      bandId: value.bandId ?? null,
      genre: value.genre.trim() || null,
      label: value.label.trim() || null,
      listenUrl: value.listenUrl.trim() || null,
      notes: value.notes.trim() || null,
    };
    const editingId = this.editingId();
    const operation = editingId
      ? this.api.updateRelease(editingId, request)
      : this.api.createRelease(request);

    operation.subscribe({
      next: (release) => {
        this.saving.set(false);
        this.notice.set(
          editingId
            ? `Lanzamiento «${release.title}» actualizado.`
            : `Lanzamiento «${release.title}» creado.`,
        );
        this.cancel();
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.error.set(
          problemMessage(error, 'No se pudo guardar el lanzamiento.'),
        );
      },
    });
  }

  protected remove(release: ReleaseAdmin): void {
    if (!confirm(`¿Eliminar el lanzamiento «${release.title}»?`)) {
      return;
    }

    this.error.set(null);
    this.notice.set(null);
    this.api.deleteRelease(release.id).subscribe({
      next: () => {
        this.notice.set(`Lanzamiento «${release.title}» eliminado.`);
        if (this.editingId() === release.id) {
          this.cancel();
        }
        this.load();
      },
      error: (error: unknown) => {
        this.error.set(
          problemMessage(error, 'No se pudo eliminar el lanzamiento.'),
        );
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.listReleases().subscribe({
      next: (releases) => {
        this.releases.set(releases);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(
          problemMessage(error, 'No se pudo cargar el radar de lanzamientos.'),
        );
      },
    });
    this.api.listBands().subscribe({
      next: (bands) => this.bands.set(bands),
      error: () => this.bands.set([]),
    });
  }
}
