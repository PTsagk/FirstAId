import { Component } from '@angular/core';
import { NgModel, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.scss'],
  imports: [FormsModule],
})
export class ChatBotComponent {
  messages = [
    { text: 'Hello! How can I assist you today?', sender: 'bot' },
    { text: 'Can you help me find a doctor?', sender: 'user' },
    { text: 'Sure! Please provide your location.', sender: 'bot' },
  ];
  userMessage = '';

  sendMessage() {
    if (this.userMessage.trim()) {
      this.messages.push({ text: this.userMessage, sender: 'user' });
      this.userMessage = '';

      // Simulate bot response
      setTimeout(() => {
        this.messages.push({
          text: 'Thank you for your message!',
          sender: 'bot',
        });
      }, 1000);
    }
  }
}
