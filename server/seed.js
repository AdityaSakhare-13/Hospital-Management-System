const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Patient = require("./models/Patient");
const Doctor = require("./models/Doctor");
const Appointment = require("./models/Appointment");
const Expense = require("./models/Expense");
const Medicine = require("./models/Medicine");

const connectDB = require("./config/db");

const users = [
  { fullName: "System Admin", email: "admin@hms.com", password: "admin123", role: "admin", phone: "9876543210" },
  { fullName: "Dr. Aryan Mehta", email: "doctor@hms.com", password: "doctor123", role: "doctor", phone: "9123456789" },
  { fullName: "Suresh Raina", email: "patient@hms.com", password: "patient123", role: "patient", phone: "8765432109" },
  { fullName: "Priya Sharma", email: "reception@hms.com", password: "reception123", role: "reception", phone: "7654321098" },
];

const initialDoctors = [
  { name: 'Dr. Aryan Mehta', specialization: 'Cardiology', experience: '12 Years', availability: 'Mon, Wed, Fri (10AM–2PM)', contact: '+91 98765 43210', email: 'aryan@hms.com', status: 'Active', patients: 24 },
  { name: 'Dr. Sneha Verma', specialization: 'Neurology', experience: '8 Years', availability: 'Tue, Thu, Sat (9AM–1PM)', contact: '+91 87654 32109', email: 'sneha@hms.com', status: 'Active', patients: 18 },
  { name: 'Dr. Rahul Patil', specialization: 'Orthopedics', experience: '15 Years', availability: 'Mon–Fri (2PM–6PM)', contact: '+91 76543 21098', email: 'rahul@hms.com', status: 'On Leave', patients: 0 },
  { name: 'Dr. Nisha Iyer', specialization: 'Dermatology', experience: '5 Years', availability: 'Wed, Fri, Sun (11AM–4PM)', contact: '+91 65432 10987', email: 'nisha@hms.com', status: 'Active', patients: 12 },
];

const initialPatients = [
  { name: 'Rohan Sharma', age: 34, gender: 'Male', contact: '9876543210', bloodGroup: 'B+', status: 'Active', address: 'Mumbai, MH', medicalHistory: 'Diabetes Type 2' },
  { name: 'Priya Verma', age: 28, gender: 'Female', contact: '8765432109', bloodGroup: 'O+', status: 'Admitted', address: 'Pune, MH', medicalHistory: 'Asthma (mild)' },
  { name: 'Amit Patel', age: 45, gender: 'Male', contact: '9123456789', bloodGroup: 'A+', status: 'Discharged', address: 'Ahmedabad, GJ', medicalHistory: 'Hypertension' },
];

const initialAppointments = [
  { patient: 'Rohan Sharma', doctor: 'Dr. Aryan Mehta', dept: 'Cardiology', date: '2024-06-12', time: '10:30 AM', status: 'Pending', reason: 'Chest pain' },
  { patient: 'Priya Verma', doctor: 'Dr. Sneha Verma', dept: 'Neurology', date: '2024-06-12', time: '11:15 AM', status: 'Confirmed', reason: 'Headache' },
  { patient: 'Vikram Singh', doctor: 'Dr. Aryan Mehta', dept: 'Cardiology', date: '2024-06-14', time: '09:00 AM', status: 'Confirmed', reason: 'Follow-up' },
];

const initialExpenses = [
  { item: 'MRI Machine', category: 'Machine', amount: 2500000, date: '2024-05-15' },
  { item: 'Surgical Tools Set', category: 'Equipment', amount: 85000, date: '2024-05-28' },
];

const initialMedicines = [
  { name: "Paracetamol", quantity: 150, price: 5 },
  { name: "Amoxicillin", quantity: 8, price: 45 },
];

const seedDB = async () => {
  try {
    await connectDB();

    console.log("🛠️ Starting Full Database Sync (Frontend → Backend)...");

    // Clean all collections
    await User.deleteMany();
    await Patient.deleteMany();
    await Doctor.deleteMany();
    await Appointment.deleteMany();
    await Expense.deleteMany();
    await Medicine.deleteMany();

    console.log("🗑️ Cleared existing database records.");

    // 1. Seed Users
    for (const u of users) {
      await User.create(u);
    }
    console.log(`✅ Seeded ${users.length} Base Users.`);

    // 2. Seed Doctors
    await Doctor.insertMany(initialDoctors);
    console.log(`✅ Seeded ${initialDoctors.length} Doctors (matched to frontend).`);

    // 3. Seed Patients
    await Patient.insertMany(initialPatients);
    console.log(`✅ Seeded ${initialPatients.length} Patients (matched to frontend).`);

    // 4. Seed Appointments
    await Appointment.insertMany(initialAppointments);
    console.log(`✅ Seeded ${initialAppointments.length} Appointments (matched to frontend).`);

    // 5. Seed Expenses
    await Expense.insertMany(initialExpenses);
    console.log(`✅ Seeded ${initialExpenses.length} Expenses (matched to Revenue Dashboard).`);

    // 6. Seed Medicines
    await Medicine.insertMany(initialMedicines);
    console.log(`✅ Seeded ${initialMedicines.length} Medicines (matched to Pharmacy).`);

    console.log("\n🎉 DATABASE SYNC COMPLETE! Your backend now matches your frontend 1:1.\n");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedDB();
