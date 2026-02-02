Admin API (overview)

Environment
- Set `MONGO_URI` to your MongoDB connection string (example in .env):
  MONGO_URI="mongodb+srv://toan226464_db_user:123@webgameblock.qhqxzco.mongodb.net/?appName=webgameblock"
- Set `ADMIN_KEY` to a strong secret, e.g. `ADMIN_KEY=somestrongsecret`

Auth for admin endpoints
- Admin endpoints require header `x-admin-key: <ADMIN_KEY>` (or query `?adminKey=<ADMIN_KEY>`).

Endpoints (examples)
- Promote a user to admin
  POST /api/admin/promote/:userId
  Headers: { "x-admin-key": "<ADMIN_KEY>" }

- Demote admin
  POST /api/admin/demote/:userId

- List users
  GET /api/admin/users?page=1&limit=50&q=alice

- Update user
  PATCH /api/admin/users/:userId
  Body: { "locked": true }

- Deposit (admin credits user balance in wei)
  POST /api/admin/deposit
  Body: { "userId": "<userId>", "amountWei": "1000000000000000000", "note": "bonus" }

- Withdraw (admin deducts from user balance in wei)
  POST /api/admin/withdraw
  Body: { "userId": "<userId>", "amountWei": "1000000000000000000", "note": "penalty" }

- Transfer between users
  POST /api/admin/transfer
  Body: { "fromUserId": "<id>", "toUserId": "<id>", "amountWei": "..." }

- Send notification
  POST /api/admin/notify
  Body: { "title": "Important", "message": "...", "userId": "<optional>" }

- List notifications
  GET /api/admin/notifications?userId=<userId>&page=1

Notes & security
- This implementation is intentionally simple. For production, integrate full authentication for admins (JWT + roles), audit logs, rate limiting, and optionally sign on-chain transactions when moving real tokens.
- All balances are stored as string (wei). Use ethers.js to convert units when interacting with UI or blockchain.
