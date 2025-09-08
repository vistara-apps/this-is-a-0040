# DigiNinja Pro

> Generate stunning logos & compelling content for your business, in minutes.

DigiNinja Pro is an AI-powered web application designed for solo founders and entrepreneurs to quickly generate high-quality business assets like logos, social media content, and ad copy using cutting-edge AI technology.

## 🚀 Features

### Core Features
- **🎨 AI-Powered Logo Generator** - Create unique, brand-aligned logos instantly
- **📝 AI-Driven Ad Copy Generator** - Generate high-converting ad copy for multiple platforms
- **📱 Social Media Post Templates** - Customizable templates for Instagram, Twitter, LinkedIn
- **💡 Content Idea Brainstormer** - Get trending content topics and blog post ideas

### Business Features
- **💳 Subscription Management** - Tiered pricing with Stripe integration
- **📊 Usage Analytics** - Track generations and performance
- **⭐ Favorites System** - Save and organize your best assets
- **🔍 Search & Filter** - Find assets quickly across projects

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **Zustand** for state management

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **JWT** authentication
- **Stripe** for payments
- **OpenAI API** for content generation
- **Winston** for logging

### Infrastructure
- **Docker** for containerization
- **AWS S3** for file storage
- **Redis** for caching (planned)

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- OpenAI API key
- Stripe account (for payments)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/vistara-apps/this-is-a-0040.git
cd this-is-a-0040
```

### 2. Install dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Environment setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 4. Database setup
```bash
# Create PostgreSQL database
createdb digininja_pro

# Run database migrations
cd server
npm run setup-db
cd ..
```

### 5. Start development servers
```bash
# Start backend (in one terminal)
cd server
npm run dev

# Start frontend (in another terminal)
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Backend server port | No (default: 3001) |
| `DB_HOST` | PostgreSQL host | Yes |
| `DB_NAME` | Database name | Yes |
| `DB_USER` | Database user | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |

See `.env.example` for complete configuration options.

## 📊 Database Schema

### Users
- User authentication and subscription management
- Generation limits and usage tracking
- Stripe customer integration

### Projects
- Organize assets by business/brand
- Brand colors and fonts storage
- Industry categorization

### Generated Assets
- Store AI-generated content
- Version control and favorites
- Metadata and search indexing

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile

### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Assets
- `GET /api/assets` - List user assets
- `POST /api/assets/generate` - Generate new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Payments
- `POST /api/payments/create-checkout` - Create Stripe checkout
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/subscription` - Get subscription status

## 🏗️ Project Structure

```
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── utils/             # Utility functions
├── server/                # Backend source code
│   ├── config/            # Configuration files
│   ├── middleware/        # Express middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── migrations/        # Database migrations
│   └── scripts/           # Utility scripts
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd server
npm test

# Run integration tests
npm run test:integration
```

## 🚀 Deployment

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

```bash
# Build frontend
npm run build

# Start production server
cd server
npm start
```

## 📈 Subscription Tiers

| Tier | Price | Generations | Features |
|------|-------|-------------|----------|
| **Free** | $0/month | 3/month | Basic generation |
| **Pro** | $29/month | Unlimited | All features, priority support |
| **Premium** | $59/month | Unlimited | Advanced features, custom branding |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@digininja.pro
- 💬 Discord: [Join our community](https://discord.gg/digininja)
- 📖 Documentation: [docs.digininja.pro](https://docs.digininja.pro)

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) for AI capabilities
- [Stripe](https://stripe.com) for payment processing
- [shadcn/ui](https://ui.shadcn.com) for UI components
- [Tailwind CSS](https://tailwindcss.com) for styling

---

**Made with ❤️ for entrepreneurs and founders**
