import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeRoleForm } from './employee-role-form';

describe('EmployeeRoleForm', () => {
  let component: EmployeeRoleForm;
  let fixture: ComponentFixture<EmployeeRoleForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeRoleForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeRoleForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
