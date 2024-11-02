import { Injectable, signal } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment.development';
import {
  Message,
  SendMessageEvent,
  User,
} from '@progress/kendo-angular-conversational-ui';
import { marked } from 'marked';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  readonly LOCAL_STORAGE_KEY = 'chat_messages';
  #generativeAi = new GoogleGenerativeAI(environment.gemini_key);

  #prompt =
    'You are a business owner using StockApp (an application that helps run businesses and manage inventory), provide a guide on how to use this product ' +
    'links for resources. Here are some of the guide info incase a user asks the specific questions i.e How to add a product? Click Stock Setup Click Add Product Fill the details (name, quantity, buying price, selling price) and save.How to edit a product?Click Stock SetupClick the item Click edit Update the details and save. How can I  view my product history?Click Stock Setup Click the item Click product history You can check the sales, stock-in and bad stock histories for each month of the current year. You can the year too.How to do stock taking? Click Stock Setup Click count Update the physical count Click ok. It will change color to green.How to import stock items? Click Stock Setup Click import items Click from excel (if you are importing from excel) Click from other shop (if you are importing from another shop and select the shop)  Select the items and click submit. How to do stock-in or restocking? Click Stock-in and Orders Manager Click Add Stock-in Select the items Update the quantities and save.How to add a supplier?  Click Stock-in and Orders Manager Click Suppliers’ Manager Click Add New You can add through importing from your phone’s contacts, from excel, from another shop or by filling the name and number. Make sure the number is unique to each supplier. How to make a sale? Click Sales and Orders Manager Click Add Sales Select the items Update the quantities, mode of payment, customer name then save How to add a customer? Click Sales and Orders Manager Click Customers Manager Click Add New You can add through importing from your phone’s contacts, from excel, from another shop or by filling the name and number. Make sure the number is unique to each customer. How to view sales reports? Click Sales and Orders Manager Click the period you want (daily, weekly or monthly) Click the download icon on your top right corner Select either PDF or Excel. You can export for further analysis How to share receipts to customers? Click Sales and Orders Manager Click the date the items were sold to that customer Long press the receipt and you will see multiple options Click share and select where to share to How to add an expense? Click Profit and Expenses Manager Click Expenses Set the expenses categories and save the Click Add New Select the category, update the amount and save . How to view profit report? Click Profit and Expenses Manager Click the period you want to check (daily, weekly or monthly) You should see it here. To export the report, click the download icon on your to right corner How to view product comparison? Click Profit and Expenses Manager Click Product Comparison It sows comparison for the current month. You can change the month or year How to balance the Cashflow? Click Cashflow Manager Click Add cash-in Select category Update the exact amount you have as the negative figure and save. How to add a Store Attendant/Manager? Click My Attendants Click Add New Select if it is a manager or attendant Fill the name and password Set the permissions and save They will login using the UserID generated by the system AND NOT THEIR NAMES How to edit/change password/delete an attendant or manager Click My Attendants Click the specific attendant/Manager You can the password, name or even delete them. Also, you can as well update their permissions including locking them out How to make scription? Click Usage Manager Click end Usage Select the pack you want Select the modf payment Go ahead and pay. Once you pay, it should be immediately updated. If not,  gage us on WhatsApp easily wa.me/+ 22794549 How to edit profile Click the menu (the three lines on your top left corner next to Store Admin) Click edit profile Update the details and save changes How to customize the shop settings? Click the menu (the three lines on your top left corner next to Store Admin) Click my shops Click the shop You can click any feature and customize the settings like notifications, back up, receipt settings, barcodes, tax and so on How to clear shop data? Click the menu (the three lines on your top left corner next to Store Admin) Click the shop name Click storage analyzer Click clear data and you will receive a code to confirm this . Please be specific with the response provided . ';
    
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
      // Add user message to messages list
      if (textInput.message.text && this.#model) {
        this.$messages.update((p) => [...p, textInput.message]);

        // Add loading message
        const loadingMessage: Message = {
          author: this.#kendoIA,
          timestamp: new Date(),
          text: 'Loading...',
        };
        this.$messages.update((p) => [...p, loadingMessage]);

        const parts = [
          { text: this.#prompt },
          { text: textInput.message.text },
        ];

        // Generate response from AI model
        const result = await this.#model.generateContent({
          contents: [{ role: 'user', parts }],
        });

        // Remove loading message
        this.$messages.update((p) => p.filter((msg) => msg !== loadingMessage));

        // Add AI response to messages
        const response = result.response;
        const responseText = response.text();
        const formattedText = await marked(responseText);
        const message: Message = {
          author: this.#kendoIA,
          timestamp: new Date(),
          text: formattedText,
        };
        this.$messages.update((p) => [...p, message]);
      }
    } catch (e: any) {
      console.log(e);
    }
  }

  constructor() {}
}
