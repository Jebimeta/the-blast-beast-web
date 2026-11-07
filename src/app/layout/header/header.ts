import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CategoryStore } from '../../core/category-store';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly router = inject(Router);
  protected readonly store = inject(CategoryStore);

  protected search(event: Event, value: string): void {
    event.preventDefault();
    const q = value.trim();
    if (q.length < 2) {
      return;
    }
    void this.router.navigate(['/buscar'], { queryParams: { q } });
  }
}
