import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GetMonthPipe } from '../../pipes/getMonth.pipe';

@Component({
  selector: 'app-drop-menu',
  standalone: true,
  imports: [NgIf, NgFor, GetMonthPipe, NgClass],
  templateUrl: './drop-menu.component.html',
  styleUrl: './drop-menu.component.scss'
})
export class DropMenuComponent {
  @Input() public menuOpen = false;
  @Input() public description?: string;
  @Input() public translateMonth = false;
  @Input({required: true}) public currentValue!: number | null;
  @Input({required: true}) public valueList!: number[] | null;

  @Output() public valueChanged: EventEmitter<number> = new EventEmitter<number>();
  @Output() public menuOpened: EventEmitter<void> = new EventEmitter<void>();
  @Output() public menuClosed: EventEmitter<void> = new EventEmitter<void>();

  public toggleMenu(): void {
    if (this.menuOpen) this.menuClosed.emit();
    else this.menuOpened.emit();
  }

}
