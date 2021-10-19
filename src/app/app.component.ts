import { Component } from '@angular/core';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  userName: string = "";
  messageText: string = "";
  language: string = "";
  messages: Array<any> = [];
  socket:any;

  constructor() {
    this.socket = io();
  }

  ngOnInit() {
    this.messages = new Array();
    this.listenToEvent();
  }

  listenToEvent() {
    this.socket.on("msg", (data: any) => {
      this.messages.push(data);
      console.log(data);
    });
  }

  sendMessage() {
    this.socket.emit("newMsg", 
    {
      userName: this.userName, 
      msg: this.messageText,
      language: this.language
    });

    this.messageText = "";
    this.language = "";
  }
}
