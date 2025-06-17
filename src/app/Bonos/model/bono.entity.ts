/**
 * Interface para los costos específicos del emisor.
 */
export interface CostosEmisor {
  estructuracionPorcentaje: number;
  colocacionPorcentaje: number;
  flotacionPorcentaje: number;
  cavaliPorcentaje: number;
}

/**
 * Interface para los costos específicos del bonista (inversionista).
 */
export interface CostosBonista {
  flotacionPorcentaje: number;
  cavaliPorcentaje: number;
}

/**
 * Clase que representa la estructura de un Bono, con valores por defecto.
 */
export class BonoEntity {
  id?: number;
  nombre: string;
  moneda: string;
  valorNominal: number;
  valorComercial: number;
  tasaDeInteresAnualParaCalculo: number;
  fechaEmision: string;
  fechaVencimiento: string;
  frecuenciaPagoTexto: string;
  frecuenciaPagoAnual: number;
  primaRedencionPorcentaje: number;

  costosEmisor: CostosEmisor;
  costosBonista: CostosBonista;

  constructor() {
    this.id = undefined; // O null, si prefieres
    this.nombre = '';
    this.moneda = '';
    this.valorNominal = 0;
    this.valorComercial = 0;
    this.tasaDeInteresAnualParaCalculo = 0;
    this.fechaEmision = '';
    this.fechaVencimiento = '';
    this.frecuenciaPagoTexto = '';
    this.frecuenciaPagoAnual = 0;
    this.primaRedencionPorcentaje = 0;

    // Inicializa los objetos anidados también
    this.costosEmisor = {
      estructuracionPorcentaje: 0,
      colocacionPorcentaje: 0,
      flotacionPorcentaje: 0,
      cavaliPorcentaje: 0
    };
    this.costosBonista = {
      flotacionPorcentaje: 0,
      cavaliPorcentaje: 0
    };
  }
}
