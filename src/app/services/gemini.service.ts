import { Injectable, signal } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment.development';
import {
  Message,
  SendMessageEvent,
  User,
} from '@progress/kendo-angular-conversational-ui';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  #generativeAi = new GoogleGenerativeAI(environment.gemini_key);

  #prompt =
    'You are a business owner using StockApp (an application that helps run businesses and manage inventory), provide a guide on how to use this product ' +
    'links for resources';

  #model = this.#generativeAi.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });
  readonly #kendoIA: User = {
    id: crypto.randomUUID(),
    name: 'StockApp AI',
    avatarUrl:
      'data:image/png;base64,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',
  };

  public readonly user: User = {
    id: crypto.randomUUID(),
    name: 'User',
    avatarUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDwmG52pVI5JZfn04j9gdtsd8pAGbqjjLswg&s',
  };
  $messages = signal<Message[]>([
    {
      author: this.#kendoIA,
      timestamp: new Date(),
      text: 'Hi! 👋 how I can help you today?',
    },
  ]);
  async generate(textInput: SendMessageEvent) {
    try {
      if (textInput.message.text && this.#model) {
        this.$messages.update((p) => [...p, textInput.message]);
        const parts = [
          {
            text: this.#prompt,
          },
          { text: textInput.message.text },
        ];

        const result = await this.#model.generateContent({
          contents: [{ role: 'user', parts }],
        });

        const response = result.response;
        const text = response.text();

        const message = {
          author: this.#kendoIA,
          timestamp: new Date(),
          text,
        };

        this.$messages.update((p) => [...p, message]);
      }
    } catch (e: any) {
      console.log(e);
    }
  }

  // async generate(textInput: string) {
  //   try {
  //     if (Text) {
  //       const parts = [
  //         {
  //           text: this.#prompt,
  //         },
  //         { text: textInput },
  //       ];

  //       const modelResult = await this.#model.generateContent({
  //         contents: [{ role: 'user', parts }],
  //       });
  //       const response = modelResult.response;
  //       const text = response.text();
  //       console.log(text);
  //     }
  //   } catch (e: any) {
  //     console.log(e);
  //   }
  // }

  constructor() {}
}
