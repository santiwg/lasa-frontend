import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/config';
import { PaginatedData } from '../interfaces/paginated-data.interface';
import { Product, ProductDto, ProductWithCosts } from '../interfaces/product.interface';
import { Purchase, PurchaseDto } from '../interfaces/purchase.interface';
import { Payment, PaymentDto } from '../interfaces/payment.interface';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = config.urls.payments;

  constructor() {}
  async getPayments(page: number, quantity: number,filterType:string='', filterObjectId?: number): Promise<{
    success: true; data: PaginatedData<Payment>
  } | { success: false; error: string }> {
    try {
      const response = await axiosClient.get(`${this.baseUrl}?page=${page}&quantity=${quantity}&filterType=${filterType}&filterObjectId=${filterObjectId || ''}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unknown Error";
      return { success: false, error: message };
    }
  }

  async createPayment(payment: PaymentDto): Promise<{
    success: true; data: Payment
  } | { success: false; error: string }> {
    try {
      const response = await axiosClient.post(
        `${this.baseUrl}`,
        payment
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
  
  async deletePayment(id: number): Promise<{ success: true; data: { message: string } } | { success: false; error: string }> {
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
}

/*

@Get()
    async findAll(@Query() pagination: PaginationWithFilteringDto): Promise<PaginatedResponseDto<Payment>> {
        return await this.paymentService.findAll(pagination);
    }
    @Post()
    async createPayment(@Body() paymentData: NewPaymentDto): Promise<Payment> {
        return await this.paymentService.create(paymentData);
    }
    @Delete(':id')
    async deletePayment(@Param('id') id: number): Promise<{ message: string }> {
        return await this.paymentService.delete(id);
    }

*/