import { Injectable } from '@angular/core';
import {
  Geolocation,
  Position,
  PositionOptions,
  WatchPositionCallback,
} from '@capacitor/geolocation';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GPSLocationService {
  currentLatitude: number = 0;
  currentLongitude: number = 0;
  lastLatitude: number = 0;
  lastLongitude: number = 0;

  constructor() {}

  checkUbicacionActivada(): Promise<boolean> {
    return Geolocation.getCurrentPosition().then(
      (position: Position): boolean => {
        return true;
      },
      (error) => {
        return false;
      }
    );
  }

  obtenerCurrentPosition(): Promise<{
    lastLatitude: number;
    lastLongitude: number;
    currentLatitude: number;
    currentLongitude: number;
  }> {
    return new Promise((resolve, reject) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 5000,
      };
      const watchCallback: WatchPositionCallback = (
        position: Position | null,
        error?: any
      ) => {
        if (position && position.coords) {
          const newLatitude = position.coords.latitude;
          const newLongitude = position.coords.longitude;

          resolve({
            lastLatitude: this.currentLatitude,
            lastLongitude: this.currentLongitude,
            currentLatitude: newLatitude,
            currentLongitude: newLongitude,
          });
        } else {
          reject(error);
        }
      };
      Geolocation.watchPosition(options, watchCallback);
    });
  }

  startPositionUpdates(): Observable<{
    lastLatitude: number;
    lastLongitude: number;
    currentLatitude: number;
    currentLongitude: number;
    distanceTraveled: number;
  }> {
    return new Observable((observer) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      };

      const DISTANCE_THRESHOLD_IN_METERS = 10;
      const DEGREES_PER_METER = 1 / (111 * 1000);
      const DISTANCE_THRESHOLD_IN_DEGREES =
        DISTANCE_THRESHOLD_IN_METERS * DEGREES_PER_METER;

      let distanceTraveled = 0;
      let lastLatitude: number;
      let lastLongitude: number;

      const watchCallback: WatchPositionCallback = (
        position: Position | null,
        err?: any
      ) => {
        if (position && position.coords) {
          const currentLatitude = position.coords.latitude;
          const currentLongitude = position.coords.longitude;

          if (
            lastLatitude !== undefined &&
            lastLongitude !== undefined &&
            (Math.abs(currentLatitude - lastLatitude) >
              DISTANCE_THRESHOLD_IN_DEGREES ||
              Math.abs(currentLongitude - lastLongitude) >
                DISTANCE_THRESHOLD_IN_DEGREES)
          ) {
            const distanceLat =
              (currentLatitude - lastLatitude) / DEGREES_PER_METER;
            const distanceLng =
              (currentLongitude - lastLongitude) / DEGREES_PER_METER;
            const distanceChange = Math.sqrt(
              distanceLat ** 2 + distanceLng ** 2
            );

            distanceTraveled += distanceChange;
          }

          observer.next({
            lastLatitude: lastLatitude || currentLatitude,
            lastLongitude: lastLongitude || currentLongitude,
            currentLatitude,
            currentLongitude,
            distanceTraveled,
          });

          lastLatitude = currentLatitude;
          lastLongitude = currentLongitude;
        }
      };

      const watchId = Geolocation.watchPosition(options, watchCallback) as any;

      return () => {
        Geolocation.clearWatch({ id: watchId.toString() });
      };
    });
  }

  calcularVelocidad(distancia: number, tiempo: number): number {
    // tiempo en horas
    const velocidad = distancia / tiempo; // Velocidad en kilómetros por hora
    return velocidad;
  }
}
