// src/app/model/bono.entity.ts

export class CostosEmisor {
  estructuracionPorcentaje: number = 0;
  colocacionPorcentaje: number = 0;
  flotacionPorcentaje: number = 0;
  cavaliPorcentaje: number = 0;

  constructor(data?: Partial<CostosEmisor>) {
    this.estructuracionPorcentaje = data?.estructuracionPorcentaje ?? 0;
    this.colocacionPorcentaje = data?.colocacionPorcentaje ?? 0;
    this.flotacionPorcentaje = data?.flotacionPorcentaje ?? 0;
    this.cavaliPorcentaje = data?.cavaliPorcentaje ?? 0;
  }
}

export class CostosBonista {
  flotacionPorcentaje: number = 0;
  cavaliPorcentaje: number = 0;

  constructor(data?: Partial<CostosBonista>) {
    this.flotacionPorcentaje = data?.flotacionPorcentaje ?? 0;
    this.cavaliPorcentaje = data?.cavaliPorcentaje ?? 0;
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

  incluirPeriodoGracia: boolean;
  tipoPeriodoGracia: 'parcial' | 'total' | ''; // 'parcial', 'total' o '' (ninguno)
  periodoGraciaMeses: number;

  constructor(data?: Partial<BonoEntity>) {
    this.id = data?.id || '';
    this.nombre = data?.nombre || '';
    this.descripcion = data?.descripcion || '';
    this.valorNominal = data?.valorNominal ?? 0;
    this.moneda = data?.moneda || 'USD';
    this.tasaDeInteresAnualParaCalculo = data?.tasaDeInteresAnualParaCalculo ?? 0;
    this.fechaEmision = data?.fechaEmision ? new Date(data.fechaEmision) : new Date();
    this.fechaVencimiento = data?.fechaVencimiento ? new Date(data.fechaVencimiento) : new Date();
    this.frecuenciaPagoTexto = data?.frecuenciaPagoTexto || 'Semestral';
    this.frecuenciaPagoAnual = data?.frecuenciaPagoAnual ?? 2;
    this.plazoEnAnios = data?.plazoEnAnios ?? 0;
    this.costosEmisor = new CostosEmisor(data?.costosEmisor);
    this.costosBonista = new CostosBonista(data?.costosBonista);

    // Inicializar nuevas propiedades de gracia
    this.incluirPeriodoGracia = data?.incluirPeriodoGracia ?? false;
    this.tipoPeriodoGracia = data?.tipoPeriodoGracia || '';
    this.periodoGraciaMeses = data?.periodoGraciaMeses ?? 0;
    }
}
