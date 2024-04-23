import { Component, EventEmitter, Input, OnDestroy, Output, inject } from '@angular/core';
import { AddOrEditTransaction, Transaction, TransactionType } from '../../shared/models/transaction';
import { NgClass } from '@angular/common';
import { GetPriceDecimalPipe } from '../../shared/pipes/getPriceDecimal.pipe';
import { TransactionService } from '../../shared/services/transaction.service';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [NgClass, GetPriceDecimalPipe],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.scss'
})
export class TransactionComponent implements OnDestroy {
  public TransactionType = TransactionType;
  private unsubscribe = new Subject<void>();
  private readonly transactionService = inject(TransactionService);

  @Input({ required: true }) public transaction!: Transaction;
  @Output() public transactionEdited: EventEmitter<AddOrEditTransaction> = new EventEmitter();
  @Output() public transactionDeleted: EventEmitter<void> = new EventEmitter();

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public editTransaction(): void {
    this.transactionEdited.emit({
      useCase: 'edit',
      transactionId: this.transaction.id,
      transactionType: this.transaction.transactionType,
    })
  }

  public deleteTransaction(): void {
    this.transactionService.deleteTransaction(this.transaction.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        console.log("successfully deleted");
        this.transactionDeleted.emit();
      },
      (error: HttpErrorResponse) => {
          console.log("error", error.status)
      })
  }
}
