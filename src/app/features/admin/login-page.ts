import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/api/auth.service';

@Component({
  selector: 'app-admin-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLoginPage {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form = this.formBuilder.group({
    email: ['redaccion@theblastbeast.com', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    const returnUrl = this.returnUrl();
    if (this.auth.isAuthenticated()) {
      void this.router.navigateByUrl(returnUrl);
      return;
    }
    this.auth.ensureSession().subscribe((authenticated) => {
      if (authenticated) {
        void this.router.navigateByUrl(returnUrl);
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => {
        void this.router.navigateByUrl(this.returnUrl());
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(readError(error) ?? 'No se pudo iniciar sesión');
      },
    });
  }

  private returnUrl(): string {
    return this.route.snapshot.queryParamMap.get('returnUrl') ?? '/admin/articulos';
  }
}

function readError(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const body = (error as { error?: { detail?: string } }).error;
    return body?.detail ?? null;
  }
  return null;
}
