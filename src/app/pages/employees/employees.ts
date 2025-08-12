import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services';
import { GlobalStatusService } from '../../services/global-status-service';
import { Employee } from '../../interfaces/employee.interface';
import { Pagination } from '../../components/pagination/pagination';

@Component({
  selector: 'app-employees',
  imports: [CommonModule, Pagination],
  templateUrl: './employees.html',
  styleUrl: './employees.css'
})
export class Employees implements OnInit {
  constructor(private employeeService: EmployeeService, private globalStatusService: GlobalStatusService) {}
  employees: Employee[] = [];
  page = 1; //initial value
  quantity = 10; //for the moment, it will always be 10
  hasNext = false; // controls next button
  showCreateEmployeeModal = false;
  showEditEmployeeModal = false;
  showCreateEmployeeRoleModal = false;
  ngOnInit() {
    this.refreshPage();
  }

  private refreshPage() {
    this.globalStatusService.setLoading(true);
    // TODO: replace with service call + pagination metadata
    // Mock logic: if we have exactly 'quantity' items, assume there is a next page 
    this.globalStatusService.setLoading(false);
  }

  previousPage() { if (this.page > 1) { this.page--; this.refreshPage(); } }
  nextPage() { if (this.hasNext) { this.page++; this.refreshPage(); } }
}
