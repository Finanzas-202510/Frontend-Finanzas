import {Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router'; // Importa NavigationEnd
import { filter } from 'rxjs/operators'; // Importa filter de rxjs/operators

// Importa el servicio y la entidad del bono
import { BonoApiService } from '../services/bono-api.service';
import { BonoEntity } from '../model/bono.entity';
import {Subscription} from 'rxjs';
import {MatIcon} from '@angular/material/icon';

// Interfaz para cada fila del flujo de caja
interface CashFlowItem {
  periodo: number;
  fecha: Date;
  saldoInicial: number | string;
  amortizacion: number | string;
  interes: number | string;
  cuota: number | string;
  flujoCaja: number;
  saldo: number | string;
  tipoPeriodo?: 'T' | 'P' | 'S' | '-';
}

@Component({
  selector: 'app-bonos-vista',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon
  ],
  templateUrl: './bonos-vista.component.html',
  styleUrl: './bonos-vista.component.css',
  providers: [DatePipe, DecimalPipe]
})
export class BonosVistaComponent implements OnInit, OnDestroy {
  bono: BonoEntity | undefined;
  loading: boolean = true;
  error: string | null = null;
  bondCashFlows: CashFlowItem[] = [];

  tcea: number | null = null;
  trea: number | null = null;
  tep: number | null = null;

  precioBonoCalculado: number | null = null;
  duracionMacaulay: number | null = null;
  duracionModificada: number | null = null;
  convexidad: number | null = null;

  private routeSubscription: Subscription | undefined; // Para manejar la suscripción


  constructor(
    private route: ActivatedRoute,
    private bonoApiService: BonoApiService,
    private router: Router,
    private datePipe: DatePipe
  ) {

  }

