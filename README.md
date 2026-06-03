# ShopNest 🛍️

A full-stack ecommerce platform where users can shop and sellers can manage their own stores.

## Live Demo
🔗 [Coming soon]

## Features

**Buyers**
- Register / login with email activation
- Browse products and events
- Add to cart and wishlist
- Checkout with Stripe payments
- Track orders

**Sellers**
- Register a shop with image upload
- Create and manage products and events
- Create coupon codes
- View and manage orders

## Tech Stack

**Frontend**
- React 18
- Redux Toolkit
- Tailwind CSS
- Material UI
- Stripe.js
- Axios

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (image uploads)
- Nodemailer (email)
- Stripe (payments)

## Getting Started

### Prerequisites
- Node.js v16+
- MongoDB
- Cloudinary account
- Stripe account (test keys work)
- Gmail App Password

### Installation

1. Clone the repo
   ```bash
   git clone https://github.com/YOURUSERNAME/ShopNest.git
   cd ShopNest
   ```

2. Install backend dependencies
   ```bash
   cd Backend
   npm install
   ```

3. Install frontend dependencies
   ```bash
   cd ../Frontend
   npm install
   ```

4. Create `Backend/config/.env` and add your values
   ```env
   PORT=8000
   DB_URL=mongodb://localhost:27017/ShopNest

   JWT_SECRET_KEY=your_jwt_secret
   JWT_EXPIRES=7d
   COOKIE_EXPIRES=7

   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SERVICE=gmail
   SMTP_MAIL=your_email@gmail.com
   SMTP_PASSWORD=your_gmail_app_password

   CLOUDINARY_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   STRIPE_API_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

5. Create `Frontend/.env`
   ```env
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

6. Create uploads folder
   ```bash
   mkdir Backend/uploads
   ```

### Running Locally

Start the backend (in one terminal):
```bash
cd Backend
npm run start:dev
```

Start the frontend (in another terminal):
```bash
cd Frontend
npm start
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Environment Variables

| Variable | Description |
|---|---|
| `DB_URL` | MongoDB connection string |
| `JWT_SECRET_KEY` | Secret key for JWT tokens |
| `CLOUDINARY_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SMTP_MAIL` | Gmail address for sending emails |
| `SMTP_PASSWORD` | Gmail App Password |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_API_KEY` | Stripe publishable key |

## License
MIT
