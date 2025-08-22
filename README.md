# BGHS Alumni Website

A modern, full-stack alumni website for Barasat Govt. High School built with Next.js, Supabase, and Tailwind CSS.

## 🚀 Features

### Core Features
- **Homepage** - Beautiful landing page with school information and call-to-action
- **Events Management** - Browse, search, and register for alumni events and reunions
- **Alumni Directory** - Searchable directory of alumni with professional information
- **Blog System** - News, success stories, and updates from the alumni community
- **Donation Platform** - Secure donation system with multiple causes and tracking
- **Responsive Design** - Mobile-first design that works on all devices

### Technical Features
- **Modern Tech Stack** - Next.js 14, TypeScript, Tailwind CSS
- **Database** - Supabase with PostgreSQL and real-time subscriptions
- **Authentication** - Secure user authentication and authorization
- **Payment Integration** - Stripe integration for donations
- **SEO Optimized** - Built-in SEO features and meta tags
- **Performance** - Optimized for speed and user experience

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide React Icons
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe
- **Deployment**: Vercel (Frontend), Supabase (Backend)
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd bghs-alumni-website
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Copy the example environment file and fill in your values:

```bash
cp env.example .env.local
```

Fill in the following variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vlhojsyqqazdztrzuqky.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsaG9qc3lxcWF6ZHp0cnp1cWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NTc5MTEsImV4cCI6MjA3MTQzMzkxMX0.XsIyo6_6CursR48AJLzU4NcnQEOOxVr2TzGG6X-9ngA

# Stripe Configuration (for donations)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 4. Set Up Supabase

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Copy your project URL and anon key from the project settings
3. Go to the SQL Editor in your Supabase dashboard
4. Copy and paste the contents of `supabase-schema.sql` and run it
5. This will create all the necessary tables and policies

### 5. Set Up Stripe (Optional - for donations)

1. Create a [Stripe](https://stripe.com/) account
2. Get your publishable and secret keys from the dashboard
3. Set up webhook endpoints for payment confirmation

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the website.

## 🗄️ Database Schema

The website uses the following main tables:

- **profiles** - Alumni user profiles and information
- **events** - Event details and management
- **event_registrations** - User event registrations
- **blog_posts** - Blog articles and content
- **blog_comments** - Comments on blog posts
- **blog_likes** - User likes on blog posts
- **donation_causes** - Donation campaigns and causes
- **donations** - Individual donation records
- **newsletters** - Newsletter subscriptions

## 🎨 Customization

### Colors and Branding

The website uses a customizable color scheme defined in `tailwind.config.js`. You can modify the primary, secondary, and accent colors to match your school's branding.

### Content

- Update school information in the homepage (`app/page.tsx`)
- Modify event categories and blog categories as needed
- Customize donation causes in the donation page
- Update contact information and social media links

### Images

Replace placeholder images with actual school and alumni photos:
- School logo and hero images
- Event photos
- Alumni profile pictures
- Blog post images

## 🚀 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com/)
3. Set environment variables in Vercel dashboard
4. Deploy automatically on every push

### Backend (Supabase)

Your Supabase project is already hosted and ready to use. Just ensure your environment variables are correctly set in your deployment platform.

## 📱 Mobile Responsiveness

The website is built with a mobile-first approach and includes:
- Responsive navigation
- Mobile-optimized forms
- Touch-friendly buttons and interactions
- Optimized layouts for all screen sizes

## 🔒 Security Features

- Row Level Security (RLS) in Supabase
- Secure authentication with Supabase Auth
- Protected API routes
- Input validation and sanitization
- HTTPS enforcement in production

## 📊 Analytics and Monitoring

Consider adding:
- Google Analytics for visitor tracking
- Sentry for error monitoring
- Vercel Analytics for performance insights
- Supabase dashboard for database monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you need help or have questions:

1. Check the [Issues](https://github.com/your-username/bghs-alumni-website/issues) page
2. Create a new issue with a detailed description
3. Contact the development team

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Supabase](https://supabase.com/)
- Icons from [Lucide React](https://lucide.dev/)

## 📈 Future Enhancements

- **Real-time Chat** - Alumni networking platform
- **Job Board** - Career opportunities and job postings
- **Mentorship Program** - Connect alumni with current students
- **Mobile App** - Native mobile application
- **Advanced Analytics** - Detailed insights and reporting
- **Multi-language Support** - Bengali and English
- **Social Media Integration** - Share updates across platforms

---

**Built with ❤️ for the BGHS Alumni Community**
