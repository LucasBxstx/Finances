import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { AddOrEditTransaction, TransactionType } from '../../shared/models/transaction';
import { AsyncPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../shared/services/transaction.service';
import { BehaviorSubject, Subject, map, switchMap, takeUntil } from 'rxjs';
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

export type UseCase = 'add' | 'edit';

@Component({
  selector: 'app-add-or-edit-transaction',
  standalone: true,
  imports: [NgClass, FormsModule, SpinnerComponent, NgIf, NgFor, AsyncPipe, MatDatepickerModule, MatNativeDateModule, NgStyle, AddOrEditLabelComponent],
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

  private readonly authService = inject(AuthService);
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

  public showSpinner = false;
  public labelEditingMode = false;

  private readonly transactionService = inject(TransactionService);
  private readonly labelService = inject(LabelService);

  public readonly labels$ = this.refreshLabels.pipe(switchMap(() =>
    this.labelService.getLabels()
  ));

  public ngOnInit(): void {
    if (this.addOrEditData.useCase === 'add' || !this.addOrEditData.transactionId) return;

    this.transactionService.getTransaction(this.addOrEditData.transactionId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((transaction) => {
        this.editingTransactionType = transaction.transactionType;
        this.editingDate = transaction.date;
        this.editingTitle = transaction.title;
        this.editingLabelId = transaction.labelId;
        this.editingPrice = transaction.price;
        this.rowVersion = transaction.rowVersion;
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
    this.showSpinner = true;

    this.transactionService.createOrUpdateTransaction({
      id: this.addOrEditData.transactionId ?? -1,
      transactionType: this.editingTransactionType,
      date: this.editingDate,
      title: this.editingTitle,
      labelId: this.editingLabelId,
      price: this.editingPrice ?? 0,
      rowVersion: this.rowVersion,
    }).pipe(takeUntil(this.unsubscribe))
      .subscribe((transaction) => {
        console.log("transaction successfully updated", transaction);
        this.showSpinner = false;
        this.closedWindow.emit();
      },
      (error: HttpErrorResponse) => {
        console.log("update transaction error", error);
        this.showSpinner = false;
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
