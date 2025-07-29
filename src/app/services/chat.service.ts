// import { Injectable, inject } from '@angular/core';
// import { Firestore, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, Timestamp } from '@angular/fire/firestore';
// import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
// import { AuthService } from './auth.service';
// import { Observable } from 'rxjs';

// export interface ChatMessage {
//   id?: string;
//   chatId: string;
//   senderId: string;
//   senderName: string;
//   recipientId: string;
//   text?: string;
//   imageUrl?: string;
//   messageType: 'text' | 'image';
//   timestamp: Timestamp | Date;
//   read: boolean;
// }

// export interface Chat {
//   id?: string;
//   participants: string[];
//   participantNames: { [userId: string]: string };
//   listingId: string;
//   listingName: string;
//   lastMessage?: string;
//   lastMessageTimestamp?: Timestamp | Date;
//   unreadCount: { [userId: string]: number };
//   createdAt: Timestamp | Date;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class ChatService {
//   private firestore: Firestore = inject(Firestore);
//   private storage: Storage = inject(Storage);
//   private authService: AuthService = inject(AuthService);

//   /**
//    * Creates or gets an existing chat for a listing between two users
//    */
//   async createOrGetChat(listingId: string, listingName: string, otherUserId: string, otherUserName: string): Promise<string> {
//     const currentUser = this.authService.getCurrentUser();
//     if (!currentUser) {
//       throw new Error('User must be authenticated to create a chat');
//     }

//     const participants = [currentUser.uid, otherUserId].sort(); // Sort for consistent chat IDs
//     const chatId = `${listingId}_${participants.join('_')}`;

//     try {
//       // Check if chat already exists using a query instead of creating directly
//       const chatsRef = collection(this.firestore, 'chats');
//       const existingChatQuery = query(
//         chatsRef,
//         where('participants', 'array-contains', currentUser.uid)
//       );

//       // For now, just create the chat ID and let the messages collection handle the chat
//       // This is a simplified approach - in production you'd want to check for existing chats
//       return chatId;

//     } catch (error) {
//       console.error('Error creating/getting chat:', error);
//       return chatId; // Return the chat ID anyway
//     }
//   }

//   /**
//    * Sends a text message in a chat
//    */
//   async sendTextMessage(chatId: string, recipientId: string, text: string): Promise<void> {
//     const currentUser = this.authService.getCurrentUser();
//     if (!currentUser) {
//       throw new Error('User must be authenticated to send messages');
//     }

//     const message: Omit<ChatMessage, 'id'> = {
//       chatId,
//       senderId: currentUser.uid,
//       senderName: currentUser.displayName || 'Anonymous',
//       recipientId,
//       text: text.trim(),
//       messageType: 'text',
//       timestamp: serverTimestamp(),
//       read: false
//     };

//     const messagesRef = collection(this.firestore, 'messages');
//     await addDoc(messagesRef, message);

//     // Update chat with last message info
//     await this.updateChatLastMessage(chatId, text.trim(), recipientId);
//   }

//   /**
//    * Sends an image message in a chat
//    */
//   async sendImageMessage(chatId: string, recipientId: string, imageFile: File): Promise<void> {
//     const currentUser = this.authService.getCurrentUser();
//     if (!currentUser) {
//       throw new Error('User must be authenticated to send messages');
//     }

//     // Upload image first
//     const imageUrl = await this.uploadChatImage(imageFile, currentUser.uid);

//     // const message: Omit<ChatMessage, 'id'> = {
//     //   chatId,
//     //   senderId: currentUser.uid,
//     //   senderName: currentUser.displayName || 'Anonymous',
//     //   recipientId,
//     //   imageUrl,
//     //   messageType: 'image',
//     //   // timestamp: serverTimestamp(),
//     //   read: false
//     // };

//     const messagesRef = collection(this.firestore, 'messages');
//     await addDoc(messagesRef,);

//     // Update chat with last message info
//     await this.updateChatLastMessage(chatId, '📷 Image', recipientId);
//   }

//   /**
//    * Gets real-time messages for a chat
//    */
//   getChatMessages(chatId: string): Observable<ChatMessage[]> {
//     return new Observable(observer => {
//       const messagesRef = collection(this.firestore, 'messages');
//       const q = query(
//         messagesRef,
//         where('chatId', '==', chatId),
//         orderBy('timestamp', 'asc')
//       );

//       return onSnapshot(q, (snapshot) => {
//         const messages: ChatMessage[] = snapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         } as ChatMessage));
        
//         observer.next(messages);
//       }, (error) => {
//         observer.error(error);
//       });
//     });
//   }

//   /**
//    * Gets all chats for the current user
//    */
//   getUserChats(): Observable<Chat[]> {
//     const currentUser = this.authService.getCurrentUser();
//     if (!currentUser) {
//       throw new Error('User must be authenticated to get chats');
//     }

//     return new Observable(observer => {
//       const chatsRef = collection(this.firestore, 'chats');
//       const q = query(
//         chatsRef,
//         where('participants', 'array-contains', currentUser.uid),
//         orderBy('lastMessageTimestamp', 'desc')
//       );

//       return onSnapshot(q, (snapshot) => {
//         const chats: Chat[] = snapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         } as Chat));
        
//         observer.next(chats);
//       }, (error) => {
//         observer.error(error);
//       });
//     });
//   }

//   /**
//    * Marks messages as read for the current user
//    */
//   async markMessagesAsRead(chatId: string): Promise<void> {
//     const currentUser = this.authService.getCurrentUser();
//     if (!currentUser) return;

//     // This would require a more complex query to update multiple documents
//     // For now, we'll leave this as a placeholder for future implementation
//     console.log('Mark messages as read for chat:', chatId);
//   }

//   /**
//    * Uploads a chat image to Firebase Storage
//    */
//   private async uploadChatImage(file: File, userId: string): Promise<string> {
//     const timestamp = Date.now();
//     const fileName = `chats/${userId}/${timestamp}_${file.name}`;
//     const storageRef = ref(this.storage, fileName);
    
//     const snapshot = await uploadBytes(storageRef, file);
//     return await getDownloadURL(snapshot.ref);
//   }

//   /**
//    * Updates chat document with last message information
//    */
//   private async updateChatLastMessage(chatId: string, lastMessage: string, recipientId: string): Promise<void> {
//     const currentUser = this.authService.getCurrentUser();
//     if (!currentUser) return;

//     // This would update the chat document with the last message
//     // For simplicity, we're skipping this implementation for now
//     console.log('Update chat last message:', chatId, lastMessage);
//   }
// }
