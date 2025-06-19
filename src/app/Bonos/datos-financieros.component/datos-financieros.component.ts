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
    CommonModule
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

  frecuenciaPagoOptions = [
    { value: 'Semestral', annualValue: 2 },
    { value: 'Anual', annualValue: 1 },
    { value: 'Trimestral', annualValue: 4 },
    { value: 'Mensual', annualValue: 12 } // Puedes añadir más si es necesario
  ];

  onFieldChange(): void {
    // Al seleccionar una frecuencia, actualiza frecuenciaPagoAnual
    const selectedFrecuencia = this.frecuenciaPagoOptions.find(opt => opt.value === this.bono.frecuenciaPagoTexto);
    if (selectedFrecuencia) {
      this.bono.frecuenciaPagoAnual = selectedFrecuencia.annualValue;
    }

    this.bonoUpdated.emit({
      tasaDeInteresAnualParaCalculo: this.bono.tasaDeInteresAnualParaCalculo,
      fechaEmision: this.bono.fechaEmision,
      fechaVencimiento: this.bono.fechaVencimiento,
      frecuenciaPagoTexto: this.bono.frecuenciaPagoTexto,
      frecuenciaPagoAnual: this.bono.frecuenciaPagoAnual,
    });
  }

  onAdvanceSection(): void {
    this.onFieldChange(); // Asegúrate de emitir los últimos cambios antes de avanzar
    this.avanzarSeccion.emit('adicionales');
  }

  onBackSection(): void {
    this.onFieldChange(); // Asegúrate de emitir los últimos cambios antes de retroceder
    this.retrocederSeccion.emit('general');
  }
}
