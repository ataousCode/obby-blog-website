# Docker Setup for Development

This guide explains how to set up Docker Compose for email testing during development.

## Email Configuration with MailHog

We use MailHog for email testing in development. MailHog is a lightweight email testing tool that captures emails and provides a web interface to view them.

### Prerequisites

- Docker and Docker Compose installed on your system

### Setup Instructions

1. **Start the services:**
   ```bash
   docker-compose up -d
   ```

2. **Verify services are running:**
   ```bash
   docker-compose ps
   ```

3. **Access MailHog Web UI:**
   - Open your browser and go to: http://localhost:8025
   - This is where you'll see all emails sent by your application

### Email Configuration

The `.env` file is configured to use MailHog for development:

```env
EMAIL_SERVER_HOST="localhost"
EMAIL_SERVER_PORT=1025
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM="noreply@myblog.local"
```

### Testing Email Functionality

1. Start your Next.js application:
   ```bash
   npm run dev
   ```

2. Trigger any email functionality in your app (e.g., user registration, password reset)

3. Check the MailHog web interface at http://localhost:8025 to see the captured emails

### Production Configuration

For production, use the `.env.production` file which contains the Gmail SMTP configuration.

### Stopping Services

```bash
docker-compose down
```

### Troubleshooting

- **Port conflicts:** If port 1025 or 8025 are already in use, modify the ports in `docker-compose.yml`
- **Email not appearing:** Check that your application is using the correct SMTP settings from the `.env` file
- **Container issues:** Run `docker-compose logs mailhog` to see container logs

### Additional Services

The `docker-compose.yml` file also includes a commented PostgreSQL service if you want to switch back from SQLite to PostgreSQL for development.