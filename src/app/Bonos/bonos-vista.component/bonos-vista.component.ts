import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router'; // Importa NavigationEnd
import { filter } from 'rxjs/operators'; // Importa filter de rxjs/operators

// Importa el servicio y la entidad del bono
import { BonoApiService } from '../services/bono-api.service';
import { BonoEntity } from '../model/bono.entity';
import {Subscription} from 'rxjs';

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
}

@Component({
  selector: 'app-bonos-vista',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './bonos-vista.component.html',
  styleUrl: './bonos-vista.component.css',
  providers: [DatePipe, DecimalPipe]
})
export class BonosVistaComponent implements OnInit {
  bono: BonoEntity | undefined;
  loading: boolean = true;
  error: string | null = null;
  bondCashFlows: CashFlowItem[] = [];

  tcea: number | null = null;
  trea: number | null = null;
  tep: number | null = null;

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
    // Es CRUCIAL desuscribirse para evitar fugas de memoria
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

    const vn = this.bono.valorNominal;
    const tea = this.bono.tasaDeInteresAnualParaCalculo;
    let freqPagoAnual = this.bono.frecuenciaPagoAnual;

    // AQUI ES DONDE EL PLAZO EN AÑOS ES IMPORTANTE. Asegúrate de que n se calcule correctamente
    // basándose en las nuevas fechas o el nuevo plazoEnAnios
    const fechaEmision = new Date(this.bono.fechaEmision);
    const fechaVencimiento = new Date(this.bono.fechaVencimiento);

    // Es crucial que 'n' se derive correctamente de los datos actualizados del bono.
    // Si tu `BonoEntity` tiene `plazoEnAnios`, úsalo para calcular `n` de manera consistente.
    // Si la edición solo cambia `plazoEnAnios`, asegúrate de que eso afecte `n`.
    // Si la edición cambia `fechaVencimiento`, la lógica actual debería recalcular `n`.

    const diffTime = Math.abs(fechaVencimiento.getTime() - fechaEmision.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysPerYear = 365.25; // Considerando años bisiestos para mayor precisión
    const yearsCalculated = diffDays / daysPerYear;
    let n: number;

    // Si tu entidad tiene 'plazoEnAnios', podrías usarlo directamente para 'n'
    // o asegurarte de que sea coherente con las fechas.
    // Asumiendo que 'n' es el número de periodos de pago.
    n = Math.round(yearsCalculated * freqPagoAnual);

    // Si estás pasando el `plazoEnAnios` explícitamente en la edición
    // y es el valor que quieres que determine la cantidad de cuotas,
    // asegúrate de que 'n' se derive de 'plazoEnAnios' si esa es la fuente de verdad.
    // Por ejemplo, si siempre 6 años con pago semestral son 12 cuotas,
    // y al cambiar a 3 años son 6 cuotas:
    // n = this.bono.plazoEnAnios * freqPagoAnual;

    if (n <= 0 || !Number.isInteger(n)) {
      this.error = "Las fechas, el plazo o la frecuencia de pago no resultan en un número válido de periodos.";
      this.bondCashFlows = [];
      return;
    }

    const tepCalculated = Math.pow(1 + tea, (1 / freqPagoAnual)) - 1;
    this.tep = tepCalculated;

    const amortizacionConstante = vn / n;

    let currentSaldo = vn;
    const cashFlows: CashFlowItem[] = [];

    cashFlows.push({
      periodo: 0,
      fecha: fechaEmision,
      saldoInicial: '-',
      amortizacion: '-',
      interes: '-',
      cuota: '-',
      flujoCaja: 0,
      saldo: vn,
    });

    for (let i = 1; i <= n; i++) {
      const interes = currentSaldo * tepCalculated;
      const cuota = interes + amortizacionConstante;

      const paymentDate = new Date(fechaEmision);
      const monthsPerPaymentPeriod = 12 / freqPagoAnual;
      paymentDate.setMonth(fechaEmision.getMonth() + (monthsPerPaymentPeriod * i));
      if (paymentDate.getDate() !== fechaEmision.getDate()) {
        paymentDate.setDate(0); // Set to last day of previous month
        paymentDate.setDate(fechaEmision.getDate()); // Set to original day, will overflow if needed
      }

      currentSaldo -= amortizacionConstante;
      if (i === n) {
        currentSaldo = 0; // Asegura que el saldo final sea 0 en la última cuota
      }

      cashFlows.push({
        periodo: i,
        fecha: paymentDate,
        saldoInicial: (vn - (amortizacionConstante * (i - 1))),
        amortizacion: amortizacionConstante,
        interes: interes,
        cuota: cuota,
        flujoCaja: cuota,
        saldo: currentSaldo,
      });
    }

    this.bondCashFlows = cashFlows;
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
    const flotacionEmisorCosto = (this.bono.costosEmisor.flotacionPorcentaje / 100) * vn;
    const cavaliEmisorCosto = (this.bono.costosEmisor.cavaliPorcentaje / 100) * vn;

    const totalCostosInicialesEmisor = estructuracionCosto + colocacionCosto + flotacionEmisorCosto + cavaliEmisorCosto;

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
}
