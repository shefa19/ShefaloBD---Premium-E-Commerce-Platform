<div align="center">

  <h1>🛍️ ShefaloBD - Premium E-Commerce Platform</h1>
  <p><strong>A Next-Generation, High-Performance Full-Stack E-Commerce Experience</strong></p>

  <p>
    <a href="#-tech-stack--technologies">
      <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    </a>
    <a href="#-tech-stack--technologies">
      <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    </a>
    <a href="#-tech-stack--technologies">
      <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    </a>
    <a href="#-tech-stack--technologies">
      <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    </a>
    <a href="#-tech-stack--technologies">
      <img src="https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
    </a>
    <a href="#-tech-stack--technologies">
      <img src="https://img.shields.io/badge/Motion-Framer-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Motion" />
    </a>
  </p>

  <br />

  <img src="https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=1200&q=80" alt="ShefaloBD E-Commerce Platform Banner" width="100%" style="border-radius: 12px;" />

</div>

<br />

---

## 📌 Overview

**ShefaloBD** is a modern, feature-rich full-stack e-commerce web application engineered for lightning-fast shopping, real-time inventory synchronization, flash deal countdowns, secure user authentication, and comprehensive admin dashboard control.

---

## ✨ Features

### 🛒 Customer Experience
- **Interactive Product Catalog**: Real-time category filtering, instant search, price sorting, stock level badges, and rich product detail modals.
- **Urgent Flash Sales**: Timed promotion banner featuring live dynamic countdown clocks and special discount labels.
- **Dynamic Cart & Wishlist**: Interactive sliding cart drawer, coupon code redemption, real-time total calculator, and saved favorites.
- **Streamlined Checkout**: Seamless multi-address management, customer contact information setup, and instant order confirmation flow.
- **User Dashboard & Device Profile Upload**: Complete user profile management, historical order tracking, address book, and direct device profile photo uploads with client-side canvas image compression.

### 🛡️ Admin Management Panel
- **Product Catalog Management**: Add, update, or soft-delete products with multi-image gallery support.
- **Orders & Inventory Management**: Live order processing pipeline with status badges (`Pending`, `Processing`, `Delivered`, `Cancelled`).
- **User Role Administration**: View user accounts and toggle admin access privileges (`admin` / `user`).
- **Promotions & Flash Deals Engine**: Create custom discount vouchers and manage timed flash sale products.
- **Automated Database Seeder**: Built-in sample dataset seeder for quick database population.

---

## 🛠️ Tech Stack & Technologies

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Frontend Framework** | ![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white) |
| **Build System** | ![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=flat-square&logo=vite&logoColor=white) |
| **Styling & UI** | ![TailwindCSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) ![Lucide](https://img.shields.io/badge/Lucide_Icons-F34F29?style=flat-square&logo=git&logoColor=white) |
| **Animations** | ![Motion](https://img.shields.io/badge/Motion-0055FF?style=flat-square&logo=framer&logoColor=white) |
| **Backend & Database** | ![Firebase](https://img.shields.io/badge/Firebase_Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black) ![Auth](https://img.shields.io/badge/Firebase_Auth-DD2C00?style=flat-square&logo=firebase&logoColor=white) |
| **Server Engine** | ![Node.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white) ![esbuild](https://img.shields.io/badge/esbuild-FFCF00?style=flat-square&logo=esbuild&logoColor=black) |

---

## 📁 Directory Structure

```
shefalo-bd/
├── 📁 src/
│   ├── 📁 components/       # UI Components (Navbar, AdminPanel, AuthModal, CartDrawer, etc.)
│   ├── 📁 context/          # React Context API (AuthContext, CartContext)
│   ├── 📁 lib/              # Firebase configuration & sample data seeder
│   ├── 📁 types/            # TypeScript interface definitions
│   ├── 📄 App.tsx           # Main application shell
│   ├── 📄 main.tsx          # React application entry point
│   └── 📄 index.css         # Global Tailwind CSS directives
├── 📁 public/               # Static assets
├── 📄 firebase-applet-config.json # Firebase runtime settings
├── 📄 firestore.rules       # Security rules for Firestore database
├── 📄 package.json          # Project dependencies & scripts
├── 📄 tsconfig.json         # TypeScript config
├── 📄 vite.config.ts        # Vite configuration
└── 📄 README.md             # Project documentation
```

---

## 🚀 Quick Start Guide

Follow these steps to run the application locally on your machine.

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun**

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/shefalobd.git
cd shefalobd
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the project root:
```env
PORT=3000
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 🔑 Demo Admin Credentials

To access and test the **Admin Management Panel**:
- **Email**: `name@example.com`
- **Password**: `abcd1234`

*(💡 Tip: Click "Quick Fill" on the login modal to auto-populate the admin credentials).*

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
