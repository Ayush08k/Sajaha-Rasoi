Saajha Rasoi (The Shared Kitchen)
Tagline: Your Surplus, Their Staple. Waste Less, Earn More.

📢 Project Overview		   
This project is a submission for Tutedude’s Web Development Hackathon 1.0 – Solving for Street Food.

Current Time & Location: Saturday, July 26, 2025, 8:50 PM IST, Kharkhoda, Haryana, India.

The Problem
India's vibrant street food economy faces a critical, often overlooked challenge: the daily sourcing of raw materials. Street food vendors operate on thin margins, and any unsold perishable goods at the end of the day—like chopped vegetables, paneer, or prepared batters—translate directly into financial loss and food waste. Simultaneously, another nearby vendor might be running low on that exact item, forcing them to close early or make a costly trip to a distant market.

The Solution: Saajha Rasoi
Saajha Rasoi is a mobile-first web application designed to tackle this inefficiency head-on. It creates a hyper-local, peer-to-peer marketplace where vendors can sell their surplus perishable materials to other vendors in their immediate vicinity. This creates a win-win-win scenario:

Sellers recover costs on items that would have been wasted.

Buyers source urgently needed materials quickly and at a discounted price.

The community benefits from reduced food waste.

✨ Key Features
Real-time Map View: A (simulated) live map showing available surplus items nearby for instant discovery.

Simple Anonymous Login: Quick access to the app without complex registration, perfect for the target audience.

Effortless Listing Creation: A guided, multi-step form using Angular Material Stepper to post surplus items in under a minute.

Dynamic Item Details: A sleek Material Bottom Sheet provides item details without navigating away from the map.

Clean, Mobile-First UI: Built with Tailwind CSS and Angular Material for a modern, responsive, and intuitive user experience.

Scalable Firebase Backend: Leverages Firebase for authentication, a real-time database (Firestore), and storage.

🛠️ Tech Stack
Frontend Framework: Angular 19+

UI Libraries:

Angular Material: For robust, pre-built UI components like Steppers, Bottom Sheets, and Toolbars.

Tailwind CSS: For rapid, utility-first styling and a clean, modern look.

Backend-as-a-Service (BaaS): Google Firebase

Authentication: Firebase Authentication (Anonymous Sign-in)

Database: Cloud Firestore (Real-time NoSQL database)

Storage: Firebase Cloud Storage (for image uploads)

State Management: RxJS

🚀 Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

Prerequisites
Node.js (v16 or later)

Angular CLI (npm install -g @angular/cli)

A Google account to create a Firebase project.

Installation & Setup
Clone the repository:

git clone https://github.com/your-username/saajha-rasoi.git
cd saajha-rasoi

Install NPM packages:

npm install

Set up Firebase:

Go to the Firebase Console and create a new project.

Add a new Web App (</>) to your project.

Firebase will provide you with a firebaseConfig object. Copy this object.

Open src/environments/environment.ts in your project and paste your firebaseConfig object there.

Enable Firebase Services:

In the Firebase Console, navigate to Authentication -> Sign-in method and enable Anonymous sign-in.

Navigate to Firestore Database, create a new database, and start in Test Mode. This will allow open read/write access for development.

Navigate to Storage, click "Get Started," and follow the prompts to enable it.

Run the development server:

ng serve

Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

📂 Project Structure
The project follows a standard Angular CLI structure, with a focus on modularity.

/src
|-- /app
|   |-- /components
|   |   |-- chat/
|   |   |-- create-listing/
|   |   |-- listing-detail-sheet/
|   |   |-- login/
|   |   |-- map-home/
|   |-- /guards
|   |   |-- auth.guard.ts      # Protects routes from unauthenticated access
|   |-- app-routing.module.ts  # Defines all application routes
|   |-- app.component.ts
|   |-- app.module.ts          # Main application module
|-- /assets
|-- /environments
|   |-- environment.ts         # Firebase config goes here
|-- index.html
|-- main.ts
|-- styles.css                 # Global styles and Tailwind directives
