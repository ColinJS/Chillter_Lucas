import { Component } from '@angular/core';
import {
  NavController,
  ViewController,
  NavParams,
  ToastController,
  AlertController
} from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { ApiService } from '../../providers/api';
import { StorageService } from '../../providers/storage';
import { ChillerDetails } from '../chiller-details/chiller-details'
import { SyncService } from '../../providers/sync';
import { ResolveExpenses } from "../resolve-expenses/resolve-expenses";

@Component({
  selector: 'chill-utils',
  templateUrl: 'chill-utils.html'
})

export class ChillUtils {
  private transaltions: any;

  chillUtilsDisplay: string = 'transports';
  chillUtilsDisplayTitles: string[] = ['transports','list','expenses'];

  arraySeats: any[];
  title: string;
  slidesOptions: any;
  slideInit: number = 0;
  slidePager: boolean = false;

  cars: any[];
  seats: string = "";
  addCarBool: boolean = false;
  isLoadingCar: boolean = true;
  isLoadingAddCar: boolean = false;

  list: any[] = [];
  leftList: any[] = [];
  bringingList: any[] = [];
  isLoadingList: boolean = true;
  element: string = "";

  expsList: any[];
  exps: any[];
  expensesPage: boolean = false;
  expense: string = "";
  price: string = "";
  isLoadingExp: boolean = true;
  isLoadingExpAction: boolean = false;

  newMode: boolean = false;
  creator: any;
  creatorId: number;
  utilsObj: any;
  profileId: any;

  // Used to control expense list
  tmpList: any[];
  isTmpList: boolean = false;

  // Fix navbar when coming from chill-detail
  fixNav: boolean = false;

