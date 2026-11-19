import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface MultiSelectOption {
  readonly id: number;
  readonly name: string;
}

/**
 * Desplegable de selección múltiple con casillas.
 *
 * Se integra con Reactive Forms mediante ControlValueAccessor y guarda un
 * array de ids. El panel se cierra al pulsar fuera o con Escape.
 */
@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelect),
      multi: true,
    },
  ],
})
export class MultiSelect implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly options = input.required<readonly MultiSelectOption[]>();
  readonly placeholder = input('Selecciona…');
  readonly hint = input<string | null>(null);

  protected readonly selectedIds = signal<readonly number[]>([]);
  protected readonly open = signal(false);
  protected readonly disabled = signal(false);

  protected readonly selectedOptions = computed(() => {
    const ids = new Set(this.selectedIds());
    return this.options().filter((option) => ids.has(option.id));
  });

  protected readonly selectedLabel = computed(() =>
    this.selectedOptions()
      .map((option) => option.name)
      .join(', '),
  );

  private onChange: (value: number[]) => void = () => {};
  private onTouched: () => void = () => {};

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }
    this.open.update((open) => !open);
  }

  protected isSelected(id: number): boolean {
    return this.selectedIds().includes(id);
  }

  protected toggleOption(id: number): void {
    if (this.disabled()) {
      return;
    }
    const current = this.selectedIds();
    const next = current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
    this.commit(next);
  }

  protected remove(id: number, event: Event): void {
    event.stopPropagation();
    this.toggleOption(id);
  }

  protected clear(): void {
    this.commit([]);
  }

  private commit(ids: readonly number[]): void {
    this.selectedIds.set(ids);
    this.onChange([...ids]);
    this.onTouched();
  }

  writeValue(value: number[] | null): void {
    this.selectedIds.set(Array.isArray(value) ? [...value] : []);
  }

  registerOnChange(fn: (value: number[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.open()) {
      return;
    }
    const target = event.target as Node | null;
    if (target && !this.elementRef.nativeElement.contains(target)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.open.set(false);
  }
}
