import {Component, EventEmitter, Output} from '@angular/core';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatOption, provideNativeDateAdapter} from '@angular/material/core';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-datos-financieros',
  imports: [
    MatFormField,
    MatLabel,
    MatDatepickerToggle,
    MatDatepicker,
    MatSelect,
    MatOption,
    MatInput,
    MatDatepickerInput,
    MatButton
  ],
  providers: [
    provideNativeDateAdapter() // Proveedor del adaptador de fechas
  ],
  templateUrl: './datos-financieros.component.html',
  styleUrl: './datos-financieros.component.css'
})
export class DatosFinancierosComponent {
  @Output() avanzarSeccion = new EventEmitter<string>();
  @Output() retrocederSeccion = new EventEmitter<string>();

}
