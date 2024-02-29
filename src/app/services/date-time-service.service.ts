import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateTimeService {
  constructor() {}

  convertirFecha(fecha: Date): string {
    return (
      this.convertirDia(fecha.getDay().toString()) +
      ',' +
      fecha.getDate() +
      ' ' +
      this.convertirMes(fecha.getMonth().toString()) +
      ' ' +
      fecha.getFullYear()
    );
  }

  convertirDia(nombreDia: string): string {
    let nuevoDia: string = '';
    const diasSemana: string[] = [
      'Dom',
      'Lun',
      'Mar',
      'Mié',
      'Jue',
      'Vie',
      'Sáb',
    ];

    for (let i = 0; i < diasSemana.length; i++) {
      if (nombreDia === i.toString()) {
        nuevoDia = diasSemana[i];
      }
    }
    return nuevoDia;
  }

  convertirMes(nombreMes: string): string {
    let nuevoMes: string = '';
    const mesesAnio: string[] = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    for (let i = 0; i < mesesAnio.length; i++) {
      if (nombreMes === i.toString()) {
        nuevoMes = mesesAnio[i];
      }
    }

    return nuevoMes;
  }
}
