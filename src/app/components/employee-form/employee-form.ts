import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employee, EmployeeDto } from '../../interfaces/employee.interface';
import { EmployeeRole } from '../../interfaces/employee-role.interface';
import { ValidatorFn, AbstractControl } from '@angular/forms';
import { AlertService } from '../../services/alert.service';
import { GlobalStatusService } from '../../services/global-status-service';
import { EmployeeRoleService, EmployeeService } from '../../services';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-form.html',
  styleUrls: ['./employee-form.css']
})
export class EmployeeForm implements OnChanges, OnInit {
  @Input() employee: Employee | null = null; // if provided -> edit mode, if not provided -> create mode
  roles: EmployeeRole[] = [];

  @Output() create = new EventEmitter<Employee>();
  @Output() update = new EventEmitter<Employee>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;

  get isEdit(): boolean { return !!this.employee; }

  constructor(private fb: FormBuilder, private alert: AlertService, private globalStatusService: GlobalStatusService, private readonly employeeService: EmployeeService, private readonly employeeRolesService: EmployeeRoleService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^[\d\-() ]+$/) // allows digits, parentheses, hyphens, and spaces
      ]],
      roleId: [null, Validators.required],
      cuit: ['', [Validators.pattern(/^[\d-]+$/)]],
      cuil: ['', [Validators.pattern(/^[\d-]+$/)]],
      hourlyWage: [0, [Validators.required, Validators.min(0)]],
      isActive: [true],
    }, { validators: EmployeeForm.cuitCuilRequiredValidator() });
  }

  //validator for checking that at least one of CUIL and CUIT is provided
  //if neither is provided, the form will be invalid
  static cuitCuilRequiredValidator(): ValidatorFn {
    return (group: AbstractControl) => {
      const cuit = group.get('cuit')?.value;
      const cuil = group.get('cuil')?.value;
      const cuitCtrl = group.get('cuit');
      const cuilCtrl = group.get('cuil');
      if ((!cuit || cuitCtrl?.untouched) && (!cuil || cuilCtrl?.untouched)) {
        return { cuitCuilRequired: true }; //returns an error
      }
      return null; // no error
    };
  }

  //inicializar o actualizar el formulario cada vez que cambie el empleado a editar.
  ngOnChanges(changes: SimpleChanges): void {
    if ('employee' in changes) {
      const e = this.employee;
      if (e) {
        this.form.patchValue({
          name: e.name,
          lastName: e.lastName,
          email: e.email,
          phoneNumber: e.phoneNumber,
          roleId: e.role?.id ?? null,
          hourlyWage: e.hourlyWage,
          isActive: e.isActive,
          cuit: e.cuit ?? '',
          cuil: e.cuil ?? ''
        });
      } else {
        this.form.reset({
          name: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          roleId: null,
          hourlyWage: 0,
          isActive: true,
          cuit: '',
          cuil: ''
        });
      }
    }
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); //trigger validation messages for all form fields at once
      return;
    }

    const confirmed = await this.alert.confirm();
    if (!confirmed) return;
    const v = this.form.value;
    if (this.isEdit && this.employee) {
      const payload: EmployeeDto = {
        name: v.name!,
        lastName: v.lastName!,
        email: v.email!,
        phoneNumber: v.phoneNumber || '',
        roleId: v.roleId!,
        hourlyWage: Number(v.hourlyWage!),
        isActive: !!v.isActive,
        cuit: v.cuit || undefined,
        cuil: v.cuil || undefined
      };
      this.updateEmployee(payload, this.employee.id!);
    } else {
      const payload: EmployeeDto = {
        name: v.name!,
        lastName: v.lastName!,
        email: v.email!,
        phoneNumber: v.phoneNumber || '',
        roleId: v.roleId!,
        hourlyWage: Number(v.hourlyWage!),
        isActive: !!v.isActive,
        cuit: v.cuit || undefined,
        cuil: v.cuil || undefined
      };
      this.createEmployee(payload);
    }
  }

  async updateEmployee(payload: EmployeeDto, id: number): Promise<void> {
    // This method is used to update an existing employee
    this.globalStatusService.setLoading(true);
    const response = await this.employeeService.updateEmployee(payload, id);
    this.globalStatusService.setLoading(false);
    if (response.success) {
      this.alert.success('¡Empleado actualizado!');
      this.update.emit(response.data);
    } else {
      this.alert.error(`Surgió un problema editando al empleado.\n ${response.error}`);
    }
    this.onCancel(); // close the modal after update
  }
  async createEmployee(payload: EmployeeDto): Promise<void> {
    this.globalStatusService.setLoading(true);
    const response = await this.employeeService.createEmployee(payload);
    this.globalStatusService.setLoading(false);
    if (response.success) {
      this.alert.success('¡Empleado creado!');
      this.create.emit(response.data);
    } else {
      this.alert.error(`Surgió un problema creando al empleado.\n ${response.error}`);
    }
    this.onCancel(); // close the modal after creation
  }

  onCancel(): void {
    this.cancel.emit();
  }
  ngOnInit() {
    this.getEmployeeRoles()
  }
  getEmployeeRoles(): void {
    this.globalStatusService.setLoading(true);
    this.employeeRolesService.getEmployeeRoles().then(response => {
      if (response.success) {
        this.roles = response.data;
      } else {
        this.alert.error(`Error al obtener los roles de empleados: ${response.error}`);
        //since I'm not using "await", the next actions happen right away
        this.onCancel(); // close the modal if roles cannot be loaded
      }
      this.globalStatusService.setLoading(false);
    });
    
  }
}
