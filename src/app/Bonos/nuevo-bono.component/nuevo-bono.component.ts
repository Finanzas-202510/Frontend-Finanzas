import { Component, OnInit } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {DatosAdicionalesComponent} from '../datos-adicionales.component/datos-adicionales.component';
import {InformacionGeneralComponent} from '../informacion-general.component/informacion-general.component';
import {DatosFinancierosComponent} from '../datos-financieros.component/datos-financieros.component';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';

import { BonoEntity} from '../model/bono.entity';
import { BonoApiService} from '../services/bono-api.service';
import { Router } from '@angular/router';

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
export class NuevoBonoComponent implements OnInit{
  seccionActiva = 'general';
  nuevoBono: BonoEntity;

  constructor(
    private bonoApiService: BonoApiService,
    private router: Router,
  ) {
    this.nuevoBono = new BonoEntity();
  }

  ngOnInit() {

  }

  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
  }

  // Métodos para actualizar el objeto nuevoBono con los datos de cada sección
  onInformacionGeneralUpdated(data: Partial<BonoEntity>) {
    this.nuevoBono = { ...this.nuevoBono, ...data };
    console.log('Información General Actualizada:', this.nuevoBono);
  }

  onDatosFinancierosUpdated(data: Partial<BonoEntity>) {
    this.nuevoBono = { ...this.nuevoBono, ...data };
    console.log('Datos Financieros Actualizados:', this.nuevoBono);
  }

  onDatosAdicionalesUpdated(data: Partial<BonoEntity>) {
    this.nuevoBono = {
      ...this.nuevoBono,
      costosEmisor: {
        ...this.nuevoBono.costosEmisor, // Mantener los costos existentes si no se sobrescriben
        estructuracionPorcentaje: data.costosEmisor?.estructuracionPorcentaje ?? 0,
        colocacionPorcentaje: data.costosEmisor?.colocacionPorcentaje ?? 0,
        cavaliPorcentaje: data.costosEmisor?.cavaliPorcentaje ?? 0 // Aquí iría cavali Emisor
      },
      costosBonista: {
        ...this.nuevoBono.costosBonista, // Mantener los costos existentes si no se sobrescriben
        flotacionPorcentaje: data.costosBonista?.flotacionPorcentaje ?? 0, // Aquí iría flotacion Bonista
        cavaliPorcentaje: data.costosBonista?.cavaliPorcentaje ?? 0 // Aquí iría cavali Bonista
      }
    };
    console.log('Datos Adicionales Actualizados:', this.nuevoBono);
  }

  // Método para guardar el bono completo
  guardarBono(): void {
    // Aquí puedes añadir validaciones finales si es necesario
    if (!this.nuevoBono.nombre || !this.nuevoBono.valorNominal || !this.nuevoBono.fechaEmision) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    // Asegurar que las fechas tengan el formato correcto (YYYY-MM-DD)
    if (this.nuevoBono.fechaEmision instanceof Date) {
      this.nuevoBono.fechaEmision = this.nuevoBono.fechaEmision.toISOString().substring(0, 10);
    }
    if (this.nuevoBono.fechaVencimiento instanceof Date) {
      this.nuevoBono.fechaVencimiento = this.nuevoBono.fechaVencimiento.toISOString().substring(0, 10);
    }

    // --- CÁLCULO DE LA FECHA DE VENCIMIENTO ---
    let fechaEmisionDate: Date;
    // Asegurarse de que fechaEmision sea un objeto Date para el cálculo
    if (typeof this.nuevoBono.fechaEmision === 'string') {
      fechaEmisionDate = new Date(this.nuevoBono.fechaEmision + 'T00:00:00'); // Añadir T00:00:00 para evitar problemas de zona horaria
    } else if (this.nuevoBono.fechaEmision instanceof Date) {
      fechaEmisionDate = this.nuevoBono.fechaEmision;
    } else {
      alert('Formato de Fecha de Emisión inválido.');
      return;
    }

    const fechaVencimientoCalculada = new Date(fechaEmisionDate);
    fechaVencimientoCalculada.setFullYear(fechaEmisionDate.getFullYear() + this.nuevoBono.plazoEnAnios);

    // Formatear la fecha de vencimiento a 'YYYY-MM-DD' para guardarla en db.json
    const fechaVencimientoFormatted = fechaVencimientoCalculada.toISOString().substring(0, 10);

    // Crear una copia del bono para enviar, añadiendo la fecha de vencimiento calculada
    const bonoToSend = {
      ...this.nuevoBono,
      fechaVencimiento: fechaVencimientoFormatted // <-- ¡Aquí se debería asignar!
    };

    // CLAVE: Asegúrate de que el ID no se envíe para que json-server lo genere
    if (bonoToSend.id !== undefined && bonoToSend.id !== null) {
      // Si por alguna razón el ID tiene un valor, y es un nuevo bono, asegúrate de que sea undefined
      // Esto previene que se envíen IDs como "" o 0 si no queremos que json-server los use
      delete bonoToSend.id; // Elimina la propiedad 'id' si está presente y no es undefined
    }

    // Asegurar que fechaEmision se envíe como string YYYY-MM-DD
    if (bonoToSend.fechaEmision instanceof Date) {
      bonoToSend.fechaEmision = bonoToSend.fechaEmision.toISOString().substring(0, 10);
    }

    console.log('Enviando bono (final payload):', bonoToSend);

    this.bonoApiService.addBono(bonoToSend).subscribe({
      next: (bonoGuardado: BonoEntity) => {
        console.log('Bono guardado exitosamente:', bonoGuardado);
        alert('Bono creado con éxito!');
        this.router.navigate(['/dashboard']); // Redirigir al dashboard
      },
      error: (err: any) => {
        console.error('Error al guardar el bono:', err);
        alert('Hubo un error al guardar el bono. Por favor, inténtalo de nuevo.');
      }
    });
  }
}
