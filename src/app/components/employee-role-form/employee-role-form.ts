import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeRoleDto } from '../../interfaces/employee-role.interface';
import { EmployeeRoleService } from '../../services';
import { GlobalStatusService } from '../../services/global-status-service';

@Component({
  selector: 'app-employee-role-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-role-form.html',
  styleUrls: ['./employee-role-form.css']
})
export class EmployeeRoleForm {
  //No edit mode, only create mode
  //No event for creation, since the father component wouldn´t do anything with it
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder, private alert: AlertService,private globalStatusService: GlobalStatusService, private readonly employeeRoleService: EmployeeRoleService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const confirmed = await this.alert.confirm();
    if (!confirmed) return;
    const v = this.form.value;
    const payload: EmployeeRoleDto = {
      name: v.name.trim(),
      description: v.description?.trim() || undefined
    };
    this.createEmployeeRole(payload);
  }
  
  
  async createEmployeeRole(payload: EmployeeRoleDto): Promise<void> {
      this.globalStatusService.setLoading(true);
      const response = await this.employeeRoleService.createEmployeeRole(payload);
      this.globalStatusService.setLoading(false);
      if (response.success) {
        this.alert.success('¡Rol de empleado creado!');
      } else {
        this.alert.error(`Surgió un problema creando el rol de empleado.\n ${response.error}`);
      }
      this.onCancel(); // close the modal after creation
    }

  onCancel(): void {
    this.cancel.emit();
  }
}
