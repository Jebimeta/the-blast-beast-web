import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../core/api/auth.service';
import { AdminAccountPage } from './admin-account-page';

describe('AdminAccountPage', () => {
  const changePassword = vi.fn(() => of(void 0));

  beforeEach(async () => {
    changePassword.mockClear();
    await TestBed.configureTestingModule({
      imports: [AdminAccountPage],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { changePassword },
        },
      ],
    }).compileComponents();
  });

  it('envía la contraseña actual y la nueva, y vuelve al login', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(AdminAccountPage);
    fixture.detectChanges();

    fill(fixture.nativeElement, '#current-password', 'Actual2026!');
    fill(fixture.nativeElement, '#new-password', 'NuevaClave2026!');
    fill(fixture.nativeElement, '#confirm-password', 'NuevaClave2026!');
    submit(fixture.nativeElement);

    expect(changePassword).toHaveBeenCalledWith(
      'Actual2026!',
      'NuevaClave2026!',
    );
    expect(navigate).toHaveBeenCalledWith(['/admin/login'], {
      queryParams: { passwordChanged: '1' },
    });
  });

  it('no envía el formulario si las contraseñas no coinciden', () => {
    const fixture = TestBed.createComponent(AdminAccountPage);
    fixture.detectChanges();

    fill(fixture.nativeElement, '#current-password', 'Actual2026!');
    fill(fixture.nativeElement, '#new-password', 'NuevaClave2026!');
    fill(fixture.nativeElement, '#confirm-password', 'OtraClave2026!');
    submit(fixture.nativeElement);
    fixture.detectChanges();

    expect(changePassword).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'Las contraseñas no coinciden',
    );
  });
});

function fill(root: HTMLElement, selector: string, value: string): void {
  const input = root.querySelector<HTMLInputElement>(selector);
  if (!input) {
    throw new Error(`No se encontró ${selector}`);
  }
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

function submit(root: HTMLElement): void {
  const form = root.querySelector('form');
  if (!form) {
    throw new Error('No se encontró el formulario');
  }
  form.dispatchEvent(new Event('submit'));
}
