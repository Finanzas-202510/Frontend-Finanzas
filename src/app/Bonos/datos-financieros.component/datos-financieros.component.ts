import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatFormField, MatInputModule, MatLabel} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatOption, provideNativeDateAdapter} from '@angular/material/core';
import {MatButton} from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { NgIf} from '@angular/common';

import { BonoEntity} from '../model/bono.entity';

@Component({
  selector: 'app-datos-financieros',
  imports: [
    MatFormField,
    MatLabel,
    MatDatepickerToggle,
    MatDatepicker,
    MatSelectModule,
    MatOption,
    MatInputModule,
    MatDatepickerInput,
    MatButton,
    FormsModule,
    MatFormFieldModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    CommonModule,
    NgIf
  ],
  providers: [
    provideNativeDateAdapter() // Proveedor del adaptador de fechas
  ],
  templateUrl: './datos-financieros.component.html',
  styleUrl: './datos-financieros.component.css'
})
export class DatosFinancierosComponent implements OnInit, OnChanges{
  @Input() bono!: BonoEntity; // Recibe el objeto bono del padre
  @Output() avanzarSeccion = new EventEmitter<string>();
  @Output() retrocederSeccion = new EventEmitter<string>();
  @Output() bonoUpdated = new EventEmitter<Partial<BonoEntity>>(); // Emite cambios en esta sección

  plazosDisponibles: number[] = [2, 3, 4, 5, 6, 7, 8, 9, 10];

  frecuenciaPagoOptions = [
    { value: 'Semestral', annualValue: 2 },
    { value: 'Anual', annualValue: 1 },
  ];

  ngOnInit(): void {
    if (!this.bono.plazoEnAnios || !this.plazosDisponibles.includes(this.bono.plazoEnAnios)) {
      this.bono.plazoEnAnios = this.plazosDisponibles[0];
    }
    this.bono.frecuenciaPagoTexto = 'Semestral';
    this.bono.frecuenciaPagoAnual = 2;

    if (!this.bono.fechaEmision) {
      this.bono.fechaEmision = new Date();
    }
    // Asegurarse de que las fechas sean objetos Date si vienen como string del backend
    if (typeof this.bono.fechaEmision === 'string') {
      this.bono.fechaEmision = new Date(this.bono.fechaEmision);
    }
    if (typeof this.bono.fechaVencimiento === 'string') {
      this.bono.fechaVencimiento = new Date(this.bono.fechaVencimiento);
    }

    this.recalculateFechaVencimiento(); // Calcula la fecha de vencimiento al iniciar
    this.onFieldChange();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Esto se ejecutará si el objeto 'bono' de entrada cambia (ej. al cargar el bono en el padre)
    // Asegurarse de que las fechas sean objetos Date cuando el Input bono cambia
    if (changes['bono'] && changes['bono'].currentValue) {
      const currentBono = changes['bono'].currentValue as BonoEntity;
      if (typeof currentBono.fechaEmision === 'string') {
        currentBono.fechaEmision = new Date(currentBono.fechaEmision);
      }
      if (typeof currentBono.fechaVencimiento === 'string') {
        currentBono.fechaVencimiento = new Date(currentBono.fechaVencimiento);
      }
      this.recalculateFechaVencimiento(); // Recalcula si el bono de entrada cambia
    }
  }

  // Método para recalcular fechaVencimiento
  recalculateFechaVencimiento(): void {
    if (this.bono.fechaEmision && this.bono.plazoEnAnios) {
      const nuevaFechaVencimiento = new Date(this.bono.fechaEmision);
      nuevaFechaVencimiento.setFullYear(nuevaFechaVencimiento.getFullYear() + this.bono.plazoEnAnios);

      // Pequeño ajuste para evitar problemas con el 29 de febrero
      const originalDay = this.bono.fechaEmision.getDate();
      if (nuevaFechaVencimiento.getDate() !== originalDay) {
        const lastDayOfNewMonth = new Date(nuevaFechaVencimiento.getFullYear(), nuevaFechaVencimiento.getMonth() + 1, 0).getDate();
        nuevaFechaVencimiento.setDate(Math.min(originalDay, lastDayOfNewMonth));
      }

      this.bono.fechaVencimiento = nuevaFechaVencimiento;
      console.log('Fecha de vencimiento recalculada:', this.bono.fechaVencimiento); // Para depuración
    }
  }

  onFieldChange(): void {
    const selectedFrecuencia = this.frecuenciaPagoOptions.find(opt => opt.value === this.bono.frecuenciaPagoTexto);
    if (selectedFrecuencia) {
      this.bono.frecuenciaPagoAnual = selectedFrecuencia.annualValue;
    }

    this.recalculateFechaVencimiento(); // Vuelve a calcular cuando cualquier campo de esta sección cambia

    this.bonoUpdated.emit({
      tasaDeInteresAnualParaCalculo: this.bono.tasaDeInteresAnualParaCalculo,
      fechaEmision: this.bono.fechaEmision,
      fechaVencimiento: this.bono.fechaVencimiento, // Asegúrate de emitir también la fecha de vencimiento
      frecuenciaPagoTexto: this.bono.frecuenciaPagoTexto,
      frecuenciaPagoAnual: this.bono.frecuenciaPagoAnual,
      plazoEnAnios: this.bono.plazoEnAnios
    });
  }

  isFormValid(): boolean {
    const tasaValida = this.bono.tasaDeInteresAnualParaCalculo !== null &&
      this.bono.tasaDeInteresAnualParaCalculo >= 0 &&
      this.bono.tasaDeInteresAnualParaCalculo <= 20;

    const plazoValido = this.bono.plazoEnAnios !== null &&
      this.bono.plazoEnAnios >= 2 &&
      this.bono.plazoEnAnios <= 10;

    const fechaValida = !!this.bono.fechaEmision;
    const fechaVencimientoValida = !!this.bono.fechaVencimiento; // Añade validación para fechaVencimiento

    return tasaValida && plazoValido && fechaValida && fechaVencimientoValida; // Incluye en el retorno
  }

  onAdvanceSection(): void {
    // La emisión de cambios ya se hace en onFieldChange, que es llamado por los (ngModelChange)
    if (this.isFormValid()) {
      this.avanzarSeccion.emit('adicionales');
    } else {
      alert('Por favor, complete y corrija todos los campos financieros antes de continuar.');
    }
  }

  onBackSection(): void {
    // La emisión de cambios ya se hace en onFieldChange
    this.retrocederSeccion.emit('general');
  }
}
