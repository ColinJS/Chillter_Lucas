import { Component, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { ActionSheetController, ModalController } from 'ionic-angular';
import { Camera, CameraOptions } from 'ionic-native';
import { TranslateService } from 'ng2-translate';
import { ImgPickerService } from '../../providers/img-picker'
import { CroppiePage } from '../../pages/croppie/croppie';

@Component({
  selector: 'img-picker-logo',
  templateUrl: 'img-picker-logo.html'
})
export class ImgPickerLogo {
  private transaltions: any;
  picture: string;
  firstSrc: string;

  @Input("src") definedSrc: string;
  @ViewChild('imgSrc') imgSrc: ElementRef;
  @Output("change") imgChange: any = new EventEmitter();

  imageOptions: CameraOptions = {
    quality: 100,
    destinationType: Camera.DestinationType.DATA_URL,
    mediaType: Camera.MediaType.PICTURE,
    allowEdit: false,
    encodingType: Camera.EncodingType.JPEG,
    targetWidth: 2200,
    targetHeight: 2200,
    saveToPhotoAlbum: false,
    correctOrientation: true
  };

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private translate: TranslateService,
    private imgPickerService: ImgPickerService,
    private modalCtrl: ModalController
  ) {
    translate.get(['img-loader.get-picture',
      'img-loader.take-picture',
      'img-loader.picture',
      'global.cancel']).subscribe(value => this.transaltions = value);
  }

  ngAfterViewInit() {
    this.firstSrc = this.imgSrc.nativeElement.currentSrc;
    !this.firstSrc ? this.picture = "assets/images/default-profil-picture.svg" : null;
    this.imgPickerService.setImgResultLogo(undefined);
  }

  ngOnChanges(evt) {
    let stringDefault = "default-profil-picture.svg";

    if (evt.definedSrc.currentValue) {
      evt.definedSrc.currentValue.includes(stringDefault) ?
        this.imgPickerService.setFirstImgSrcLogo("default-profil-picture.svg")
        : this.imgPickerService.setFirstImgSrcLogo(evt.definedSrc.currentValue);
      if (evt.definedSrc.currentValue.includes(stringDefault)) {
        this.imgPickerService.setFirstImgSrcLogo("default-profil-picture.svg");
      } else {
        this.imgPickerService.setImgResultLogo(evt.definedSrc.currentValue);
        this.imgPickerService.setFirstImgSrcLogo(evt.definedSrc.currentValue);
      }
    }
    evt.definedSrc.currentValue ? this.picture = evt.definedSrc.currentValue : this.picture = "assets/images/default-profil-picture.svg";
  }

  chooseActions() {
    let actionSheet = this.actionSheetCtrl.create({
      title: this.transaltions['img-loader.picture'],
      buttons: [
        {
          text: this.transaltions['img-loader.take-picture'],
          handler: () => {
            this.takePicture();
          }
        }, {
          text: this.transaltions['img-loader.get-picture'],
          handler: () => {
            this.getPicture();
          }
        }, {
          text: this.transaltions['global.cancel'],
          role: 'cancel'
        }
      ]
    });

    actionSheet.present();
  }

  /**
   * Take picture from camera
   */
  takePicture() {
    this.imageOptions.sourceType = Camera.PictureSourceType.CAMERA;

    Camera.getPicture(this.imageOptions).then(
      (imageData) => {
        this.goCroppie('data:image/jpeg;base64,' + imageData.replace(/(\r\n|\n|\r)/gm, ""));
        /*this.picture = 'data:image/jpeg;base64,' + imageData.replace(/(\r\n|\n|\r)/gm, "");
        this.imgChange.emit();
        this.imgPickerService.setFirstImgSrcLogo(this.firstSrc);
        this.imgPickerService.setImgResultLogo(this.picture);*/
      },
      (err) => { console.error(err) });
  }

  /**
   * Get picture from photo library
   */
  getPicture() {
    this.imageOptions.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;

    Camera.getPicture(this.imageOptions).then(
      (imageData) => {
        this.goCroppie('data:image/jpeg;base64,' + imageData.replace(/(\r\n|\n|\r)/gm, ""));
        /*this.picture = 'data:image/jpeg;base64,' + imageData.replace(/(\r\n|\n|\r)/gm, "");
        this.imgChange.emit();
        this.imgPickerService.setFirstImgSrcLogo(this.firstSrc);
        this.imgPickerService.setImgResultLogo(this.picture);*/
      },
      (err) => { console.error(err) });
  }

  goCroppie(picture) {
    let modal = this.modalCtrl.create(CroppiePage, { "picture": picture, "width": 256, "height": 256, "type": "circle" })

    modal.onDidDismiss((data) => {
      if (data) {
        this.picture = data;
        this.imgChange.emit();
        this.imgPickerService.setFirstImgSrcLogo(this.firstSrc);
        this.imgPickerService.setImgResultLogo(this.picture);
      }
    });

    modal.present();
  }

}

