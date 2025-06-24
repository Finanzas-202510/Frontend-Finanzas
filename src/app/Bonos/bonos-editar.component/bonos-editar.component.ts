// src/app/Bonos/bono-editar/bono-editar.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BonoApiService} from '../services/bono-api.service';
import { BonoEntity} from '../model/bono.entity';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Si usas ngModel
import { InformacionGeneralComponent} from '../informacion-general.component/informacion-general.component';
import { DatosFinancierosComponent } from '../datos-financieros.component/datos-financieros.component';
import { DatosAdicionalesComponent } from '../datos-adicionales.component/datos-adicionales.component';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';


@Component({
  selector: 'app-bono-editar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // o ReactiveFormsModule
    InformacionGeneralComponent,
    DatosFinancierosComponent,
    DatosAdicionalesComponent,
    MatButtonToggle,
    MatButtonToggleGroup
  ],
  templateUrl: './bonos-editar.component.html',
  styleUrl: './bonos-editar.component.css'
})
export class BonoEditarComponent implements OnInit {
  bono: BonoEntity = new BonoEntity();
  loading: boolean = true;
  error: string | null = null;
  bonoId: string | null = null;

  seccionActiva: string = 'general'; // <--- AÑADE ESTA LÍNEA e inicialízala

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bonoApiService: BonoApiService
  ) { }

  ngOnInit(): void {
    this.bonoId = this.route.snapshot.paramMap.get('id');
    if (this.bonoId) {
      this.loadBono(this.bonoId);
    } else {
      this.error = 'No se proporcionó un ID de bono para editar.';
      this.loading = false;
    }
  }

  loadBono(id: string): void {
    this.loading = true;
    this.bonoApiService.getBonoById(id).subscribe({
      next: (data: BonoEntity) => {
        this.bono = new BonoEntity(data);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar el bono para edición:', err);
        this.error = 'No se pudo cargar el bono para edición.';
        this.loading = false;
      }
    });
  }

  saveBono(): void {
    if (!this.bonoId) {
      this.error = 'ID de bono no disponible para guardar.';
      return;
    }
    this.bonoApiService.updateBono(this.bonoId, this.bono).subscribe({
      next: () => {
        alert('Bono actualizado exitosamente!');
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        console.error('Error al actualizar el bono:', err);
        this.error = 'Error al actualizar el bono. Por favor, intente de nuevo.';
      }
    });
  }

  cancel(): void {
    if (this.bonoId) {
      this.router.navigate(['/bonos', this.bonoId]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  // <--- AÑADE ESTE MÉTODO si tus sub-componentes emiten eventos para cambiar de sección
  cambiarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
  }
  // No necesitas los métodos onInformacionGeneralUpdated, onDatosFinancierosUpdated, onDatosAdicionalesUpdated
  // porque en el modo edición, los cambios se actualizan directamente en 'bono' via Two-way data binding (ngModel)
  // o reactive forms. El 'saveBono()' guarda todo al final.
}
