import { NgIf, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddOrEditLabel } from '../../../shared/models/label';
import { LabelService } from '../../../shared/services/label.service';
import { catchError, Subject, takeUntil, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { AuthService } from '../../../shared/services/auth.service';
import { TranslocoDirective } from '@ngneat/transloco';

@Component({
  selector: 'app-add-or-edit-label',
  standalone: true,
  imports: [FormsModule, NgStyle, SpinnerComponent, NgIf, ColorPickerModule, TranslocoDirective],
  templateUrl: './add-or-edit-label.component.html',
  styleUrl: './add-or-edit-label.component.scss'
})
export class AddOrEditLabelComponent implements OnInit, OnDestroy{
  private unsubscribe = new Subject<void>();
  private readonly labelService = inject(LabelService);

  public editingName: string | null = null;
  public editingColor: string = '#FFFFFF';
  private rowVersion: string | null = null;

  public showSavingSpinner = false;
  public showLoadingSpinner = false;
  public showSavingError = false;
  public showLoadingError = false;

  @Input({ required: true }) public addOrEditData!: AddOrEditLabel;
  @Output() public closedWindow: EventEmitter<void> = new EventEmitter();

  public ngOnInit(): void {
    if(!this.addOrEditData.labelId || this.addOrEditData.useCase === 'add') return;

    this.showLoadingSpinner = true;

    this.labelService.getLabel(this.addOrEditData.labelId)
      .pipe(takeUntil(this.unsubscribe),
      catchError((error: HttpErrorResponse) => {
        this.showLoadingSpinner = false;
        this.showLoadingError = true;

        return throwError(error);
      }))
      .subscribe((label)=> {
        this.editingName = label.name;
        this.editingColor = label.color;
        this.rowVersion = label.rowVersion;

        this.showLoadingSpinner = false;
      })
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public saveLabel(): void {
    this.showSavingError = false;
    this.showSavingSpinner = true;

    this.labelService.createOrUpdateLabel({
      id: this.addOrEditData.labelId ?? -1,
      name: this.editingName ?? '',
      color: this.editingColor ?? 'black',
      rowVersion: this.rowVersion,
    }).pipe(
      takeUntil(this.unsubscribe),
      catchError((error: HttpErrorResponse) => {
        console.log("update label error", error)
        this.showSavingSpinner = false;
        this.showSavingError = true;

        return throwError(error);
      })
    ).subscribe((label) =>  {
        console.log("label successfully updated", label);
        this.closedWindow.emit();
        this.showSavingSpinner = false;
      });
      
  }
}
