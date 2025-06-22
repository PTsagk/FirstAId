import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgModel, FormsModule } from '@angular/forms';
import { environment } from '../../../environment/environment';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDlgComponent } from '../../dialogs/confirmation-dlg/confirmation-dlg.component';
import { marked } from 'marked';
@Component({
  selector: 'app-chat-bot',
  standalone: true,
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.scss'],
  imports: [FormsModule, MatIcon, MatButton],
})
export class ChatBotComponent implements OnInit {
  messages: { text: string; sender: string }[] = [];
  userMessage = '';
  pending: boolean = false;
  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit() {
    this.getMessages();
  }
  sendMessage() {
    if (this.userMessage.trim()) {
      this.messages.push({ text: this.userMessage, sender: 'user' });
      this.messages.push({ text: 'loading', sender: 'bot' });
      this.scrollToBottom();
      const params = { question: this.userMessage };
      this.userMessage = '';
      this.http
        .post(`${environment.api_url + '/doctor-assistant/chat'}`, params, {
          withCredentials: true,
        })
        .subscribe(
          (res: any) => {
            this.messages.pop(); // Remove the loading message
            this.messages.push({
              text: marked(res.content) as string,
              sender: 'bot',
            });
          },
          (err) => {
            this.messages.pop(); // Remove the loading message
            this.messages.push({
              text: 'Error: Unable to get response from the server.',
              sender: 'bot',
            });
          }
        );
    }
  }

  getMessages() {
    this.messages = [];
    this.pending = true;
    this.http
      .get(`${environment.api_url + '/doctor-assistant/messages'}`, {
        withCredentials: true,
      })
      .subscribe((res: any) => {
        this.pending = false;
        this.messages = res.map((msg: any) => ({
          text: marked(msg.content) as string,
          sender: msg.role === 'user' ? 'user' : 'bot',
        }));
        this.messages.reverse();
        this.scrollToBottom();
      });
  }

  clearChat() {
    const dialogRef = this.dialog.open(ConfirmationDlgComponent, {
      width: '400px',
      data: {
        message: 'Do you want to delete the entire chart conversation?',
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.http
          .delete(`${environment.api_url + '/doctor-assistant/thread'}`, {
            withCredentials: true,
          })
          .subscribe(() => {
            this.messages = [];
            this.scrollToBottom();
          });
      }
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }
}
