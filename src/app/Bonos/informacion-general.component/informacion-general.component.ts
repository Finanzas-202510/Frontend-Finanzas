import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatFormField, MatInput, MatLabel, MatPrefix} from '@angular/material/input';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import { FormsModule } from '@angular/forms';

import { BonoEntity} from '../model/bono.entity';

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
    MatPrefix
  ],
  templateUrl: './informacion-general.component.html',
  styleUrl: './informacion-general.component.css'
})
export class InformacionGeneralComponent {
  @Input() bono!: BonoEntity; // Recibe el objeto bono del padre
  @Output() avanzarSeccion = new EventEmitter<string>();
  @Output() bonoUpdated = new EventEmitter<Partial<BonoEntity>>(); // Emite cambios en esta sección

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
