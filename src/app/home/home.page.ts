import { Component, OnInit } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { ModalController } from '@ionic/angular';

import { DateTimeService } from '../services/date-time-service.service';
import { GPSLocationService } from '../services/gps-location-serv.service';
import { TarifaService } from '../services/tarifa-service.service';
import { TaximetroService } from '../services/taximetro-service.service';

import { DetalleViajeComponent } from '../components/detalle-viaje/detalle-viaje.component'; // Asegúrate de colocar la ruta correcta
import { InfoTarifasComponent } from '../components/info-tarifas/info-tarifas.component';
import { ReporteViajesComponent } from '../components/reporte-viajes/reporte-viajes.component';
import { AcercaDeComponent } from '../components/acerca-de/acerca-de.component'; // Asegúrate de colocar la ruta correcta

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  currentTime: Date;
  currentDate: string = ''; // Fecha del encabezado

  isLocationOn: boolean = false;
  isDay: boolean = false;

  startedTrip: boolean = false;
  finishedTrip: boolean = false;
  travelCost: number = 0;
  taxiSelected: string | null = null;

  isTracking = false;
  distance: number = 0;
  accumulatedDistance: number = 0;
  speedometer = 0;
  speedWatchId: string = '';
  previousPosition: Position | undefined;
  previousTimestamp: number = 0;
  timeElapsed: any;

  chargeByTime: boolean = false;
  chargeByDistance: boolean = false;

  totalDistanceTraveled: number = 0;
  timesDistance: number = 0;

  timeTraveled: number = 1;
  timeTraveledFormatted: string = '00:00:00';
  timeInterval: any;
  accumulatedTime: number = 0;

  fare: number = 0;
  increaseFare: number = 0;
  intervalCostTime: any;
  intervalCostDistance: any;
  timeTimes: number = 0;

  watchIdLocation: any = null;
  ticket: boolean = false;
  total: number = 0;

  timeTraveledDebug: number = 1;
  timeTraveledFormattedDebug: string = ':00';

  constructor(
    private dateTimeService: DateTimeService,
    private gpsLocationService: GPSLocationService,
    private tarifaService: TarifaService,
    private taximetroService: TaximetroService,
    private modalController: ModalController
  ) {
    this.currentTime = new Date();
    this.currentDate = this.dateTimeService.convertirFecha(this.currentTime);

    this.checkUbicacionActivada();
  }

  ngOnInit() {
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  checkUbicacionActivada() {
    this.gpsLocationService.checkUbicacionActivada().then(
      (ubicacionActivada: boolean) => {
        this.isLocationOn = ubicacionActivada;
      },
      (error) => {
        console.log('No se pudo obtener la ubicación');
      }
    );
  }

  tipoTarifa(): boolean {
    const currentHour = this.currentTime.getHours();
    return currentHour >= 5 && currentHour < 22 ? (this.isDay = true) : false;
  }

  obtenerNumeroTarifa(): number {
    return this.tarifaService.obtenerNumeroTarifa(this.taxiSelected);
  }

  async startSpeedMeasurement() {
    const watchOptions = { enableHighAccuracy: true };
    const watchId = await Geolocation.watchPosition(
      watchOptions,
      (position, err) => {
        if (position && position.coords) {
          if (this.previousPosition && this.previousTimestamp) {
            const distance = this.calculateHaversineDistance(
              this.previousPosition.coords.latitude,
              this.previousPosition.coords.longitude,
              position.coords.latitude,
              position.coords.longitude
            );
            this.distance += distance;
            this.accumulatedDistance += distance;

            const timeElapsed =
              (position.timestamp - this.previousTimestamp) / 1000; // en segundos

            this.timeElapsed = timeElapsed;

            if (timeElapsed > 0) {
              this.speedometer = (distance / timeElapsed) * 3.6; // km/hr
            }

            if (this.distance * 1000 >= 250) {
              this.validateFare(1);
              this.travelCost += this.increaseFare;
              this.timesDistance++;

              this.chargeByTime = false;
              this.chargeByDistance = true;
              this.distance = 0;
              this.restartTimers();
            }
          }

          this.previousPosition = position;
          this.previousTimestamp = position.timestamp;
        }
      }
    );

    this.speedWatchId = watchId;
  }

  stopSpeedMeasurement() {
    if (this.speedWatchId) {
      Geolocation.clearWatch({ id: this.speedWatchId });
      this.speedWatchId = '';
    }
  }

  calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const earthRadius = 6371; // Radio de la Tierra en kilómetros
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;
    return distance;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  startTravel() {
    this.startedTrip = true;
    this.finishedTrip = false;
    this.totalDistanceTraveled = 0;
    this.initialFare();
    this.startTimerCostTime();
    this.timeTraveled = 1;
    this.timeTraveledDebug = 1;
    this.updateTimeTraveledFormatted();
    this.taximetroService.iniciarViaje();
    this.timeInterval = setInterval(() => {
      this.timeTraveled++;
      this.timeTraveledDebug++;
      this.updateTimeTraveledFormatted();
    }, 1000);
    this.startSpeedMeasurement();

    this.ticket = false;
  }

  stopTravel() {
    this.taximetroService.terminarViaje();
    clearInterval(this.intervalCostTime);
    clearInterval(this.timeInterval);

    const storedData = localStorage.getItem('recorridos');
    const recorridos = storedData ? JSON.parse(storedData) : [];
    const fecha = new Date();
    const hh: string = fecha.getHours().toString().padStart(2, '0');
    const mm: string = fecha.getMinutes().toString().padStart(2, '0');
    const ss: string = fecha.getSeconds().toString().padStart(2, '0');
    const currentTime: string = `${hh}:${mm}:${ss}`;
    const nuevoRecorrido = {
      fecha: fecha.toLocaleDateString('es-ES'),
      hora: currentTime,
      tiempo: this.timeTraveledFormatted, // Reemplaza con el tiempo real
      cost: this.travelCost.toFixed(2),
      type: this.taxiSelected,
    };
    recorridos.push(nuevoRecorrido);
    localStorage.setItem('recorridos', JSON.stringify(recorridos));

    this.calculateTravelDetail();
    this.startedTrip = false;
    this.finishedTrip = true;
    this.timeTimes = 0;
    this.timesDistance = 0;
    this.distance = 0;
    this.timeTraveledDebug = 0;

    this.stopSpeedMeasurement();
    this.ticket = true;
  }

  restartTaximeter() {
    clearInterval(this.intervalCostTime);
    clearInterval(this.timeInterval);

    this.startedTrip = false;
    this.finishedTrip = false;
    this.taxiSelected = null;

    this.travelCost = 0;
    this.timeTraveled = 0;
    this.timeTraveledDebug = 0;
    this.chargeByTime = false;
    this.totalDistanceTraveled = 0;
    this.speedometer = 0;
    this.distance = 0;
    this.updateTimeTraveledFormatted();
    this.accumulatedTime = 0;

    this.chargeByDistance = false;
    this.accumulatedDistance = 0;
    this.ticket = false;
  }

  initialFare() {
    this.validateFare(2);
    this.travelCost = this.fare;
  }

  validateFare(opcion: number) {
    const { tarifa, aumento } = this.tarifaService.validarTarifa(
      opcion,
      this.currentTime,
      this.taxiSelected
    );
    this.fare = tarifa;
    this.increaseFare = aumento;
  }

  startTimerCostTime() {
    this.intervalCostTime = setInterval(() => {
      this.updateCostByTime();
    }, 45000);
  }

  updateCostByTime() {
    this.validateFare(1);
    this.travelCost += this.increaseFare;
    this.timeTimes++;
    this.chargeByTime = true;
    this.chargeByDistance = false;
    this.restartTimers();
  }

  restartTimers() {
    clearInterval(this.intervalCostTime);
    this.distance = 0;
    this.timeTraveledDebug = 0;
    this.timeTraveledFormattedDebug = '0';

    this.startTimerCostTime();
  }

  private updateTimeTraveledFormatted() {
    const hours = Math.floor(this.timeTraveled / 3600);
    const minutes = Math.floor((this.timeTraveled % 3600) / 60);
    const seconds = this.timeTraveled % 60;

    this.timeTraveledFormatted = `${this.padZero(hours)}:${this.padZero(
      minutes
    )}:${this.padZero(seconds)}`;

    const secondsDebug = this.timeTraveledDebug % 60;
    this.timeTraveledFormattedDebug = `${this.padZero(secondsDebug)}`;
  }

  private padZero(value: number): string {
    return value < 10 ? `0${value}` : value.toString();
  }

  async calculateTravelDetail() {
    this.accumulatedTime = this.increaseFare * this.timeTimes;
    this.accumulatedDistance = this.increaseFare * this.timesDistance;

    this.total = this.fare + this.accumulatedTime + this.accumulatedDistance;
  }

  async showTicket() {
    const modal = await this.modalController.create({
      component: DetalleViajeComponent,
      componentProps: {
        tarifa: this.fare.toFixed(2),
        acumuladoTiempo: this.accumulatedTime.toFixed(2),
        acumuladoDistancia: this.accumulatedDistance.toFixed(2),
        total: this.total.toFixed(2),
        distanceTraveled: this.distance.toFixed(2),
        tiempoViajeFormatted: this.timeTraveledFormatted,
      },
    });

    await modal.present();
  }

  async showReport() {
    const modal = await this.modalController.create({
      component: ReporteViajesComponent,
    });

    await modal.present();
  }

  async aboutApp() {
    const modal = await this.modalController.create({
      component: AcercaDeComponent,
    });

    await modal.present();
  }

  async showOptions() {
    const modal = await this.modalController.create({
      component: InfoTarifasComponent,
    });

    await modal.present();
  }
}
