import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgModel, FormsModule } from '@angular/forms';
import { environment } from '../../../environment/environment';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDlgComponent } from '../../dialogs/confirmation-dlg/confirmation-dlg.component';
import { marked } from 'marked';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.scss'],
  imports: [FormsModule, MatIcon, MatButton],
})
export class ChatBotComponent implements OnInit, AfterViewInit {
  @ViewChild('myChart', { static: true }) chartRef!: ElementRef;

  messages: { id?: string; text: string; sender: string; chartData?: any }[] =
    [];
  userMessage = '';
  pending: boolean = false;
  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {}

  get ChartId(): string {
    return Math.random().toString(36).substr(2, 9); // Return a unique ID for the chart
  }

  ngOnInit() {
    Chart.register(...registerables); // Register all required chart components

    this.getMessages();
  }

  ngAfterViewInit(): void {}
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
              text: marked(
                res.role == 'assistant' ? res.content.message_text : res.content
              ) as string,
              sender: 'bot',
              chartData: res.content?.chart_data,
              id: Math.random().toString(36).substr(2, 9), // Generate a unique ID for the chart
            });
            this.cd.detectChanges(); // Ensure the view is updated
            this.initializeCharts([this.messages[this.messages.length - 1]]); // Initialize charts after new message is added
            this.scrollToBottom(); // Scroll to the bottom after adding the new message
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
          text: marked(
            msg.role == 'assistant' ? msg.content?.message_text : msg.content
          ) as string,
          sender: msg.role === 'user' ? 'user' : 'bot',
          chartData: msg.content?.chart_data || null,
          id: msg.id,
        }));
        this.messages.reverse();
        this.scrollToBottom();
        this.initializeCharts(this.messages);
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
  initializeCharts(messages: any): void {
    this.cd.detectChanges(); // Ensure the view is updated before accessing DOM elements
    messages.forEach((message: any) => {
      if (message?.chartData) {
        const chartId = message.id as string;
        const chartElement = document.getElementById(
          chartId
        ) as HTMLCanvasElement | null;
        if (chartElement && chartElement instanceof HTMLCanvasElement) {
          new Chart(chartElement, message.chartData);
        }
      }
    });
  }
}
