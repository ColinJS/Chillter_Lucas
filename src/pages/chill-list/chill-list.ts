import { ApiService } from '../../providers/api';
import { ConfigService } from '../../providers/config';
import { Component, ViewChild } from '@angular/core';
import {
  Content,
  NavController,
  ViewController,
  ToastController,
  NavParams,
  Events,
  ModalController,
  ItemSliding
} from 'ionic-angular';
import { Keyboard } from 'ionic-native';
import { SyncService } from '../../providers/sync';
import { EditChills } from '../edit-chills/edit-chills';
import { Home } from '../home/home';
import { TranslateService } from 'ng2-translate';

@Component({
  selector: 'chill-list',
  templateUrl: 'chill-list.html',
})
export class ChillList {
  @ViewChild(Content) content: Content;

  placeholderLogo: string = "assets/images/default-profil.svg";
  fakeArray4: any = new Array(6); // Used for content placeholder
  fakeArray5: any = new Array(8); // Used for content placeholder
  isLoadingCustoms: boolean = true;
  isLoadingList: boolean = true;

  chillListDisplay: string = "chills";
  private transaltions: any;
  private homeChills: any = [];
  private chills: any = [];
  private customChills: any[] = [];
  private baseUrl: string;
  private myProfile: Object = {};
  private fromPage: string;

  constructor(
    private navCtrl: NavController,
    private notif: Events,
    private viewCtrl: ViewController,
    private navParams: NavParams,
    private api: ApiService,
    private sync: SyncService,
    private toastCtrl: ToastController,
    private translate: TranslateService,
    private configService: ConfigService,
    private modalCtrl: ModalController
  ) {
    this.baseUrl = configService.getBaseUrl();
    translate.get(['offline.blocked',
      'offline.save-add-chill',
      'global.back']).subscribe(value => this.transaltions = value);

    this.api.getMyProfile().subscribe(
      (data) => {
        this.myProfile = data
      });
  }

  ionViewDidEnter(){
    this.getAllChills();
    let from = this.navParams.get('from');
    if(from && from == 'home'){
      this.fromPage = 'Home';
    }else if(this.navCtrl.getPrevious() == undefined){
      this.fromPage = 'Chiller';
    }else{
      this.fromPage = 'Chillbox';
    }
  }

  getAllChills() {

    let allChills: boolean = false;
    let customChillsBool: boolean = false;
    let homeChills: boolean = false;

    let callChills = this.api.getAllChills().subscribe(
      (data) => {
        if(data.length != 0){
          //callChills.unsubscribe()
          let chills = data;
          for(let i = 0; i < chills.length; i++){
            for(let j = 0; j < chills[i].chills.length; j++){
              chills[i].chills[j].homeState = false;
            }
          }
          console.log("allChills");
          console.log(chills);
          let willChange = this.chills.length == chills.length ? false : true;

          if(!willChange){
            checkLoop:{
              for(let i = 0; i < chills.length; i++){
                if(chills[i].chills.length != this.chills[i].chills.length){
                  willChange = true;
                  break checkLoop;
                }
                for(let j = 0; j < chills[i].chills.length; j++){
                  if(JSON.stringify(chills[i].chills[j]) != JSON.stringify(this.chills[i].chills[j])){
                    willChange = true;
                    break checkLoop;
                  }
                }
              }
            }
          }

          if(willChange){
            this.chills = chills;
          }
          allChills = true;
          if(allChills && customChillsBool && homeChills){
            this.changeHomeState();
          }
        }
    });

    let callCustoms = this.api.getCustomChills().subscribe(
      (data) => {

        if(data.length != 0){
          //callCustoms.unsubscribe()

          let customChills = [].concat(data);

          for(let i = 0; i < customChills.length; i++){
            customChills[i].homeState = false;
          }

          let willChange = this.customChills.length == customChills.length ? false : true;

          if(!willChange){
            checkLoop:{
              for(let i = 0; i < customChills.length; i++){
                if(JSON.stringify(customChills[i]) != JSON.stringify(this.customChills[i])){
                  willChange = true;
                  break checkLoop;
                }
              }
            }
          }

          if(willChange){
            this.customChills = customChills;
          }
          customChillsBool = true;
          if(allChills && customChillsBool && homeChills){
            this.changeHomeState();
          }
        }
    });

    let callHome = this.api.getHome(true).subscribe(
    data => {
      if(data.length != 0){
        callHome.unsubscribe();
        this.homeChills = data;
        
        homeChills = true;
        if(allChills && customChillsBool && homeChills){
          this.changeHomeState();
        }
      }
    });

  }

