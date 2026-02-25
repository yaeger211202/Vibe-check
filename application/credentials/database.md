\# Database Access – Milestone 1 (Checkpoint 3)



\## Overview



The Vibe Check application uses PostgreSQL 16 with PostGIS enabled.

The database runs on the same EC2 instance as the application and is secured to localhost.



The database is NOT publicly accessible from the internet.



---



\## Engine



\- PostgreSQL 16.x (Ubuntu 24.04)

\- PostGIS 3.4 enabled



---



\## Database Configuration



\- Database Name: vibecheck

\- Database User: vibe\_user

\- Host: localhost

\- Port: 5432



---



\## Important



PostgreSQL is configured with:



listen\_addresses = 'localhost'



This means the database can only be accessed from inside the EC2 instance.

To connect from a local machine, an SSH tunnel must be used.



---



\## Access Method 1 – SSH Into EC2 (Simplest Method)



\### Step 1 – SSH into the EC2 instance



From your local machine:



ssh -i ARKHA\_VibeCheck.pem ubuntu@3.138.212.58



(Windows users: ensure PEM file permissions are set correctly using icacls.)



\### Step 2 – Connect to the database



psql -h localhost -p 5432 -U vibe\_user -d vibecheck



Enter the database password when prompted.



---



\## Access Method 2 – SSH Tunnel (Recommended for Graders)



This method allows connecting to PostgreSQL from your local machine while keeping the database secure.



\### Step 1 – Create SSH tunnel (run from your local machine)



ssh -i ARKHA\_VibeCheck.pem -L 5432:localhost:5432 ubuntu@3.138.212.58



Leave this terminal window open.



\### Step 2 – Open a new terminal and connect



psql -h localhost -p 5432 -U vibe\_user -d vibecheck



---



\## Verify PostGIS Installation



Inside psql, run:



SELECT postgis\_version();



If a version is returned, PostGIS is properly installed.



To exit psql:



\\q



---



\## Security Notes



\- Database is restricted to localhost.

\- Port 5432 is not publicly exposed.

\- Database credentials are provided in the credentials folder.

\- Application credentials are stored in a .env file on the server (not committed to GitHub).

