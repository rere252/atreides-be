# Hide-and-Seek Game Server

## Introduction

The backend code for a hide-and-seek game designed to be played in specific geographical areas. The server is implemented using Node.js and Express, with MongoDB for data storage. It also uses WebSockets for real-time communication between players.

## Configuration

### Prerequisites

- Node.js
- npm
- MongoDB

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/hide-and-seek-app.git
   cd hide-and-seek-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```
     PORT=3000
     DB_URI=mongodb://localhost:27017/hideandseek
     ```

### Starting the Server

1. **Ensure MongoDB is running:**
   - For Windows users, ensure MongoDB is installed as a service and started. You can start it manually using:
     ```bash
     mongod --dbpath "C:\data\db"
     ```
   - Replace `"C:\data\db"` with the path to your MongoDB data directory.

2. **Start the server:**
   ```bash
   npm start
   ```

## API Endpoints

Below are the available API endpoints, along with methods and example requests.

### Users

- **Register a User**
  - **POST** `/api/users/register`
  - **Body:**
    ```json
    {
      "nickname": "Paul",
      "role": "seeker",
      "room": "Caladan"
    }
    ```
  - Registers a new user and assigns them to a room with a role.

- **Update Location**
  - **POST** `/api/users/location`
  - **Body:**
    ```json
    {
      "id": "user's MongoDB ObjectId",
      "location": {
        "latitude": 58.378025,
        "longitude": 26.728493
      }
    }
    ```
  - Updates the geographical location of a user.

### Games

- **Start a Game**
  - **POST** `/api/games/start`
  - **Body:**
    ```json
    {
      "room": "Caladan",
      "players": ["ObjectId1", "ObjectId2"]
    }
    ```
  - Starts a new game in a specified room with designated players.

- **Check Distance**
  - **POST** `/api/games/check-distance`
  - **Body:**
    ```json
    {
      "seekerId": "ObjectId",
      "hiderId": "ObjectId"
    }
    ```
  - Checks the distance between a seeker and a hider. Responds with the distance and whether the hider is found within a certain range.

## Real-Time Communication

WebSocket endpoints are used for real-time interaction during the game.