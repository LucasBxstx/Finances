import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@ngneat/transloco';

@Component({
  selector: 'app-session-expired',
  standalone: true,
  imports: [TranslocoDirective],
  templateUrl: './session-expired.component.html',
  styleUrl: './session-expired.component.scss'
})
export class SessionExpiredComponent {
  private readonly router = inject(Router);

  public navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

}
