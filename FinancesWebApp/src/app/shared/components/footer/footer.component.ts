import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  private readonly router = inject(Router);

  public navigateTo(url: "imprint" | "privacy-policy" | "login"): void {
    this.router.navigate(['/'+url])
  }
}
