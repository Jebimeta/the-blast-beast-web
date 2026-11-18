import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/api/auth.service';
import { problemMessage } from '../../../core/api/problem';

@Component({
  selector: 'app-admin-account-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin-account-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAccountPage {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.formBuilder.group(
    {
      currentPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(200),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { currentPassword, newPassword } = this.form.getRawValue();
    this.auth.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        void this.router.navigate(['/admin/login'], {
          queryParams: { passwordChanged: '1' },
        });
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(
          problemMessage(error, 'No se pudo cambiar la contraseña'),
        );
      },
    });
  }
}

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return newPassword === confirmPassword ? null : { passwordsMismatch: true };
}
