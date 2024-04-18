import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { AddOrEditTransaction, Transaction, TransactionType } from '../../shared/models/transaction';
import { NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../shared/services/transaction.service';
import { Subject, take, takeUntil } from 'rxjs';
import { GetDatePipe } from '../../shared/pipes/getDate.pipe';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

export type UseCase = 'add' | 'edit';

@Component({
  selector: 'app-add-or-edit-transaction',
  standalone: true,
  imports: [NgClass, FormsModule, GetDatePipe, SpinnerComponent, NgIf],
  templateUrl: './add-or-edit-transaction.component.html',
  styleUrl: './add-or-edit-transaction.component.scss'
})
export class AddOrEditTransactionComponent implements OnChanges, OnInit, OnDestroy {
  public TransactionType = TransactionType;
  private unsubscribe: Subject<void> = new Subject();
  private readonly transactionService = inject(TransactionService);

  @Input({ required: true }) public addOrEditData!: AddOrEditTransaction;

  @Output() public closedWindow: EventEmitter<void> = new EventEmitter();

  public editingTransactionType!: TransactionType;
  public editingDate: Date = new Date();
  public editingTitle: string | null = null;
  public editingLabel: string | null = null;
  public editingPrice: number | null = null;
  private rowVersion: string | null = null;

  public showSpinner = false;

  public ngOnInit(): void {
    if (this.addOrEditData.useCase === 'add' || !this.addOrEditData.transactionId) return;

    this.transactionService.getTransaction(this.addOrEditData.transactionId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((transaction) => {
        this.editingTransactionType = transaction.transactionType;
        this.editingDate = transaction.date;
        this.editingTitle = transaction.title;
        this.editingLabel = transaction.label;
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
      label: this.editingLabel,
      price: this.editingPrice ?? 0,
      rowVersion: this.rowVersion,
    }).pipe(takeUntil(this.unsubscribe)).subscribe((transaction)=> {
      console.log("updated", transaction);
      this.showSpinner = false;
      this.closedWindow.emit();
    });
  }
}
