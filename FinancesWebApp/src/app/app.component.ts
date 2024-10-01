import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
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
