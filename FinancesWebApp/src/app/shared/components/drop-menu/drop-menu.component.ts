import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-drop-menu',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './drop-menu.component.html',
  styleUrl: './drop-menu.component.scss'
})
export class DropMenuComponent {
  public menuOpen = false;

  @Input() public description?: string;
  @Input({required: true}) public currentValue!: number | null;
  @Input({required: true}) public valueList!: number[] | null;

  @Output() public valueChanged: EventEmitter<number> = new EventEmitter<number>();
}