  // Don't show addCar icon if chiller already own a car
  foundDriver: boolean = false;

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private translate: TranslateService,
    private api: ApiService,
    private sync: SyncService,
    private navCtrl: NavController,
    private viewCtrl: ViewController,
    private navParams: NavParams,
    private storage: StorageService
  ) {
    translate.get(['chill-utils.global-title',
      'chill-utils.title-transport',
      'chill-utils.title-list',
      'chill-utils.title-expense',
      'chill-utils.input-add-element.title',
      'chill-utils.input-add-element.placeholder',
      'chill-utils.input-add-car.title',
      'chill-utils.input-add-car.placeholder',
      'chill-utils.input-add-expense.placeholder-element',
      'chill-utils.input-add-expense.placeholder-price',
      'chill-utils.no-invited',
      'chill-utils.not-sended',
      'chill-utils.no-exp-info',
      'chill-utils.no-exp-inheriter',
      'chill-utils.add-inheriter',
      'chill-utils.already-in-car1',
      'chill-utils.already-in-car2',
      'chill-utils.already-in-car2',
      'chill-utils.over-10-seats',
      'chill-utils.me',
      'chill-utils.owes',
      'offline.blocked',
      'global.add',
      'global.cancel',
      'global.ok']).subscribe(value => this.transaltions = value);

    if (this.navParams.get("init")) {
      this.slideInit = this.navParams.get("init");
      this.chillUtilsDisplay = this.chillUtilsDisplayTitles[this.slideInit];
    }
    if (this.navParams.get("newMode")) {
      this.newMode = this.navParams.get("newMode");
    }

    if (this.newMode && this.navParams.get("utils")) {
      console.log("alors");
      this.utilsObj = this.navParams.get("utils");
      this.cars = this.utilsObj.cars;
      if (this.cars.length == 0) {
        this.addCarBool = true;
      } else {
        this.addCarBool = false;
      }
      this.list = this.utilsObj.list;
      this.sortListData();
      this.exps = this.utilsObj.expenses;
    }

    this.creator = this.navParams.get("creator");

    if (this.newMode) {
      this.fixNav = false;
      this.creatorId = this.navParams.get("creatorId");
      if (this.utilsObj.expenses != undefined) {
        this.tmpList = this.utilsObj.expenses;
        this.formatExps();
      }
    } else {
      this.fixNav = true;
      this.creatorId = this.navParams.get("creatorId");
      this.getExps();
      this.getCar();
      this.getList();
    }

    this.api.getProfileId().subscribe(data => {
      this.profileId = data;
    });

    this.arraySeats = [
      'place-av-driver',
      'place-av-passenger',
      'place-ar-one',
      'place-ar-two',
      'place-ar-three',
      'place-ar-four',
      'place-ar-five',
      'place-ar-six'];

      console.log(this.utilsObj);
  }

  close(){
    console.log("Dismiss");
    this.viewCtrl.dismiss(this.utilsObj);
  }

  getCar() {
    let evtId = this.navParams.get("eventId");

    this.api.getCar(evtId).subscribe(
      data => {
        this.isLoadingCar = false;
        this.cars = [];

        if (data.length == 0) {
          this.addCarBool = true;
          return;
        } else {
          for (let c in data) {
            if (!this.foundDriver) {
              if (data[c].driver_id == this.creatorId || this.creatorId == undefined) {
                this.addCarBool = false;
                this.foundDriver = true;
              } else {
                this.addCarBool = true;
              }
            }

            let obj = {
              "id": data[c].id,
              "seats": data[c].seats,
              "driver": {
                "id": data[c].driver_id, "firstname": data[c].passengers[0].firstname, "picture": data[c].passengers[0].picture
              },
              "passengers": data[c].passengers,
              "seats_left": data[c].seats - data[c].passengers.length
            };

            obj.driver.picture == "" || !obj.driver.picture ? obj.driver.picture = "assets/images/default-profil.svg" : null;

            for (let p in obj.passengers) {
              obj.passengers[p].picture == "" || !obj.passengers[p].picture ? obj.passengers[p].picture = "assets/images/default-profil.svg" : null;
            }

            this.cars.push(obj);
          }
        }
      },
      res => {
        this.isLoadingCar = false;
        if (res.status != undefined) {
          console.log("Http request error :" + res.status);
        }
      }
    )
  }

  getList() {
    let evtId = this.navParams.get("eventId");

    this.api.getList(evtId).subscribe(
      data => {
        this.isLoadingList = false;
        if (data) {
          this.list = data;
          this.sortListData();
        } else {
          this.list = [];
        }
      },
      res => {
        this.isLoadingList = false;
        if (res.status != 200) {
          console.log("Http request error :" + res.status);
        }
      }
    )
  }

  sortListData(){
    this.leftList = this.list.filter((value: any, index: number)=>{
      if(value.assigned_to.id == null){
        return true;
      }else{
        return false;
      }
    });

    this.bringingList = this.list.filter((value: any, index: number)=>{
      console.log(value);
      if(value.assigned_to.id == null){
        return false;
      }else{
        return true;
      }
    });
  }

  getExps() {
    let evtId = this.navParams.get("eventId");

    this.api.getExps(evtId).subscribe(
      data => {
        this.isLoadingExp = false;
        if (data) {
          this.expsList = data;
          let tmpList: any[] = [];

          for (let e of data) {
            let toDo = true;

            for (let i in tmpList) {
              if (e.payer.id == tmpList[i].payer.id) {
                let tmpExp = {
                  "id": e.id,
                  "element": e.element,
                  "price": e.price,
                  "inheriters": e.inheriters,
                  "payer": e.payer
                }

                tmpList[i].expenses.push(tmpExp);
                toDo = false;
              }
            }

            if (toDo) {
              let tmpExp = {
                "payer": e.payer,
                "expenses": [{
                  "id": e.id,
                  "element": e.element,
                  "price": e.price,
                  "inheriters": e.inheriters,
                  "payer": e.payer
                }]
              }
              tmpList.push(tmpExp);
            }
          }

          for (let i in tmpList) {
            let tmpSum: number = 0.0;
            for (let p of tmpList[i].expenses) {
              tmpSum += parseFloat(p.price);
            }
            tmpList[i].sum = tmpSum;
          }

          this.exps = tmpList;
        } else {
          this.expsList = [];
          this.exps = [];
        }
      },
      res => {
        this.isLoadingExp = false;
        if (res.status != 200) {
          console.log("Http request error :" + res.status);
        }
      }
    )
  }

  addCar(seats: number) {
    if (!this.sync.status) {
      this.showToast(1);
      return;
    }
    if (!seats) {
      return false;
    }

    if (this.newMode) {
      this.addCarBool = false;
      this.cars = [{
        "seats": seats,
        "driver": { "id": this.creator.id, "firstname": this.creator.firstname, "picture": this.creator.picture },
        "passengers": []
      }];
      this.utilsObj.cars = this.cars;
      return;

    } else {
      let evtId = this.navParams.get("eventId");
      this.isLoadingAddCar = true;

      let body = {
        seats: seats
      };

      this.api.addCar(evtId, body).subscribe(
        data => {
          this.isLoadingAddCar = false;
          if (!data) {
            console.log("Error" + data);
          }
        },
        res => {
          this.isLoadingAddCar = false;
          if (res.status != undefined) {
            console.log("Http request error :" + res.status);
          } else {
            this.addCarBool = false;
            this.cars = [];
            this.getCar();
          }
        }
      );
    }
  }

  deleteCar(carId: any) {
    if (!this.sync.status) {
      this.showToast(1);
      return;
    }
    if (this.newMode) {
      this.addCarBool = true;
      this.cars = [];
      this.utilsObj.cars = [];

      return;
    } else {
      let evtId = this.navParams.get("eventId");

      for (let car in this.cars) {
        if (this.cars[car].id == carId) {
          this.cars[car].isDeleteLoading = true;
        }
      }

      this.api.deleteCar(evtId, carId).subscribe(
        data => {
          this.cars = [];
          this.addCarBool = true;
          this.getCar();
        },
        res => {
          if (res.status != 200) {
            console.log("Http request error :" + res.status);
          }
        }
      )
    }
  }

  passengerTap(carId, profileId) {
    if (!this.sync.status) {
      this.showToast(1);
      return;
    }
    if (this.newMode) {
      return
    } else {
      for (let c in this.cars) {
        if (profileId == this.cars[c].driver.id) {
          return;
        }
        for (let p of this.cars[c].passengers) {
          if (p.id == profileId) {
            if (carId != this.cars[c].id) {
              let evtId = this.navParams.get("eventId");

              this.api.deletePassenger(evtId, this.cars[c].id).subscribe(
                data => {
                  this.cars = [];
                  this.getCar();
                  this.api.addPassenger(evtId, carId).subscribe(
                    data => {
                      this.cars = [];
                      this.getCar();
                      return;
                    },
                    res => {
                      if (res.status != 200) {
                        console.log("Http request error :" + res.status);
                      }
                    }
                  );
                },
                res => {
                  if (res.status != 200) {
                    console.log("Http request error :" + res.status);
                  }
                }
              );
            }
          }
        }
      }

      for (let c in this.cars) {
        let driver_id = this.cars[c].driver.id;

        if (this.cars[c].id == carId) {
          for (let p of this.cars[c].passengers) {
            if (p.id == profileId) {
              if (p.id == driver_id) {
                return;
              } else {
                let evtId = this.navParams.get("eventId");

                for (let car in this.cars) {
                  if (this.cars[car].id == carId) {
                    this.cars[car].isGetOutLoading = true;
                  }
                }

                this.api.deletePassenger(evtId, carId).subscribe(
                  data => {
                    this.cars = [];
                    this.getCar();
                    return;
                  },
                  res => {
                    if (res.status != 200) {
                      console.log("Http request error :" + res.status);
                    }
                  }
                );
              }
              return;
            } else {
              let evtId = this.navParams.get("eventId");

              for (let car in this.cars) {
                if (this.cars[car].id == carId) {
                  this.cars[car].isGetInLoading = true;
                }
              }

              this.api.addPassenger(evtId, carId).subscribe(
                data => {
                  this.cars = [];
                  this.getCar();
                  return;
                },
                res => {
                  if (res.status != 200) {
                    console.log("Http request error :" + res.status);
                  }
                }
              );
            }
          }
          return;
        }
      }
    }
  }

  addElement(element: string) {
    if (!this.sync.status) {
      this.showToast(1);
      return;
    }
    if (!element) {
      return false;
    }

    if (this.newMode) {
      let elemId = this.list.length;

      this.list.push({
        assigned_to: {
          "id": null,
          "firstname": null
        },
        created_by: {
          "id": 0,
          "firstname": null
        },
        "id": elemId,
        "content": element,
        "mine": true
      });

      this.utilsObj.list = this.list;
    } else {
      let evtId = this.navParams.get("eventId");

      let body = {
        element: element
      };

      this.list.push({
        assigned_to: {
          "id": this.creatorId,
          "firstname": this.creator.firstname
        },
        created_by: {
          "id": this.creatorId,
          "firstname": this.creator.firstname
        },
        "id": 0,
        "content": element,
        "state": true
      });

      this.api.addElement(evtId, body).subscribe(
        data => {

        },
        res => {
          if (res.status != undefined) {
            console.log("Http request error :" + res.status);
            this.getList();
          } else {
            this.getList();
          }
        }
      );
    }

    this.sortListData();
  }

  deleteElement(elemId) {
    if (!this.sync.status) {
      this.showToast(1);
      return;
    }
    if (this.newMode) {
      this.list = this.list.filter(item => elemId !== item.id);
      this.utilsObj.list = this.list;
    } else {
      let evtId = this.navParams.get("eventId");

      const toDelete = new Set([elemId]);
      const updatedList = this.list.filter(obj => !toDelete.has(obj.id));

      this.list = updatedList;

      this.api.deleteElement(evtId, elemId).subscribe(
        data => {

        },
        res => {
          if (res.status != null) {
            console.log("Http request error :" + res.status);
            this.getList();
          }
        }
      );
    }
  }

  elementTap(elemId: string, firstName: string, takerId: number) {
    if (!this.sync.status) {
      this.showToast(1);
      return;
    }
    if (this.newMode) {
      let prompt = this.alertCtrl.create();

      prompt.setTitle(this.transaltions['chill-utils.not-sended']);
      prompt.addButton({
        text: this.transaltions['global.ok'],
      });
      prompt.present();

      return;
    }

    if (firstName == null) {
      this.takeElement(elemId);
    } else {
      if (takerId != this.creatorId) {
        return false;
      }
      this.leaveElement(elemId);
    }
  }

  takeElement(elemId: string) {
    if (!this.sync.status) {
      this.showToast(1);
      return;
    }
    let evtId = this.navParams.get("eventId");

    for (let elem in this.list) {
      if (this.list[elem].id == elemId) {
        this.list[elem].assigned_to.state = true;
      }
    }

    this.api.takeElement(evtId, elemId).subscribe(
      data => {
        this.getList();
      },
      res => {
        if (res.status != null) {
          console.log("Http request error :" + res.status);
        } else {
          this.getList();
        }
      }
    )
  }

  leaveElement(elemId: string) {
    if (!this.sync.status) {
      this.showToast(1);
      return;
    }
    let evtId = this.navParams.get("eventId");

    for (let elem in this.list) {
      if (this.list[elem].id == elemId) {
        this.list[elem].assigned_to.state = true;
      }
    }

    this.api.leaveElement(evtId, elemId).subscribe(
      data => {
        this.getList();
      },
      res => {
        if (res.status != null) {
          console.log("Http request error :" + res.status);
        } else {
          this.getList();
        }
      }
    )
  }

  showChillerDetails(friendId: string) {
    this.navCtrl.push(ChillerDetails, { "friendId": friendId }, { animate: true, direction: 'back' });
  }

  resolve() {
    if (this.newMode) {
      let prompt = this.alertCtrl.create();
      prompt.setTitle(this.transaltions['chill-utils.not-sended']);

      prompt.addButton({
        text: this.transaltions['global.ok'],
      });

      prompt.present();
    } else {

      let baseExps: any = this.expsList;

      console.log(this.expsList);

      let tmpList: any[] = [];
      let pay: any[] = [];

      for (let e of baseExps) {
        let neo: boolean = true;

        for (let i in tmpList) {
          if (tmpList[i].chiller.id == e.payer.id) {
            tmpList[i].credit += parseFloat(e.price);
            neo = false;
          }
        }

        if (neo) {
          let tmpExp = {
            "chiller": e.payer,
            "credit": parseFloat(e.price)
          }
          tmpList.push(tmpExp);
        }

        let count = e.inheriters.length

        for (let i of e.inheriters) {
          neo = true;

          for (let j in tmpList) {
            if (tmpList[j].chiller.id == i.id) {
              tmpList[j].credit -= parseFloat(e.price) / count;
              neo = false;
            }
          }

          if (neo) {
            let tmpExp = {
              "chiller": i,
              "credit": -(parseFloat(e.price) / count)
            }
            tmpList.push(tmpExp);
          }
        }
      }

      let posList = tmpList.filter((a) => {
        if (a.credit > 0) {
          return true
        } else {
          return false
        }
      });

      let negList = tmpList.filter((a) => {
        if (a.credit < 0) {
          return true
        } else {
          return false
        }
      });

      let otherTmp: any[] = [];
      let toSplice: any[] = [];

      for (let p = 0; p < posList.length; p++) {
        let tmpCredit = posList[p].credit;

        for (let n = 0; n < negList.length; n++) {
          tmpCredit += negList[n].credit

          if (tmpCredit == 0) {
            let tmpPay = {
              "from": negList[n].chiller,
              "to": posList[p].chiller,
              "sum": Math.abs(negList[n].credit)
            }

            toSplice.push(n);
            tmpPay.sum = (Math.trunc(tmpPay.sum * 100) / 100)
            otherTmp.push(tmpPay);
            break;
          } else if (tmpCredit > 0) {
            let tmpPay = {
              "from": negList[n].chiller,
              "to": posList[p].chiller,
              "sum": Math.abs(negList[n].credit)
            }
            toSplice.push(n);
            tmpPay.sum = (Math.trunc(tmpPay.sum * 100) / 100)
            otherTmp.push(tmpPay);
          } else {
            let tmpPay = {
              "from": negList[n].chiller,
              "to": posList[p].chiller,
              "sum": (Math.abs(negList[n].credit) + tmpCredit)
            }
            negList[n].credit = tmpCredit;
            tmpPay.sum = (Math.trunc(tmpPay.sum * 100) / 100)
            otherTmp.push(tmpPay);
            break;
          }
        }

        for (let i = 0; i < toSplice.length; i++) {
          negList.splice((toSplice[i] - i), 1);
        }
      }

      pay = otherTmp;

      let alertMessage: string = '';

      for(let i = 0; i < pay.length; i++){

        let from = this.profileId == pay[i].from.id ? '<span class="mine-title">' + this.transaltions['chill-utils.me'] + '</span>' : pay[i].from.firstname;
        let to = this.profileId == pay[i].to.id ? '<span class="mine-title">' + this.transaltions['chill-utils.me'] + '</span>' : pay[i].to.firstname;
        let sum = pay[i].sum;
        let owes = this.transaltions['chill-utils.owes']

        alertMessage += '<div class="resolve-text">'+ from +' '+ owes +' '+ to +': '+ sum +' €</div>'
      }

      let alert = this.alertCtrl.create({
        title: 'Balance', //TODO : add translate
        message: alertMessage,
        buttons: ['Dismiss']
      });
      alert.present();

      //this.navCtrl.push(ResolveExpenses, { "expenses": this.expsList });
    }
  }

  promptManager(){
    console.log("prompt manager");
    if(this.chillUtilsDisplay == 'transports'){
      this.addCarPrompt();
    }else if(this.chillUtilsDisplay == 'list'){
      this.addElementPrompt();
    }else if(this.chillUtilsDisplay == 'expenses'){
      this.addExpensePrompt();
    }

  }

  addElementPrompt() {
    if (!this.sync.status) {
      this.showToast(1);
      return;
    }
    let prompt = this.alertCtrl.create({
      title: this.transaltions['chill-utils.input-add-element.title'],
      inputs: [
        {
          name: 'Element',
          placeholder: this.transaltions['chill-utils.input-add-element.placeholder'],
          type: 'text'
        }
      ],
      buttons: [
        {
          text: this.transaltions['global.cancel']
        },
        {
          text: this.transaltions['global.add'],
          handler: data => {
            this.addElement(data.Element);
          }
        }
      ]
    });
    prompt.present();
  }

  addCarPrompt() {
    if (!this.sync.status) {
      this.showToast(1);
      return;
    }
    let profileId = this.creatorId;

    for (let c in this.cars) {
      for (let p of this.cars[c].passengers) {
        if (profileId == p.id) {
          let prompt = this.alertCtrl.create({
            subTitle: this.transaltions['chill-utils.already-in-car1'] + this.cars[c].passengers[0].firstname + this.transaltions['chill-utils.already-in-car2'],
            buttons: [{
              text: this.transaltions['global.ok']
            }]
          });

          prompt.present();
          return;
        }
      }
    }

    let prompt = this.alertCtrl.create({
      title: this.transaltions['chill-utils.input-add-car.title'],
      inputs: [
        {
          name: 'seats',
          placeholder: this.transaltions['chill-utils.input-add-car.placeholder'],
          type: 'number'

        }
      ],
      buttons: [
        {
          text: this.transaltions['global.cancel']
        },
        {
          text: this.transaltions['global.add'],
          handler: data => {
            this.addCarBool = false;
            data.seats < 9 ? this.addCar(parseInt(data.seats) + 1) : this.showToast(2);
          }
        }
      ]
    });
    prompt.present();
  }

  addExpensePrompt() {
    if (!this.sync.status) {
      this.showToast(1);
      return;
    }
    let prompt = this.alertCtrl.create();
    let friends = this.navParams.get("friends");

    if (friends.length == 0) {
      prompt.setTitle(this.transaltions['chill-utils.no-invited']);

      prompt.addButton({
        text: this.transaltions['global.ok'],
      });

      prompt.present();
    } else {
      prompt.setTitle(this.transaltions['chill-utils.input-add-expense.placeholder-element']);

      prompt.addInput({
        name: 'Element',
        placeholder: this.transaltions['chill-utils.input-add-expense.placeholder-element'],
        type: 'text'
      });

      prompt.addInput({
        name: 'Price',
        placeholder: this.transaltions['chill-utils.input-add-expense.placeholder-price'],
        type: 'number'
      });

      prompt.addButton({
        text: this.transaltions['global.cancel']
      });

      prompt.addButton({
        text: this.transaltions['global.add'],
        handler: data => {
          if (data.Element == "" || data.Price == "") {
            this.assertExps(1);
            return;
          }
          this.addFriendsToExpensePrompt(data.Element, data.Price)
        }
      });

      prompt.present();
    }
  }

  addFriendsToExpensePrompt(element: string, price: string) {
    let friends = this.navParams.get("friends");
    let prompt = this.alertCtrl.create();

    for (let friend in friends) {
      friends[friend].id == this.creatorId ? friends.splice(friend, 1) : null;
    }

    this.creator.id = this.creatorId;
    this.creator.have_chillter = true;
    friends.unshift(this.creator);

    prompt.setTitle(this.transaltions['chill-utils.add-inheriter']);

    for (let i = 0; i < friends.length; i++) {
      if (friends[i].id == this.creatorId) {
        prompt.addInput({
          type: 'checkbox',
          label: (friends[i].firstname + " " + friends[i].lastname),
          value: ("value" + i.toString()),
          checked: true
        });
      } else {
        prompt.addInput({
          type: 'checkbox',
          label: (friends[i].firstname + " " + friends[i].lastname),
          value: ("value" + i.toString()),
          checked: false
        });
      }
    }

    prompt.addButton({
      text: this.transaltions['global.cancel']
    });

    prompt.addButton({
      text: this.transaltions['global.add'],
      handler: data => {
        if (data.length == 0) {
          this.assertExps(2);
          return;
        }

        let inheritersList = []
        for (let i = 0; i < friends.length; i++) {
          if (data.indexOf("value" + i.toString()) > -1) {
            inheritersList.push(friends[i].id);
          }
        }

        this.addExpense(element, price, inheritersList);
      }
    });

    prompt.present();
  }

  addExpense(element: string, price: string, inheriters: any[]) {
    if (!this.sync.status) {
      this.showToast(1);
      return;
    }
    if (element == "" || price == "") {
      return false;
    }

    if (this.newMode) {
      let Uexps = [{
        "id": null,
        "price": price,
        "element": element,
        "payer": {
          "id": this.creatorId,
          "firstname": this.creator.firstname
        },
        "inheriters": inheriters
      }];


      // If tmpList !undefined add expense to the existing exps list, don't reset tmpList
      if (this.isTmpList == false) {
        this.expsList = Uexps;
        this.tmpList = [];
      }

      for (let e of Uexps) {
        let toDo = true;

        for (let i in this.tmpList) {
          if (e.payer.id == this.tmpList[i].payer.id) {
            let tmpExp = {
              "id": e.id,
              "element": e.element,
              "price": e.price,
              "inheriters": e.inheriters,
              "payer": e.payer
            }

            this.expsList.push(tmpExp);
            this.tmpList[i].expenses.push(tmpExp);
            toDo = false;
          }
        }

        if (toDo) {
          this.isTmpList = true;
          let tmpExp = {
            "payer": e.payer,
            "expenses": [{
              "id": e.id,
              "element": e.element,
              "price": e.price,
              "inheriters": e.inheriters
            }]
          }

          this.tmpList.push(tmpExp);
        }
      }

      for (let i in this.tmpList) {
        let tmpSum: number = 0.0;
        for (let p of this.tmpList[i].expenses) {
          tmpSum += parseFloat(p.price);
        }
        this.tmpList[i].sum = tmpSum;
      }

      this.exps = this.tmpList;
      this.utilsObj.expenses = this.exps;
    }

    if (!this.newMode) {
      this.isLoadingExpAction = true;

      let evtId = this.navParams.get("eventId");
      let body = {
        expenses: [{
          "element": element,
          "price": price,
          "inheriters": inheriters
        }]
      };

      this.api.addExpense(evtId, body).subscribe(
        data => {
          this.isLoadingExpAction = false;
          if (!data) {
            return false;
          }
        },
        res => {
          this.isLoadingExpAction = false;
          if (res.status != undefined) {
            console.log("Http request error :" + res.status);
          } else {
            this.getExps();
          }
        });
    }
  }

  // Format exps object when coming back from edit-chill
  formatExps() {
    let formatUtilsObj = this.utilsObj.expenses;

    for (let e in formatUtilsObj) {
      for (let u of formatUtilsObj[e].expenses) {
        if (u.element != undefined && u.price != undefined && u.inheriters != undefined) {
          this.addExpense(u.element, u.price, u.inheriters);
        }
      }
    }
  }

  deleteExp(expId, expPrice, expExpense) {
    if (!this.sync.status) {
      this.showToast(1);
      return;
    }
    let expsDel = this.exps;

    if (this.newMode) {
      for (let e in expsDel) {
        for (let el of expsDel[e].expenses) {
          if (el.price == expPrice && el.element == expExpense) {
            let indexOf = expsDel[e].expenses.indexOf(el);

            expsDel[e].expenses.splice(indexOf, 1);
            this.utilsObj.expenses = [];
            this.exps = [];
            this.tmpList = [];
            this.utilsObj.expenses = expsDel;
            this.formatExps();
            return;
          }
        }
      }
    } else {
      let evtId = this.navParams.get("eventId");

      this.isLoadingExpAction = true;
      this.api.deleteExpense(evtId, expId).subscribe(
        data => {
          this.isLoadingExpAction = false;
          this.getExps();
        },
        res => {
          this.isLoadingExpAction = false;
          if (res.status != null) {
            console.log("Http request error :" + res.status);
          } else {
            this.getExps();
          }
        }
      );
    }
  }

  // Constraint to give information about expenses
  assertExps(type) {
    let prompt = this.alertCtrl.create();

    if (type == 1) {
      prompt.setTitle(this.transaltions['chill-utils.no-exp-info']);

      prompt.addButton({
        text: this.transaltions['global.ok'],
        handler: data => {
          this.addExpensePrompt();
        }
      });

      prompt.present();
    }

    if (type == 2) {
      prompt.setTitle(this.transaltions['chill-utils.no-exp-inheriter']);

      prompt.addButton({
        text: this.transaltions['global.ok']
      });

      prompt.present();
    }
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
        message: this.transaltions['chill-utils.over-10-seats'],
        duration: 3000
      });
      toast.present();
    }
  }
}
