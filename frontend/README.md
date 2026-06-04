# TravelMate Frontend

This is the React frontend application for the TravelMate travel planning project.

The frontend connects to the backend REST API from Assignment 2 and allows users to log in, view a travel dashboard, see mock trip data, view travel friends, update settings, change theme preference, and log out.

## Technologies Used

* React.js
* React Router
* Fetch API
* CSS

## Project Structure

```text
src/
├── components/
│   ├── Navbar.js
│   ├── Footer.js
│   ├── TripCard.js
│   ├── TripsTable.js
│   └── FriendCard.js
├── pages/
│   ├── LoginPage.js
│   ├── DashboardPage.js
│   └── SettingsPage.js
├── services/
│   ├── authService.js
│   ├── settingsService.js
│   ├── tripsService.js
│   └── friendsService.js
├── App.js
└── App.css
```

## Backend API Base URL

The frontend connects to the backend server at:

```text
http://localhost:3000
```

The backend must be running before using the frontend.

## Frontend URL

The frontend runs locally on:

```text
http://localhost:5173
```

This port is configured in the frontend environment settings.

## How to Install Dependencies

From the `frontend` folder, run:

```bash
npm install
```

On Windows PowerShell, if `npm` is blocked, use:

```bash
npm.cmd install
```

## How to Start the Frontend

From the `frontend` folder, run:

```bash
npm start
```

On Windows PowerShell, if `npm` is blocked, use:

```bash
npm.cmd start
```

Then open:

```text
http://localhost:5173
```

## How to Run the Full Project

Open two terminals.

### Terminal 1 — Backend

```bash
cd backend
npm install
npm start
```

If using Windows PowerShell:

```bash
cd backend
npm.cmd install
npm.cmd start
```

The backend should run on:

```text
http://localhost:3000
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm start
```

If using Windows PowerShell:

```bash
cd frontend
npm.cmd install
npm.cmd start
```

The frontend should run on:

```text
http://localhost:5173
```

## Demo Users

You can log in using one of the following users:

```text
Email: yossi@email.com
Password: 123456
```

```text
Email: tamar@email.com
Password: 123456
```

```text
Email: roni@email.com
Password: 123456
```

## Main Pages

### Login Page

The login page includes:

* Email input
* Password input
* Login button
* Client-side validation
* Loading state
* Error message for invalid login
* Redirect to dashboard after successful login

Backend endpoint used:

```text
POST /api/auth/login
```

### Dashboard Page

The dashboard page displays data from the backend, including:

* Summary cards
* Featured trip cards
* Travel friends section
* Trips data table

Backend endpoints used:

```text
GET /trips
GET /friends/:userId
GET /users/:id
```

The trip cards are reusable components, and the trips table dynamically maps over trip data received from the backend.

### Settings Page

The settings page allows the logged-in user to update:

* Username
* Email
* Theme preference
* Password

Backend endpoints used:

```text
GET /api/settings
PUT /api/settings
```

The theme preference supports:

* Light
* Dark
* Travel

The selected theme changes the visual design of the application.

### Navbar and Footer

After login, the application displays:

* Project name/logo
* Navigation links
* Logged-in user name
* Settings link
* Logout button
* Footer with project description

Backend endpoints used:

```text
GET /api/users/me
POST /api/auth/logout
```

## Notes

This project uses mock backend data only. Data changes are stored in memory while the backend server is running.

If the backend server is restarted, updated settings and password changes reset to the original mock data.

This behavior is expected for this assignment because the project is not connected to a real database yet.

## Screenshots for Submission

Screenshots:

1. Login page
2. Dashboard page
3. Trips table
4. Settings page
5. Optional validation or error example
