import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employee, EmployeeCreate, EmployeeUpdate } from '../../interfaces/employee.interface';
import { EmployeeRole } from '../../interfaces/employee-role.interface';
import { ValidatorFn, AbstractControl } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    if (this.isEdit && this.employee) {
      const payload: EmployeeUpdate = {
        id: this.employee.id,
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
      this.updateEmployee(payload);
    } else {
      const payload: EmployeeCreate = {
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
  updateEmployee(payload: EmployeeUpdate): void {
    // This method is used to update an existing employee
    
    //EMIT the update event with the payload
    //this.update.emit(payload);
    //CORREGIR TIPO DE RETORNO
  }
  createEmployee(payload: EmployeeCreate): void {
    // This method is used to create a new employee
    //EMIT the create event with the payload
    //this.create.emit(payload);
    //CORREGIR TIPO DE RETORNO
  }

  onCancel(): void {
    this.cancel.emit();
  }
  ngOnInit() {
    //load employee roles from a service or API
  }
}
