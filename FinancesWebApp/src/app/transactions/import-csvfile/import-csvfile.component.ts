import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { Transaction, TransactionType, TransactionWithLabel } from '../../shared/models/transaction';
import { LabelService } from '../../shared/services/label.service';
import { TransactionService } from '../../shared/services/transaction.service';
import { concatMap, from, iif, of, Subject, switchMap, takeUntil } from 'rxjs';
import { Label } from '../../shared/models/label';
import { TransactionComponent } from '../transaction/transaction.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslocoDirective } from '@ngneat/transloco';
import { ImportDataSource, SelectionOptions } from '../../shared/models/importCSV';

@Component({
  selector: 'app-import-csvfile',
  standalone: true,
  imports: [NgIf, NgFor, TransactionComponent, SpinnerComponent, TranslocoDirective, NgClass],
  templateUrl: './import-csvfile.component.html',
  styleUrl: './import-csvfile.component.scss'
})
export class ImportCSVFileComponent implements OnInit, OnDestroy {
  private unsubscribe = new Subject<void>();

  public fileName: string = "";
  public fileSelected = false;
  public showUploadingSpinner = false;
  public showUploadingError = false;
  public uploadingTransactionNumber: number = 0;
  public uploadCompleted = false;
  public selectedPriceOptionIndex: number = 3;
  public numberOfPersons: number = 0;
  
  public previewTransactions: TransactionWithLabel[] = [];
  public existingLabels: Label[] = [];
  public priceSelectionOptions: SelectionOptions[] = [];
  public dataSource: ImportDataSource = 'default';
  private csvData: string[][] = [];
  

  @Output() public closedWindow = new EventEmitter<void>();

  private readonly labelService = inject(LabelService);
  private readonly transactionService = inject(TransactionService);

