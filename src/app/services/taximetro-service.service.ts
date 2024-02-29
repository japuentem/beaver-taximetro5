import { Injectable } from '@angular/core';
import { GPSLocationService } from './gps-location-serv.service';
import { TarifaService } from './tarifa-service.service';

@Injectable({
  providedIn: 'root',
})
export class TaximetroService {
  private lastLatitude: number = 0;
  private lastLongitude: number = 0;
  private currentLatitude: number = 0;
  private currentLongitude: number = 0;

  private tarifa: number = 0;
  private acumuladoPorTiempo: number = 0;
  private acumuladoPorDistancia: number = 0;

  constructor(
    private gpsLocationService: GPSLocationService,
    private tarifaService: TarifaService
  ) {}

  iniciarViaje(): void {
    this.lastLatitude = 0;
    this.lastLongitude = 0;
    this.currentLatitude = 0;
    this.currentLongitude = 0;

    this.gpsLocationService.obtenerCurrentPosition().then(
      (positionData: {
        lastLatitude: number;
        lastLongitude: number;
        currentLatitude: number;
        currentLongitude: number;
      }) => {
        this.lastLatitude = positionData.lastLatitude;
        this.lastLongitude = positionData.lastLongitude;
        this.currentLatitude = positionData.currentLatitude;
        this.currentLongitude = positionData.currentLongitude;

        if (this.lastLatitude === 0 && this.lastLongitude === 0) {
          this.lastLatitude = this.currentLatitude;
          this.lastLongitude = this.currentLongitude;
        }
      },
      (error: any) => {
        console.error('Error getting location', error);
      }
    );
  }

  terminarViaje(): void {
    this.lastLatitude = 0;
    this.lastLongitude = 0;
    this.currentLatitude = 0;
    this.currentLongitude = 0;
  }

  calcularTotalAcumuladoTiempo() {
    this.tarifa = this.tarifaService.tarifa;
    this.acumuladoPorTiempo = this.tarifaService.aumento;
  }

  calcularTotalAcumuladoDistancia() {
    console.log('Total acumulado por distancia:', this.acumuladoPorDistancia);
  }

  calcularTotal() {
    const total =
      this.tarifa + this.acumuladoPorTiempo + this.acumuladoPorDistancia;
  }
}
