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
        // Ahora, aquí puedes calcular los promedios y el total de bonos
        this.calculateDashboardMetrics();
      },
      error: (err: any) => {
        console.error('Error al obtener los bonos:', err);
        this.error = 'No se pudieron cargar los bonos.';
        this.loading = false;
        this.bonos = []; // Asegúrate de que el array esté vacío en caso de error
        this.calculateDashboardMetrics(); // También calcula métricas para mostrar 0 o N/A
      }
    });
  }

  calculateDashboardMetrics(): void {
    // Calculamos TCEA y TREA promedio aquí, si no lo haces ya con un servicio.
    // Si tienes un servicio para esto, simplemente llámalo aquí.
    let totalTCEA = 0;
    let countTCEA = 0;
    let totalTREA = 0;
    let countTREA = 0;

    this.bonos.forEach(bono => {
      // Si usas un servicio para calcular TCEA/TREA individualmente
      // const tcea = this.calculoFinancieroService.calculateTCEA(bono);
      // const trea = this.calculoFinancieroService.calculateTREA(bono);

      // Si calculateTCEA y calculateTREA son métodos de este componente o tienes los valores ya en el bono
      // (asumiendo que BonoEntity tiene propiedades tcea y trea precalculadas o se calculan aquí directamente)
      const tcea = (bono as any).tceaEmisor || null; // Reemplaza con la forma real de acceder a TCEA/TREA si no están precalculadas en el bono
      const trea = (bono as any).treaBonista || null; // Reemplaza con la forma real de acceder a TCEA/TREA

      if (tcea !== null && !isNaN(tcea)) {
        totalTCEA += tcea;
        countTCEA++;
      }
      if (trea !== null && !isNaN(trea)) {
        totalTREA += trea;
        countTREA++;
      }
    });

    //this.tceaPromedio = countTCEA > 0 ? totalTCEA / countTCEA : null;
    //this.treaPromedio = countTREA > 0 ? totalTREA / countTREA : null;

    // EL TOTAL DE BONOS SE CALCULA SIMPLEMENTE CON LA LONGITUD DEL ARRAY:
    // Ya no necesitas una propiedad separada para el total de bonos,
    // puedes usar directamente `this.bonos.length` en el HTML.
  }

}
