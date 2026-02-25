\# Database Access (Checkpoint 3)



\## Engine

\- PostgreSQL 16.x (Ubuntu 24.04)



\## Extensions

\- PostGIS enabled (verified with SELECT postgis\_version();)



\## Database

\- Name: vibecheck

\- User: vibe\_user

\- Host: localhost

\- Port: 5432



\## Access Method

\- Database runs on the same EC2 instance as the application.

\- The app connects using environment variables (.env), not hardcoded credentials.



\## Test Command (run on the server)

psql -h localhost -U vibe\_user -d vibecheck



\## Security

\- Database is not publicly accessible.

\- listen\_addresses is set to localhost.

