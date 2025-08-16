import { Component, OnInit } from '@angular/core';
import { CifService } from '../../services';
import { GlobalStatusService } from '../../services/global-status-service';
import { AlertService } from '../../services/alert.service';
import { Cif } from '../../interfaces/cif.interface';
import { CurrencyPipe,DatePipe } from '@angular/common';
import { Pagination } from "../../components/pagination/pagination";
import { CifForm } from "../../components/cif-form/cif-form";
import { CostTypeForm } from "../../components/cost-type-form/cost-type-form";
import { UnitForm } from "../../components/unit-form/unit-form";

@Component({
  selector: 'app-cif',
  imports: [CurrencyPipe, DatePipe, Pagination, CifForm, CostTypeForm, UnitForm],
  templateUrl: './cif-page.html',
  styleUrl: './cif-page.css'
})
export class CifPage implements OnInit{

  constructor(private cifService: CifService, private globalStatusService: GlobalStatusService, private alert: AlertService) {}
  cifs: Cif[] = [];

  page = 1; //initial value
  quantity = 10; //for the moment, it will always be 10
  hasNext = false; // controls next button
  showCifModal = false;
  showCreateCifRoleModal = false;
  showCreateCostTypeModal=false;
  showCreateUnitModal=false;
  lastMonthTotal:number = 0; // total of the last month
  currentMonthTotal:number = 0; // total of the current month
  unitScope:string = 'Frecuencia';
  /* 
  de momento no se implementa la opción de edición
  selectedCif: Cif | null = null; // null = create, object = edit
  */
  
  ngOnInit() {
    this.refreshPage();
  }

  private refreshPage() {
    this.globalStatusService.setLoading(true);
    this.cifService.getCifsData(this.page,this.quantity).then(response => {
        if (response.success) {
          const paginatedResponse = response.data.paginatedCifs;
          this.cifs = paginatedResponse.data;
          this.hasNext = paginatedResponse.hasMore;
          this.lastMonthTotal = response.data.lastMonthTotal;
          this.currentMonthTotal = response.data.currentMonthTotal;

        } else {
          this.alert.error(`Error al obtener los CIFs: ${response.error}`);
        }
        this.globalStatusService.setLoading(false);
      });
    
      
  }

  openCifCreateModal() {
    //this.selectedCif = null; // null indicates create mode
    this.showCifModal = true;
  }

  /*openCifEditModal(cif: Cif) {
    this.selectedCif = cif; // object indicates edit mode
    this.showCifModal = true;
  }*/

  previousPage() { if (this.page > 1) { this.page--; this.refreshPage(); } }
  nextPage() { if (this.hasNext) { this.page++; this.refreshPage(); } }
  

  //event handlers
  /*onUpdateCif(cif: Cif) {
    this.showCifModal = false;
    this.globalStatusService.setLoading(true);
    // Buscamos el empleado viejo por el id y lo reemplazamos por el nuevo
    const index = this.cifs.findIndex(c => c.id === cif.id);
    if (index !== -1) {
      this.cifs[index] = cif;
    }
    this.globalStatusService.setLoading(false);
  }*/
  onCreateCif(cif: Cif) {
    this.showCifModal = false;
    this.globalStatusService.setLoading(true);

    this.cifs.push(cif);
    this.cifs.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    if (this.cifs.length > this.quantity) {
      this.cifs.pop();
      this.hasNext = true;
    }

    this.updateMonthlyTotals(cif);
    this.globalStatusService.setLoading(false);
  }

  /**
   * Suma el valor del CIF al total del mes actual o anterior según corresponda.
   * Corrige el cálculo del mes anterior para enero.
   */
  private updateMonthlyTotals(cif: Cif) {
    const created = new Date(cif.dateTime);
    const now = new Date();
    const value = (cif.quantity ?? 0) * (cif.unitPrice ?? 0);

    // Mes actual
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Mes anterior (corrige año si es enero)
    let lastMonthYear = now.getFullYear();
    let lastMonth = now.getMonth() - 1;
    if (lastMonth < 0) {
      lastMonth = 11;
      lastMonthYear--;
    }
    const startOfLastMonth = new Date(lastMonthYear, lastMonth, 1);

    //evaluates wether the cif was paid during this month or the last month
    //and if so, adds its value to the corresponding total
    const isCurrentMonth = created >= startOfThisMonth && created < startOfNextMonth;
    const isLastMonth = created >= startOfLastMonth && created < startOfThisMonth;

    if (isCurrentMonth) this.currentMonthTotal += value;
    else if (isLastMonth) this.lastMonthTotal += value;
  }

  }