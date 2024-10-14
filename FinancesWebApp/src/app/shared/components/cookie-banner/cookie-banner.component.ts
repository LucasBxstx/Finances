import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslocoDirective } from '@ngneat/transloco';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [NgIf, TranslocoDirective],
  templateUrl: './cookie-banner.component.html',
  styleUrl: './cookie-banner.component.scss'
})
export class CookieBannerComponent implements OnInit {
  cookieConsentGiven: boolean = false;

  public ngOnInit() {
    const consent = localStorage.getItem('cookieConsent');
    this.cookieConsentGiven = consent === 'true';
  }

  public acceptCookieConsent() {
    localStorage.setItem('cookieConsent', 'true');
    this.cookieConsentGiven = true;
  }
}
