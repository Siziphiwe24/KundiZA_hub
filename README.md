# KundiZA_hub

IBM KundiZA Boardroom Booking App

1.	 Frontend
This consists of html files that provides user interface for the booking system: 

•	Booking Form - users may enter their information, pick a room, schedule a time, and request any resources they may need 

•	Room Availability Display - component that lists the rooms and their details that are currently available.


•	Guideline check box – users must check, read and agree to IBM KundiZA guidelines and terms & conditions. 

These HTML files work with JavaScript to send user input to the backend and display updated information dynamically.

2.	 Backend 
The system's backend, which is based on Node.js:

•	Processing incoming front-end booking requests

•	Verifying information, determining room availability, and handling conflicts with reservations


•	Notifications are generated and booking details are sent to the database.

The server communicates with the database and the frontend (HTML) to guarantee that every reservation is handled precisely and instantly.

3.	 Database (MongoDB)
All information about rooms, resources, and reservations is kept in the database: 

•	Enables the system to check for available rooms depending on reservations.

•	updates the interface with the most recent availability and booking data.
•	keeps previous data for use in reporting.

The backend maintains a consistent user experience by updating the database with new reservations and accessing it to verify availability.

4.	App Notification System
Each time a booking is successfully created, the system triggers an automated email notification to the admin, cc the user. This feature:

•	Keeps the admin informed of all new bookings. 

•	Allow easier monitoring and management of upcoming room usage.
