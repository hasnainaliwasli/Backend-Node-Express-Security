# 🔐 Security Mastery: Full-Stack Authentication & Protection

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Backend-Express.js-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Security](https://img.shields.io/badge/Security-OWASP%20Focused-green?style=for-the-badge)](https://owasp.org/)
[![Vercel](https://img.shields.io/badge/Deployment-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

A comprehensive full-stack application demonstrating modern web security best practices. This project serves as a robust foundation for implementing JWT authentication, CSRF protection, and defensive headers in a Next.js and Express.js environment.

---

## 🚀 Features

### 🛡️ Backend Security (Express)
- **JWT Authentication**: Secure stateless authentication using JSON Web Tokens.
- **CSRF Protection**: Comprehensive defense against Cross-Site Request Forgery using `csurf`.
- **Defensive Headers**: Standardized security headers via `Helmet`.
- **Rate Limiting**: Protection against Brute Force and DoS attacks using `express-rate-limit`.
- **Password Hashing**: Industry-standard encryption with `bcryptjs`.
- **CORS Config**: Fine-grained Cross-Origin Resource Sharing control.

### 🎨 Frontend Excellence (Next.js)
- **Fluid UI**: Responsive and premium interface designed for a modern user experience.
- **Secure API Integration**: Best practices for handling tokens and CSRF markers in a frontend client.
- **Dynamic Routing**: Optimized page transitions and state management.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Security**: JWT, Bcrypt, CSURF, Helmet
- **Platform**: Vercel ready 🚀

---

## 📂 Project Structure

```text
├── backend/ # Express server with security middleware
│   ├── src/ # Logic & components
│   ├── server.js # Main entry point
│   └── vercel.json # Backend deployment config
└── frontend/ # Next.js application
    ├── app/ # Next.js App Router
    └── next.config.ts # Frontend config
```

---

## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
```

### 2. Setup Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🌐 Deployment

### Vercel Deployment
This project is pre-configured for Vercel.
1. Connect your GitHub repository to Vercel.
2. The `frontend/` will be auto-detected as a Next.js app.
3. Use the `backend/` folder for the API service (routing handled via `vercel.json`).

> [!IMPORTANT]
> Ensure you set your `JWT_SECRET` and `FRONTEND_URL` environment variables in the Vercel dashboard.

---

## 📜 License
This project is licensed under the ISC License.

---
*Built with ❤️ for secure web development.*
