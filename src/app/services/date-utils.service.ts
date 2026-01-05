import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {
  /**
   * Devuelve la fecha local de hoy en formato compatible con <input type="date">: YYYY-MM-DD.
   */
  getTodayLocalDateString(today: Date = new Date()): string {
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  /**
   * Parsea un YYYY-MM-DD a Date en zona local (00:00). Retorna null si es inválido.
   */
  parseDateInputToLocalMidnight(dateStr: string): Date | null {
    const parts = dateStr.split('-').map(Number);
    if (parts.length !== 3) return null;

    const [year, month, day] = parts;
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;

    const date = new Date(year, month - 1, day);

    // Evita fechas inválidas que JS "normaliza" (p.ej. 2026-02-31 -> marzo)
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    date.setHours(0, 0, 0, 0);
    return date;
  }

  /**
   * Construye un Date para persistir:
   * - Si la fecha es hoy: conserva la hora actual.
   * - Si no: manda 00:00:00.000.
   */
  buildDateTimeFromDateString(dateStr: string | null | undefined): Date {
    if (!dateStr) return new Date();

    const parts = dateStr.split('-').map(Number);
    if (parts.length !== 3) return new Date();

    const [year, month, day] = parts;
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return new Date();

    const dateTime = new Date(year, month - 1, day);

    const today = new Date();
    const isToday =
      year === today.getFullYear() &&
      month - 1 === today.getMonth() &&
      day === today.getDate();

    if (isToday) {
      dateTime.setHours(today.getHours(), today.getMinutes(), today.getSeconds(), today.getMilliseconds());
    } else {
      dateTime.setHours(0, 0, 0, 0);
    }

    return dateTime;
  }

  /**
   * Validator: evita seleccionar una fecha futura (comparación por día, sin hora).
   */
  noFutureDateValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const raw = control.value;
      if (!raw) return null;

      const selected = this.parseDateInputToLocalMidnight(String(raw));
      if (!selected) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return selected.getTime() > today.getTime() ? { futureDate: true } : null;
    };
  }
}
