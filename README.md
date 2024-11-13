# Event-Manager

## Setup

1. Clone the repository
2. Navigate to the repository directory
3. Install [Docker](https://docs.docker.com/get-docker/).
4. Run the following command:

```bash
docker-compose up --build
```

or if that doesn't work, try:
```bash
docker compose up --build
```

5. Access the webapp at `http://localhost:3001`

This app uses Docker, which is a tool that allows us to package our application and its dependencies into a container that can run exactly the same on any machine.

### Database Credentials

    Host: localhost
    Port: 3307
    Username: root
    Password: pass123

To log into the database, try this:
    
```bash
docker exec -it event-manager-db-1 /bin/bash
mysql -u root -p
```