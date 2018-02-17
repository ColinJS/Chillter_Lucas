import { Component } from '@angular/core';
import { ApiService } from '../../providers/api';
import { SyncService } from '../../providers/sync';
import { NavController, AlertController, Events, ToastController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { ChillerDetails } from "../chiller-details/chiller-details";
import { FriendListSearch } from "../friend-list-search/friend-list-search";
import { StorageService } from "../../providers/storage";
import { CacheService } from '../../providers/cache';
import { ContactsService } from '../../providers/contacts'

@Component({
  selector: 'friend-list',
  templateUrl: 'friend-list.html',
})
export class FriendList {
  private transaltions: any;

  chillersDisplay: string = "chillers";

  searchWord: string;
  pendingFriends: any = [];

  friends: any[] = [];
  friendsUnfilter: any = [];
  unsortFriends: any = [];

  phoneContacts: any[] = [];
  phoneContactsUnfilter: any[] = [];
  unsortPhoneContacts: any[] = [];

  notFriends: any = [];

  sentInvitation: any = [];
  noFriends: boolean = false;
  noContacts: boolean = false;
  profileId: number;

  firstLoad: boolean = true;

  noResultFriends: boolean = false;
  noResultNotFriends: boolean = false;
  searchNotFriends: boolean = false;
  resultFound: boolean = false;
  iconSunOutline: string = "chillter-icon-tab-bar-chills-outline";
  iconSunFill: string = "chillter-icon-tab-bar-chills";
  iconSun: string;

  contactPermState: boolean = false;

  constructor(
    private notif: Events,
    private translate: TranslateService,
    private al: AlertController,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private api: ApiService,
    private sync: SyncService,
    private storage: StorageService,
    private cache: CacheService,
    private contacts: ContactsService
  ) {
    translate.get(['friend-list.delete-alert.title',
      'friend-list.delete-alert.message',
      'friend-list.delete-alert.button-text-del-block',
      'friend-list.delete-alert.button-text-del',
      'friend-list.request-subtitle',
      'friend-list.request-subtitle',
      'offline.blocked']).subscribe(value => this.transaltions = value);

    this.iconSun = this.iconSunOutline;

    this.storage.getValue('id').subscribe(
      res => {
        this.profileId = res;
      }
    )

    let call = this.cache.getCache('CONTACTS_PERMISSION').subscribe(
      (data)=>{
        if(data){
          this.contactPermState = data;
          call.unsubscribe();
          if (this.contactPermState) {
            this.notif.publish("notif:update");
            this.getCacheFriends();
            !(this.iconSun != this.iconSunFill) ? this.iconSun = this.iconSunOutline : null;
          }
        }
    });

    this.resetAllLists();

    this.notif.subscribe("notif:friends", () => {
      this.getFriends();
      this.contactPermState ? this.getCacheFriends() : null;
      this.getPendingFriends();
    })

  }

  ionViewDidEnter() {
    this.resetAllLists();
  }

  doRefresh(refresher) {

    this.resetAllLists(refresher);

  }

  resetAllLists(ref: any = false){

    this.friends = [];
    this.friendsUnfilter = [];

    this.getFriends()
    this.getPendingFriends(ref);
    this.getSentInvitation(ref);

    if (this.contactPermState) {
      this.notif.publish("notif:update");
      this.getCacheFriends();
      !(this.iconSun != this.iconSunFill) ? this.iconSun = this.iconSunOutline : null;
    }

    this.filterFriends()

  }

  listsAreDifferent(list1: any[], list2: any[]): boolean{
    let isDifferent: boolean = list1.length != list2.length;

    if(!isDifferent){
      compareLoop:{
        for(let i = 0; i < list1.length; i++){
          if(JSON.stringify(list1[i]) != JSON.stringify(list2[i])){
            isDifferent = true;
            break compareLoop;
          }
        }
      }
    }

    return isDifferent
  }

  getFriends() {
    let call = this.api.getFriends(this.firstLoad).subscribe(
      data => {
        call.unsubscribe();
        this.firstLoad = false;
        data.length == 0 ? this.noFriends = true : this.noFriends = false;
        if (data) {
          if(this.listsAreDifferent(data,this.friends)){
            this.friends = data;
          }
          if(this.listsAreDifferent(data,this.unsortFriends)){
            this.unsortFriends = data;
          }
        } else {
          this.friends = [];
        }
      },
      res => {
        if (res.status != 200) {
          console.log("Http request error :" + res.status);
        }
      },
      () => console.log("Error")
    )
  }

  getPendingFriends(ref: any = false) {
    let call = this.api.getPendingFriends().subscribe(
      data => {
        call.unsubscribe();
        if (data) {
          if(this.listsAreDifferent(data,this.pendingFriends)){
            this.pendingFriends = data;
          }
        } else {
          this.pendingFriends = [];
        }
        if (ref) {
          ref.complete();
        }
      },
      res => {
        if (res.status != 200) {
          console.log("Http request error :" + res.status);
        }
      },
      () => console.log("Error")
    )
  }

  getSentInvitation(ref: any = false) {
    let call = this.api.getSentInvitation().subscribe(
      data => {
        call.unsubscribe();
        if (data) {
          if(this.listsAreDifferent(this.sentInvitation,data)){
            this.sentInvitation = data;
          }
        } else {
          this.sentInvitation = [];
        }
        if (ref) {
          ref.complete();
        }
      }
    )
  }

  getCacheFriends() {

    let increment = 0

    let call = this.cache.getCache('CONTACTS').subscribe(
      data => {
        if(data){
            increment ++
            if(increment >= 5){call.unsubscribe();} // disable the observable after a certain amount of data returned
            data.length == 0 ? this.noContacts = true : this.noContacts = false;
            if (data != undefined) {
              //console.log("Contacts")
              //console.log(data);
              this.noContacts = false;
              if(this.listsAreDifferent(data,this.phoneContacts)){
                this.phoneContacts = data;
                this.unsortPhoneContacts = this.phoneContacts;
              }
              //console.log("Contacts")
              //console.log(this.phoneContacts);
          }else{
            this.noContacts = true;
          }
        }
      }
    )
  }

  acceptFriend(friendId: string) {
    if (!this.sync.status) {
      this.showOfflineToast(1);
      return;
    }
    let call = this.api.acceptFriend(friendId).subscribe(
      data => {
        call.unsubscribe();
        this.resetAllLists();
      },
      res => {
        if (res.status != 200) {
          console.log("Http request error :" + res.status);
        }
      },
      () => console.log("Error")
    )
  }

  showDeleteAlert(friendId: string) {
    if (!this.sync.status) {
      this.showOfflineToast(1);
      return;
    }
    let confirm = this.al.create({
      title: this.transaltions['friend-list.delete-alert.title'],
      message: this.transaltions['friend-list.delete-alert.message'],
      buttons: [
        {
          text: this.transaltions['friend-list.delete-alert.button-text-del-block'],
          handler: () => {
            this.blockFriend(friendId);
          }
        },
        {
          text: this.transaltions['friend-list.delete-alert.button-text-del'],
          handler: () => {
            this.deleteFriend(friendId);
          }
        }
      ]
    });
    confirm.present();
  }

  deleteFriend(friendId: string) {
    if (!this.sync.status) {
      this.showOfflineToast(1);
      return;
    }
    let call = this.api.deleteFriend(friendId).subscribe(
      data => {
        call.unsubscribe();
        this.resetAllLists();
      },
      res => {
        if (res.status != 200) {
          console.log("Http request error :" + res.status);
        }
      },
      () => console.log("Error")
    )
  }

  blockFriend(friendId: string) {
    if (!this.sync.status) {
      this.showOfflineToast(1);
      return;
    }
    let call = this.api.blockFriend(friendId).subscribe(
      data => {
        call.unsubscribe();
        this.resetAllLists();
      },
      res => {
        if (res.status != 200) {
          console.log("Http request error :" + res.status);
        }
      },
      () => console.log("Error")
    )
  }

  inputChange(evt) {
    this.noResultFriends = false;
    this.searchWord = evt.target.value;

    if (this.searchWord == "" || this.searchWord == undefined) {

      this.getCacheFriends()
      this.getFriends();

      this.searchNotFriends = false;
      this.noResultFriends = false;
      this.notFriends = [];

      !(this.iconSun != this.iconSunFill) ? this.iconSun = this.iconSunOutline : null;
      return;
    }

    // Retrieve chiller not in friend list, filter by input value
    if (this.searchWord.length >= 2) {
      this.api.findUser(this.searchWord).subscribe(
        data => {
          if (data) {
            data = data.slice(0, 15);
            for (let d in data) {
              data[d].id == this.profileId ? data = data.slice([d + 1]) : null;
            }
            this.notFriends = data;
            this.searchNotFriends = true;
            this.noResultNotFriends = false;
          }

          if (data.length == 0 || this.notFriends.length == 0) {
            this.notFriends = [];
            this.searchNotFriends = false;
            this.noResultNotFriends = true;
            return;
          }
        },
        res => {
          if (res.status != 200) {
            console.log("Http request error :" + res.status);
          }
        },
        () => console.log("Error")
      )

      // Call function to filter our already added friends
      this.filterFriends();
    }
  }

  getNotFriends() {
    let call = this.api.findUser(this.searchWord).subscribe(
      data => {
        if (data) {
          call.unsubscribe();
          this.notFriends = data;
          this.searchNotFriends = true;
          this.noResultNotFriends = false;
        }

        if (data.length == 0) {
          this.notFriends = [];
          this.noResultNotFriends = true;
          return;
        }
      },
      res => {
        if (res.status != 200) {
          console.log("Http request error :" + res.status);
        }
      },
      () => console.log("Error")
    )
  }

  filterFriends() {

    this.resultFound = false;

    this.friends = this.unsortFriends.filter((v) => {
      // If searchbar become empty by tap on little cross, reset all
      if (this.searchWord == undefined) {

        this.searchWord = "";
        this.notFriends = [];

        this.searchNotFriends = false;

        this.getCacheFriends()
        this.getFriends();

        return;
      }

      if (v.firstname.toLowerCase().indexOf(this.searchWord.toLowerCase()) > -1) {
        this.resultFound = true;
        this.noResultFriends = false;
        return true;
      }
      // Fix to avoid getting no result. Set resultFound to true when found result.
      // The condition below check that. So show no result only when no result in array and resultFound = true
      // With no verification it will show no result even if there is result
      if (v.firstname.toLowerCase().indexOf(this.searchWord.toLowerCase()) == -1 && this.resultFound != true) {
        this.noResultFriends = true;
        return false;
      }
    });
  }

  showChillerDetails(friendId: string, firstname: string, phone: string, have_chillter: boolean) {
    this.navCtrl.push(ChillerDetails, { "friendId": friendId, "firstname": firstname, "phone": phone, "have_chillter": have_chillter }, { animate: true, direction: 'back' });
  }

  showSearch(){
    this.navCtrl.push(FriendListSearch, { animate: true, direction: 'back' });
  }

  addFriend(notFriendId: number) {
    if (!this.sync.status) {
      this.showOfflineToast(1);
      return;
    }

    const toDelete = new Set([notFriendId]);
    this.notFriends = this.notFriends.filter(obj => !toDelete.has(obj.id));
    let call = this.api.addFriend(notFriendId).subscribe(
      data => {
        call.unsubscribe();
        if (data) {
          this.getSentInvitation();
          this.getNotFriends();
        }
      }
    );
  }

  showOfflineToast(type) {
    if (type == 1) {
      const toast = this.toastCtrl.create({
        message: this.transaltions['offline.blocked'],
        duration: 3000
      });
      toast.present();
    }
  }

  toggleFilter() {
    this.iconSun != this.iconSunFill ? this.iconSun = this.iconSunFill : this.iconSun = this.iconSunOutline;
    this.friendsUnfilter.length == 0 ? this.friendsUnfilter = this.friends : null;

    if (!(this.iconSun != this.iconSunFill)) {
      this.friends = this.friendsUnfilter.filter(itm => {
        return itm.have_chillter == true;
      });
    } else {
      this.friends = this.friendsUnfilter;
    }

  }

}
