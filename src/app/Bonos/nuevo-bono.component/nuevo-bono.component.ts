import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {DatosAdicionalesComponent} from '../datos-adicionales.component/datos-adicionales.component';
import {InformacionGeneralComponent} from '../informacion-general.component/informacion-general.component';
import {DatosFinancierosComponent} from '../datos-financieros.component/datos-financieros.component';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';

@Component({
  selector: 'app-nuevo-bono.component',
  imports: [
    MatButtonToggleGroup,
    FormsModule,
    MatButtonToggle,
    NgIf,
    DatosAdicionalesComponent,
    InformacionGeneralComponent,
    DatosFinancierosComponent
  ],
  templateUrl: './nuevo-bono.component.html',
  styleUrl: './nuevo-bono.component.css'
})
export class NuevoBonoComponent {
  seccionActiva = 'general';

  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
  }

}
