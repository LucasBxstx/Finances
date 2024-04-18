import { Component, Input } from '@angular/core';
import { Transaction, TransactionType } from '../../shared/models/transaction';
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
}
