import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatFormField, MatInput, MatLabel, MatPrefix} from '@angular/material/input';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import { FormsModule } from '@angular/forms';

import { BonoEntity} from '../model/bono.entity';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {DecimalPipe} from '@angular/common';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-informacion-general',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatFormField,
    MatRadioGroup,
    MatRadioButton,
    MatButton,
    RouterLink,
    FormsModule,
    MatSelect,
    MatOption,
    DecimalPipe,
    CommonModule
  ],
  templateUrl: './informacion-general.component.html',
  styleUrl: './informacion-general.component.css'
})
export class InformacionGeneralComponent {
  @Input() bono!: BonoEntity; // Recibe el objeto bono del padre
  @Output() avanzarSeccion = new EventEmitter<string>();
  @Output() bonoUpdated = new EventEmitter<Partial<BonoEntity>>(); // Emite cambios en esta sección

  valoresNominalesDisponibles: number[] = [1000, 2000, 3000, 4000, 5000];

  ngOnInit(): void {
    // Si bono.valorNominal no tiene un valor por defecto o uno de los disponibles,
    // puedes establecerlo aquí para que el select inicie con una opción.
    if (!this.bono.valorNominal || !this.valoresNominalesDisponibles.includes(this.bono.valorNominal)) {
      this.bono.valorNominal = this.valoresNominalesDisponibles[0]; // Establece el primer valor como predeterminado
      this.onFieldChange(); // Emite el cambio inicial
    }
  }

  // Método para emitir los cambios cada vez que un campo cambia
  // Se podría hacer con (ngModelChange) en cada input o con un método genérico
  onFieldChange(): void {
    this.bonoUpdated.emit({
      nombre: this.bono.nombre,
      descripcion: this.bono.descripcion,
      valorNominal: this.bono.valorNominal,
      moneda: this.bono.moneda
      // Otros campos de esta sección
    });
  }

  onAdvanceSection(): void {
    this.onFieldChange(); // Asegúrate de emitir los últimos cambios antes de avanzar
    this.avanzarSeccion.emit('financieros');
  }
}
