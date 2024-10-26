import { NgIf } from '@angular/common';
import { Component, EventEmitter, inject, OnDestroy, Output } from '@angular/core';
import { SpinnerComponent } from '../../spinner/spinner.component';
import { UserService } from '../../../services/user.service';
import { catchError, Subject, takeUntil, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { TranslocoDirective } from '@ngneat/transloco';

@Component({
  selector: 'app-delete-account-prompt',
  standalone: true,
  imports: [NgIf, SpinnerComponent, TranslocoDirective],
  templateUrl: './delete-account-prompt.component.html',
  styleUrl: './delete-account-prompt.component.scss'
})
export class DeleteAccountPromptComponent implements OnDestroy {
  private unsubscribe = new Subject<void>();
  public showDeletingErrorMessage = false;
  public showDeletingSpinner = false;

  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);

  @Output() public closeDeletingPrompt: EventEmitter<void> = new EventEmitter<void>();

  public deleteAccount(): void {
    this.showDeletingSpinner = true;

    this.userService.deleteUser().pipe(
      takeUntil(this.unsubscribe),
      catchError((error: HttpErrorResponse) => {
        this.showDeletingSpinner = false;
        this.showDeletingErrorMessage = true;

        return throwError(error);
      })
    ).subscribe(()=>{
      this.showDeletingSpinner = false;
      this.closeDeletingPrompt.emit();

      this.authService.logout();
    })
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
