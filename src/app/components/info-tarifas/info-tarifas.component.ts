import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-info-tarifas',
  templateUrl: './info-tarifas.component.html',
  styleUrls: ['./info-tarifas.component.scss'],
})
export class InfoTarifasComponent implements OnInit {
  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  onRegresarHomePage() {
    this.modalController.dismiss();
  }
}
