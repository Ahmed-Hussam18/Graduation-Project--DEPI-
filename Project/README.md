# Electronics E-Commerce Website

A modern e-commerce website for electronics built with React, Bootstrap, and JSON Server Auth.

## 🌐 Live Site

[Visit the deployed site](https://front-end-oasd.vercel.app/)

## Features

- 🔐 **User Authentication** - Login and Sign Up pages with JSON Server Auth
- 🛒 **Shopping Cart** - Add, remove, and update items in cart
- ❤️ **Favourites** - Save your favorite products
- 🔍 **Search Functionality** - Search products by name or description
- 🎯 **Advanced Filtering** - Filter by category, price range, and rating
- 📱 **Responsive Design** - Beautiful UI built with Bootstrap

## Tech Stack

- **React** - Frontend framework
- **React Router** - Routing
- **Bootstrap & React Bootstrap** - UI components
- **JSON Server Auth** - Backend authentication
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

### Running the Application

You need to run two servers:

1. **Start the JSON Server** (in one terminal):

```bash
npm run server
```

This will start the JSON Server on `http://localhost:3001`

2. **Start the React Development Server** (in another terminal):

```bash
npm run dev
```

This will start the Vite dev server (usually on `http://localhost:5173`)

### Default Data

The application comes with sample electronics products including:

- Smartphones (iPhone, Samsung Galaxy)
- Laptops (MacBook, Dell XPS)
- Audio devices (Sony headphones, AirPods)
- Tablets (iPad, Samsung Galaxy Tab)
- Gaming consoles (PlayStation, Xbox, Nintendo Switch)
- Wearables (Apple Watch, Samsung Watch)
- Cameras (Canon, Sony)

## Design

This project features a custom UI/UX design created from scratch. The design prioritizes user experience with a clean, modern interface and responsive layout optimized for all devices.

## Project Structure

```
src/
├── components/       # Reusable components (Navbar, ProductCard, etc.)
├── pages/           # Page components (Home, Login, SignUp, Cart, Favourites)
├── context/         # React Context providers (Auth, Cart, Favourites)
├── utils/           # Utility functions (API calls)
└── App.jsx          # Main app component with routing
```

## Usage

1. **Sign Up**: Create a new account on the Sign Up page
2. **Login**: Log in with your credentials
3. **Browse Products**: View all electronics on the home page
4. **Search**: Use the search bar to find specific products
5. **Filter**: Use filters to narrow down products by category, price, or rating
6. **Add to Cart**: Click "Add to Cart" on any product
7. **Add to Favourites**: Click the heart icon on products
8. **View Cart**: Navigate to Cart page to manage your items
9. **View Favourites**: See all your favorite products

## API Endpoints

The JSON Server provides the following endpoints:

- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /products` - Get all products
- `GET /carts?userId={id}` - Get user's cart
- `POST /carts` - Add item to cart
- `PATCH /carts/{id}` - Update cart item
- `DELETE /carts/{id}` - Remove from cart
- `GET /favourites?userId={id}` - Get user's favourites
- `POST /favourites` - Add to favourites
- `DELETE /favourites/{id}` - Remove from favourites

## Notes

- User authentication is handled by JSON Server Auth
- Cart and favourites are user-specific (requires login)
- All data is stored in `db.json`
- The server automatically restarts when `db.json` changes

## License

© 2025 Ahmed Hussam. This project is open source and available for educational purposes.
