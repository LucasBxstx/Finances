import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [NgIf, TranslocoDirective, AsyncPipe],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly translocoService = inject(TranslocoService);

  public readonly currentLanguage$ = this.translocoService.langChanges$.pipe(startWith(this.translocoService.getActiveLang()))

  public menuOpened = false;
  public emailAddress?: string;
  
  public ngOnInit(): void {
    this.emailAddress = localStorage.getItem('emailAddress') ?? this.authService.emailAddress;
  }

  public logout(): void {
    this.authService.logout();
  }

  public changeLanguage(): void {
    const currentLang = this.translocoService.getActiveLang()
    const setLangTo = currentLang === "de" ? "en" : "de" ;
    this.translocoService.setActiveLang(setLangTo);
    localStorage.setItem("activeLang", setLangTo);
    window.location.reload();
  }
}
