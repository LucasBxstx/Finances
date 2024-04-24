import { NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddOrEditLabel } from '../../../shared/models/label';
import { LabelService } from '../../../shared/services/label.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-or-edit-label',
  standalone: true,
  imports: [FormsModule, NgStyle],
  templateUrl: './add-or-edit-label.component.html',
  styleUrl: './add-or-edit-label.component.scss'
})
export class AddOrEditLabelComponent implements OnInit, OnDestroy{
  private unsubscribe = new Subject<void>();
  private readonly labelService = inject(LabelService);

  public editingName: string | null = null;
  public editingColor: string | null = null;

  @Input({ required: true }) public addOrEditData!: AddOrEditLabel;
  @Output() public closedWindow: EventEmitter<void> = new EventEmitter();

  public ngOnInit(): void {
    if(!this.addOrEditData.labelId) return;

    this.labelService.getLabel('6104cf02-6adf-45da-8e0b-f32946e3cf13', this.addOrEditData.labelId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((label)=>{
        this.editingName = label.name;
        this.editingColor = label.color;
      })
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
