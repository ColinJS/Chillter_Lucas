import { Component } from '@angular/core';
import { NavController, ViewController, NavParams,ToastController,ItemSliding } from 'ionic-angular';
import { ApiService } from '../../providers/api';
import { TranslateService } from 'ng2-translate';
import { SyncService } from '../../providers/sync';

@Component({
  selector: 'ask-friends',
  templateUrl: 'ask-friends.html',
})
export class AskFriends {
  arrayTmp: any = {};
  arrayFriends: any = [];
  friends: any = [];
  filteredFriends: any = [];
  addFriendsDisplay: string = 'add'
  viewAddGuest: any = [];
  viewViewGuest: any[] = [];
  friendsList: any = [];
  isLoadingFriends: boolean = true;
  transaltions: any;
  eventId: any;
  editor: boolean = false;

  constructor(
    private nav: NavController,
    private viewCtrl: ViewController,
    private api: ApiService,
    private translate: TranslateService,
    private toastCtrl: ToastController,
    private navP: NavParams,
    private sync: SyncService
  ) {

    translate.get(['offline.blocked']).subscribe(value => this.transaltions = value);

    this.friendsList = this.navP.get("friendsList");
    this.eventId = this.navP.get("eventId");
    this.editor = this.navP.get("editor");
    this.viewViewGuest = this.friendsList;
    this.getFriends();
  }

  onInput(searchbar: any) {
    if (searchbar.target.value == "" || searchbar.target.value == undefined) {
      searchbar.target.value = "";
      this.getFriends();
      this.viewViewGuest = this.friendsList;
      return;
    }

    this.viewAddGuest = this.filteredFriends.filter((v) => {
      if (v.firstname.toLowerCase().indexOf(searchbar.target.value.toLowerCase()) > -1) {
        return true;
      } else {
        return false;
      }
    });

    this.viewViewGuest = this.friendsList.filter((v) => {
      if (v.firstname.toLowerCase().indexOf(searchbar.target.value.toLowerCase()) > -1) {
        return true;
      } else {
        return false;
      }
    });
  }

  getFriends() {
    this.api.getFriends().subscribe(
      data => {
        this.isLoadingFriends = false;
        if (data) {
          this.friends = data;
          if (this.friendsList.length > 0) {

            let filterList = [];

            for (let f of this.friendsList) {
              filterList.push(f.id);
            }

            this.filteredFriends = this.friends.filter((v) => {
              if (filterList.indexOf(v.id) == -1) {
                return true;
              } else {
                return false;
              }
            });
          } else {
            this.filteredFriends = this.friends;
          }
          this.viewAddGuest = this.filteredFriends;
        } else {
          this.friends = [];
          this.filteredFriends = [];
        }
      },
      res => {
        this.isLoadingFriends = false;
        console.log(res.status)
        if (res.status != 200) {
          console.log("Http request error :" + res.status);
        }
      }
    )
  }

  addFriend(friend: any) {
    for (var prop in this.arrayTmp) {
      this.arrayFriends.push(this.arrayTmp[prop]);
    }

    this.close(friend);
  }

  deleteFriend(slidingItem: ItemSliding, friendId: string) {
    if (!this.sync.status) {
      this.showOfflineToast(1);
      return;
    }
    this.api.deleteFriendFromEvent(this.eventId, friendId).subscribe();
    let ind;
    for (let i = 0; i < this.friendsList.length; i++) {
      if (this.friendsList[i].id == friendId) {
        ind = i;
      }
    }
    this.friendsList.splice(ind, 1);
    slidingItem.close();
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

  addToArray(id, e) {
    if (e.checked) {
      this.arrayTmp[id.id] = id;
    } else {
      delete this.arrayTmp[id.id];
    }
  }

  close(friend: any = undefined) {
    this.viewCtrl.dismiss(friend);
  }
}