  public ngOnInit(): void {
    this.labelService.getLabels().pipe(takeUntil(this.unsubscribe)).subscribe((labels) => {
      if (labels) labels.forEach((label) => this.existingLabels.push(label));
    });
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public cancelUpload(): void {
    this.showUploadingError = true;
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public selectFile(id: string): void {
    document.getElementById(id)?.click();
  }

  public onFileSelected(event: Event, splitwise: boolean): void {
    this.dataSource = splitwise ? 'splitwise' : 'default';

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.fileName = file.name;
    const reader = new FileReader();

    reader.onload = () => {
      const text = reader.result as string;
      const cellSplitting: ',' | ';' = splitwise ? ',' : ';';
      this.csvData = this.parseCSV(text, cellSplitting);

      const headers = this.csvData[0];
      this.numberOfPersons = headers.length - 5;

      this.addPriceSelectionOption(3, headers[3]);
      // Do not add 'Währung'
      for (let i = 5; i < headers.length; i++) {
        this.addPriceSelectionOption(i,headers[i]);
      }
      
      if (splitwise === true) this.previewTransactions = this.getTransactionsFromSplitwiseCSV(this.csvData);
      else this.previewTransactions = this.getTransactionsFromCSV(this.csvData);
    };

    reader.readAsText(file);
    this.fileSelected = true;
  }

  private addPriceSelectionOption(index: number, title: string): void {
    this.priceSelectionOptions.push({
      index: index,
      title: title,
    });
  }

  public onPriceOptionChange(index: number): void {
    if(this.dataSource === 'default') return;

    this.selectedPriceOptionIndex = index;
    this.previewTransactions = this.getTransactionsFromSplitwiseCSV(this.csvData, index);
  }

  // In english CSV files, cells are splitted by comma. In german csv files, cells are splitted by semicolon
  private parseCSV(data: string, cellSplitting: ',' | ';'): string[][] {
    const rows = data.split('\n');
    return rows.map(row => row.split(cellSplitting));
  }

  private getColors(): string[] {
    return [
      "#68066b",
      "#ff5733",
      "#3498db",
      "#27ae60",
      "#f1c40f",
      "#e74c3c",
      "#8e44ad",
      "#2c3e50",
      "#1abc9c",
      "#c0392b",
      "#9b59b6",
      "#2980b9",
      "#16a085",
      "#f39c12",
      "#d35400",
      "#34495e",
      "#7f8c8d",
      "#2ecc71",
      "#e67e22",
      "#95a5a6"
    ];
  }

  public uploadImportedTransactions(): void {
    this.showUploadingError = false;
    this.showUploadingSpinner = true;
    this.uploadingTransactionNumber = 1;

    from(this.previewTransactions).pipe(  // Wandelt die Liste in einen Observable-Stream um
      concatMap((transaction: TransactionWithLabel) => {
        const existingLabel = this.existingLabels.find(
          (label) => label.name === transaction.labelName
        );

        return iif(
          () => !!existingLabel,  // Bedingung: Gibt true zurück, wenn ein Label existiert
          of(existingLabel),       // Observable für den Fall, dass das Label existiert
          this.labelService.createOrUpdateLabel({  // Observable für den Fall, dass das Label nicht existiert
            id: -1,
            name: transaction.labelName,
            color: transaction.labelColor,
            rowVersion: null,
          })
        ).pipe(
          switchMap((label) => {
            if (label) this.existingLabels.push(label);
            // Sobald wir das Label haben (existierend oder neu erstellt), können wir die Transaktion erstellen
            return this.transactionService.createOrUpdateTransaction({
              id: -1,
              date: transaction.date,
              title: transaction.title,
              transactionType: transaction.transactionType,
              price: transaction.price,
              labelId: label!.id,
              rowVersion: null,
            });
          })
        );
      }),
      takeUntil(this.unsubscribe)
    ).subscribe({
      next: (transaction: Transaction) => {
        console.log('Transaktion erstellt:', transaction);
        this.uploadingTransactionNumber++;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Fehler beim Hochladen der Transaktion:', error);
        this.showUploadingError = true;
        this.showUploadingSpinner = false;
      },
      complete: () => {
        console.log('Alle Transaktionen wurden hochgeladen.');
        this.showUploadingSpinner = false;
        this.uploadCompleted = true;
      }
    });
  }

  // The default priceIndex is 3, as this is the total value of a splitwise transaction. 
  // If the user selected the individual amount for a transaction, another index will be used.
  private getTransactionsFromSplitwiseCSV(csvData: string[][], priceIndex: number = 3): TransactionWithLabel[] {
    const filteringData = csvData.slice(); // new array
    filteringData.splice(0, 2);
    filteringData.splice(-4);   

    const colors = this.getColors()
    let colorIndex = 0;
    const existingLabels: Label[] = [];

    const transactions = filteringData.map((transaction) => {
      const title: string = transaction[1];
      const transactionType: TransactionType = TransactionType.Expense;
      const date: Date = new Date(transaction[0]);
      const labelName: string = transaction[2];
      const existingLabel = existingLabels.find((label) => label.name === labelName);

      if (!existingLabel) {
        existingLabels.push(
          {
            id: -1,
            name: labelName,
            color: colors[colorIndex++],
            rowVersion: null,
          })
      }

      const labelColor: string = existingLabels.find((label) => label.name === labelName)?.color ?? '';
      let price: number;

      try {
        const eprice = Number(transaction[3]);
        if(priceIndex !== 3) price = eprice / this.numberOfPersons;
        else price = eprice;
        
      } catch (error) {
        price = 0;
      }

      const transactionWithLabel: TransactionWithLabel = {
        id: -1,
        transactionType: transactionType,
        date: date,
        title: title,
        labelId: -1,
        price: price,
        rowVersion: null,
        labelName: labelName,
        labelColor: labelColor,
      }

      return transactionWithLabel;
    });

    return transactions.filter((transaction) => transaction.labelName !== 'Zahlung');
  }


  private getTransactionsFromCSV(csvData: string[][]): TransactionWithLabel[] {
    csvData.shift();

    return csvData.map((transaction) => {
      const title: string = transaction[1];
      const transactionType: TransactionType = transaction[2] === '1' ? TransactionType.Expense : TransactionType.Income;
      const date: Date = new Date(transaction[3]);
      const labelName: string = transaction[5];
      const labelColor: string = transaction[6];
      let price: number;

      try {
        price = Number(transaction[4].replace(',', '.'));
      } catch (error) {
        price = 0;
      }

      const transactionWithLabel: TransactionWithLabel = {
        id: -1,
        transactionType: transactionType,
        date: date,
        title: title,
        labelId: -1,
        price: price,
        rowVersion: null,
        labelName: labelName,
        labelColor: labelColor,
      }

      return transactionWithLabel;
    })
  }
}
