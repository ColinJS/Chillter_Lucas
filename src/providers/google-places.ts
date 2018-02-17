import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { Platform } from 'ionic-angular';

declare var google;

@Injectable()
export class GooglePlacesService {
  status: boolean = false;
  onDevice: boolean;
  googlePlacesAdded: boolean = false;
  callNetwork: any;
  autocompleteService: any;

  constructor(public platform: Platform, public network: Network) {
    
    this.onDevice = this.platform.is('cordova');

    this.callNetwork = this.onDevice ? this.network.onConnect().subscribe(() => {this.loadGooglePlaces();}) : document.addEventListener('online',()=>{this.loadGooglePlaces()});

    this.loadGooglePlaces();
  }

  isOnline(): boolean{
    if(this.onDevice && this.network.type){
      return this.network.type !== 'none';
    } else {
      return navigator.onLine;
    }
  }

    isOffline(): boolean {
    if(this.onDevice && this.network.type){
      return this.network.type === 'none';
    } else {
      return !navigator.onLine;  
    }
  }

  loadGooglePlaces(){
    if(typeof(google) === "undefined" || typeof(google.maps) === "undefined"){
        if(this.isOnline()){
            let script = document.createElement("script");
            script.id = "googlePlaces";

            script.src = "https://maps.googleapis.com/maps/api/js?v=3&key=AIzaSyCblAei95OMaFkE_aGlf9I51KJCO6sEfos&libraries=places";

            document.body.appendChild(script);

            this.googlePlacesAdded = true;
            this.onDevice ? this.callNetwork.unsubscribe() : document.removeEventListener('online',this.callNetwork);
        }
    }
  }

  getPrediction(input: string): Promise<any>{
      if(this.googlePlacesAdded && typeof(google) !== "undefined"){
          this.autocompleteService = new google.maps.places.AutocompleteService();
      }else{
          this.loadGooglePlaces();
      }
      return new Promise((resolve)=>{
          if(this.isOnline && this.autocompleteService != undefined && input && input != ''){
            //console.log('get Predictions')
            let options={
                types: ['geocode'],
                input: input
            }
                this.autocompleteService.getPlacePredictions(options,(predictions, status)=>{
                if (predictions != null) {
                    resolve(predictions);
                }
            });
        }else{
            resolve([]);
        }
      });
  }

}
