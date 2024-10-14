import { Component, OnDestroy, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@ngneat/transloco';
import { AuthService } from '../shared/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { TokenResult } from '../shared/models/auth';
import { HttpErrorResponse } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { SpinnerComponent } from '../shared/components/spinner/spinner.component';
import { FooterComponent } from '../shared/components/footer/footer.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [TranslocoDirective, ReactiveFormsModule, NgIf, SpinnerComponent, FooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy {
  private unsubscribe = new Subject<void>();

  private readonly router = inject(Router);
  private readonly authSerivce = inject(AuthService);
  public readonly emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  public readonly passwordFormControl = new FormControl('', [Validators.required]);

  public showError = false;
  public showSpinner = false;

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public createAccount(): void {
    this.router.navigate(['/create-account']);
  }

  public login(): void {
    if (this.emailFormControl.invalid || this.passwordFormControl.invalid)
      return;

    this.showSpinner = true;

    this.authSerivce.login({
      email: this.emailFormControl.value!,
      password: this.passwordFormControl.value!,
      twoFactorCode: '',
      twoFactorRecoveryCode: ''
    }).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (tokenResult: TokenResult) => {
          console.log('login successful', tokenResult);
          this.showSpinner = false;
          this.showError = false;

          this.router.navigate(['/transactions'],{
            queryParams: {year: new Date().getFullYear(), month: new Date().getMonth() + 1}
          });
        },
        (error: HttpErrorResponse) => {
          console.log(error.error);
          this.showError = true;
          this.showSpinner = false;
        }
      );
  }

}
