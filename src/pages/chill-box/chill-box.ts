import { Component, ViewChild } from '@angular/core';
import { NavController, List, ModalController, AlertController, Events, ToastController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { ApiService } from '../../providers/api';
import { SyncService } from '../../providers/sync';
import { ChillDetail } from '../chill-detail/chill-detail';
import { History } from '../history/history';
import { Calendar } from 'ionic-native';
import { ChillList } from '../chill-list/chill-list';

@Component({
  selector: 'chill-box',
  templateUrl: 'chill-box.html',
})
export class ChillBox {
  private transaltions: any;
  myId: string;

  idList: any[] = [];
  events: any[] = [];
  viewEvents: any[] = [];
  searchWord: string = "";
  timeNow: Date = new Date();
  timeTomorrow: Date = new Date();
  profileId: number;
  firstLoad: boolean = true;

  slides: any[] = [];
  noEvent: boolean = false;
  noEventSoon: boolean = false;

  filterSelected: any[] = [true, true, true, true];
  yesPath: string = "assets/images/status-yes-thin.svg";
  maybePath: string = "assets/images/status-maybe-thin.svg";
  noPath: string = "assets/images/status-no-thin.svg";

  offset: number = (new Date()).getTimezoneOffset() * -60000;

  @ViewChild(List) list: List;

  constructor(
    private toastCtrl: ToastController,
    private translate: TranslateService,
    private notif: Events,
    private al: AlertController,
    private mod: ModalController,
    private navCtrl: NavController,
    private api: ApiService,
    private sync: SyncService
  ) {
    translate.get(['chill-box.invited-you',
      'chill-box.event-removed',
      'chill-box.event-added',
      'chill-box.cancel-chill-message',
      'chill-box.hide-chill-message',
      'chill-box.confirm',
      'offline.save-participate',
      'offline.blocked',
      'global.yes',
      'global.cancel']).subscribe(value => this.transaltions = value);
    this.api.getProfileId().subscribe(data => {
      this.profileId = data;
    });

    this.getEvents();
    this.myId = localStorage.getItem("_id");
    this.notif.subscribe("notif:update", () => {
      this.getEvents();
    });

    this.getHome();
  }

  ionViewDidEnter() {
    this.getEvents();
  }

  inputChange(evt) {
    this.searchWord = evt.target.value;
    this.filterEvents();
  }

  filterEvents() {
    this.viewEvents = this.events;

    this.viewEvents = this.events.filter((v) => {
      if (v.info.name.toLowerCase().indexOf(this.searchWord.toLowerCase()) > -1 || this.searchWord == "") {
        return true;
      } else {
        return false;
      }
    });

    console.log(this.viewEvents);

  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  participate(ind: number, eventId: any) {
    let currentEvent;

    this.events.forEach((evt) => {
      if (evt.info.id == eventId) {
        currentEvent = evt;
      }
    });

    let startDate = new Date(currentEvent.date);
    let endDate = new Date(startDate.getTime() + 30*60000);
    let title = this.capitalizeFirstLetter(currentEvent.info.name);
    let notes = this.capitalizeFirstLetter(currentEvent.info.chiller) + this.transaltions['chill-box.invited-you'] + this.capitalizeFirstLetter(currentEvent.info.name);
    let calendarOptions = Calendar.getCalendarOptions();

    calendarOptions.firstReminderMinutes = 60;

    this.sync.status ? null : this.showOfflineToast(1);

    this.api.participateEvent(ind, eventId).subscribe(
      data => {
        this.getEvents();
        if (data) {
          for (let i = 0; i < this.events.length; i++) {
            if (this.events[i].info.id == eventId) {
              this.events[i].participation_status = ind;
            }
          }
          this.filterEvents();
        }
        this.notif.publish("notif:update");
      }
    );

    if (window.hasOwnProperty('cordova') && (ind == 0 || ind == 2)) {
      Calendar.findEvent(title, "", notes, startDate, endDate).then((data) => {
        if (data.length > 0) {
          Calendar.deleteEvent(title, "", notes, startDate, endDate).then((d) => {
            this.showToast(this.transaltions['chill-box.event-removed']);
          });
        }
      })
    } else if (window.hasOwnProperty('cordova') && ind == 1) {
      Calendar.createEventWithOptions(title, "", notes, startDate, endDate, calendarOptions).then((d) => {
        this.showToast(this.transaltions['chill-box.event-added']);
      });
    }
  }

  getEvents(ref: any = false) {
    this.timeNow = new Date();

    this.timeTomorrow = new Date();
    this.timeTomorrow.setDate(this.timeNow.getDate() + 1);

    let noEvent = false;
    let noEventSoon = false;

    let call = this.api.getEvents(this.firstLoad).subscribe(
      data => {
        if (data) {
          call.unsubscribe();
          let events = data.filter((d) => {
            let now = new Date();
            // Could be simplified later when all events will have coherent ending_date
            let tmpDate = new Date(d.ending_date) >= new Date(d.date) ? new Date(d.ending_date) : new Date(d.date);
            if (isNaN(tmpDate.getTime())) {
              return false;
            }

            let time = tmpDate.getTime() - now.getTime();
            return time > 0;
          });

          events.forEach((index) => {
            let now = new Date();
            let nowPlusOne = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 24);
            let d = new Date(index.date);

            index.info.logo ? index.type = "custom" : null;
            index.info.chill.logo ? index.type = "regular" : null;
            !index.info.chill.logo && !index.info.logo || index.info.chill.logo && index.info.logo ? index.type = "custom" : null;

            index.soon = (d < nowPlusOne ? "today" : "later");
            index.soon = (d < now ? "ongoing" : index.soon);
          })

          // If data (all events) && events (coming event) == 0, show "never had any events"
          if (data.length == 0 && events.length == 0) {
            noEvent = true;
          }
          
          // If data (all events) != 0 && events (coming event) == 0, show "no coming events"
          if (data.length != 0 && events.length == 0) {
            noEventSoon = true;
          }

          // If data (all events) != 0 && events (coming event) != 0, reset var
          if (data.length != 0 && events.length != 0) {
            noEvent = false;
            noEventSoon = false;
          }

          let willChange: boolean = events.length != this.events.length ? true : false;

          console.log(willChange)

          if(!willChange){
            compareEventLoop:{
              for(let i = 0; i < events.length; i++){
                if(JSON.stringify(events[i]) != JSON.stringify(this.events[i])){
                  willChange = true;
                  break compareEventLoop;
                }
              }
            }
          }

          console.log(willChange)
          if(willChange || this.firstLoad){
            console.log("we change it");
            this.events = events;
            this.noEvent = noEvent;
            this.noEventSoon = noEventSoon;
            this.filterEvents();
          }

          this.firstLoad = false;

        } else {
          this.noEventSoon = true;
          this.events = [];
        }
        console.log("Ref:")
        console.log(ref);
        if (ref) {
            ref.complete();
          }
      },
      res => {
        if (res.status != 200) {
          console.log("Http request error :" + res.status);
        }
        
    });
  }

  cancelEvent(eventId: string) {
    let eventDetail;
    this.api.cancelEvent(eventId).subscribe(
      data => {
      },
      res => {
        console.log(res.status)
        if (res.status != 200) {
          console.log("Http request error :" + res.status);
        }
      }
    );

    this.api.getEvent(eventId).subscribe(
      data => {
        eventDetail = data;
        if (eventDetail.chillerid == this.profileId) {
          this.hideEvent(eventId);
        }
      },
      res => {
        console.log(res.status)
        if (res.status != 200) {
          console.log("Http request error :" + res.status);
        }
      }
    );

    this.getEvents();
    this.notif.publish("notif:update");
  }

  hideEvent(eventId) {
    this.api.hideEvent(eventId).subscribe(
      data => {
        this.getEvents();
      },
      res => {
        console.log(res.status)
        if (res.status != 200) {
          console.log("Http request error :" + res.status);
        }
      }
    );
  }

  doRefresh(refresher) {
    console.log(refresher);
    this.getEvents(refresher);
  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });

    toast.present();
  }

  showCancelAlert(eventId: string) {
    if (!this.sync.status) {
      this.showOfflineToast(2);
      return;
    }
    let confirm = this.al.create({
      title: this.transaltions['chill-box.confirm'],
      message: this.transaltions['chill-box.cancel-chill-message'],
      buttons: [
        {
          text: this.transaltions['global.cancel']
        },
        {
          text: this.transaltions['global.yes'],
          handler: data => {
            this.cancelEvent(eventId);
          }
        }]
    });

    confirm.present();
  }

  showHiddingAlert(eventId: string) {
    if (!this.sync.status) {
      this.showOfflineToast(2);
      return;
    }
    let confirm = this.al.create({
      title: this.transaltions['chill-box.confirm'],
      message: this.transaltions['chill-box.hide-chill-message'],
      buttons: [
        {
          text: this.transaltions['global.cancel']
        },
        {
          text: this.transaltions['global.yes'],
          handler: data => {
            this.hideEvent(eventId);
          }
        }]
    });
    confirm.present();
  }

  showDetailEvent(eventId: string) {
    let modal = this.mod.create(ChillDetail, { "eventId": eventId });

    modal.onDidDismiss((participate, updateLogo) => {
      participate == 0 ? this.participate(0, eventId) : null;
      participate == 1 ? this.participate(1, eventId) : null;
      participate == 2 ? this.participate(2, eventId) : null;
      updateLogo ? this.navCtrl.setRoot(ChillBox) : null;
    });

    modal.present(modal);
  }

  //take the home chills (logo of event) from the dataBase
  getHome() {
    this.api.getHome().subscribe(
      data => {
        this.notif.publish("notif:update");
        if (data) {
          this.changeSlides(data)
        }
        this.slides = data;
      });
  }

  changeSlides(home: any) {
    this.slides = [[]];
    this.idList = [];

    for (let h in home) {
      this.idList.push(home[h].chill_id);
    }
  }

  addChill() {
    this.navCtrl.push(ChillList, { idList: this.idList }, { animate: true, direction: 'back' });
  }

  showHistory() {
    this.navCtrl.push(History, {}, { animate: true, direction: 'back' });
  }

  showOfflineToast(type) {
    if (type == 1) {
      const toast = this.toastCtrl.create({
        message: this.transaltions['offline.save-participate'],
        duration: 4000
      });
      toast.present();
    }
    if (type == 2) {
      const toast = this.toastCtrl.create({
        message: this.transaltions['offline.blocked'],
        duration: 4000
      });
      toast.present();
    }
  }
}
