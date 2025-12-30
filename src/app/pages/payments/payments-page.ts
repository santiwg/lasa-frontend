import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Pagination } from '../../components/pagination/pagination';
import { FilterSelectionForm, FilterSelectionResult, SelectableEntity } from '../../components/filter-selection-form/filter-selection-form';
import { Payment } from '../../interfaces/payment.interface';
import { PaymentMethod } from '../../interfaces/payment-method.interface';
import { Supplier } from '../../interfaces/supplier.interface';
import { AlertService } from '../../services/alert.service';
import { GlobalStatusService } from '../../services/global-status-service';
import { PaymentService } from '../../services/payment.service';
import { PaymentMethodService } from '../../services/payment-method.service';
import { PurchaseService } from '../../services/purchase.service';
import { SupplierService } from '../../services/supplier.service';
import { PaymentForm } from '../../components/payment-form/payment-form';

@Component({
  selector: 'app-payments',
  imports: [CommonModule, Pagination, FilterSelectionForm, PaymentForm],
  templateUrl: './payments-page.html',
  styleUrl: './payments-page.css'
})
export class PaymentsPage {

  @Input() filterType: string = '';
  @Input() filterObjectId?: number;

  payments: Payment[] = [];

  page = 1;
  quantity = 10;
  hasNext = false;

  showPaymentModal = false;

  showSupplierSelectionModal = false;
  showPaymentMethodSelectionModal = false;

  fetchSupplierOptions: () => Promise<FilterSelectionResult<Supplier>> = async () => {
    const response = await this.supplierService.getSuppliers(1, 1000);
    if (response.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, error: response.error };
  };

  fetchPaymentMethodOptions: () => Promise<FilterSelectionResult<PaymentMethod>> = async () => {
    const response = await this.paymentMethodService.getPaymentMethods();
    return response;
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly paymentService: PaymentService,
    private readonly supplierService: SupplierService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly purchaseService: PurchaseService,
    private readonly alertService: AlertService,
    private readonly globalStatusService: GlobalStatusService,
  ) { }

  ngOnInit() {
    const supplierIdParam = this.route.snapshot.queryParamMap.get('supplierId');
    if (supplierIdParam) {
      const supplierId = Number(supplierIdParam);
      if (!Number.isNaN(supplierId)) {
        this.filterType = 'supplier';
        this.filterObjectId = supplierId;
      }
    }
    this.refreshPage();
  }

  // Total del pago (suma de detalles + monto no asignado)
  calculatePaymentTotal(payment: Payment): number {
    return this.paymentService.calculatePaymentTotal(payment);
  }

  // Total de la venta/compra asociada al detalle
  calculateDetailSaleTotal(paymentDetail: Payment['details'][number]): number {
    const purchase = paymentDetail.purchase;
    if (!purchase) return 0;
    return this.purchaseService.calculatePurchaseTotal(purchase);
  }

  private refreshPage() {
    this.globalStatusService.setLoading(true);
    this.paymentService
      .getPayments(this.page, this.quantity, this.filterType, this.filterObjectId)
      .then(response => {
        if (response.success) {
          this.payments = response.data.data;
          this.hasNext = response.data.hasMore;
        } else {
          this.alertService.error(`Error al obtener los pagos: ${response.error}`);
        }
      })
      .catch((err: any) => {
        const message = err?.message ? String(err.message) : String(err);
        this.alertService.error(`Error al obtener los pagos: ${message}`);
      })
      .finally(() => {
        this.globalStatusService.setLoading(false);
      });
  }

  openSupplierSelectionModal() {
    this.showSupplierSelectionModal = true;
  }

  openPaymentMethodSelectionModal() {
    this.showPaymentMethodSelectionModal = true;
  }

  openPaymentCreateModal() {
    this.showPaymentModal = true;
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.refreshPage();
    }
  }

  nextPage() {
    if (this.hasNext) {
      this.page++;
      this.refreshPage();
    }
  }

  async deletePayment(payment: Payment) {
    const confirmed = await this.alertService.confirm();
    if (!confirmed) return;

    this.globalStatusService.setLoading(true);
    const response = await this.paymentService.deletePayment(payment.id);

    if (response.success) {
      if (this.hasNext) {
        this.refreshPage();
      } else {
        this.payments = this.payments.filter(p => p.id !== payment.id);
        if (this.payments.length === 0 && this.page > 1) {
          this.previousPage();
        }
      }

      this.globalStatusService.setLoading(false);
      await this.alertService.success('Eliminado', 'El pago ha sido eliminado.');
    } else {
      this.globalStatusService.setLoading(false);
      await this.alertService.error(`Hubo un problema eliminando el pago:\n${response.error}`);
    }
  }

  onCreatePayment(payment: Payment) {
    this.showPaymentModal = false;
    this.globalStatusService.setLoading(true);
    this.payments.unshift(payment);
    this.sortPayments();
    if (this.payments.length > this.quantity) {
      this.payments.pop();
      this.hasNext = true;
    }
    this.globalStatusService.setLoading(false);
  }

  sortPayments(order: 'asc' | 'desc' = 'desc') {
    this.payments.sort((a, b) => {
      const comparison = new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      return order === 'asc' ? comparison : -comparison;
    });
  }

  onApplyFilters(filterType: string, filterObject: SelectableEntity | null) {
    if (filterObject == null) {
      this.filterObjectId = undefined;
      this.filterType = '';
      this.refreshPage();
      return;
    }

    this.filterType = filterType;
    this.filterObjectId = filterObject.id;
    this.page = 1;
    this.refreshPage();
  }
}
