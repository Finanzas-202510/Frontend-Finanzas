import { Component } from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from '@angular/material/table';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [
    MatToolbar,
    MatHeaderRow,
    MatRow,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatIconButton,
    MatHeaderCellDef,
    MatCellDef,
    MatCard,
    MatButton,
    MatIcon,
    MatTable,
    MatHeaderRowDef,
    MatRowDef,
    RouterLink
  ],
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  displayedColumns: string[] = [
    'nombre',
    'valorNominal',
    'tasaCupon',
    'fechaEmision',
    'fechaVencimiento',
    'frecuencia',
    'acciones'
  ];

  bonos = [
    {
      nombre: 'Bono Corporativo INTERBANK',
      valorNominal: 'USD 1,000.00',
      tasaCupon: '7.25%',
      fechaEmision: '14/01/2025',
      fechaVencimiento: '14/01/2028',
      frecuencia: 'Semestral'
    },
    {
      nombre: 'Bono Corporativo BCP',
      valorNominal: 'S/. 5,000.00',
      tasaCupon: '6.50%',
      fechaEmision: '09/02/2025',
      fechaVencimiento: '09/02/2027',
      frecuencia: 'Trimestral'
    },
    {
      nombre: 'Bono Corporativo BBVA',
      valorNominal: 'USD 10,000.00',
      tasaCupon: '6.50%',
      fechaEmision: '04/03/2025',
      fechaVencimiento: '04/03/2030',
      frecuencia: 'Anual'
    }
  ];
}