  getHomeRequest(){
    let callHome = this.api.getHome(true).subscribe(
    data => {
      if(data.length != 0){
        console.log("refresh");
        callHome.unsubscribe();
        this.homeChills = data;
      }
    });
  }

  changeHomeState(){

    console.log("Manage home state");
    console.log(this.homeChills);

    for(let i = 0; i < this.homeChills.length; i++){

      homeLoop:{
        for(let j = 0; j < this.chills.length; j++){
          for(let k = 0; k < this.chills[j].chills.length; k++){
            if(this.chills[j].chills[k].info.id == this.homeChills[i].chill_id){
              this.chills[j].chills[k].homeState = true;
              break homeLoop;
            }
          }
        }
        for(let j = 0; j < this.customChills.length; j++){
          if(this.customChills[j].id == this.homeChills[i].chill_id){
            console.log("I'm in");
            this.customChills[j].homeState = true;
            break homeLoop;
          }
        }
      }
    }
  }

  homeSwitcher(slidingItem: ItemSliding,chill: any){
    if(chill.homeState){
      this.deleteChill(slidingItem,chill);
    }else{
      this.addChill(slidingItem,chill);
    }
  }

  deleteCustomChill(chill: any){
    this.api.deleteCustomChill(chill.id).subscribe(
      data=>{
        this.getAllChills();
      }
    )
  }

  editCustomChill(chill){

    chill.chill_id = chill.id;
    chill.type = "custom";

    let modal = this.modalCtrl.create(EditChills, { chill: chill, edit:true });

    modal.onDidDismiss(() => {
      this.getAllChills();
    });
    modal.present()

  }

  showEditChills(chill: any) {

    let chillObj = { "type": chill.info ? "chill" : "custom" , "chill_id": chill.info ? chill.info.id : chill.id , "link": { "chills": chill.info ? chill.info.id : chill.id } };

    let modal = this.modalCtrl.create(EditChills, { chill: chillObj });

    modal.present()
  }

  addChill(slidingItem: ItemSliding, chill: any) {

    let custom = !!chill.id;
    let currentId = custom ? chill.id : chill.info.id;

    this.api.addChill(currentId, custom ? 'custom' : 'chill').subscribe(
      data => {
        chill.homeState = !chill.homeState;
        slidingItem.close();
        this.getHomeRequest();
      },
      err => { console.log(err) }
    )
  }

  deleteChill(slidingItem: ItemSliding, chill: any) {

    let custom = !!chill.id;
    let tmpId = custom ? chill.id : chill.info.id;
    let currentId = 0;

    for(let i = 0; i < this.homeChills.length; i++){
      if(tmpId == this.homeChills[i].chill_id){
        currentId = this.homeChills[i].id;
      }
    }

    this.sync.status ? null : this.showToast(1);
    this.api.deleteChill(currentId).subscribe(
      data=>{
        console.log("alors !");
        chill.homeState = !chill.homeState;
        slidingItem.close();
      },
      res => {
        console.log(res.status)
        if (res.status == 0 || res.status == 204) {
          
        }
      }
    );

  }

  trackByChills(index,item){
    return item.info.id;
  }

  trackByCustomChills(index,item){
    return item.id;
  }

  close(chill: any = undefined) {
    /*
    * If current view is ChillList add the Chill to Homepage (from Chillbox)
    * else (from Chiller-details -> Send a Chill), dismiss ChilllList and open chill-edit with choosen friends
    */
    if (this.fromPage == 'Chiller') {
      this.viewCtrl.dismiss(chill);
    }else{
      this.showEditChills(chill);
      this.viewCtrl.dismiss(chill);
    }
  }

  addPersonalized() {
    if (!this.sync.status) {
      this.showToast(1);
      return;
    }
    let modal = this.modalCtrl.create(EditChills, { chill: null });

    modal.onDidDismiss(() => {
      this.getAllChills();
    });
    modal.present()

    //this.navCtrl.push(EditChills, { chill: null }, { animate: true, direction: 'back' });
  }

  // Set text for back button (navbar)
  ionViewWillEnter() {
    this.viewCtrl.setBackButtonText(this.transaltions['global.back']);
  }

  slideChanged() {
    this.content.scrollToTop();
  }

  showToast(type) {
    if (type == 1) {
      const toast = this.toastCtrl.create({
        message: this.transaltions['offline.blocked'],
        duration: 3000
      });
      toast.present();
    }
    if (type == 2) {
      const toast = this.toastCtrl.create({
        message: this.transaltions['offline.save-add-chill'],
        duration: 3000
      });
      toast.present();
    }
  }
}
