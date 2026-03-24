import React from "react";
import { motion } from "framer-motion";

const Billing = () => {
  const bills = [
    { id: 1, patient: "Rajesh", amount: 5000, status: "Paid", date: "12 Mar" },
    { id: 2, patient: "Moses", amount: 3000, status: "Pending", date: "13 Mar" },
    { id: 3, patient: "Vijay Kumar", amount: 7000, status: "Paid", date: "14 Mar" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
        <h2 className="text-xl font-semibold">💰 Billing Management</h2>
        <p className="text-sm opacity-80">Manage patient bills & payments</p>
      </div>

      {/* Table */}
      <div className="p-4">
        <table className="w-full">
          <thead>
            <tr className="text-gray-500 text-sm text-left">
              <th className="pb-2">Patient</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {bills.map((bill) => (
              <tr
                key={bill.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="py-3 font-medium">{bill.patient}</td>
                <td className="font-semibold text-gray-700">
                  ₹{bill.amount}
                </td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      bill.status === "Paid"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {bill.status}
                  </span>
                </td>

                <td className="text-gray-500">{bill.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Billing;