import {Component, EventEmitter, Input, Output} from '@angular/core';
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
export class DatosFinancierosComponent {
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
    // Inicializar el plazo si no tiene un valor válido
    if (!this.bono.plazoEnAnios || !this.plazosDisponibles.includes(this.bono.plazoEnAnios)) {
      this.bono.plazoEnAnios = this.plazosDisponibles[0]; // Establece el primer valor (2 años) como predeterminado
    }
    // ¡NUEVO: Forzar la frecuencia de pago a Semestral al inicio!
    this.bono.frecuenciaPagoTexto = 'Semestral';
    this.bono.frecuenciaPagoAnual = 2; // Para Semestral

    // Asegúrate de que fechaEmision se inicialice si es necesario para evitar errores de fecha
    if (!this.bono.fechaEmision) {
      this.bono.fechaEmision = new Date(); // O la fecha que consideres por defecto
    }

    this.onFieldChange(); // Emite los cambios iniciales
  }

  onFieldChange(): void {
    // Al seleccionar una frecuencia, actualiza frecuenciaPagoAnual
    const selectedFrecuencia = this.frecuenciaPagoOptions.find(opt => opt.value === this.bono.frecuenciaPagoTexto);
    if (selectedFrecuencia) {
      this.bono.frecuenciaPagoAnual = selectedFrecuencia.annualValue;
    }

    this.bonoUpdated.emit({
      tasaDeInteresAnualParaCalculo: this.bono.tasaDeInteresAnualParaCalculo,
      fechaEmision: this.bono.fechaEmision,
      frecuenciaPagoTexto: this.bono.frecuenciaPagoTexto,
      frecuenciaPagoAnual: this.bono.frecuenciaPagoAnual,
      plazoEnAnios: this.bono.plazoEnAnios
    });
  }

  isFormValid(): boolean {
    // Comprueba que los campos obligatorios y con restricciones estén válidos
    const tasaValida = this.bono.tasaDeInteresAnualParaCalculo !== null &&
      this.bono.tasaDeInteresAnualParaCalculo >= 0 &&
      this.bono.tasaDeInteresAnualParaCalculo <= 20; // Rango de la tasa

    const plazoValido = this.bono.plazoEnAnios !== null &&
      this.bono.plazoEnAnios >= 2 &&
      this.bono.plazoEnAnios <= 10; // Rango del plazo

    const fechaValida = !!this.bono.fechaEmision; // Asegura que la fecha esté seleccionada

    // La frecuencia de pago ya está restringida a 'Semestral' por la lógica que haremos.

    return tasaValida && plazoValido && fechaValida;
  }

  onAdvanceSection(): void {
    this.onFieldChange(); // Asegúrate de emitir los últimos cambios antes de avanzar
    if (this.isFormValid()) {
      this.avanzarSeccion.emit('adicionales');
    } else {
      alert('Por favor, complete y corrija todos los campos financieros antes de continuar.');
    }
    }

  onBackSection(): void {
    this.onFieldChange(); // Asegúrate de emitir los últimos cambios antes de retroceder
    this.retrocederSeccion.emit('general');
  }
}
