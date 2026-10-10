# ShopNest — Full-Stack E-Commerce Platform

ShopNest is a production-style BTech full-stack e-commerce application built with **React + Vite + Tailwind CSS** on the frontend and **Spring Boot + Spring Security + JWT + JPA + MySQL** on the backend.

## Highlights
- JWT authentication with USER/ADMIN roles
- Product catalogue with search, category, price and stock filters
- Sorting and pagination
- Cart and wishlist
- Wishlist → cart flow removes the item from wishlist
- Checkout with Indian Rupee pricing
- ₹50 delivery charge below ₹1,000; free delivery at ₹1,000+
- Inventory deducted at order placement and restored on cancellation/approved return
- Customer order tracking
- Customer cancellation before shipping
- 30-day return window after delivery
- Admin dashboard, users, roles, products, categories and orders
- Controlled order lifecycle: PLACED → SHIPPED → DELIVERED
- Return lifecycle: DELIVERED → RETURN REQUESTED → RETURNED
- Responsive UI with accessible empty/loading/error states
- Cloudinary-ready image upload scaffolding (optional)

## Tech Stack
**Frontend:** React 18, React Router, Axios, Tailwind CSS, Lucide React, Vite

**Backend:** Java 17+, Spring Boot, Spring Security, JWT, Spring Data JPA, MySQL, Bean Validation

## Run locally
### Backend
1. Open `backend/src/main/resources/application.properties`.
2. Keep your working Aiven/MySQL configuration or provide the same values through environment variables.
3. Start with `mvn spring-boot:run`.
4. Backend runs on `http://localhost:8088`.

### Frontend
1. Open `frontend`.
2. Install dependencies with `npm.cmd install` on Windows PowerShell if `npm` is blocked by execution policy.
3. Run `npm.cmd run dev`.
4. Frontend runs on `http://localhost:5173`.

## Important
- Do **not** commit database passwords, JWT secrets or Cloudinary secrets.
- This package uses environment-variable placeholders in `application.properties`. Copy your existing working database/JWT configuration into your local project; do not reset the existing database.
- Cloudinary is optional. Product image URLs can be used without configuring it.

## Demo accounts
The development data seeder provides the project demo accounts. If your existing database already contains users, keep that database intact.

## Architecture
`React UI → Axios REST client → Spring Boot REST API → Service layer → JPA repositories → MySQL/Aiven`