  ngOnInit(): void {
    // Nos suscribimos a paramMap. Esto reaccionará si el parámetro 'id' cambia
    // o si el componente es inicializado por primera vez.
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const bonoId = params.get('id');
      if (bonoId) {
        this.getBonoDetails(bonoId);
      } else {
        this.error = 'ID de bono no proporcionado en la URL.';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  getBonoDetails(id: string): void {
    this.loading = true;
    this.error = null;
    this.bonoApiService.getBonoById(id).subscribe({
      next: (data: BonoEntity) => {
        // Asegurarse de que el objeto bono se reemplace completamente
        this.bono = data;
        this.loading = false;
        // Recalcular siempre que los detalles del bono se carguen
        this.generateCashFlow();
        this.tcea = this.calculateTCEA();
        this.trea = this.calculateTREA();
        this.calculateAdvancedMetrics();
      },
      error: (err: any) => {
        console.error('Error al obtener los detalles del bono:', err);
        this.error = `No se pudieron cargar los detalles del bono con ID ${id}.`;
        this.loading = false;
        this.bono = undefined; // Limpiar el bono si hay error
        this.bondCashFlows = []; // Limpiar el flujo de caja
        this.tcea = null;
        this.trea = null;
        this.tep = null;
        // Reiniciar los nuevos cálculos también en caso de error
        this.precioBonoCalculado = null;
        this.duracionMacaulay = null;
        this.duracionModificada = null;
        this.convexidad = null;
      }
    });
  }

  // ... (resto de tus métodos: goBack, print, exportPdf, generateCashFlow, calculateIRR, calculateTCEA, calculateTREA)
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  print(): void {
    window.print();
  }

  exportPdf(): void {
    console.log('Exportar a PDF no implementado en este ejemplo. Requiere librerías adicionales.');
    alert('Función de exportar a PDF no implementada en este ejemplo.');
  }

  private generateCashFlow(): void {
    if (!this.bono) {
      this.bondCashFlows = [];
      this.error = "Datos del bono no disponibles para generar el flujo de caja.";
      return;
    }

    console.log('generateCashFlow llamado. Plazo en anios:', this.bono.plazoEnAnios, 'Frecuencia:', this.bono.frecuenciaPagoAnual);
    console.log('Fecha de emision:', this.bono.fechaEmision, 'Fecha de vencimiento:', this.bono.fechaVencimiento);
    console.log('Gracia:', this.bono.incluirPeriodoGracia, 'Tipo:', this.bono.tipoPeriodoGracia, 'Duracion:', this.bono.periodoGraciaMeses);

    const vn = this.bono.valorNominal;
    const tea = this.bono.tasaDeInteresAnualParaCalculo;
    const freqPagoAnual = this.bono.frecuenciaPagoAnual;

    const fechaEmision = new Date(this.bono.fechaEmision);
    // const fechaVencimiento = new Date(this.bono.fechaVencimiento); // Not directly used here

    const n = this.bono.plazoEnAnios * freqPagoAnual; // Número total de períodos

    if (n <= 0 || !Number.isInteger(n)) {
      this.error = "El plazo calculado no resulta en un numero valido de periodos.";
      this.bondCashFlows = [];
      return;
    }

    // Tasa efectiva periódica basada en la TEA del cupón
    const tepCalculated = (Math.pow(1 + tea / 100, (1 / freqPagoAnual))) - 1;
    this.tep = tepCalculated;

    const cashFlows: CashFlowItem[] = [];

    // FLUJO DE CAJA INICIAL (Periodo 0)
    // Para la tabla de amortización, saldo inicial es VN.
    // Para cálculos de TIR/TCEA/TREA, el flujo en t=0 es -VN (si es el precio de emisión)
    cashFlows.push({
      periodo: 0,
      fecha: fechaEmision,
      saldoInicial: '-',
      amortizacion: '-',
      interes: '-',
      cuota: '-',
      flujoCaja: -vn, // Asumimos que el flujo en t=0 para el bonista es la compra del bono (salida de dinero)
      saldo: vn, // Saldo inicial del bono
      tipoPeriodo: '-'
    });

    const incluirGracia = this.bono.incluirPeriodoGracia;
    const tipoGracia = this.bono.tipoPeriodoGracia;
    const duracionGraciaPeriodos = this.bono.periodoGraciaMeses;

    // Calculamos el principal que quedará al final de la gracia total (si aplica)
    // Este será el principal base para la amortización constante.
    let principalAcumuladoPostGraciaTotal = vn;
    if (incluirGracia && tipoGracia === 'total') {
      for (let k = 1; k <= duracionGraciaPeriodos; k++) {
        principalAcumuladoPostGraciaTotal += principalAcumuladoPostGraciaTotal * tepCalculated;
      }
    }

    // Calculamos el número de períodos donde realmente habrá amortización de capital
    const periodosDeAmortizacionEfectiva = n - (incluirGracia && tipoGracia === 'total' ? duracionGraciaPeriodos : 0);

    // Calculamos la amortización constante para los períodos efectivos
    let amortizacionConstante = 0;
    if (periodosDeAmortizacionEfectiva > 0) {
      amortizacionConstante = principalAcumuladoPostGraciaTotal / periodosDeAmortizacionEfectiva;
    }

    let currentSaldoCapital = vn; // Este es el saldo de capital que se actualiza en cada período

    for (let i = 1; i <= n; i++) {
      let amortizacion = 0;
      let interes = currentSaldoCapital * tepCalculated; // El interés se calcula sobre el saldo de capital actual
      let cuota = 0;
      let flujoCaja = 0;
      let saldoFinalPeriodo = 0;
      let tipoPeriodoColumna: 'T' | 'P' | 'S' | '-' = 'S';

      if (incluirGracia && i <= duracionGraciaPeriodos) {
        // Estamos en un período de gracia
        if (tipoGracia === 'parcial') {
          // Gracia Parcial: Solo se pagan intereses
          amortizacion = 0; // No hay amortización de capital
          cuota = interes;
          flujoCaja = cuota;
          saldoFinalPeriodo = currentSaldoCapital; // El saldo de capital no cambia
          tipoPeriodoColumna = 'P';
        } else if (tipoGracia === 'total') {
          // Gracia Total: No se paga nada, intereses se capitalizan
          amortizacion = 0; // No hay amortización
          cuota = 0; // Cuota es 0
          flujoCaja = 0; // Flujo de caja es 0
          saldoFinalPeriodo = currentSaldoCapital + interes; // Capitalización de intereses
          tipoPeriodoColumna = 'T';
        }
      } else {
        // Período normal de amortización (después de la gracia o si no hay gracia)
        amortizacion = amortizacionConstante; // La amortización de principal es constante
        cuota = interes + amortizacion;
        flujoCaja = cuota;
        saldoFinalPeriodo = currentSaldoCapital - amortizacion; // El saldo disminuye por la amortización
        tipoPeriodoColumna = 'S';
      }

      // Cálculo de la fecha de pago
      const paymentDate = new Date(fechaEmision);
      const monthsPerPaymentPeriod = 12 / freqPagoAnual;
      paymentDate.setMonth(fechaEmision.getMonth() + (monthsPerPaymentPeriod * i));
      if (paymentDate.getDate() !== fechaEmision.getDate()) {
        const originalDay = fechaEmision.getDate();
        const lastDayOfPaymentMonth = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0).getDate();
        paymentDate.setDate(Math.min(originalDay, lastDayOfPaymentMonth));
      }

      // Ajuste para el último período para asegurar que el saldo final sea exactamente 0
      // debido a posibles imprecisiones de punto flotante.
      if (i === n) {
        amortizacion = currentSaldoCapital; // Amortiza todo el capital restante
        cuota = interes + amortizacion; // Recalcula la cuota con la amortización ajustada
        flujoCaja = cuota;
        saldoFinalPeriodo = 0; // El saldo final es 0
      }

      cashFlows.push({
        periodo: i,
        fecha: paymentDate,
        saldoInicial: currentSaldoCapital,
        amortizacion: amortizacion,
        interes: interes,
        cuota: cuota,
        flujoCaja: flujoCaja,
        saldo: saldoFinalPeriodo,
        tipoPeriodo: tipoPeriodoColumna
      });

      currentSaldoCapital = saldoFinalPeriodo; // El saldo final de este período es el inicial del siguiente
    }
    this.bondCashFlows = cashFlows;
    console.log("Flujos de caja generados (Alemán):", this.bondCashFlows);
  }


  private calculateIRR(cashFlows: number[]): number | null {
    if (!cashFlows || cashFlows.length === 0) {
      return null;
    }

    const hasPositive = cashFlows.some(cf => cf > 0);
    const hasNegative = cashFlows.some(cf => cf < 0);
    if (!hasPositive || !hasNegative) {
      return null;
    }

    const maxIterations = 1000;
    const tolerance = 0.0000001;
    let lowRate = -0.999;
    let highRate = 100.0;
    let guess = 0.1;

    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let derivative = 0;

      for (let k = 0; k < cashFlows.length; k++) {
        npv += cashFlows[k] / Math.pow(1 + guess, k);
        derivative -= cashFlows[k] * k / Math.pow(1 + guess, k + 1);
      }

      if (Math.abs(npv) < tolerance) {
        return guess;
      }

      if (derivative === 0) {
        guess += 0.0001;
        continue;
      }

      guess = guess - npv / derivative;

      if (guess < lowRate) guess = lowRate;
      if (guess > highRate) guess = highRate;
    }

    return null;
  }

