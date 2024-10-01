import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, SimpleChanges, inject } from '@angular/core';
import { AddOrEditTransaction, Transaction, TransactionType } from '../../shared/models/transaction';
import { AsyncPipe, NgClass, NgIf, NgStyle } from '@angular/common';
import { GetPriceDecimalPipe } from '../../shared/pipes/getPriceDecimal.pipe';
import { TransactionService } from '../../shared/services/transaction.service';
import { map, Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LabelService } from '../../shared/services/label.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MOBILE_BREAKPOINT } from '../../shared/constants';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [NgClass, GetPriceDecimalPipe, NgStyle, NgIf, AsyncPipe],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.scss'
})
export class TransactionComponent implements OnDestroy, OnChanges {
  public TransactionType = TransactionType;
  private unsubscribe = new Subject<void>();

  private readonly transactionService = inject(TransactionService);
  private readonly labelService = inject(LabelService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  public readonly breakpointMobile$ = this.breakpointObserver.observe([MOBILE_BREAKPOINT]).pipe(map((state)=> state.matches));

  public labelColor?: string;
  public labelName?: string;
  public openEditContainer = false;

  @Input({ required: true }) public transaction!: Transaction;
  @Output() public transactionEdited: EventEmitter<AddOrEditTransaction> = new EventEmitter();
  @Output() public transactionDeleted: EventEmitter<void> = new EventEmitter();

  @HostListener('click')
  public onClick(): void {
    if(!this.isMobile()) return;

    this.openEditContainer = !this.openEditContainer;
  }

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

  private isMobile(): boolean {
    return this.breakpointObserver.isMatched(MOBILE_BREAKPOINT);
  }
}
