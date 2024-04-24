import { NgIf, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddOrEditLabel } from '../../../shared/models/label';
import { LabelService } from '../../../shared/services/label.service';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-add-or-edit-label',
  standalone: true,
  imports: [FormsModule, NgStyle, SpinnerComponent, NgIf],
  templateUrl: './add-or-edit-label.component.html',
  styleUrl: './add-or-edit-label.component.scss'
})
export class AddOrEditLabelComponent implements OnInit, OnDestroy{
  private unsubscribe = new Subject<void>();
  private readonly labelService = inject(LabelService);

  public editingName: string | null = null;
  public editingColor: string | null = null;
  private rowVersion: string | null = null;

  public showSavingSpinner = false;

  @Input({ required: true }) public addOrEditData!: AddOrEditLabel;
  @Output() public closedWindow: EventEmitter<void> = new EventEmitter();

  public ngOnInit(): void {
    if(!this.addOrEditData.labelId) return;

    this.labelService.getLabel('6104cf02-6adf-45da-8e0b-f32946e3cf13', this.addOrEditData.labelId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((label)=>{
        this.editingName = label.name;
        this.editingColor = label.color;
        this.rowVersion = label.rowVersion;
      })
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public saveLabel(): void {
    this.showSavingSpinner = true;

    this.labelService.createOrUpdateLabel({
      id: this.addOrEditData.labelId ?? -1,
      userId: '6104cf02-6adf-45da-8e0b-f32946e3cf13',
      name: this.editingName ?? '',
      color: this.editingColor ?? 'black',
      rowVersion: this.rowVersion,
    }).pipe(takeUntil(this.unsubscribe))
      .subscribe((label) =>  {
        console.log("label successfully updated", label);
        this.closedWindow.emit();
        this.showSavingSpinner = false;
      },
      (error: HttpErrorResponse) => {
        console.log("update label error", error)
        this.showSavingSpinner = false;
      });
  }
}
