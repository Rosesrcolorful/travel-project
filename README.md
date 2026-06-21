# TravelMate - AI Travel Planning Platform

TravelMate is a full-stack travel planning website where users can create trips, manage their personal travel plans, connect with friends, chat in real time, share trips, and generate trip suggestions using AI.

This README explains how to install, run, and use the website from start to finish.

---

## 1. Technologies Used

### Frontend

- React
- React Router
- Create React App / react-scripts
- Axios
- CSS

### Backend

* Node.js
* Express
* MySQL
* Sequelize ORM
* Socket.IO
* OpenAI API

---

## 2. Main Features

The website includes:

* User signup
* User login
* User settings page
* Change username, email, theme, and password
* Delete account
* Create trips manually
* View all personal and shared trips
* Edit trips as the trip owner
* View shared trips as a participant
* Delete trips as the trip owner
* Search users
* Send friend requests
* Accept or decline friend requests
* Remove friends
* Real-time chat between friends
* Online user indication
* Share trips with friends
* Accept or decline shared trips
* AI trip planner
* Save AI-generated trips
* Save and share AI-generated trips

---

## 3. Project Structure

```txt
travel-project/
  backend/
    config/
    controllers/
    docs/
    middleware/
    migrations/
    models/
    routes/
    services/
    socket/
    .env.example
    package.json
    seed.js
    server.js

  frontend/
    src/
      components/
      pages/
      services/
      App.js
      App.css
    package.json

  README.md
```

---

## 4. Database Setup

This project uses MySQL with Sequelize ORM.

Before running the backend, make sure MySQL is installed and running.

Create a database called:

```txt
travel_project
```

You can create it using MySQL Workbench, phpMyAdmin, or the MySQL command line:

```sql
CREATE DATABASE travel_project;
```

---

## 5. Environment Variables

Inside the `backend` folder, create a file named:

```txt
.env
```

Use `backend/.env.example` as a template.

Example:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=travel_project
DB_USER=root
DB_PASSWORD=your_mysql_password_here

OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

Important:

* Do not upload or share the real `.env` file publicly.
* The OpenAI API key must stay only in the backend.
* The frontend does not contain the OpenAI key.

---

## 6. Installing and Running the Backend

Open a terminal in the project folder.

Go into the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Run the seed file:

```bash
node seed.js
```

Start the backend server:

```bash
npm start
```

The backend should run on:

```txt
http://localhost:3000
```

---

## 7. Installing and Running the Frontend

Open another terminal.

Go into the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm start
```

The frontend should run on:

```txt
http://localhost:5173
```

Open this address in the browser.

---

## 8. Test Users

After running `node seed.js`, the database contains test users.

Use the following accounts to test the website:

```txt
User 1:
Email: ADD_EMAIL_HERE
Password: ADD_PASSWORD_HERE

User 2:
Email: ADD_EMAIL_HERE
Password: ADD_PASSWORD_HERE

