require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri); // for clear code, and less warnings 

async function updateDateFields() {
  try {
    await client.connect();
    const db = client.db("kundizaHub");
    const bookingsCollection = db.collection("bookings");

    // Update documents where the date is stored as a string
    const result = await bookingsCollection.updateMany(
      { date: { $type: "string" } },  // Finds date fields stored as strings
      [{ $set: { date: { $toDate: "$date" } } }]  // Converts them to ISODate format
    );

    console.log(`Updated ${result.modifiedCount} documents`);
  } catch (error) {
    console.error("Error updating date fields:", error);
  } finally {
    await client.close();
  }
}

updateDateFields();


