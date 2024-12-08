# Event-Manager

## Setup

1. Clone the repository
2. Install [Docker](https://docs.docker.com/get-docker/).
3. Navigate to the repository directory
4. Create a `.env` file in the `client` directory with the following content:
```
REACT_APP_GOOGLE_MAPS_API_KEY=<YOUR_API_KEY>
```
5. Run the following command:

```bash
docker compose up --build
```

6. Access the webapp at `http://localhost:3001`

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
