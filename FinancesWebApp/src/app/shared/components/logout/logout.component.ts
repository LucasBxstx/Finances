import { NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [NgIf],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutComponent implements OnInit {
  private readonly authService = inject(AuthService)

  public menuOpened = false;
  public emailAddress?: string;
  
  public ngOnInit(): void {
    this.emailAddress = localStorage.getItem('emailAddress') ?? this.authService.emailAddress;
  }

  public logout(): void {
    this.authService.logout();
  }
}
