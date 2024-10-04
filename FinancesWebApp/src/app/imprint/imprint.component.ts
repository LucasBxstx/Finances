import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@ngneat/transloco';
import { FooterComponent } from '../shared/components/footer/footer.component';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [NgClass, TranslocoDirective, FooterComponent],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {
  private readonly router = inject(Router);

  public navigateTo(url: 'login' | 'create-account'): void {
    this.router.navigate([`/${url}`]);
  }
}
