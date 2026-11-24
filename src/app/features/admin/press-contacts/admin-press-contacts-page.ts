import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AdminApiService } from '../../../core/api/admin-api.service';
import type { PressContact } from '../../../core/api/admin.models';
import { problemMessage } from '../../../core/api/problem';
import { formatShortDate } from '../../../core/format';
import {
  buildPressContactsCsv,
  pressContactsCsvFileName,
  type PressContactsCsvFormat,
} from './press-contacts-csv';

@Component({
  selector: 'app-admin-press-contacts-page',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-press-contacts-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPressContactsPage implements OnInit {
  private readonly api = inject(AdminApiService);

  protected readonly contacts = signal<PressContact[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly updatedAt = signal<string | null>(null);

  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly category = new FormControl('', { nonNullable: true });

  private readonly searchTerm = toSignal(this.search.valueChanges, {
    initialValue: '',
  });
  private readonly selectedCategory = toSignal(this.category.valueChanges, {
    initialValue: '',
  });

  protected readonly categories = computed(() => {
    const counts = new Map<string, number>();
    for (const contact of this.contacts()) {
      counts.set(contact.categoria, (counts.get(contact.categoria) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => left.name.localeCompare(right.name, 'es'));
  });

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase('es');
    const selected = this.selectedCategory();

    return this.contacts().filter((contact) => {
      if (selected && contact.categoria !== selected) {
        return false;
      }
      if (!term) {
        return true;
      }
      return [
        contact.categoria,
        contact.nombre,
        contact.tipo,
        contact.pais,
        contact.email,
        contact.contactoNombre,
        contact.idioma,
        contact.tipoDeMaterial,
        contact.licenciaUso,
        contact.notas,
      ].some((value) => value.toLocaleLowerCase('es').includes(term));
    });
  });

  protected readonly visibleCount = computed(() => this.filtered().length);
  protected readonly hasFilters = computed(
    () => this.searchTerm().length > 0 || this.selectedCategory().length > 0,
  );

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.listPressContacts().subscribe({
      next: (result) => {
        this.contacts.set(result.rows);
        this.updatedAt.set(result.updatedAt ?? null);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(
          problemMessage(error, 'No se pudieron cargar los contactos'),
        );
      },
    });
  }

  protected clearFilters(): void {
    this.search.setValue('');
    this.category.setValue('');
  }

  protected download(format: PressContactsCsvFormat): void {
    const rows = this.filtered();
    if (rows.length === 0) {
      return;
    }

    const blob = new Blob([buildPressContactsCsv(rows, format)], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = pressContactsCsvFileName(format);
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    this.notice.set(
      `${rows.length} contactos descargados (${format === 'excel' ? 'Excel' : 'CSV'})`,
    );
  }

  protected safeUrl(value: string): string | null {
    return /^https?:\/\//i.test(value) ? value : null;
  }

  protected copyEmail(email: string): void {
    if (!navigator.clipboard) {
      this.error.set('Este navegador no permite copiar al portapapeles');
      return;
    }
    navigator.clipboard
      .writeText(email)
      .then(() => this.notice.set(`Correo copiado: ${email}`))
      .catch(() => this.error.set('No se pudo copiar el correo'));
  }

  protected date(value: string | null | undefined): string {
    return formatShortDate(value);
  }
}
