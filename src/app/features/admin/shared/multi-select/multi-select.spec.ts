import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MultiSelect } from './multi-select';

@Component({
  imports: [ReactiveFormsModule, MultiSelect],
  template: `
    <app-multi-select
      inputId="tags"
      label="Etiquetas"
      [options]="options"
      [formControl]="control"
    />
  `,
})
class Host {
  readonly options = [
    { id: 1, name: 'Noticias' },
    { id: 2, name: 'Giras' },
  ];
  readonly control = new FormControl<number[]>([], { nonNullable: true });
}

describe('MultiSelect', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
  });

  it('abre el desplegable y muestra las opciones', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('#tags') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#tags-panel')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Noticias');
    expect(fixture.nativeElement.textContent).toContain('Giras');
  });

  it('permite seleccionar varias etiquetas y actualiza el formulario', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('#tags') as HTMLButtonElement).click();
    fixture.detectChanges();

    const checkboxes = fixture.nativeElement.querySelectorAll(
      'input[type="checkbox"]',
    ) as NodeListOf<HTMLInputElement>;
    checkboxes[0].click();
    checkboxes[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toEqual([1, 2]);
    expect(fixture.nativeElement.textContent).toContain('Noticias, Giras');
  });

  it('refleja el valor del formulario y permite quitar una etiqueta', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.control.setValue([2]);
    fixture.detectChanges();

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const remove = buttons.find((button) => button.textContent?.includes('Quitar Giras'));
    expect(remove).toBeDefined();
    remove!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toEqual([]);
  });

  it('se cierra al hacer clic fuera', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('#tags') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#tags-panel')).not.toBeNull();

    document.body.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#tags-panel')).toBeNull();
  });
});
