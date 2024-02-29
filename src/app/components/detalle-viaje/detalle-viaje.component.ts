import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-detalle-viaje',
  templateUrl: './detalle-viaje.component.html',
  styleUrls: ['./detalle-viaje.component.scss'],
})
export class DetalleViajeComponent {
  @Input() tarifa: string = '';
  @Input() acumuladoTiempo: string = '';
  @Input() acumuladoDistancia: string = '';
  @Input() distanceTraveled: string = '';
  @Input() tiempoViajeFormatted: string = '';
  @Input() total: string = '';
  // @Output() regresarHomePageEvent = new EventEmitter<void>(); // Evento para regresar a HomePage

  constructor(private modalController: ModalController) {}

  onRegresarHomePage() {
    this.modalController.dismiss();
  }
}
