import { Injectable, Pipe } from '@angular/core';

@Pipe({
  name: 'statusImg'
})
@Injectable()
export class StatusImg {
  /*
    Takes a value and makes it lowercase.
   */
  transform(value: any = "", args: any[] = []) {
    value = value.toString()

    let imgPath: string = "";

    if (value == "0") {
      imgPath = args[0] ? "#ff4a48" : "assets/images/status-no-thin.svg";
    } else if (value == "1") {
      imgPath = args[0] ? "#7ed321" : "assets/images/status-yes-thin.svg";
    } else if (value == "2") {
      imgPath = args[0] ? "#f5a623" : "assets/images/status-maybe-thin.svg";
    } else if (value == "3") {
      imgPath = args[0] ? "lightgrey" : "assets/images/status-wait.svg";
    }
    return imgPath;
  }
}
