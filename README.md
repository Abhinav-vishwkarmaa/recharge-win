# RechargeWin Backend

A gamified recharge platform backend built with Node.js, Express.js, MySQL, and Sequelize. Users can perform simulated mobile recharges, earn lottery entries, coupons, and referral rewards.

## Features

- User registration and authentication with JWT
- Simulated mobile recharge system
- Lottery entries for successful recharges
- Coupon system for rewards
- Referral program with wallet credits
- Admin panel for managing users, coupons, lotteries, and winners
- Public endpoints for viewing approved winners
- Automated lottery expiration using node-cron

## Tech Stack

- **Language**: JavaScript (Node.js ES modules)
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT + bcryptjs
- **Validation**: Joi
- **File Upload**: Multer
- **Scheduler**: node-cron
- **Environment Management**: dotenv

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the required environment variables (see `.env` example)
4. Set up MySQL database and update connection details in `.env`
5. Run the server: `npm start` or `npm run dev` for development

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

### User
- `GET /api/v1/user/profile` - Get user profile
- `GET /api/v1/user/rewards` - Get user rewards (coupons and lotteries)

### Recharge
- `POST /api/v1/recharge/initiate` - Initiate recharge
- `POST /api/v1/recharge/verify` - Verify recharge payment

### Public
- `GET /api/v1/public/winners` - Get approved winners

### Admin
- `GET /api/v1/admin/dashboard/stats` - Dashboard statistics
- `GET /api/v1/admin/users` - Paginated user list
- `POST /api/v1/admin/coupons` - Create coupon
- `GET /api/v1/admin/lotteries/active` - Active lotteries
- `POST /api/v1/admin/winners/declare` - Declare winner
- `POST /api/v1/admin/winners/:winnerId/approve` - Approve winner
- `POST /api/v1/admin/winners/:winnerId/upload-poster` - Upload winner poster

## Database Schema

The application uses the following models:
- Users
- Recharges
- Lotteries
- Coupons
- UserCoupons
- Winners

Refer to the source code for detailed schema definitions.

## Environment Variables

- `PORT`: Server port (default: 3000)
- `DB_HOST`: MySQL host
- `DB_USER`: MySQL username
- `DB_PASS`: MySQL password
- `DB_NAME`: MySQL database name
- `JWT_SECRET`: JWT secret key

## Development

Run `npm run dev` to start the server with nodemon for automatic restarts on file changes.