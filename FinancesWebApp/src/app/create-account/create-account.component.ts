import { NgClass, NgIf } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { SpinnerComponent } from '../shared/components/spinner/spinner.component';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TokenResult } from '../shared/models/auth';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [TranslocoDirective, ReactiveFormsModule, NgIf, SpinnerComponent, NgClass],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss'
})
export class CreateAccountComponent implements OnDestroy{
  private unsubscribe = new Subject<void>();
  private readonly router = inject(Router);
  private readonly authSerivce = inject(AuthService);
  public readonly emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  public readonly passwordFormControl = new FormControl('', [Validators.required]);

  public showErrorPassword = false;
  public showErrorEmail = false;
  public showSpinner = false;

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public createAccount(): void {
    if (this.emailFormControl.invalid || this.passwordFormControl.invalid)
      return;

    this.showErrorPassword = false;
    this.showErrorEmail = false;
    this.showSpinner = true;

    this.authSerivce.register({
      email: this.emailFormControl.value!,
      password: this.passwordFormControl.value!
    }).pipe(takeUntil(this.unsubscribe)).subscribe((result) => {
      console.log('register successful', result);
      this.login();
    },
    (error: HttpErrorResponse) => {
      this.showSpinner = false;

      if (error.status === 400 && error.error && error.error.errors) {
        const validationErrors = error.error.errors;

        if (validationErrors.PasswordTooShort || validationErrors.PasswordRequiresNonAlphanumeric || validationErrors.PasswordRequiresLower || validationErrors.PasswordRequiresUpper) {
          this.showErrorPassword = true;
        }

        if (validationErrors.DuplicateUserName) {
          this.showErrorEmail = true;
        }
      } 
    });
  }

  private login(): void {
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
          this.router.navigate(['/transactions'],{
            queryParams: {year: new Date().getFullYear(), month: new Date().getMonth() + 1}
          });
        },
        (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.showErrorPassword = true;
            this.showSpinner = false;
          }
        }
      );
  }
}
