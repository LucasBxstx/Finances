import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { AddOrEditTransaction, TransactionType } from '../../shared/models/transaction';
import { AsyncPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../shared/services/transaction.service';
import { Subject, map, takeUntil } from 'rxjs';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_NATIVE_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NativeDateAdapter } from '@angular/material/core';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { GetDatePipe } from '../../shared/pipes/getDate.pipe';
import { LabelService } from '../../shared/services/label.service';
import { Label } from '../../shared/models/label';

export type UseCase = 'add' | 'edit';

@Component({
  selector: 'app-add-or-edit-transaction',
  standalone: true,
  imports: [NgClass, FormsModule, SpinnerComponent, NgIf, NgFor, AsyncPipe, MatDatepickerModule, MatNativeDateModule, GetDatePipe, NgStyle],
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

  private readonly transactionService = inject(TransactionService);
  private readonly labelService = inject(LabelService);

  public readonly labels$ = this.labelService.getLabels('6104cf02-6adf-45da-8e0b-f32946e3cf13');

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
      userId: '6104cf02-6adf-45da-8e0b-f32946e3cf13',
      transactionType: this.editingTransactionType,
      date: this.editingDate,
      title: this.editingTitle,
      labelId: this.editingLabelId,
      price: this.editingPrice ?? 0,
      rowVersion: this.rowVersion,
    }).pipe(takeUntil(this.unsubscribe)).subscribe((transaction)=> {
      console.log("updated", transaction);
      this.showSpinner = false;
      this.closedWindow.emit();
    });
  }
}
