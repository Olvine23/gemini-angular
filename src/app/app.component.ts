import { text } from 'stream/consumers';
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { GeminiService } from './services/gemini.service';
import {
  ChatModule,
  Message,
  SendMessageEvent,
  User,
} from '@progress/kendo-angular-conversational-ui';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ChatModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'conversional-with-gemini';

  geminiService = inject(GeminiService);

  user = this.geminiService.user
  messages = this.geminiService.$messages

  async generate(event: SendMessageEvent) {
    await this.geminiService.generate(event)
  }

  async getAnswer(text: any) {
    await this.geminiService.generate(text);
  }



}
