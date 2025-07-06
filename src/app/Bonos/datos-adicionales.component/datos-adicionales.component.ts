import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatButton} from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import {CommonModule, NgIf} from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox'; // Para mat-checkbox


import { BonoEntity, CostosEmisor, CostosBonista} from '../model/bono.entity';
import {MatSelectModule} from '@angular/material/select';
import {MatOption} from '@angular/material/core';

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
    NgIf,
    MatSelectModule, // Añadir MatSelectModule
    MatOption

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

  readonly MAX_ESTRUCTURACION = 0.1;
  readonly MAX_COLOCACION = 0.15;
  readonly MAX_CAVALI_EMISOR = 0.0525;
  readonly MAX_FLOTACION_BONISTA = 1;
  readonly MAX_CAVALI_BONISTA = 0.0525;

  periodosGraciaDisponibles: number[] = [1,2,3,4];

  ngOnInit(): void {
    // Inicializar los objetos de costos si son undefined para evitar errores de acceso a propiedades anidadas
    if (!this.bono.costosEmisor) {
      this.bono.costosEmisor = new CostosEmisor();
    }
    if (!this.bono.costosBonista) {
      this.bono.costosBonista = new CostosBonista();
    }
    // Asegurarse de que los valores numéricos estén inicializados a 0 si son nulos para evitar NaN en inputs
    this.bono.costosEmisor.estructuracionPorcentaje = this.MAX_ESTRUCTURACION;
    this.bono.costosEmisor.colocacionPorcentaje = this.MAX_COLOCACION;
    this.bono.costosEmisor.cavaliPorcentaje = this.MAX_CAVALI_EMISOR;
    this.bono.costosBonista.flotacionPorcentaje = this.MAX_FLOTACION_BONISTA;
    this.bono.costosBonista.cavaliPorcentaje = this.MAX_CAVALI_BONISTA;
    this.bono.cok = this.bono.cok ?? 0.08;

    // Inicializar el array de periodos de gracia disponibles
    this.generatePeriodosGraciaOptions();
    // Asegurarse de que los valores de gracia estén inicializados
    this.bono.incluirPeriodoGracia = this.bono.incluirPeriodoGracia ?? false;
    this.bono.tipoPeriodoGracia = this.bono.tipoPeriodoGracia || '';
    this.bono.periodoGraciaMeses = this.bono.periodoGraciaMeses ?? 0;
  }

  generatePeriodosGraciaOptions(): void {
    if (this.bono.plazoEnAnios && this.bono.frecuenciaPagoAnual) {
      const totalPeriodos = this.bono.plazoEnAnios * this.bono.frecuenciaPagoAnual;
      this.periodosGraciaDisponibles = Array.from({length: totalPeriodos}, (_, i) => i + 1);
    } else {
      this.periodosGraciaDisponibles = [];
    }
    // Si el periodo de gracia seleccionado excede el nuevo total, resetéalo
    if (this.bono.periodoGraciaMeses > this.periodosGraciaDisponibles.length) {
      this.bono.periodoGraciaMeses = 0;
    }
  }

  onFieldChange(): void {
    // Emitir todos los costos (emisor y bonista)
    this.bonoUpdated.emit({
      costosEmisor: {
        estructuracionPorcentaje: this.bono.costosEmisor.estructuracionPorcentaje,
        colocacionPorcentaje: this.bono.costosEmisor.colocacionPorcentaje,
        cavaliPorcentaje: this.bono.costosEmisor.cavaliPorcentaje
      },
      costosBonista: {
        flotacionPorcentaje: this.bono.costosBonista.flotacionPorcentaje, // Corregido el typo aquí
        cavaliPorcentaje: this.bono.costosBonista.cavaliPorcentaje
      },
      // NUEVAS PROPIEDADES DE GRACIA PARA EMITIR
      incluirPeriodoGracia: this.bono.incluirPeriodoGracia,
      tipoPeriodoGracia: this.bono.tipoPeriodoGracia,
      periodoGraciaMeses: this.bono.periodoGraciaMeses,
      cok: this.bono.cok
    });
  }

  // Este método se llamará cuando cambie el checkbox de "incluir periodo de gracia"
  onTogglePeriodoGracia(): void {
    if (!this.bono.incluirPeriodoGracia) {
      // Si se desactiva, resetear el tipo y la duración de la gracia
      this.bono.tipoPeriodoGracia = '';
      this.bono.periodoGraciaMeses = 0;
    }
    this.onFieldChange(); // Emite los cambios
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
      isValidPercentage(costosEmisor?.cavaliPorcentaje, this.MAX_CAVALI_EMISOR);

    // Validar costos del bonista
    const bonistaValido =
      isValidPercentage(costosBonista?.flotacionPorcentaje, this.MAX_FLOTACION_BONISTA) &&
      isValidPercentage(costosBonista?.cavaliPorcentaje, this.MAX_CAVALI_BONISTA);

    // Validar periodo de gracia si está incluido
    let graciaValida = true;
    if (this.bono.incluirPeriodoGracia) {
      graciaValida = this.bono.tipoPeriodoGracia !== '' && this.bono.periodoGraciaMeses > 0;
    }

    const cokValido = this.bono.cok !== null &&
      this.bono.cok >= 0.03 && // 3%
      this.bono.cok <= 0.20;  // 20%

    return emisorValido && bonistaValido && graciaValida;
  }

  onSaveBono(): void {
    this.onFieldChange(); // Asegúrate de emitir los últimos cambios

    if (this.isFormValid()) {
      this.guardarBono.emit();
    } else {
      alert('Por favor, complete y corrija todos los campos de costos antes de guardar el bono.');
    }
  }

  onBackSection(): void {
    this.onFieldChange();
    this.retrocederSeccion.emit('financieros');
  }
}
