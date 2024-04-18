import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AddOrEditTransaction, Transaction, TransactionType } from '../../shared/models/transaction';
import { NgClass } from '@angular/common';
import { GetPriceDecimalPipe } from '../../shared/pipes/getPriceDecimal.pipe';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [NgClass, GetPriceDecimalPipe],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.scss'
})
export class TransactionComponent {
  public TransactionType = TransactionType;
  @Input({required: true}) public transaction!: Transaction;
  @Output() public transactionEdited: EventEmitter<AddOrEditTransaction> = new EventEmitter();

  public edit(): void {
    this.transactionEdited.emit({
      useCase: 'edit',
      transactionId: this.transaction.id,
      transactionType: this.transaction.transactionType,
    })
  }
}
