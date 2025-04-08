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
    {
      text: "Hello! I'm MediBot, your virtual healthcare assistant. How can I help you today?",
      sender: 'bot',
    },
    {
      text: "I've been experiencing severe headaches for the past three days.",
      sender: 'user',
    },
    {
      text: "I'm sorry to hear that. Can you describe the pain? Is it constant or intermittent, and have you noticed any triggers?",
      sender: 'bot',
    },
    {
      text: "It's a throbbing pain, usually worse in the morning. Light makes it worse.",
      sender: 'user',
    },
    {
      text: 'Thank you for sharing those symptoms. Light sensitivity with throbbing pain could indicate a migraine. Have you taken any medication or had similar episodes before?',
      sender: 'bot',
    },
  ];
  userMessage = '';

  sendMessage() {
    if (this.userMessage.trim()) {
      this.messages.push({ text: this.userMessage, sender: 'user' });
      this.userMessage = '';

      // Simulate bot response
      setTimeout(() => {
        this.messages.push({
          text: "Based on what you've described, I recommend consulting with a neurologist. Would you like me to help you find the nearest available doctor?",
          sender: 'bot',
        });
      }, 1000);
    }
  }
}
