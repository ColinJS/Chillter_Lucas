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

  placeholderLogo: string = "assets/images/default-profil-picture.svg";
  fakeArray4: any = new Array(6); // Used for content placeholder
  fakeArray5: any = new Array(8); // Used for content placeholder
  isLoadingCustoms: boolean = true;
  isLoadingList: boolean = true;

  chillListDisplay: string = "chills";
  private transaltions: any;
  private homeChills: any = [];
  private chills: any = [{"name":"culture","color":"fd7479","chills":[{"info":{"id":"1","name":"cinema","logo":"cinema","color":"fd7479"},"link":{"chill":"1"}},{"info":{"id":"6","name":"concert","logo":"concert","color":"fd7479"},"link":{"chill":"6"}},{"info":{"id":"7","name":"exposition","logo":"exposition","color":"fd7479"},"link":{"chill":"7"}},{"info":{"id":"8","name":"festival","logo":"festival","color":"fd7479"},"link":{"chill":"8"}},{"info":{"id":"9","name":"musee","logo":"musee","color":"fd7479"},"link":{"chill":"9"}},{"info":{"id":"10","name":"theatre","logo":"theatre","color":"fd7479"},"link":{"chill":"10"}}]},{"name":"gathering","color":"ffb206","chills":[{"info":{"id":"2","name":"verre","logo":"verre","color":"ffb206"},"link":{"chill":"2"}},{"info":{"id":"11","name":"anniversaire","logo":"anniversaire","color":"ffb206"},"link":{"chill":"11"}},{"info":{"id":"12","name":"boite","logo":"boite","color":"ffb206"},"link":{"chill":"12"}},{"info":{"id":"13","name":"cafe","logo":"cafe","color":"ffb206"},"link":{"chill":"13"}},{"info":{"id":"14","name":"cremaillere","logo":"cremaillere","color":"ffb206"},"link":{"chill":"14"}},{"info":{"id":"15","name":"mariage","logo":"mariage","color":"ffb206"},"link":{"chill":"15"}},{"info":{"id":"16","name":"quai","logo":"quai","color":"ffb206"},"link":{"chill":"16"}},{"info":{"id":"17","name":"soiree","logo":"soiree","color":"ffb206"},"link":{"chill":"17"}}]},{"name":"restauration","color":"c661b5","chills":[{"info":{"id":"3","name":"restaurant","logo":"restaurant","color":"c661b5"},"link":{"chill":"3"}},{"info":{"id":"18","name":"burger","logo":"burger","color":"c661b5"},"link":{"chill":"18"}},{"info":{"id":"19","name":"glace","logo":"glace","color":"c661b5"},"link":{"chill":"19"}},{"info":{"id":"20","name":"kebab","logo":"kebab","color":"c661b5"},"link":{"chill":"20"}},{"info":{"id":"21","name":"petitdejeuner","logo":"petitdejeuner","color":"c661b5"},"link":{"chill":"21"}},{"info":{"id":"22","name":"pique-nique","logo":"piquenique","color":"c661b5"},"link":{"chill":"22"}},{"info":{"id":"23","name":"pizza","logo":"pizza","color":"c661b5"},"link":{"chill":"23"}},{"info":{"id":"24","name":"sandwich","logo":"sandwich","color":"c661b5"},"link":{"chill":"24"}},{"info":{"id":"25","name":"sushi","logo":"sushi","color":"c661b5"},"link":{"chill":"25"}}]},{"name":"sport","color":"66b613","chills":[{"info":{"id":"4","name":"course","logo":"course","color":"66b613"},"link":{"chill":"4"}},{"info":{"id":"26","name":"basket","logo":"basket","color":"66b613"},"link":{"chill":"26"}},{"info":{"id":"27","name":"danse","logo":"danse","color":"66b613"},"link":{"chill":"27"}},{"info":{"id":"28","name":"equitation","logo":"equitation","color":"66b613"},"link":{"chill":"28"}},{"info":{"id":"29","name":"escalade","logo":"escalade","color":"66b613"},"link":{"chill":"29"}},{"info":{"id":"30","name":"fitness","logo":"fitness","color":"66b613"},"link":{"chill":"30"}},{"info":{"id":"31","name":"foot","logo":"foot","color":"66b613"},"link":{"chill":"31"}},{"info":{"id":"32","name":"golf","logo":"golf","color":"66b613"},"link":{"chill":"32"}},{"info":{"id":"33","name":"gym","logo":"gym","color":"66b613"},"link":{"chill":"33"}},{"info":{"id":"34","name":"handball","logo":"handball","color":"66b613"},"link":{"chill":"34"}},{"info":{"id":"37","name":"piscine","logo":"piscine","color":"66b613"},"link":{"chill":"37"}},{"info":{"id":"40","name":"rugby","logo":"rugby","color":"66b613"},"link":{"chill":"40"}},{"info":{"id":"41","name":"sportdecombat","logo":"sportcombat","color":"66b613"},"link":{"chill":"41"}},{"info":{"id":"42","name":"sportdeglisse","logo":"sportglisse","color":"66b613"},"link":{"chill":"42"}},{"info":{"id":"43","name":"sportdeneige","logo":"sportneige","color":"66b613"},"link":{"chill":"43"}},{"info":{"id":"44","name":"sportdetire","logo":"sporttire","color":"66b613"},"link":{"chill":"44"}},{"info":{"id":"45","name":"sportdevague","logo":"sportvague","color":"66b613"},"link":{"chill":"45"}},{"info":{"id":"46","name":"tennis","logo":"tennis","color":"66b613"},"link":{"chill":"46"}},{"info":{"id":"47","name":"velo","logo":"velo","color":"66b613"},"link":{"chill":"47"}},{"info":{"id":"48","name":"volley","logo":"volley","color":"66b613"},"link":{"chill":"48"}}]},{"name":"recreation","color":"2991b3","chills":[{"info":{"id":"5","name":"vacances","logo":"vacances","color":"2991b3"},"link":{"chill":"5"}},{"info":{"id":"35","name":"peche","logo":"peche","color":"2991b3"},"link":{"chill":"35"}},{"info":{"id":"36","name":"petanque","logo":"petanque","color":"2991b3"},"link":{"chill":"36"}},{"info":{"id":"38","name":"randonnee","logo":"randonnee","color":"2991b3"},"link":{"chill":"38"}},{"info":{"id":"49","name":"bateau","logo":"bateau","color":"2991b3"},"link":{"chill":"49"}},{"info":{"id":"50","name":"bowling","logo":"bowling","color":"2991b3"},"link":{"chill":"50"}},{"info":{"id":"51","name":"camping","logo":"camping","color":"2991b3"},"link":{"chill":"51"}},{"info":{"id":"52","name":"jeuxdesociete","logo":"jeuxsociete","color":"2991b3"},"link":{"chill":"52"}},{"info":{"id":"53","name":"lasergame","logo":"lasergame","color":"2991b3"},"link":{"chill":"53"}},{"info":{"id":"54","name":"parcattraction","logo":"parcattraction","color":"2991b3"},"link":{"chill":"54"}},{"info":{"id":"55","name":"plage","logo":"plage","color":"2991b3"},"link":{"chill":"55"}},{"info":{"id":"56","name":"promenade","logo":"promenade","color":"2991b3"},"link":{"chill":"56"}},{"info":{"id":"57","name":"shopping","logo":"shopping","color":"2991b3"},"link":{"chill":"57"}},{"info":{"id":"58","name":"weekend","logo":"weekend","color":"2991b3"},"link":{"chill":"58"}}]}];
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
      'global.back',
      ]).subscribe(value => this.transaltions = value);

    this.api.getMyProfile().subscribe(
      (data) => {
        this.myProfile = data
      });

      for(let i = 0; i < this.chills.length; i++){
        for(let j = 0; j < this.chills[i].chills.length; j++){
          this.chills[i].chills[j].homeState = false;
        }
      }
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

    let allChills: boolean = true;
    let customChillsBool: boolean = false;
    let homeChills: boolean = false;

    /*let callChills = this.api.getAllChills().subscribe(
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
          
        }
        allChills = true;
          if(allChills && customChillsBool && homeChills){
            this.changeHomeState();
          }
    });*/

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
        }
        customChillsBool = true;
          if(allChills && customChillsBool && homeChills){
            this.changeHomeState();
          }
    });

    let callHome = this.api.getHome(true).subscribe(
    data => {
      if(data.length != 0){
        callHome.unsubscribe();
        this.homeChills = data;
        
        
      }
      homeChills = true;
        if(allChills && customChillsBool && homeChills){
          this.changeHomeState();
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
