import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-reporte-viajes',
  templateUrl: './reporte-viajes.component.html',
  styleUrls: ['./reporte-viajes.component.scss'],
})
export class ReporteViajesComponent implements OnInit {
  years: number[] = [];
  months: string[] = [];
  selectedYear: number = 0;
  selectedMonth: string = '';
  selectedTaxiType: string = '';
  viajes: any[] = [];

  recorridos: any[] = [];
  recorridosFiltrados: any[] = [];
  totalTiempo: string = '00:00:00'; // Inicializar con cero
  totalCosto: number = 0; // Inicializar con cero

  constructor(
    private modalController: ModalController,
    private alertController: AlertController
  ) {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 10; i--) {
      this.years.push(i);
    }

    this.months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
  }

  ngOnInit() {
    // Llena "viajes" con los datos de los viajes almacenados localmente
    const storedViajes = localStorage.getItem('recorridos');
    if (storedViajes) {
      this.viajes = JSON.parse(storedViajes);
    }

    const storedData = localStorage.getItem('recorridos');
    this.recorridos = storedData ? JSON.parse(storedData) : [];
  }

  generarReporte() {
    let filteredViajes = this.viajes;

    if (this.selectedYear) {
      filteredViajes = filteredViajes.filter((viaje) =>
        viaje.fecha.endsWith(this.selectedYear)
      );
    }

    if (this.selectedMonth) {
      const monthNumber = this.months.indexOf(this.selectedMonth) + 1;
      filteredViajes = filteredViajes.filter((viaje) => {
        const [day, month, year] = viaje.fecha.split('/');
        return parseInt(month, 10) === monthNumber;
      });
    }

    if (this.selectedTaxiType) {
      console.log(this.selectedTaxiType);
      filteredViajes = filteredViajes.filter(
        (viaje) => viaje.type === this.selectedTaxiType
      );
    }

    const totalCosto = filteredViajes.reduce(
      (acc, viaje) => acc + parseFloat(viaje.cost),
      0
    );
  }

  tiempoToSegundos(tiempo: string): number {
    const [hh, mm, ss] = tiempo.split(':').map(Number);
    return hh * 3600 + mm * 60 + ss;
  }

  segundosToTiempo(segundos: number): string {
    const hh = Math.floor(segundos / 3600);
    const mm = Math.floor((segundos % 3600) / 60);
    const ss = segundos % 60;

    return `${hh.toString().padStart(2, '0')}:${mm
      .toString()
      .padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
  }
  getMonthName(month: number): string {
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return monthNames[month - 1]; // Restamos 1 porque los meses comienzan en 1
  }

  async borrarRecorridos() {
    localStorage.removeItem('recorridos');

    const alert = await this.alertController.create({
      header: 'Recorridos Eliminados',
      message: 'Los recorridos se han eliminado con éxito.',
      buttons: ['OK'],
    });

    await alert.present();
  }

  onRegresarHomePage() {
    // Cierra el modal para regresar a la página anterior (HomePage)
    this.modalController.dismiss();
  }

  // filtrarRecorridos() {
  //   this.recorridosFiltrados = this.getRecorridosFiltrados();

  //   this.calcularSumas();
  // }

  filtrarAnio() {
    const selectedYear = new Date(`1,1,${this.selectedYear}`);

    this.recorridosFiltrados = this.recorridos.filter((recorrido) => {
      return (
        selectedYear.getFullYear() ===
        parseInt(recorrido.fecha.split('/')[2], 10)
      );
    });

    this.calcularSumas();
  }

  filtrarMes() {
    const selectedMonth = new Date(`${this.selectedMonth} 1`);

    this.recorridosFiltrados = this.recorridos.filter((recorrido) => {
      return (
        selectedMonth.getMonth() + 1 ===
        parseInt(recorrido.fecha.split('/')[1], 10)
      );
    });

    this.calcularSumas();
  }

  filtrarTipoTaxi() {
    this.recorridosFiltrados = this.recorridos.filter((recorrido) => {
      return this.selectedTaxiType === recorrido.type;
    });

    this.calcularSumas();
  }

  // getRecorridosFiltrados() {
  //   if (!this.selectedYear && !this.selectedMonth && !this.selectedTaxiType) {
  //     return this.recorridos;
  //   }

  //   return this.recorridos.filter((recorrido) => {
  //     const selectedMonth = new Date(`${this.selectedMonth} 1`);
  //     const selectedYear = new Date(`1,1,${this.selectedYear}`);

  //     return (
  //       (!this.selectedYear ||
  //         parseInt(recorrido.fecha.split('/')[2]) ===
  //           selectedYear.getFullYear()) &&
  //       (!this.selectedMonth ||
  //         parseInt(recorrido.fecha.split('/')[1]) ===
  //           selectedMonth.getMonth() + 1) &&
  //       (!this.selectedTaxiType || recorrido.type === this.selectedTaxiType)
  //     );
  //   });
  // }

  calcularSumas() {
    // Reiniciar las sumas
    this.totalTiempo = '00:00:00';
    this.totalCosto = 0;

    // Calcular las sumas
    this.recorridosFiltrados.forEach((recorrido) => {
      const tiempoPartes = recorrido.tiempo.split(':').map(Number);
      const costo = parseFloat(recorrido.cost);

      // Sumar tiempos
      this.totalTiempo = this.sumarTiempos(this.totalTiempo, recorrido.tiempo);

      // Sumar costos
      this.totalCosto += costo;
    });
  }

  sumarTiempos(tiempo1: string, tiempo2: string): string {
    const partesTiempo1 = tiempo1.split(':').map(Number);
    const partesTiempo2 = tiempo2.split(':').map(Number);

    let segundos = partesTiempo1[2] + partesTiempo2[2];
    let minutos = partesTiempo1[1] + partesTiempo2[1];
    let horas = partesTiempo1[0] + partesTiempo2[0];

    if (segundos >= 60) {
      segundos -= 60;
      minutos++;
    }

    if (minutos >= 60) {
      minutos -= 60;
      horas++;
    }

    return `${horas.toString().padStart(2, '0')}:${minutos
      .toString()
      .padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }

  async eliminarRecorrido(recorrido: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de eliminar este recorrido?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            // No hacer nada si el usuario cancela
          },
        },
        {
          text: 'Eliminar',
          handler: () => {
            // Lógica para eliminar el recorrido si el usuario confirma
            this.eliminarRecorridoLocalStorage(recorrido);
            const index = this.recorridosFiltrados.indexOf(recorrido);
            if (index !== -1) {
              this.recorridosFiltrados.splice(index, 1);
              this.calcularSumas();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  eliminarRecorridoLocalStorage(recorrido: any) {
    const storedData = localStorage.getItem('recorridos');
    const recorridos = storedData ? JSON.parse(storedData) : [];

    // Encontrar el índice del recorrido en localStorage
    const localStorageIndex = recorridos.findIndex(
      (r: { fecha: any; hora: any; tiempo: any; cost: any; type: any }) =>
        r.fecha === recorrido.fecha &&
        r.hora === recorrido.hora &&
        r.tiempo === recorrido.tiempo &&
        r.cost === recorrido.cost &&
        r.type === recorrido.type
    );

    // Eliminar el recorrido del arreglo localStorage
    if (localStorageIndex !== -1) {
      recorridos.splice(localStorageIndex, 1);
      localStorage.setItem('recorridos', JSON.stringify(recorridos));
    }
  }
}
