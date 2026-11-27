import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NameListInput } from './name-list-input';

@Component({
  imports: [ReactiveFormsModule, NameListInput],
  template: `
    <app-name-list-input
      inputId="bands"
      label="Bandas"
      hint="Pulsa Enter para añadir."
      [formControl]="control"
    />
  `,
})
class Host {
  readonly control = new FormControl<string[]>([], { nonNullable: true });
}

describe('NameListInput', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
  });

  function input(fixture: ReturnType<typeof TestBed.createComponent<Host>>) {
    return fixture.nativeElement.querySelector('#bands') as HTMLInputElement;
  }

  function type(fixture: ReturnType<typeof TestBed.createComponent<Host>>, value: string): void {
    const field = input(fixture);
    field.value = value;
    field.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  it('añade un nombre con Enter y actualiza el formulario', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    type(fixture, 'Metallica');
    input(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toEqual(['Metallica']);
    expect(fixture.nativeElement.textContent).toContain('Metallica');
    expect(input(fixture).value).toBe('');
  });

  it('acepta varios nombres separados por comas y evita duplicados', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    type(fixture, 'Opeth, Gojira, opeth');
    input(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toEqual(['Opeth', 'Gojira']);
  });

  it('refleja el valor del formulario y permite quitar un nombre', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.control.setValue(['Metallica', 'Opeth']);
    fixture.detectChanges();

    const remove = fixture.nativeElement.querySelector(
      'button[aria-label="Quitar Metallica"]',
    ) as HTMLButtonElement;
    remove.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toEqual(['Opeth']);
  });

  it('añade el texto pendiente al salir del campo', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    type(fixture, 'Gojira');
    input(fixture).dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toEqual(['Gojira']);
  });
});
