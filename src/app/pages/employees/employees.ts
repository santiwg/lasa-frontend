import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services';
import { GlobalStatusService } from '../../services/global-status-service';
import { Employee } from '../../interfaces/employee.interface';
import { Pagination } from '../../components/pagination/pagination';
import { EmployeeForm } from "../../components/employee-form/employee-form";
import { EmployeeRoleForm } from "../../components/employee-role-form/employee-role-form";
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-employees',
  imports: [CommonModule, EmployeeForm, EmployeeRoleForm],
  templateUrl: './employees.html',
  styleUrl: './employees.css'
})
export class Employees implements OnInit {
  constructor(private employeeService: EmployeeService, private globalStatusService: GlobalStatusService, private alert: AlertService) {}
  employees: Employee[] = [];
  /*De momento no usamos paginacion en este componente
  page = 1; //initial value
  quantity = 10; //for the moment, it will always be 10*/
  hasNext = false; // controls next button
  showEmployeeModal = false;
  showCreateEmployeeRoleModal = false;
  selectedEmployee: Employee | null = null; // null = create, object = edit

  ngOnInit() {
    this.refreshPage();
  }

  private refreshPage() {
    this.globalStatusService.setLoading(true);
    this.employeeService.getEmployees().then(response => {
        if (response.success) {
          this.employees = response.data;
          // Ordena mostrando primero los empleados activos
          this.employees.sort((a, b) => Number(b.isActive) - Number(a.isActive));
        } else {
          this.alert.error(`Error al obtener los empleados: ${response.error}`);
        }
        this.globalStatusService.setLoading(false);
      });
    
      
  }

  openEmployeeCreateModal() {
    this.selectedEmployee = null; // null indicates create mode
    this.showEmployeeModal = true;
  }

  openEmployeeEditModal(employee: Employee) {
    this.selectedEmployee = employee; // object indicates edit mode
    this.showEmployeeModal = true;
  }
/*De momento no usamos paginacion en este componente
  previousPage() { if (this.page > 1) { this.page--; this.refreshPage(); } }
  nextPage() { if (this.hasNext) { this.page++; this.refreshPage(); } }
  */

  //event handlers
  onUpdateEmployee(employee: Employee) {
    this.showEmployeeModal = false;
    this.globalStatusService.setLoading(true);
    // Buscamos el empleado viejo por el id y lo reemplazamos por el nuevo
    const index = this.employees.findIndex(e => e.id === employee.id);
    if (index !== -1) {
      this.employees[index] = employee;
    }
    this.globalStatusService.setLoading(false);
  }
  onCreateEmployee(employee: Employee) {
    this.showEmployeeModal = false;
    this.globalStatusService.setLoading(true);
    this.employees.unshift(employee); // add to the beginning of the list
    this.globalStatusService.setLoading(false);
  }

  }
