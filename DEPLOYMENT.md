# Deployment Guide - Blockchain Gaming Platform

## 📋 Pre-deployment Checklist

### Smart Contract Preparation
- [ ] All contracts compiled without errors
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests completed
- [ ] Security audit performed
- [ ] Gas optimization completed
- [ ] Replace pseudo-random with Chainlink VRF
- [ ] Emergency pause mechanism implemented
- [ ] Multi-sig wallet setup for owner functions

### Backend Preparation
- [ ] Environment variables configured
- [ ] Database backup strategy in place
- [ ] API rate limiting enabled
- [ ] JWT authentication implemented
- [ ] Error logging configured (Sentry)
- [ ] SSL/HTTPS certificates ready
- [ ] CORS properly configured

### Frontend Preparation
- [ ] Production build tested
- [ ] Contract addresses updated
- [ ] Error boundaries implemented
- [ ] Analytics configured
- [ ] SEO optimization
- [ ] Mobile responsiveness verified

## 🚀 Deployment Steps

### 1. Deploy to Testnet First

#### A. Get Testnet ETH
```bash
# Sepolia Faucet
https://sepoliafaucet.com/

# Mumbai Faucet (Polygon)
https://faucet.polygon.technology/
```

#### B. Configure .env
```bash
# Update these in .env
PRIVATE_KEY=your-real-private-key-with-testnet-eth
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-KEY
ETHERSCAN_API_KEY=your-etherscan-key
```

#### C. Deploy Contracts to Sepolia
```bash
# Compile
npm run compile

# Deploy to Sepolia
npm run deploy:sepolia

# Note the contract addresses from output
```

#### D. Verify Contracts
```bash
npx hardhat verify --network sepolia <TAIXIU_ADDRESS>
npx hardhat verify --network sepolia <FISHING_ADDRESS>
```

#### E. Test on Testnet
1. Update `frontend/.env` với contract addresses
2. Deploy frontend to test hosting (Vercel/Netlify)
3. Connect MetaMask to Sepolia
4. Test all game functions thoroughly
5. Monitor for bugs và gas costs

### 2. Production Deployment

#### A. Final Security Review
- [ ] Smart contract audit report reviewed
- [ ] All critical issues fixed
- [ ] Rate limiting tested under load
- [ ] Database indexes optimized
- [ ] Backup and recovery tested

#### B. Setup Production Environment

**Hosting Options:**

**Backend (Node.js):**
- Heroku
- AWS EC2/ECS
- Google Cloud Platform
- DigitalOcean
- Railway

**Frontend:**
- Vercel (recommended for Vite)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

**Database:**
- MongoDB Atlas (recommended)
- AWS DocumentDB
- Self-hosted MongoDB

#### C. Configure Production Environment Variables

**Backend (.env):**
```bash
NODE_ENV=production
MONGO_URI=mongodb+srv://prod-user:strong-password@cluster.mongodb.net/prod-db
JWT_SECRET=generate-strong-random-32-byte-hex
PRIVATE_KEY=mainnet-deployer-private-key
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/KEY
FRONTEND_URL=https://yourdomain.com
```

**Frontend (.env):**
```bash
VITE_API_URL=https://api.yourdomain.com
VITE_TAIXIU_CONTRACT=0x...
VITE_FISHING_CONTRACT=0x...
VITE_DEFAULT_NETWORK=mainnet
VITE_ENABLE_ANALYTICS=true
```

#### D. Deploy Smart Contracts to Mainnet

⚠️ **CRITICAL: You're deploying to mainnet with real ETH!**

```bash
# Final check
npm run test
npm run compile

# Deploy (requires mainnet ETH for gas)
npx hardhat run scripts/deploy.js --network mainnet

# Verify on Etherscan
npx hardhat verify --network mainnet <TAIXIU_ADDRESS>
npx hardhat verify --network mainnet <FISHING_ADDRESS>
```

**Expected Gas Costs:**
- TaiXiuGame deployment: ~2-3M gas
- FishingGame deployment: ~2-3M gas
- Total cost: ~0.05-0.1 ETH (varies with gas price)

#### E. Deploy Backend

**Example: Heroku Deployment**
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGO_URI=mongodb+srv://...
heroku config:set JWT_SECRET=...
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

**Example: AWS EC2**
```bash
# SSH to EC2
ssh -i key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone your-repo
cd Blockchain
npm install
nano .env  # Add production variables

# Install PM2
sudo npm install -g pm2

# Start backend
pm2 start backend/server.js --name blockchain-backend
pm2 startup
pm2 save

# Setup nginx reverse proxy
sudo apt-get install nginx
# Configure nginx (see nginx.conf example below)
```

#### F. Deploy Frontend

**Vercel (Recommended):**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Set environment variables in Vercel dashboard
# Add VITE_API_URL, VITE_TAIXIU_CONTRACT, etc.

# Deploy to production
vercel --prod
```

**Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
cd frontend
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

#### G. Configure Domain & SSL

**Vercel/Netlify:**
- Add custom domain in dashboard
- SSL automatically configured

**AWS/DigitalOcean:**
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 3. Post-Deployment

#### A. Monitoring Setup

**Backend Monitoring:**
```javascript
// Install Sentry
npm install @sentry/node

// Add to server.js
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

**Contract Monitoring:**
- Setup Etherscan alerts for contract activity
- Monitor gas usage
- Track transaction volume

#### B. Fund Gaming Contracts

```bash
# Fund FishingGame contract for rewards
# Use owner wallet via Etherscan or script
```

#### C. Test Production

- [ ] Connect MetaMask to mainnet
- [ ] Test small bet on TaiXiu
- [ ] Test fishing session
- [ ] Verify transactions on Etherscan
- [ ] Test withdrawals
- [ ] Check leaderboard updates
- [ ] Test all API endpoints

#### D. Launch Checklist

- [ ] All tests passing in production
- [ ] Monitoring and alerts active
- [ ] Backup systems operational
- [ ] Support channels ready
- [ ] Documentation published
- [ ] Social media announcements ready
- [ ] Bug bounty program (optional)

### 4. Maintenance

#### Daily
- Monitor error logs
- Check transaction success rate
- Review user feedback

#### Weekly
- Database backup verification
- Security log review
- Performance metrics analysis

#### Monthly
- Dependency updates
- Security patches
- Cost optimization review

## 📊 Cost Estimates

### Initial Deployment
- Smart contract deployment: 0.05-0.1 ETH
- Domain name: $10-50/year
- SSL certificate: Free (Let's Encrypt)

### Monthly Operating Costs
- Backend hosting: $5-50/month
- Frontend hosting: $0-20/month (Vercel/Netlify free tier)
- Database (MongoDB Atlas): $0-57/month
- RPC provider (Alchemy): $0-49/month (free tier available)

### Gas Costs (Variable)
- Each game resolution: ~0.001-0.005 ETH
- User transactions: Paid by users

## 🆘 Emergency Procedures

### Contract Bug Discovered
1. Pause contract if emergency mechanism exists
2. Notify users immediately
3. Contact audit team
4. Prepare fix and redeploy
5. Migrate user funds if necessary

### Backend Outage
1. Check server logs
2. Restart services
3. Scale resources if needed
4. Restore from backup if corrupted

### Database Failure
1. Switch to backup database
2. Restore from latest snapshot
3. Verify data integrity
4. Resume operations

## 📞 Support Contacts

- Smart Contract Auditor: [Contact]
- Hosting Provider Support: [Link]
- Development Team: [Email]
- Emergency Hotline: [Phone]

---

**Good luck with your deployment! 🚀**
