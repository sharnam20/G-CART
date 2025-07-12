# 🛒 GreenCart – Eco-Friendly Online Grocery Store

GreenCart is a full-stack web application for eco-conscious online grocery shopping. Built with the MERN stack (MongoDB, Express.js, React, Node.js), it allows users to browse, purchase, and manage sustainable products easily.

## 🌐 Live Demo

[Click here to view the deployed project](https://g-cart-dun.vercel.app/)

## 📸 Screenshots

![Homepage](<img width="1848" height="994" alt="image" src="https://github.com/user-attachments/assets/7b019a5f-20d5-4be2-999e-db78e3739b02" />
)
![Cart Page](<img width="1866" height="988" alt="image" src="https://github.com/user-attachments/assets/aaadfee9-636f-4ca5-b026-14e0f82641a2" />
)
![Place Order Page](<img width="1843" height="872" alt="image" src="https://github.com/user-attachments/assets/39f4fbd9-ac23-497c-a26a-6544240d12de" />
)
![Seller  Page](<img width="1679" height="1010" alt="image" src="https://github.com/user-attachments/assets/1552c58f-ea0d-4787-922a-ac93431ea0b9" />
)



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


