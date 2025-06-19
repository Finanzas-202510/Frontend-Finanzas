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
  descripcion: string;
  moneda: string;
  valorNominal: number;
  tasaDeInteresAnualParaCalculo: number;
  fechaEmision: any;
  fechaVencimiento: any;
  plazoEnAnios: number;
  frecuenciaPagoTexto: string;
  frecuenciaPagoAnual: number;

  costosEmisor: CostosEmisor;
  costosBonista: CostosBonista;

  constructor() {
    this.id = undefined; // O null, si prefieres
    this.nombre = '';
    this.descripcion = '';
    this.moneda = '';
    this.valorNominal = 0;
    this.tasaDeInteresAnualParaCalculo = 0;
    this.fechaEmision = '';
    this.fechaVencimiento = '';
    this.plazoEnAnios = 0;
    this.frecuenciaPagoTexto = '';
    this.frecuenciaPagoAnual = 0;

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
