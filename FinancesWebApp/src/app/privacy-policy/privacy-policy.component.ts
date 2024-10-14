import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@ngneat/transloco';
import { FooterComponent } from '../shared/components/footer/footer.component';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [TranslocoDirective, FooterComponent],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  private readonly router = inject(Router);

  public navigateTo(url: 'login' | 'create-account'): void {
    this.router.navigate([`/${url}`]);
  }

  public scrollToElementById(id: string): void {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth', // Optional: für sanftes Scrollen
        block: 'start', // Scrollt bis zum Anfang des Elements
        inline: 'nearest' // Horizontales Scrollen, falls nötig
      });
    } else {
      console.warn(`Element with id "${id}" not found.`);
    }
  }
}