  private calculateTCEA(): number | null {
    if (!this.bono || !this.bondCashFlows || this.bondCashFlows.length === 0) {
      return null;
    }

    const vn = this.bono.valorNominal;
    const freqPagoAnual = this.bono.frecuenciaPagoAnual;

    const estructuracionCosto = (this.bono.costosEmisor.estructuracionPorcentaje / 100) * vn;
    const colocacionCosto = (this.bono.costosEmisor.colocacionPorcentaje / 100) * vn;
    const cavaliEmisorCosto = (this.bono.costosEmisor.cavaliPorcentaje / 100) * vn;

    const totalCostosInicialesEmisor = estructuracionCosto + colocacionCosto + cavaliEmisorCosto;

    const flujosEmisor: number[] = [vn - totalCostosInicialesEmisor];

    for (let i = 1; i < this.bondCashFlows.length; i++) {
      const flowItem = this.bondCashFlows[i];
      if (typeof flowItem.cuota === 'number') {
        flujosEmisor.push(-flowItem.cuota);
      }
    }

    const tceaPeriodica = this.calculateIRR(flujosEmisor);

    if (tceaPeriodica === null) {
      return null;
    }

    return Math.pow(1 + tceaPeriodica, freqPagoAnual) - 1;
  }

  private calculateTREA(): number | null {
    if (!this.bono || !this.bondCashFlows || this.bondCashFlows.length === 0) {
      return null;
    }

    const vn = this.bono.valorNominal;
    const freqPagoAnual = this.bono.frecuenciaPagoAnual;

    const flotacionBonistaCosto = (this.bono.costosBonista.flotacionPorcentaje / 100) * vn;
    const cavaliBonistaCosto = (this.bono.costosBonista.cavaliPorcentaje / 100) * vn;

    const totalCostosInicialesBonista = flotacionBonistaCosto + cavaliBonistaCosto;

    const flujosBonista: number[] = [-(vn + totalCostosInicialesBonista)];

    for (let i = 1; i < this.bondCashFlows.length; i++) {
      const flowItem = this.bondCashFlows[i];
      if (typeof flowItem.cuota === 'number') {
        flujosBonista.push(flowItem.cuota);
      }
    }

    const treaPeriodica = this.calculateIRR(flujosBonista);

    if (treaPeriodica === null) {
      return null;
    }

    return Math.pow(1 + treaPeriodica, freqPagoAnual) - 1;
  }

