const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Patient = require("./models/Patient");
const Doctor = require("./models/Doctor");
const Appointment = require("./models/Appointment");
const Expense = require("./models/Expense");
const Medicine = require("./models/Medicine");
const Billing = require("./models/Billing");

const connectDB = require("./config/db");

const usersData = [
  { fullName: "System Admin", email: "admin@hms.com", password: "admin123", role: "admin", phone: "9876543210" },
  { fullName: "Dr. Aryan Mehta", email: "doctor@hms.com", password: "doctor123", role: "doctor", phone: "9123456789" },
  { fullName: "Suresh Raina", email: "patient@hms.com", password: "patient123", role: "patient", phone: "8765432109" },
  { fullName: "Priya Sharma", email: "reception@hms.com", password: "reception123", role: "reception", phone: "7654321098" },
];

const initialDoctors = [
  { 
    name: 'Dr. Aryan Mehta', 
    specialization: 'Cardiology', 
    category: 'cardiology',
    roleLevel: 'senior doctor',
    isOnDuty: true,
    experience: '12 Years', 
    availability: 'Mon, Wed, Fri (10AM–2PM)', 
    contact: '+91 98765 43210', 
    email: 'aryan@hms.com', 
    status: 'Active', 
    patients: 24 
  },
  { 
    name: 'Dr. Sneha Verma', 
    specialization: 'Neurology', 
    category: 'neurology',
    roleLevel: 'consultant',
    isOnDuty: false,
    experience: '8 Years', 
    availability: 'Tue, Thu, Sat (9AM–1PM)', 
    contact: '+91 87654 32109', 
    email: 'sneha@hms.com', 
    status: 'Active', 
    patients: 18 
  },
  { 
    name: 'Dr. Rahul Patil', 
    specialization: 'Orthopedics', 
    category: 'orthopedic',
    roleLevel: 'resident doctor',
    isOnDuty: true,
    experience: '15 Years', 
    availability: 'Mon–Fri (2PM–6PM)', 
    contact: '+91 76543 21098', 
    email: 'rahul@hms.com', 
    status: 'On Leave', 
    patients: 0 
  },
];

const initialPatients = [
  { 
    name: 'Suresh Raina', 
    age: 34, 
    gender: 'Male', 
    contact: '8765432109', 
    bloodGroup: 'B+', 
    status: 'Active', 
    address: 'Mumbai, MH', 
    medicalHistory: 'Diabetes Type 2',
    admissionDate: new Date('2024-05-01'),
    vitals: {
      bloodPressure: "120/80",
      heartRate: 72,
      temperature: 98.6,
      oxygenSaturation: 98,
      height: 175,
      weight: 75,
      bmi: 24.5
    },
    medicalReports: [
      { title: "Blood Test - June", fileUrl: "https://example.com/report1.pdf" }
    ]
  },
  { 
    name: 'Rohan Sharma', 
    age: 34, 
    gender: 'Male', 
    contact: '9876543210', 
    bloodGroup: 'B+', 
    status: 'Active', 
    address: 'Mumbai, MH', 
    medicalHistory: 'Diabetes Type 2',
    vitals: {
      bloodPressure: "130/85",
      heartRate: 80,
      temperature: 99.1,
      oxygenSaturation: 97,
      height: 168,
      weight: 70,
      bmi: 24.8
    }
  },
];

const initialAppointments = [
  { patient: 'Rohan Sharma', doctor: 'Dr. Aryan Mehta', dept: 'Cardiology', date: new Date(), time: '10:30 AM', status: 'Pending', reason: 'Chest pain' },
  { patient: 'Priya Verma', doctor: 'Dr. Sneha Verma', dept: 'Neurology', date: new Date(), time: '11:15 AM', status: 'Confirmed', reason: 'Headache' },
];

const initialExpenses = [
  { item: 'MRI Machine Maintenance', category: 'Machine', amount: 50000, date: new Date() },
  { item: 'Office Chairs', category: 'Furniture', amount: 12000, date: new Date() },
];

const initialBilling = [
  { patientName: "Rohan Sharma", amount: 1500, type: "OPD", paymentStatus: "Paid", department: "cardiology", category: "consultation" },
  { patientName: "Priya Verma", amount: 12000, type: "IPD", paymentStatus: "Paid", department: "neurology", category: "surgery" },
  { patientName: "Amit Patel", amount: 500, type: "OPD", paymentStatus: "Pending", department: "general", category: "medicine" },
];

const seedDB = async () => {
  try {
    await connectDB();

    console.log("🛠️ Starting Full Database Sync (Aligned with Dashboard Requirements)...");

    // Clean all collections
    await User.deleteMany();
    await Patient.deleteMany();
    await Doctor.deleteMany();
    await Appointment.deleteMany();
    await Expense.deleteMany();
    await Medicine.deleteMany();
    await Billing.deleteMany();

    console.log("🗑️ Cleared existing database records.");

    // 1. Seed Users
    const createdUsers = [];
    for (const u of usersData) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log(`✅ Seeded ${createdUsers.length} Base Users.`);

    // 2. Seed Doctors (Linking to User)
    const doctorUser = createdUsers.find(u => u.role === "doctor");
    if (doctorUser) initialDoctors[0].userId = doctorUser._id;
    await Doctor.insertMany(initialDoctors);
    console.log(`✅ Seeded ${initialDoctors.length} Doctors (with role levels & categories).`);

    // 3. Seed Patients (Linking to User)
    const patientUser = createdUsers.find(u => u.role === "patient");
    if (patientUser) initialPatients[0].userId = patientUser._id;
    await Patient.insertMany(initialPatients);
    console.log(`✅ Seeded ${initialPatients.length} Patients (with full vitals & reports).`);

    // 4. Seed Others
    await Appointment.insertMany(initialAppointments);
    await Expense.insertMany(initialExpenses);
    await Billing.insertMany(initialBilling);

    console.log(`✅ Seeded Dashboard Data (Appointments, Billing, Expenses).`);

    console.log("\n🎉 DATABASE SYNC COMPLETE! Your backend is now 100% aligned with your Admin Dashboard requirements.\n");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedDB();
