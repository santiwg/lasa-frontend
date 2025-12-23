import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/config';
import { PaginatedData } from '../interfaces/paginated-data.interface';
import { Product, ProductDto, ProductWithCosts } from '../interfaces/product.interface';
import { Supplier, SupplierDto, SupplierWithBalance } from '../interfaces/supplier.interface';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private baseUrl = config.urls.suppliers;

  constructor() {}
  async getSuppliersWithBalance(page: number, quantity: number,sort:string='',order:"desc"|"asc"="desc"): Promise<{
    success: true; data: PaginatedData<SupplierWithBalance>
  } | { success: false; error: string }> {
    try {
      const response = await axiosClient.get(`${this.baseUrl}/with-balance?page=${page}&quantity=${quantity}&sort=${sort}&order=${order}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unknown Error";
      return { success: false, error: message };
    }
   
  }
  
    async getSuppliers(page: number, quantity: number): Promise<{
      success: true; data: PaginatedData<Supplier>
    } | { success: false; error: string }> {
      try {
        const response = await axiosClient.get(`${this.baseUrl}?page=${page}&quantity=${quantity}`);
        return { success: true, data: response.data };
      } catch (error: any) {
        const message =
          error.response?.data?.message ||  // si existe un mensaje de error que manda el backend lo uso
          error.message ||                  // mensaje generado por Axios
          "Unknown Error";                  // por si no se obtiene
        return { success: false, error: message };
      }
    }

  async createSupplier(supplier: SupplierDto): Promise<{
    success: true; data: SupplierWithBalance
  } | { success: false; error: string }> {
    try {
      const response = await axiosClient.post(
        `${this.baseUrl}`,
        supplier
      );
      return { success: true, data: response.data }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unknown Error";
      return { success: false, error: message };
    }
  }

  async updateSupplier(supplier: SupplierDto, id: number): Promise<{
    success: true; data: SupplierWithBalance
  } | { success: false; error: string }> {
    try {
      const response = await axiosClient.put(
        `${this.baseUrl}/${id}`,
        supplier
      );
      return { success: true, data: response.data }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unknown Error";
      return { success: false, error: message };
    }
  }

  async deleteSupplier(id: number): Promise<{ success: true; data: { message: string } } | { success: false; error: string }> {
    try {
      const response = await axiosClient.delete(
        `${this.baseUrl}/${id}`
      );
      return { success: true, data: response.data }
    }
    catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unknown Error";
      return { success: false, error: message }
    }
  }
  // Métodos CRUD aquí
}
/* 
    @Get()
    async findAll(@Query() pagination: PaginationWithSortingDto):Promise<PaginatedResponseDto<SupplierWithBalance>> {
        return await this.supplierService.findAll(pagination);
    }
    
    @Post()
    async createSupplier(@Body() newSupplierDto: NewSupplierDto): Promise<SupplierWithBalance> {
        return await this.supplierService.create(newSupplierDto);
    }
    @Put(':id')
    async updateSupplier(@Param('id') id: number, @Body() updateSupplierDto: NewSupplierDto): Promise<SupplierWithBalance> {
        return await this.supplierService.update(id, updateSupplierDto);
    }
    @Delete(':id')
    async deleteSupplier(@Param('id') id: number): Promise<{ message: string }> {
        return await this.supplierService.delete(id);
    }
*/