  // --- NUEVAS FUNCIONES DE CÁLCULO ---

  /**
   * Ajusta la tasa anual (COK o TEA) a la tasa periódica según la frecuencia de pago.
   * @param annualRate La tasa anual (ej. COK anual en decimal).
   * @param compoundingFrequency La frecuencia de capitalización anual (ej. 2 para semestral).
   * @returns La tasa efectiva por período.
   */
  private getEffectiveRatePerPeriod(annualRate: number, compoundingFrequency: number): number {
    // Si la tasa anual es ya una TEA (Tasa Efectiva Anual), la conversión a Tasa Efectiva Periódica (TEP) es:
    return Math.pow(1 + annualRate, 1 / compoundingFrequency) - 1;
  }

  /**
   * Calcula el Precio del Bono (Valor Presente) descontando todos los flujos de caja futuros al COK.
   * @param bono El objeto BonoEntity.
   * @returns El precio calculado del bono.
   */
  private calculateBondPrice(): number | null {
    if (!this.bono || !this.bono.cok || this.bono.cok <= 0 || !this.bondCashFlows || this.bondCashFlows.length < 1) {
      console.warn('Datos insuficientes para el cálculo del precio del bono (COK o flujos faltantes).');
      return null;
    }

    const cokPerPeriod = this.getEffectiveRatePerPeriod(this.bono.cok, this.bono.frecuenciaPagoAnual);
    let bondPrice = 0;

    // Los flujos de caja para el cálculo del precio empiezan desde el período 1
    // (el período 0 de la tabla de flujos es la inversión inicial, no un flujo futuro del bono)
    for (let i = 1; i < this.bondCashFlows.length; i++) {
      const cf = this.bondCashFlows[i];
      if (typeof cf.flujoCaja === 'number') { // Asegurarse de que flujoCaja es un número
        bondPrice += cf.flujoCaja / Math.pow(1 + cokPerPeriod, cf.periodo);
      }
    }
    return bondPrice;
  }

