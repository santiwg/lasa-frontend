import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services';
import { GlobalStatusService } from '../../services/global-status-service';
import { Employee } from '../../interfaces/employee.interface';
import { Pagination } from '../../components/pagination/pagination';
import { EmployeeForm } from "../../components/employee-form/employee-form";

@Component({
  selector: 'app-employees',
  imports: [CommonModule, Pagination, EmployeeForm],
  templateUrl: './employees.html',
  styleUrl: './employees.css'
})
export class Employees implements OnInit {
  constructor(private employeeService: EmployeeService, private globalStatusService: GlobalStatusService) {}
  employees: Employee[] = [];
  page = 1; //initial value
  quantity = 10; //for the moment, it will always be 10
  hasNext = false; // controls next button
  showEmployeeModal = false;
  showCreateEmployeeRoleModal = false;
  selectedEmployee: Employee | null = null; // null = create, object = edit

  ngOnInit() {
    this.refreshPage();
  }

  private refreshPage() {
    this.globalStatusService.setLoading(true);
    // TODO: replace with service call + pagination metadata
    // Mock logic: if we have exactly 'quantity' items, assume there is a next page 
    this.globalStatusService.setLoading(false);
  }

  openEmployeeCreateModal() {
    this.selectedEmployee = null; // null indicates create mode
    this.showEmployeeModal = true;
  }

  openEmployeeEditModal(employee: Employee) {
    this.selectedEmployee = employee; // object indicates edit mode
    this.showEmployeeModal = true;
  }

  previousPage() { if (this.page > 1) { this.page--; this.refreshPage(); } }
  nextPage() { if (this.hasNext) { this.page++; this.refreshPage(); } }

  //event handlers
  onUpdateEmployee(employee: Employee) {
    this.globalStatusService.setLoading(true);
    //actualizar el elemento en la lista
    this.showEmployeeModal = false;
    this.globalStatusService.setLoading(false);
  }
  onCreateEmployee(employee: Employee) {
    this.globalStatusService.setLoading(true);
    //create the element in the list
    this.showEmployeeModal = false;
    this.globalStatusService.setLoading(false);
  }

  }
