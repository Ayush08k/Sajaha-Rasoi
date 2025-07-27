import { Component, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  senderName: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  listingId = signal<string>('');
  otherUserName = signal<string>('');
  messages = signal<ChatMessage[]>([]);
  newMessage = signal<string>('');

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.listingId.set(this.route.snapshot.paramMap.get('id') || '');
    
    // Mock data based on listing ID
    const mockData = this.getMockChatData(this.listingId());
    this.otherUserName.set(mockData.otherUserName);
    this.messages.set(mockData.messages);
    
    // Scroll to bottom after view is initialized
    setTimeout(() => this.scrollToBottom(), 100);
  }

  getMockChatData(listingId: string) {
    const chatData = {
      '1': {
        otherUserName: 'Rajesh Kumar',
        messages: [
          {
            id: '1',
            text: 'Hi! I saw your paneer listing. Is it still available?',
            timestamp: new Date(Date.now() - 300000), // 5 minutes ago
            isOwn: true,
            senderName: 'You'
          },
          {
            id: '2',
            text: 'Yes, it\'s fresh paneer made this morning. Very good quality!',
            timestamp: new Date(Date.now() - 240000), // 4 minutes ago
            isOwn: false,
            senderName: 'Rajesh Kumar'
          },
          {
            id: '3',
            text: 'Great! Can I come pick it up in 30 minutes?',
            timestamp: new Date(Date.now() - 180000), // 3 minutes ago
            isOwn: true,
            senderName: 'You'
          },
          {
            id: '4',
            text: 'Perfect! I\'ll be here. My shop is near the main market.',
            timestamp: new Date(Date.now() - 120000), // 2 minutes ago
            isOwn: false,
            senderName: 'Rajesh Kumar'
          }
        ]
      }
    };

    return chatData[listingId as keyof typeof chatData] || {
      otherUserName: 'Unknown User',
      messages: []
    };
  }

  onBack() {
    this.router.navigate(['/home']);
  }

  onSendMessage() {
    const messageText = this.newMessage().trim();
    if (messageText) {
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        text: messageText,
        timestamp: new Date(),
        isOwn: true,
        senderName: 'You'
      };

      this.messages.update(messages => [...messages, newMsg]);
      this.newMessage.set('');
      
      // Scroll to bottom
      setTimeout(() => this.scrollToBottom(), 50);
      
      // Simulate response after 2 seconds
      setTimeout(() => this.simulateResponse(), 2000);
    }
  }

  simulateResponse() {
    const responses = [
      'Thanks for your message!',
      'I\'ll be ready for pickup.',
      'See you soon!',
      'Let me know when you arrive.',
      'The item is ready for you.'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const responseMsg: ChatMessage = {
      id: Date.now().toString(),
      text: randomResponse,
      timestamp: new Date(),
      isOwn: false,
      senderName: this.otherUserName()
    };

    this.messages.update(messages => [...messages, responseMsg]);
    setTimeout(() => this.scrollToBottom(), 50);
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }

  onMessageInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.newMessage.set(input.value);
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendMessage();
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  isNewDay(currentMsg: ChatMessage, previousMsg: ChatMessage | null): boolean {
    if (!previousMsg) return true;
    
    const currentDate = new Date(currentMsg.timestamp).toDateString();
    const previousDate = new Date(previousMsg.timestamp).toDateString();
    
    return currentDate !== previousDate;
  }

  formatDate(date: Date): string {
    const today = new Date().toDateString();
    const messageDate = new Date(date).toDateString();
    
    if (messageDate === today) {
      return 'Today';
    } else {
      return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
      });
    }
  }
}
