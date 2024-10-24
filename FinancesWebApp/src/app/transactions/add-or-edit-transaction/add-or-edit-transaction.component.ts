import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { AddOrEditTransaction, Transaction, TransactionType } from '../../shared/models/transaction';
import { AsyncPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../shared/services/transaction.service';
import { BehaviorSubject, Subject, catchError, map, switchMap, takeUntil, throwError } from 'rxjs';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_NATIVE_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NativeDateAdapter } from '@angular/material/core';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { LabelService } from '../../shared/services/label.service';
import { AddOrEditLabel } from '../../shared/models/label';
import { AddOrEditLabelComponent } from './add-or-edit-label/add-or-edit-label.component';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../shared/services/auth.service';
import { TranslocoDirective } from '@ngneat/transloco';
import { ActivatedRoute } from '@angular/router';

export type UseCase = 'add' | 'edit';

@Component({
  selector: 'app-add-or-edit-transaction',
  standalone: true,
  imports: [NgClass, FormsModule, SpinnerComponent, NgIf, NgFor, AsyncPipe, MatDatepickerModule, MatNativeDateModule, NgStyle, AddOrEditLabelComponent, TranslocoDirective],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' } // Adjust locale as needed
  ],
  templateUrl: './add-or-edit-transaction.component.html',
  styleUrl: './add-or-edit-transaction.component.scss'
})
export class AddOrEditTransactionComponent implements OnChanges, OnInit, OnDestroy {
  public TransactionType = TransactionType;

  private unsubscribe: Subject<void> = new Subject();
  public currentAddedOrEditedLabel = new BehaviorSubject<AddOrEditLabel | null>(null);
  public refreshLabels = new BehaviorSubject<null>(null);

  @Input({ required: true }) public addOrEditData!: AddOrEditTransaction;
  @Output() public closedWindow: EventEmitter<void> = new EventEmitter();
  @ViewChild(MatDatepicker, { static: false }) datepicker?: MatDatepicker<Date>;

  public editingTransactionType!: TransactionType;
  public editingDate: Date = new Date();
  public editingTitle: string | null = null;
  public editingLabelId: number | null = null;
  public editingPrice: number | null = null;
  private rowVersion: string | null = null;

  public showLoadingSpinner = false;
  public showSavingSpinner = false;
  public labelEditingMode = false;
  public showSavingError = false;
  public showLoadingError = false;

  private readonly transactionService = inject(TransactionService);
  private readonly labelService = inject(LabelService);
  private readonly activatedRoute = inject(ActivatedRoute);

  public readonly labels$ = this.refreshLabels.pipe(
    switchMap(() =>
      this.labelService.getLabels().pipe(
        catchError((error: HttpErrorResponse) => {
          this.showLoadingError = true;

          return throwError(error);
        }))
    ));

  public ngOnInit(): void {
    if (this.addOrEditData.useCase === 'add' || !this.addOrEditData.transactionId) {
      this.activatedRoute.queryParams.pipe(takeUntil(this.unsubscribe))
        .subscribe((queryParams) => {
          const month = queryParams['month'];
          const year = queryParams['year'];
          const thisMonthEditingDate = new Date(year, month - 1);
          this.editingDate = thisMonthEditingDate;
        });

      return;
    };

    this.showLoadingSpinner = true;

    this.transactionService.getTransaction(this.addOrEditData.transactionId)
      .pipe(takeUntil(this.unsubscribe),
        catchError((error) => {
          console.log("The transaction could not be loaded", error);
          this.showLoadingSpinner = false
          this.showLoadingError = true;

          return throwError("error");
        })
      )
      .subscribe((transaction: Transaction) => {
        this.editingTransactionType = transaction.transactionType;
        this.editingDate = transaction.date;
        this.editingTitle = transaction.title;
        this.editingLabelId = transaction.labelId;
        this.editingPrice = transaction.price;
        this.rowVersion = transaction.rowVersion;

        this.showLoadingSpinner = false
      });
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if ('addOrEditData' in changes) this.editingTransactionType = this.addOrEditData.transactionType;
  }

  public getMaxDate(): Date {
    return new Date();
  }

  public changeTypeTo(type: TransactionType): void {
    this.editingTransactionType = type;
  }

  public saveTransaction(): void {
    this.showSavingError = false;
    this.showSavingSpinner = true;

    const adjustedDate = new Date(this.editingDate).getHours() !== 12 ? new Date(this.editingDate.setHours(12)) : this.editingDate;

    this.transactionService.createOrUpdateTransaction({
      id: this.addOrEditData.transactionId ?? -1,
      transactionType: this.editingTransactionType,
      date: adjustedDate,
      title: this.editingTitle,
      labelId: this.editingLabelId,
      price: this.editingPrice ?? 0,
      rowVersion: this.rowVersion,
    }).pipe(
      takeUntil(this.unsubscribe),
      catchError((error: HttpErrorResponse) => {
        console.log("update transaction error", error);
        this.showSavingSpinner = false;
        this.showSavingError = true;

        return throwError(error);
      }))
      .subscribe((transaction: Transaction) => {
        console.log("transaction successfully updated", transaction);
        this.showSavingSpinner = false;
        this.closedWindow.emit();
      });

  }

  public addLabel(): void {
    this.currentAddedOrEditedLabel.next({
      useCase: 'add',
      labelId: null,
    });
  }

  public closeAddOrEditLabelWindow(): void {
    this.currentAddedOrEditedLabel.next(null);
    this.refreshLabels.next(null);
    this.labelEditingMode = false;
  }

  public handleLabelClick(labelId: number) {
    if (!this.labelEditingMode) {
      this.editingLabelId = labelId;

      return;
    }

    this.currentAddedOrEditedLabel.next({
      useCase: 'edit',
      labelId: labelId,
    });
  }
}
