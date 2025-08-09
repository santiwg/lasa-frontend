import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/env';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private baseUrl = config.urls.employees;

  constructor() {}

  // Métodos CRUD aquí
}
