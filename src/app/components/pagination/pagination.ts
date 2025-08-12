import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css'
})
export class Pagination {
  @Input() page = 1; // default current page
  @Input() hasNext = false; // controlled by parent
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
}
