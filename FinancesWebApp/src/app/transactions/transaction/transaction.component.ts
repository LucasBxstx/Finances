import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, inject } from '@angular/core';
import { AddOrEditTransaction, Transaction, TransactionType } from '../../shared/models/transaction';
import { NgClass, NgStyle } from '@angular/common';
import { GetPriceDecimalPipe } from '../../shared/pipes/getPriceDecimal.pipe';
import { TransactionService } from '../../shared/services/transaction.service';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { LabelService } from '../../shared/services/label.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [NgClass, GetPriceDecimalPipe, NgStyle],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.scss'
})
export class TransactionComponent implements OnDestroy, OnChanges {
  public TransactionType = TransactionType;
  private unsubscribe = new Subject<void>();

  private readonly transactionService = inject(TransactionService);
  private readonly labelService = inject(LabelService);
  private readonly authService = inject(AuthService);

  public labelColor?: string;
  public labelName?: string;

  @Input({ required: true }) public transaction!: Transaction;
  @Output() public transactionEdited: EventEmitter<AddOrEditTransaction> = new EventEmitter();
  @Output() public transactionDeleted: EventEmitter<void> = new EventEmitter();

  public ngOnChanges(changes: SimpleChanges): void {
    if ('transaction' in changes) {
      this.labelService.getLabel(this.transaction.labelId!)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((label) => {
          this.labelColor = label.color;
          this.labelName = label.name;
        });
    }
  }

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