Admin user:
Email: ADD_EMAIL_HERE
Password: ADD_PASSWORD_HERE
```

The admin user exists in the database as part of the ORM model structure. The main user interface focuses on the travel planning, friends, chat, sharing, and AI trip planner features.

---

## 9. How to Use the Website

### 9.1 Signup

1. Open the website.
2. Go to the signup page.
3. Enter first name, last name, username, email, and password.
4. Submit the form.
5. After signup, login with the new account.

---

### 9.2 Login

1. Open the login page.
2. Enter an existing user email and password.
3. Click login.
4. After login, the user is redirected to the dashboard.

---

### 9.3 Dashboard

The dashboard shows a summary of the user's trips and quick actions.

From the dashboard, the user can:

* Plan a new trip with AI
* Create a trip manually
* View existing trips
* Navigate to friends, chat, and settings

---

### 9.4 Settings Page

The settings page allows the user to:

* Update username
* Update email
* Change website theme
* Change password
* Delete account

To change password:

1. Enter the current password.
2. Enter the new password.
3. Save the changes.

If the current password is wrong, the website shows an error.

To delete account:

1. Enter the account password.
2. Click delete account.
3. The account is removed from the database.

Use a test account only when testing account deletion.

---

### 9.5 My Trips Page

The My Trips page shows:

* Trips created by the logged-in user
* Trips shared with the logged-in user

For each trip, the page shows:

* Trip name
* Destination
* Dates
* Budget
* Status
* Participants
* Share controls
* Actions

Trip owners can:

* Edit the trip
* Delete the trip
* Share the trip with friends

Trip participants can:

* View the trip
* See the owner and participants
* They cannot edit or delete the trip
* They cannot share the trip again

---

### 9.6 Create a Manual Trip

1. Go to `My Trips`.
2. Click `Create Trip`.
3. Enter the trip name, destination, dates, budget, status, and description.
4. Save the trip.
5. The trip appears in `My Trips`.

---

### 9.7 Edit a Trip

Only the trip owner can edit a trip.

1. Go to `My Trips`.
2. Click `Edit` on a trip owned by the logged-in user.
3. Change the trip details.
4. Save changes.

If the logged-in user is only a participant, the page opens in view-only mode.

---

### 9.8 Delete a Trip

Only the trip owner can delete a trip.

1. Go to `My Trips`.
2. Click `Delete` on a trip owned by the logged-in user.
3. Confirm the action if needed.
4. The trip is removed.

---

## 10. Friends System

### 10.1 Search for a User

1. Go to the Friends page.
2. Use the search box.
3. Search by username.
4. Matching users appear in the results.

---

### 10.2 Send a Friend Request

1. Search for another user.
2. Click `Add`.
3. The request appears under sent requests.
4. The other user will see it under received requests.

---

### 10.3 Accept or Decline a Friend Request

Login as the second user.

1. Go to the Friends page.
2. Find the received request.
3. Click `Accept` or `Decline`.

After accepting, both users appear in each other's friends list.

---

### 10.4 Remove a Friend

1. Go to the Friends page.
2. Find the friend in the friends list.
3. Click remove.
4. The friendship is removed.

---

## 11. Real-Time Chat

The website uses Socket.IO for real-time chat.

To test chat:

1. Open the website in two browser windows or two different browsers.
2. Login as User 1 in the first browser.
3. Login as User 2 in the second browser.
4. Make sure the users are friends.
5. Open the Friends page.
6. Select the friend.
7. Send a message.
8. The other user should receive it immediately without refreshing the page.

The chat also shows online indication when the other user is connected.

---

## 12. Trip Sharing

A user can share a trip only if they are the trip owner.

To share a trip:

1. Login as the trip owner.
2. Go to `My Trips`.
3. Find the trip.
4. Choose a friend from the share dropdown.
5. Click `Share`.

The receiver can accept or decline the shared trip.

Shared trips can also appear inside the chat as trip-share messages.

---

## 13. Accepting a Shared Trip

Login as the receiving user.

A shared trip can be accepted from the sharing area or from the chat trip-share card.

After accepting:

* The trip appears in the receiver's `My Trips` page.
* The receiver becomes a participant.
* The receiver can view the trip.
* The receiver cannot edit, delete, or re-share the trip.

---

## 14. AI Trip Planner

The AI trip planner is available from the `Plan Trip` page.

To use it:

1. Go to `Plan Trip`.
2. Enter a travel prompt.
3. Example prompt:

```txt
Plan a 5-day budget trip to Rome for two friends who like food, museums, and walking tours.
```

4. Click generate.
5. The backend sends the request to the OpenAI API.
6. The generated trip appears on the page.
7. The user can edit the generated trip details before saving.

The user can then:

* Save the AI trip
* Save and share the AI trip with a friend

---

## 15. Save an AI Trip

1. Generate a trip in the AI planner.
2. Review and edit the generated details.
3. Click `Save Trip`.
4. The trip is saved to the database.
5. The trip appears in `My Trips`.

---

## 16. Save and Share an AI Trip

1. Generate a trip in the AI planner.
2. Review and edit the generated details.
3. Choose a friend.
4. Click `Save & Share`.
5. The trip is saved to the database.
6. A trip-share request is sent to the selected friend.

---

## 17. Socket.IO Events

The project uses several custom Socket.IO events, including:

```txt
user:join
user:online
chat:send
chat:received
trip_share:respond
trip_share:updated
```

These events support:

* Real-time chat
* Online user indication
* Trip-share updates

---

## 18. API Response Format

The backend returns consistent success and error responses.

Successful response:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Error response:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

---

## 19. Main Database Models

The project uses Sequelize ORM models.

Main models:

* User
* Admin
* Trip
* TripParticipant
* Friendship
* TripShare
* Message

Examples of relationships:

* A user can create many trips.
* A trip belongs to one creator.
* A trip can have many participants.
* A user can participate in many trips.
* Users can have friendships with other users.
* Users can send and receive messages.
* Trips can be shared between users.

---

## 20. Troubleshooting

### Backend does not start

Check that:

* MySQL is running.
* The `.env` file exists inside the backend folder.
* The database name, username, and password are correct.
* Dependencies were installed with `npm install`.

---

### Frontend does not start

Check that:

* You are inside the frontend folder.
* Dependencies were installed with `npm install`.
* The backend is also running.

---

### AI planner does not work

Check that:

* `OPENAI_API_KEY` exists in `backend/.env`.
* The API key is valid.
* The OpenAI account has API billing/credits.
* The backend was restarted after editing `.env`.

---

### Chat does not update live

Check that:

* Both users are logged in at the same time.
* The users are friends.
* The backend is running.
* The frontend is connected to the backend.
* The browser console does not show socket errors.

---

### Trip sharing does not appear

Check that:

* The users are friends.
* The logged-in user is the trip owner.
* The receiving user accepted the shared trip.
* The page was refreshed if needed.

---