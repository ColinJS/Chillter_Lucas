import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import * as croppie from "croppie";

@Component({
  selector: 'page-croppie-test',
  templateUrl: 'croppie.html'
})
export class CroppiePage {
  private myCroppie: any;
  pictureToCrop: string;
  cropWidth: number;
  cropHeight: number;
  cropType: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController) {

    this.pictureToCrop = this.navParams.get("picture");
    this.cropWidth = this.navParams.get("width");
    this.cropHeight = this.navParams.get("height");
    this.cropType = this.navParams.get("type");
  }

  ionViewDidLoad() {
    let opts = {
      url: this.pictureToCrop,
      viewport: { width: this.cropWidth, height: this.cropHeight, type: this.cropType },
      showZoomer: false,
      enforceBoundary: true
    };

    this.myCroppie = new croppie(document.getElementById("croppingImg"), opts);
  }

  getResult() {
    this.myCroppie.result({ type: 'base64', format: 'jpeg', circle: false }).then(data => {
      this.viewCtrl.dismiss(data);
    })
  }

  cancelCrop() {
    this.viewCtrl.dismiss();
  }

}
