import { Component,ViewChild } from '@angular/core';
import {
  NavController,
  ViewController,
  AlertController,
  ToastController,
  Content
} from 'ionic-angular';
import { ApiService } from '../../providers/api';
import { TabsPage } from '../tabs/tabs';
import { SignIn } from '../signin/signin';
import { SyncService } from '../../providers/sync';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { TranslateService } from 'ng2-translate';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';
import { Keyboard } from 'ionic-native';

@Component({
  selector: 'login',
  templateUrl: 'login.html',
})
export class LogIn {
  private transaltions: any;
  private focusPosition: number;
  private keyboardObservable: any;
  @ViewChild(Content) content: Content;

  form: FormGroup;
  submitted: boolean = false;

  constructor(
    private viewCtrl: ViewController,
    private translate: TranslateService,
    private nav: NavController,
    private api: ApiService,
    private alertCtrl: AlertController,
    private formBuilder: FormBuilder,
    private sync: SyncService,
    private toastCtrl: ToastController
  ) {
    translate.get(['login.login-failed',
      'login.error',
      'login.notice',
      'offline.blocked',
      'global.ok']).subscribe(value => this.transaltions = value);

    this.form = formBuilder.group({
      email: ['', Validators.compose([Validators.required])],
      pass: ['', Validators.compose([Validators.required])]
    });

    
  }

  focusKeyboard(){

    let activeElem = document.activeElement.parentElement
    let yPosition = 0;
    let el = activeElem;

    while(el){
      yPosition += (el.offsetTop - el.scrollTop + el.clientTop);
      if(el.tagName != 'ION-CONTENT'){
        el = el.parentElement;
      }else{
        el = null
      }
    }

    this.focusPosition = (yPosition/2)-100;
    console.log(this.focusPosition)
    this.content.scrollTo(0,this.focusPosition,200);
  }

  ionViewDidEnter(){
    this.keyboardObservable = Keyboard.onKeyboardShow().subscribe(()=>{
      this.focusKeyboard();
    });
    document.getElementById("login-logo").style.height = document.getElementById("login-logo").offsetHeight.toString()+"px";
    document.getElementById("login-logo").style.width = document.getElementById("login-logo").offsetWidth.toString()+"px";
  }

  ionViewDidLeave(){
    this.keyboardObservable.unsubscribe();
  }

  showSignUp() {
    this.nav.push(SignIn, {}, { animate: true, direction: 'back' });
  }

  onSubmit() {
    if (!this.sync.status) {
      this.showToast(1);
      return;
    }

    this.submitted = true;

    if (this.form.valid) {
      this.api.login(this.form.value).subscribe(
        res => {
          this.nav.setRoot(TabsPage);
        },
        res => {
          if (404 === res.status) {
            this.alertCtrl.create({
              title: this.transaltions['login.error'],
              subTitle: this.transaltions['login.login-failed'],
              buttons: ['OK']
            }).present();
          }

          if (403 === res.status) {
            this.alertCtrl.create({
              title: this.transaltions['login.error'],
              subTitle: this.transaltions['login.login-failed'],
              buttons: ['OK']
            }).present();
          }
        }
      );
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
  }

  openForgotPage() {
    if (!this.sync.status) {
      this.showToast(1);
      return;
    }

    this.nav.push(ForgotPasswordPage);
  }
}
