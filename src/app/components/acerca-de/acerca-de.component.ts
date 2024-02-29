import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-acerca-de',
  templateUrl: './acerca-de.component.html',
  styleUrls: ['./acerca-de.component.scss'],
})
export class AcercaDeComponent implements OnInit {
  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  onRegresarHomePage() {
    this.modalController.dismiss();
  }
}
