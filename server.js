require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const nodemailer = require('nodemailer');

// Initialize Express App
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Client Setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
async function connectDB() {
  await client.connect();
  console.log("Connected to MongoDB");
}
connectDB();

app.use('/img', express.static(path.join(__dirname, 'img')));

// Serve the HTML file
/*app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});*/

// Get the bookings collection
const db = client.db("kundizaHub");
const bookingsCollection = db.collection("bookings");
const usersCollection = db.collection("users");

// Serve Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve Login Page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html')); 
});

// Serve Booking Page
app.get('/booking', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'booking.html'));
});

// Serve KundiZA Page
app.get('/kundiza', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'kundiza.html'));
});

// Handle Booking Submission
app.post('/book-room', async (req, res) => {
  const { room, date, time, duration, attendees, email, otherComment = '', businessOtherCommenent = '' } = req.body;

  // Validate the booking data
  if (!room || !date || !time || !duration || !attendees || !email) {
    return res.status(400).send("All fields are required!");
  }

  try {
    // Calculate start and end times in milliseconds
    const startTime = new Date(`${date} ${time}`).getTime();
    const endTime = startTime + duration * 60 * 60 * 1000;

    // Check for booking conflicts
    const conflict = await bookingsCollection.findOne({
      room: room,
      date: date,
      $or: [
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gt: startTime } }
          ]
        }
      ]
    });

    if (conflict) {
      return res.status(409).send(`The room ${room} is already booked for ${date} at ${time} or during this time.`);
    }

    // Insert new booking
    const booking = {
      room,
      date,
      time,
      duration,
      startTime,
      endTime,
      attendees: Number(attendees),
      email,
      otherComment,
      businessOtherCommenent
    };

    console.log("Booking Data Before Insertion:", booking);
    await bookingsCollection.insertOne(booking);

    // Prepare email content
    let emailContent = `
      Dear ${email},
      
      Your room "${room}" has been successfully booked for ${date} at ${time} for ${attendees} attendees. The booking will last for ${duration} hours.

      Details of your booking:
      - Room: ${room}
      - Date: ${date}
      - Time: ${time}
      - Duration: ${duration} hours
      - Number of Attendees: ${attendees}
      - Email: ${email}
      
      If you have selected any additional resources, here are the details:
    `;

    if (otherComment) {
      emailContent += `\nOther Resource Details: ${otherComment}`;
    }
    if (businessOtherCommenent) {
      emailContent += `\nBusiness Unit Details: ${businessOtherCommenent}`;
    }

    emailContent += `\n\nThank you for using our booking system! If you have any questions or need to cancel your booking, please contact us at kerron@za.ibm.com.`;

    const adminEmail = 'kerronpillay@gmail.com'; 

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 465,
      secure: true,
      auth: {
        user: 'mamgcinast@gmail.com',
        pass: 'uhir yjjf oknz gfru',
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: 'mamgcinast@gmail.com',
      to: email,
      cc: adminEmail,
      subject: 'Room Booking Confirmation - IBM KundiZA Hub',
      text: emailContent
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send("Failed to send confirmation email");
      } else {
        console.log('Email sent: ' + info.response);
        return res.send(`Room "${room}" booked for ${date} at ${time} for ${attendees} attendees for ${duration} hour(s) duration. A confirmation email has been sent.`);
      }
    });

  } catch (error) {
    console.error("Error booking room:", error);
    res.status(500).send("Error booking the room. Please try again.");
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
