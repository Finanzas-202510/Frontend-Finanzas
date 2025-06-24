import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatButton} from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import {CommonModule, NgIf} from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox'; // Para mat-checkbox


import { BonoEntity, CostosEmisor, CostosBonista} from '../model/bono.entity';

@Component({
  selector: 'app-datos-adicionales',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    MatRadioGroup,
    MatRadioButton,
    MatButton,
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatCheckboxModule,
    NgIf
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

  readonly MAX_ESTRUCTURACION = 0.5;
  readonly MAX_COLOCACION = 1;
  readonly MAX_FLOTACION_EMISOR = 0.2;
  readonly MAX_CAVALI_EMISOR = 0.1;
  readonly MAX_FLOTACION_BONISTA = 0.5;
  readonly MAX_CAVALI_BONISTA = 0.1;

  ngOnInit(): void {
    // Inicializar los objetos de costos si son undefined para evitar errores de acceso a propiedades anidadas
    if (!this.bono.costosEmisor) {
      this.bono.costosEmisor = new CostosEmisor();
    }
    if (!this.bono.costosBonista) {
      this.bono.costosBonista = new CostosBonista();
    }
    // Asegurarse de que los valores numéricos estén inicializados a 0 si son nulos para evitar NaN en inputs
    this.bono.costosEmisor.estructuracionPorcentaje = this.bono.costosEmisor.estructuracionPorcentaje ?? 0;
    this.bono.costosEmisor.colocacionPorcentaje = this.bono.costosEmisor.colocacionPorcentaje ?? 0;
    this.bono.costosEmisor.flotacionPorcentaje = this.bono.costosEmisor.flotacionPorcentaje ?? 0;
    this.bono.costosEmisor.cavaliPorcentaje = this.bono.costosEmisor.cavaliPorcentaje ?? 0;
    this.bono.costosBonista.flotacionPorcentaje = this.bono.costosBonista.flotacionPorcentaje ?? 0;
    this.bono.costosBonista.cavaliPorcentaje = this.bono.costosBonista.cavaliPorcentaje ?? 0;
  }

  onFieldChange(): void {
    // Emitir todos los costos (emisor y bonista)
    this.bonoUpdated.emit({
      costosEmisor: {
        estructuracionPorcentaje: this.bono.costosEmisor.estructuracionPorcentaje,
        colocacionPorcentaje: this.bono.costosEmisor.colocacionPorcentaje,
        flotacionPorcentaje: this.bono.costosEmisor.flotacionPorcentaje,
        cavaliPorcentaje: this.bono.costosEmisor.cavaliPorcentaje
      },
      costosBonista: {
        flotacionPorcentaje: this.bono.costosBonista.flotacionPorcentaje, // Corregido el typo aquí
        cavaliPorcentaje: this.bono.costosBonista.cavaliPorcentaje
      }
      // Si el periodo de gracia se guarda en el bono, deberías emitirlo también
      // incluirPeriodoGracia: this.incluirPeriodoGracia,
      // tipoPeriodoGracia: this.tipoPeriodoGracia
    });
  }

  // Método para validar el formulario completo
  isFormValid(): boolean {
    const costosEmisor = this.bono.costosEmisor;
    const costosBonista = this.bono.costosBonista;

    const isValidPercentage = (value: number | undefined, max: number): boolean => {
      const numValue = value ?? 0;
      return numValue >= 0 && numValue <= max;
    };

    // Validar costos del emisor
    const emisorValido =
      isValidPercentage(costosEmisor?.estructuracionPorcentaje, this.MAX_ESTRUCTURACION) &&
      isValidPercentage(costosEmisor?.colocacionPorcentaje, this.MAX_COLOCACION) &&
      isValidPercentage(costosEmisor?.flotacionPorcentaje, this.MAX_FLOTACION_EMISOR) &&
      isValidPercentage(costosEmisor?.cavaliPorcentaje, this.MAX_CAVALI_EMISOR);

    // Validar costos del bonista
    const bonistaValido =
      isValidPercentage(costosBonista?.flotacionPorcentaje, this.MAX_FLOTACION_BONISTA) &&
      isValidPercentage(costosBonista?.cavaliPorcentaje, this.MAX_CAVALI_BONISTA);

    return emisorValido && bonistaValido;
  }

  onSaveBono(): void {
    this.onFieldChange(); // Asegúrate de emitir los últimos cambios

    if (this.isFormValid()) {
      this.guardarBono.emit();
    } else {
      alert('Por favor, complete y corrija todos los campos de costos antes de guardar el bono.');
      // Aquí podrías agregar lógica para "tocar" todos los campos
      // para que los mensajes de error se muestren al usuario.
      // Ejemplo: this.markAllAsTouched(this.bono.costosEmisor);
    }
  }

  onBackSection(): void {
    this.onFieldChange();
    this.retrocederSeccion.emit('financieros');
  }
}
