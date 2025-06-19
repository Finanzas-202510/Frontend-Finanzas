import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatButton} from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox'; // Para mat-checkbox


import { BonoEntity} from '../model/bono.entity';

@Component({
  selector: 'app-datos-adicionales',
  imports: [
    MatFormField,
    MatInput,
    MatRadioGroup,
    MatRadioButton,
    MatButton,
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatCheckboxModule
  ],
  templateUrl: './datos-adicionales.component.html',
  styleUrl: './datos-adicionales.component.css'
})
export class DatosAdicionalesComponent {
  @Input() bono!: BonoEntity; // Recibe el objeto bono del padre
  @Output() retrocederSeccion = new EventEmitter<string>();
  @Output() guardarBono = new EventEmitter<void>(); // Emite para que el padre guarde
  @Output() bonoUpdated = new EventEmitter<Partial<BonoEntity>>(); // Emite cambios

  // Asumo que 'incluirPeriodoGracia' y 'tipoPeriodoGracia' son propiedades temporales
  // para el formulario y no están directamente en BonoEntity.
  // Si necesitas guardarlos, deberías añadirlos a BonoEntity o manejarlos por separado.
  incluirPeriodoGracia: boolean = false;
  tipoPeriodoGracia: string = 'parcial'; // 'parcial' o 'total'

  onFieldChange(): void {
    this.bonoUpdated.emit({
      costosEmisor: {
        estructuracionPorcentaje: this.bono.costosEmisor.estructuracionPorcentaje,
        colocacionPorcentaje: this.bono.costosEmisor.colocacionPorcentaje,
        flotacionPorcentaje: this.bono.costosEmisor.flotacionPorcentaje,
        cavaliPorcentaje: this.bono.costosEmisor.cavaliPorcentaje
      },
      costosBonista: {
        flotacionPorcentaje: this.bono.costosBonista.flotacionPorcentaje,
        cavaliPorcentaje: this.bono.costosBonista.cavaliPorcentaje
      }
    });
  }

  onSaveBono(): void {
    this.onFieldChange(); // Asegúrate de emitir los últimos cambios antes de guardar
    this.guardarBono.emit(); // Emite el evento para que el padre guarde el bono
  }

  onBackSection(): void {
    this.onFieldChange(); // Asegúrate de emitir los últimos cambios antes de retroceder
    this.retrocederSeccion.emit('financieros');
  }
}
