# 🛒 GreenCart – Eco-Friendly Online Grocery Store

GreenCart is a full-stack web application for eco-conscious online grocery shopping. Built with the MERN stack (MongoDB, Express.js, React, Node.js), it allows users to browse, purchase, and manage sustainable products easily.

## 🌐 Live Demo

[Click here to view the deployed project](https://g-cart-dun.vercel.app/)





## 🚀 Features

- User Authentication (Sign up/Login)
- Add to Cart & Wishlist
- Admin Dashboard
- Product Categories & Search
- Online & COD Payment (Stripe)
- Order History and Tracking
- Mobile-Responsive UI

## 🛠️ Tech Stack

- **Frontend**: React, Redux, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Atlas)
- **Authentication**: JWT
- **Deployment**: Vercel 

## 📂 Project Structure


```bash
greencart/
│
├── client/               # React frontend
│   ├── public/           # Static assets
│   └── src/              # React components and pages
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route-based pages
│       ├── redux/        # Redux setup
│       ├── App.js        # Main App entry
│       └── index.js      # React DOM renderer
│
├── server/               # Node.js + Express backend
│   ├── controllers/      # Route controller logic
│   ├── models/           # Mongoose models (MongoDB)
│   ├── routes/           # API routes
│   ├── utils/            # Helper functions
│   ├── middleware/       # JWT auth, error handling, etc.
│   └── server.js         # Entry point for backend server
│
├── .env                  # Environment variables
├── package.json          # Project metadata and scripts
└── README.md             # Project documentation


