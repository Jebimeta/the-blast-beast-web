import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Campo de texto para escribir nombres a mano y convertirlos en una lista.
 *
 * Se usa para bandas y etiquetas: cada nombre se añade con Enter o coma y se
 * puede quitar con su botón. El formulario recibe un array de cadenas; el
 * backend se encarga de reutilizar o crear la ficha al guardar.
 */
@Component({
  selector: 'app-name-list-input',
  templateUrl: './name-list-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NameListInput),
      multi: true,
    },
  ],
})
export class NameListInput implements ControlValueAccessor {
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly placeholder = input('Escribe un nombre y pulsa Enter');
  readonly hint = input<string | null>(null);

  protected readonly names = signal<readonly string[]>([]);
  protected readonly draft = signal('');
  protected readonly disabled = signal(false);

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  protected onInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.add();
      return;
    }
    if (event.key === 'Backspace' && !this.draft() && this.names().length > 0) {
      this.remove(this.names().length - 1);
    }
  }

  protected onPaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text') ?? '';
    if (!pasted.includes(',')) {
      return;
    }
    event.preventDefault();
    const next = pasted
      .split(',')
      .reduce((names, part) => this.withName(names, part), this.names());
    this.commit(next);
    this.draft.set('');
  }

  protected add(): void {
    const next = this.draft()
      .split(',')
      .reduce((names, part) => this.withName(names, part), this.names());
    this.commit(next);
    this.draft.set('');
  }

  protected onBlur(): void {
    if (this.draft().trim()) {
      this.add();
    } else {
      this.onTouched();
    }
  }

  protected remove(index: number): void {
    const next = [...this.names()];
    next.splice(index, 1);
    this.commit(next);
  }

  writeValue(value: string[] | null): void {
    this.names.set(Array.isArray(value) ? [...value] : []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  private withName(names: readonly string[], raw: string): readonly string[] {
    const name = raw.trim();
    if (!name || names.some((existing) => existing.toLowerCase() === name.toLowerCase())) {
      return names;
    }
    return [...names, name];
  }

  private commit(next: readonly string[]): void {
    this.names.set(next);
    this.onChange([...next]);
    this.onTouched();
  }
}
