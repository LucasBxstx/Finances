import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { CookieBannerComponent } from './shared/components/cookie-banner/cookie-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, CookieBannerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private readonly translocoService = inject(TranslocoService);
  
  constructor() {
    const activeLang: string = localStorage.getItem("activeLang") ?? "en";
    if(activeLang) this.translocoService.setActiveLang(activeLang);
  }
} 
