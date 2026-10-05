# Vinstagram 📸

This project is a social media application, inspired by Instagram, built with a modern tech stack including React, TypeScript, Node.js, and Express.

## 🌟 Badges

| Build Status | Version | License |
|:------------:|:-------:|:-------:|
| [![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](N/A) | [![Version](https://img.shields.io/badge/version-1.0.0-blue)](N/A) | [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) |

## 📝 Description

Vinstagram is a full-stack social media application that allows users to share photos, follow other users, like posts, and comment on them. It features a client-side built with React and Vite, and a robust backend API built with Node.js, Express, and TypeScript, leveraging Prisma for database management and Cloudinary for image storage.

## 📚 Table of Contents

- [Project Title & Badges](#vinstagram-📸)
- [Description](#description)
- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)
- [Important Links](#important-links)
- [Footer](#footer)

## ✨ Features

- **User Authentication:** Secure registration, login, and password reset functionality.
- **Post Management:** Users can create, view, edit, and delete posts with image uploads.
- **Social Interactions:** Follow/unfollow users, like posts, and comment on posts.
- **User Profiles:** View user profiles, including their posts, follower/following counts, and basic information.
- **Image Uploads:** Integration with Cloudinary for efficient image storage and retrieval.
- **Real-time Updates:** Optimized for a dynamic user experience.
- **Responsive Design:** Built with Tailwind CSS for a consistent look across devices.

## 🚀 Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router DOM, Axios, React Hot Toast
- **Backend:** Node.js, TypeScript, Express, Prisma, Bcrypt, JWT, Nodemailer, Multer, Cors, Dotenv
- **Database:** PostgreSQL (via Prisma Neon Adapter)
- **Image Storage:** Cloudinary

## 💡 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Anup4944/vinstagram.git
   cd vinstagram
   ```

2. **Set up environment variables:**
   Create `.env` files in the root directory and in the `server/` directory. Populate them with your database credentials, Cloudinary API keys, JWT secret, and client URL.

   **Example `.env` (root):**
   ```dotenv
   CLIENT_URL=http://localhost:5173
   ```

   **Example `.env` (server/):**
   ```dotenv
   DATABASE_URL=postgresql://user:password@host:port/database?schema=public
   JWT_SECRET=your_jwt_secret_key
   CLIENT_URL=http://localhost:5173
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your_email@example.com
   SMTP_PASS=your_email_password
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Install dependencies:**
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

4. **Generate Prisma client:**
   ```bash
   # In the server directory
   npm run postinstall
   ```

5. **Start the development servers:**
   ```bash
   # In the client directory
   npm run dev

   # In the server directory
   npm run dev
   ```

## ▶️ Usage

This application is a social media platform where users can:

1.  **Register/Login:** Sign up for a new account or log in to an existing one.
2.  **View Feed:** See posts from users they follow and their own posts on the main feed.
3.  **Create Posts:** Upload images and write captions to create new posts.
4.  **View Profiles:** Navigate to user profiles to see their posts and follower/following information.
5.  **Interact with Posts:** Like posts, comment on posts, and view who liked a post.
6.  **Manage Profile:** Edit their profile information, change their password, or delete their account.

### Running the Application

1.  **Client:** `npm run dev` in the `client` directory.
2.  **Server:** `npm run dev` in the `server` directory.

Access the application in your browser, typically at `http://localhost:5173` for the client and `http://localhost:5000` for the server API.

## 📂 Project Structure

```
vinstagram/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── context/
│   │   ├── providers/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── index.tsx
│   │   └── main.tsx
│   ├── .eslintrc.cjs
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── server/
│   ├── config/
│   ├── contollers/
│   ├── generated/prism/
│   ├── middleware/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── routes/
│   ├── types/
│   ├── utils/
│   ├── .env
│   ├── nodemon.json
│   ├── package.json
│   ├── prisma.config.ts
│   ├── rest.http
│   └── server.ts
└── README.md
```

## 🔌 API Reference

The backend API is built with Express and uses RESTful principles. Key endpoints include:

-   **Auth Routes (`/api/auth`)**
    -   `POST /register`: Register a new user.
    -   `POST /login`: Log in an existing user.
    -   `POST /forgot-password`: Request a password reset email.
    -   `POST /reset-password`: Reset password with a token.

-   **User Routes (`/api/users`)**
    -   `GET /`: Get all users (excluding the current user).
    -   `GET /:id`: Get a specific user's profile.
    -   `PUT /profile/:id`: Update a user's profile.
    -   `DELETE /profile/:id`: Delete a user's account.
    -   `PUT /change-password`: Change the current user's password.
    -   `POST /follow/:id`: Follow or unfollow a user.
    -   `GET /:userId/followers`: Get a list of followers for a user.
    -   `GET /:userId/following`: Get a list of users a user is following.

-   **Post Routes (`/api/posts`)**
    -   `GET /`: Get all posts (protected).
    -   `GET /feed`: Get posts for the current user's feed.
    -   `GET /user/:id`: Get all posts by a specific user.
    -   `POST /`: Create a new post.
    -   `PUT /:id`: Update an existing post.
    -   `DELETE /:id`: Delete a post.
    -   `POST /:postId/like`: Toggle like on a post.
    -   `POST /:postId/comments`: Add a comment to a post.
    -   `DELETE /comments/:commentId`: Delete a comment.
    -   `GET /:postId/likes`: Get users who liked a post.
    -   `PUT /comments/:commentId`: Update a comment.

-   **Upload Routes (`/api/upload`)**
    -   `POST /`: Upload a single image file.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🔗 Important Links

-   **Live Demo:** [(https://vinstagram-two.vercel.app/)
-   **Author Profile:** [Anup4944](https://github.com/Anup4944)

## 🚀 Footer

© 2023 **vinstagram**

-   [**Repository:** vinstagram](https://github.com/Anup4944/vinstagram)
-   **Author:** Anup
-   **Contact:** anup4944@gmail.com

Fork this project on GitHub, give it a ⭐️ if you found it useful, and feel free to open an issue for any suggestions or problems!


---
**<p align="center">Generated by [ReadmeCodeGen](https://www.readmecodegen.com/)</p>**
