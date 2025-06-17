import { Component, OnInit } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from '@angular/material/table';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importa CommonModule aquí
// Importa el servicio y la entidad
import {BonoApiService} from '../Bonos/services/bono-api.service';
import { BonoEntity} from '../Bonos/model/bono.entity';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [
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
    RouterLink,
    CommonModule,     // Necesario para *ngIf, *ngFor
  ],
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  displayedColumns: string[] = [
    'nombre',
    'valorNominal',
    'tasaDeInteresAnualParaCalculo',
    'fechaEmision',
    'fechaVencimiento',
    'frecuenciaPagoTexto',
    'acciones'
  ];

  bonos: BonoEntity[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private bonoApiService: BonoApiService) { }

  ngOnInit(): void {
    this.getAllBonos();
  }

  getAllBonos(): void {
    this.loading = true;
    this.error = null;
    this.bonoApiService.getAllBonos().subscribe({
      next: (data: BonoEntity[]) => {
        this.bonos = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al obtener bonos:', err);
        this.error = 'No se pudieron cargar los bonos. Intenta de nuevo más tarde.';
        this.loading = false;
      }
    });
  }

}
