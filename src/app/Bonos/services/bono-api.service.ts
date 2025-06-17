// src/app/services/bono-api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; // Necesario para los métodos que devuelven observables

// Importa tus entidades (modelos) para los bonos y planes de pago
import { BonoEntity} from '../model/bono.entity';

@Injectable({
  providedIn: 'root' // Esto hace que el servicio esté disponible en toda la aplicación
})
export class BonoApiService { // Cambiado el nombre a BonoApiService para seguir la convención
  // URL base de tu json-server, que es donde se encuentra tu db.json
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { } // Inyecta HttpClient para hacer las peticiones HTTP

  // --- Métodos para Bonos (similar a tus métodos de Vehicle) ---

  /**
   * Obtiene todos los bonos disponibles del API.
   * @returns Un Observable que emite un array de BonoEntity.
   */
  getAllBonos(): Observable<BonoEntity[]> {
    return this.http.get<BonoEntity[]>(`${this.apiUrl}/bonos`);
  }

  /**
   * Obtiene un bono específico por su ID del API.
   * @param id El ID del bono.
   * @returns Un Observable que emite el BonoEntity encontrado.
   */
  getBonoById(id: number): Observable<BonoEntity> {
    return this.http.get<BonoEntity>(`${this.apiUrl}/bonos/${id}`);
  }

  /**
   * Crea un nuevo bono en el API.
   * @param bono Los datos del nuevo bono.
   * @returns Un Observable que emite el BonoEntity creado (con ID asignado por json-server).
   */
  addBono(bono: BonoEntity): Observable<BonoEntity> {
    return this.http.post<BonoEntity>(`${this.apiUrl}/bonos`, bono);
  }

  /**
   * Actualiza un bono existente en el API.
   * @param id El ID del bono a actualizar.
   * @param bono Los datos actualizados del bono.
   * @returns Un Observable que emite el BonoEntity actualizado.
   */
  updateBono(id: number, bono: BonoEntity): Observable<BonoEntity> {
    return this.http.put<BonoEntity>(`${this.apiUrl}/bonos/${id}`, bono); // Usamos PUT para reemplazar el recurso completo
  }

  /**
   * Elimina un bono por su ID del API.
   * @param id El ID del bono a eliminar.
   * @returns Un Observable que emite `void` si la eliminación fue exitosa.
   */
  deleteBono(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bonos/${id}`);
  }

}
