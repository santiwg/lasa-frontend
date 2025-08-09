import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/env';

@Injectable({
  providedIn: 'root'
})
export class EmployeeRoleService {
  private baseUrl = config.urls.employeeRoles;

  constructor() {}

  // Métodos CRUD aquí
}
