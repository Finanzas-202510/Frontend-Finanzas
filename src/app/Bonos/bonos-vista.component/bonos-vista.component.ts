import { Component, OnInit } from '@angular/core'; // Importa OnInit
import { CommonModule } from '@angular/common'; // Para pipes y *ngIf
import { ActivatedRoute, RouterLink } from '@angular/router'; // Para obtener el ID de la URL y RouterLink

// Importa el servicio y la entidad del bono
import { BonoApiService } from '../services/bono-api.service';
import { BonoEntity} from '../model/bono.entity';

@Component({
  selector: 'app-bonos-vista',
  standalone: true, // Asegúrate de que sea standalone si no usas NgModules
  imports: [
    CommonModule, // Necesario para pipes como 'number', 'date' y *ngIf
    RouterLink // Necesario si tienes routerLinks dentro de este componente
  ],
  templateUrl: './bonos-vista.component.html',
  styleUrl: './bonos-vista.component.css'
})
export class BonosVistaComponent implements OnInit { // Implementa OnInit
  bono: BonoEntity | undefined; // Para almacenar los detalles del bono
  loading: boolean = true;
  error: string | null = null;

  // Inyecta ActivatedRoute y BonoApiService
  constructor(
    private route: ActivatedRoute, // Para acceder a los parámetros de la URL
    private bonoApiService: BonoApiService // Para obtener los datos del bono
  ) { }

  ngOnInit(): void {
    // Suscribirse a los cambios en los parámetros de la URL
    // Esto es útil si el ID en la URL puede cambiar sin destruir y recrear el componente
    this.route.paramMap.subscribe(params => {
      const bonoId = params.get('id'); // Obtener el 'id' de la URL

      if (bonoId) {
        this.getBonoDetails(parseInt(bonoId, 10)); // Convertir a número y obtener los detalles
      } else {
        this.error = 'ID de bono no proporcionado en la URL.';
        this.loading = false;
      }
    });
  }

  getBonoDetails(id: number): void {
    this.loading = true;
    this.error = null;
    this.bonoApiService.getBonoById(id).subscribe({
      next: (data: BonoEntity) => {
        this.bono = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al obtener los detalles del bono:', err);
        this.error = `No se pudieron cargar los detalles del bono con ID ${id}.`;
        this.loading = false;
      }
    });
  }
}