  /**
   * Calcula la Duración de Macaulay del bono.
   * @returns La Duración de Macaulay en períodos.
   */
  private calculateMacaulayDuration(): number | null {
    if (!this.bono || !this.bono.cok || this.bono.cok <= 0 || !this.bondCashFlows || this.bondCashFlows.length < 1) {
      console.warn('Datos insuficientes para el cálculo de Duración Macaulay (COK o flujos faltantes).');
      return null;
    }

    const price = this.precioBonoCalculado; // Usar el precio ya calculado
    if (price === null || price === 0) return 0; // Evitar división por cero o si el precio es nulo

    const cokPerPeriod = this.getEffectiveRatePerPeriod(this.bono.cok, this.bono.frecuenciaPagoAnual);
    let sumWeightedPeriods = 0;

    for (let i = 1; i < this.bondCashFlows.length; i++) {
      const cf = this.bondCashFlows[i];
      if (typeof cf.flujoCaja === 'number') {
        sumWeightedPeriods += (cf.flujoCaja / Math.pow(1 + cokPerPeriod, cf.periodo)) * cf.periodo;
      }
    }

    return sumWeightedPeriods / price; // Duración en número de períodos
  }

  /**
   * Calcula la Duración Modificada del bono.
   * @returns La Duración Modificada en períodos.
   */
  private calculateModifiedDuration(): number | null {
    const macDuration = this.duracionMacaulay; // Usar la duración de Macaulay ya calculada

    if (macDuration === null || !this.bono || !this.bono.cok || this.bono.cok <= 0) {
      return null;
    }

    const cokPerPeriod = this.getEffectiveRatePerPeriod(this.bono.cok, this.bono.frecuenciaPagoAnual);

    if (1 + cokPerPeriod === 0) return 0; // Evitar división por cero

    return macDuration / (1 + cokPerPeriod); // Duración modificada por período
  }

  /**
   * Calcula la Convexidad del bono.
   * @returns La Convexidad.
   */
  private calculateConvexity(): number | null {
    if (!this.bono || !this.bono.cok || this.bono.cok <= 0 || !this.bondCashFlows || this.bondCashFlows.length < 1) {
      console.warn('Datos insuficientes para el cálculo de Convexidad (COK o flujos faltantes).');
      return null;
    }

    const price = this.precioBonoCalculado; // Usar el precio ya calculado
    if (price === null || price === 0) return 0;

    const cokPerPeriod = this.getEffectiveRatePerPeriod(this.bono.cok, this.bono.frecuenciaPagoAnual);
    let sumConvexity = 0;

    for (let i = 1; i < this.bondCashFlows.length; i++) {
      const cf = this.bondCashFlows[i];
      if (typeof cf.flujoCaja === 'number') {
        // (Flujo / (1+r)^(t+2)) * t * (t+1)
        sumConvexity += (cf.flujoCaja / Math.pow(1 + cokPerPeriod, cf.periodo + 2)) * cf.periodo * (cf.periodo + 1);
      }
    }

    return sumConvexity / price; // Convexidad
  }

  /**
   * Orquesta todos los cálculos avanzados.
   */
  private calculateAdvancedMetrics(): void {
    if (this.bono) {
      // Importante: El orden de cálculo es relevante (precio primero, luego duración de Macaulay, etc.)
      this.precioBonoCalculado = this.calculateBondPrice();
      // Si el precio es nulo, los cálculos siguientes también lo serán o tendrán 0
      if (this.precioBonoCalculado !== null) {
        const macaulayInPeriods = this.calculateMacaulayDuration();
        if (macaulayInPeriods !== null && this.bono.frecuenciaPagoAnual > 0) {
          this.duracionMacaulay = macaulayInPeriods / this.bono.frecuenciaPagoAnual; // Convertir a años
        } else {
          this.duracionMacaulay = null;
        }

        const modifiedInPeriods = this.calculateModifiedDuration();
        if (modifiedInPeriods !== null && this.bono.frecuenciaPagoAnual > 0) {
          this.duracionModificada = modifiedInPeriods / this.bono.frecuenciaPagoAnual; // Convertir a años
        } else {
          this.duracionModificada = null;
        }

        this.convexidad = this.calculateConvexity();
      } else {
        // Resetear si el precio no se pudo calcular
        this.duracionMacaulay = null;
        this.duracionModificada = null;
        this.convexidad = null;
      }
    }
  }
}
