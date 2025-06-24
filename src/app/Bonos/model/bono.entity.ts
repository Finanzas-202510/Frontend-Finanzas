// src/app/model/bono.entity.ts

export class CostosEmisor {
  estructuracionPorcentaje: number = 0;
  colocacionPorcentaje: number = 0;
  flotacionPorcentaje: number = 0;
  cavaliPorcentaje: number = 0;

  constructor(data?: Partial<CostosEmisor>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

export class CostosBonista {
  flotacionPorcentaje: number = 0;
  cavaliPorcentaje: number = 0;

  constructor(data?: Partial<CostosBonista>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

export class BonoEntity {
  id?: number | string;
  nombre: string = '';
  descripcion: string = '';
  moneda: string = 'USD';
  valorNominal: number = 0;
  tasaDeInteresAnualParaCalculo: number = 0;
  fechaEmision: any = null; // <= VUELVE A ANY y null como inicialización
  fechaVencimiento: any = null; // <= VUELVE A ANY y null como inicialización
  plazoEnAnios: number = 0;
  frecuenciaPagoTexto: string = 'Semestral';
  frecuenciaPagoAnual: number = 2;

  costosEmisor: CostosEmisor = new CostosEmisor();
  costosBonista: CostosBonista = new CostosBonista();

  // Para el periodo de gracia, si va a ser parte del modelo del bono
  incluirPeriodoGracia: boolean = false;
  tipoPeriodoGracia: string = 'parcial';

  constructor(data?: Partial<BonoEntity>) {
    if (data) {
      Object.assign(this, data);

      // Manejar los objetos anidados de forma especial
      if (data.costosEmisor) {
        this.costosEmisor = new CostosEmisor(data.costosEmisor);
      }
      if (data.costosBonista) {
        this.costosBonista = new CostosBonista(data.costosBonista);
      }

      // OMITIR LA LÓGICA DE CONVERSIÓN DE FECHAS A Date (si antes era string)
      // Ya que hemos vuelto a 'any', asumimos que el tipo se manejará externamente
      // Por ejemplo, si mat-datepicker maneja strings o si el backend espera un formato específico.
    }
  }
}
