import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLink } from '@angular/router';

// Importa el servicio y la entidad del bono
import { BonoApiService } from '../services/bono-api.service';
import { BonoEntity } from '../model/bono.entity'; // Importa tu entidad real

// Interfaz para cada fila del flujo de caja
interface CashFlowItem {
  periodo: number;
  fecha: Date;
  saldoInicial: number | string;
  amortizacion: number | string;
  interes: number | string;
  cuota: number | string;
  prima: number;
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
  providers: [DatePipe]
})
export class BonosVistaComponent implements OnInit {
  bono: BonoEntity | undefined; // Usamos directamente BonoEntity
  loading: boolean = true;
  error: string | null = null;
  bondCashFlows: CashFlowItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private bonoApiService: BonoApiService,
    private router: Router,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const bonoId = params.get('id');

      if (bonoId) {
        this.getBonoDetails(bonoId);
      } else {
        this.error = 'ID de bono no proporcionado en la URL.';
        this.loading = false;
      }
    });
  }

  getBonoDetails(id: string): void {
    this.loading = true;
    this.error = null;
    this.bonoApiService.getBonoById(id).subscribe({
      next: (data: BonoEntity) => {
        this.bono = data;
        this.loading = false;
        // Una vez que el bono se ha cargado, generamos el flujo de caja
        this.generateCashFlow();
      },
      error: (err: any) => {
        console.error('Error al obtener los detalles del bono:', err);
        this.error = `No se pudieron cargar los detalles del bono con ID ${id}.`;
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  print(): void {
    window.print();
  }

  exportPdf(): void {
    console.log('Exportar a PDF no implementado en este ejemplo. Requiere librerías adicionales.');
  }

  private generateCashFlow(): void {
    if (!this.bono) {
      this.bondCashFlows = [];
      this.error = "Datos del bono no disponibles para generar el flujo de caja.";
      return;
    }

    // --- **CRÍTICO**: Verificar y manejar el método de amortización ---
    // Si tu BonoEntity no tiene 'metodoAmortizacion', el flujo no sabrá qué calcular.
    // Asumo que tu bono.entity.ts eventualmente tendrá esta propiedad.
    // Para propósitos de este ejemplo, si no existe, lo asumiremos "Alemán" y mostraremos una advertencia.
    const metodoAmortizacion = 'Alemán'; // Valor por defecto si no está en la DB

    if (metodoAmortizacion !== 'Alemán') {
      this.bondCashFlows = [];
      this.error = `Solo se soporta el método Alemán para el flujo de caja en este momento. El método del bono es: ${metodoAmortizacion}.`;
      return;
    }

    const vn = this.bono.valorNominal;
    // Removido: const vc = this.bono.valorComercial; // Ya no existe en tu db.json
    const tea = this.bono.tasaDeInteresAnualParaCalculo / 100;
    let freqPagoAnual = this.bono.frecuenciaPagoAnual; // Intentar usar el valor de la DB

    // --- **CRÍTICO**: Manejo de frecuenciaPagoAnual = 0 ---
    // Si freqPagoAnual es 0 en la DB, es un error. Intentaremos inferirlo de frecuenciaPagoTexto.
    if (freqPagoAnual === 0) {
      switch (this.bono.frecuenciaPagoTexto) {
        case 'Anual': freqPagoAnual = 1; break;
        case 'Semestral': freqPagoAnual = 2; break;
        case 'Trimestral': freqPagoAnual = 4; break;
        case 'Mensual': freqPagoAnual = 12; break;
        default:
          this.error = "Frecuencia de pago anual no válida. No se puede generar el flujo.";
          this.bondCashFlows = [];
          return;
      }
      console.warn("Advertencia: 'frecuenciaPagoAnual' era 0 en la DB, inferido a " + freqPagoAnual + " de 'frecuenciaPagoTexto'.");
    }

    if (tea === 0 && freqPagoAnual > 0) { // Manejar si la TEA es 0
      console.warn("Advertencia: La tasa de interés anual (TEA) es 0. Los intereses y cupones serán 0.");
    }


    // 1. Calcular la Tasa Efectiva del Periodo (TEP)
    const tep = Math.pow(1 + tea, (1 / freqPagoAnual)) - 1;
    console.log('TEA:', tea, 'TEP:', tep);

    // 2. Calcular el número total de periodos (N)
    const fechaEmision = new Date(this.bono.fechaEmision);
    const fechaVencimiento = new Date(this.bono.fechaVencimiento);

    const diffMonths = (fechaVencimiento.getFullYear() - fechaEmision.getFullYear()) * 12 +
      (fechaVencimiento.getMonth() - fechaEmision.getMonth());
    const monthsPerPeriod = 12 / freqPagoAnual;
    const n = Math.round(diffMonths / monthsPerPeriod); // Usar Math.round para evitar imprecisiones de flotación

    console.log('Total periodos (n):', n);

    if (n <= 0 || !Number.isInteger(n)) {
      this.error = "Las fechas de emisión/vencimiento o la frecuencia de pago no resultan en un número entero de periodos. O el número de periodos es cero/negativo.";
      this.bondCashFlows = [];
      return;
    }

    // 3. Amortización por Periodo (constante en el Método Alemán)
    const amortizacionConstante = vn / n;
    console.log('Amortización Constante:', amortizacionConstante);

    let currentSaldo = vn;
    const cashFlows: CashFlowItem[] = [];

    // --- Periodo 0 (Inversión Inicial del Bonista) ---
    // Sin valorComercial, el flujo inicial del bonista es el Valor Nominal
    // más los costos iniciales del bonista (si los hay).
    // Asumimos que la flotación bonista es un costo inicial sobre el Valor Nominal.
    let costosBonistaIniciales = 0;
    if (this.bono.costosBonista && this.bono.costosBonista.flotacionPorcentaje) {
      costosBonistaIniciales = (this.bono.costosBonista.flotacionPorcentaje / 100) * vn;
    }

    // El flujo inicial es la inversión del bonista, que es el Valor Nominal
    // más los costos iniciales del bonista. Es negativo porque es un egreso.
    const flujoCajaInicialBonista = -(vn + costosBonistaIniciales);


    cashFlows.push({
      periodo: 0,
      fecha: fechaEmision, // La inversión se da en la fecha de emisión
      saldoInicial: '-',
      amortizacion: '-',
      interes: '-',
      cuota: '-',
      prima: 0,
      flujoCaja: flujoCajaInicialBonista,
      saldo: vn, // El saldo del bono al inicio es el Valor Nominal
    });

    // --- Periodos 1 a N ---
    for (let i = 1; i <= n; i++) {
      const interes = currentSaldo * tep;
      const cuota = interes + amortizacionConstante;

      // Calcular la fecha de pago para este periodo
      const paymentDate = new Date(fechaEmision);
      paymentDate.setMonth(fechaEmision.getMonth() + (monthsPerPeriod * i));

      let prima = 0;
      if (i === n) { // Si es el último periodo, añadir la prima de redención
        prima = vn ;
      }

      const flujoCajaPeriodo = cuota + prima;

      currentSaldo -= amortizacionConstante;
      if (i === n) {
        currentSaldo = 0; // Aseguramos que el saldo final sea 0 en el último periodo
      }

      cashFlows.push({
        periodo: i,
        fecha: paymentDate,
        saldoInicial: vn - (amortizacionConstante * (i - 1)),
        amortizacion: amortizacionConstante,
        interes: interes,
        cuota: cuota,
        prima: prima,
        flujoCaja: flujoCajaPeriodo,
        saldo: currentSaldo,
      });
    }

    this.bondCashFlows = cashFlows;
    this.loading = false;
    this.error = null;
  }
}
