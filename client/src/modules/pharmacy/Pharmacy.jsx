import React from "react";
import { motion } from "framer-motion";

const Pharmacy = () => {
  const medicines = [
    { id: 1, name: "Paracetamol", qty: 50, price: 20 },
    { id: 2, name: "Crocin", qty: 30, price: 25 },
    { id: 3, name: "Dolo 650", qty: 40, price: 30 },
    { id: 4, name: "Aspirin", qty: 20, price: 15 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4">
        <h2 className="text-xl font-semibold">💊 Pharmacy Management</h2>
        <p className="text-sm opacity-80">Manage medicines & stock</p>
      </div>

      {/* Table */}
      <div className="p-4">
        <table className="w-full">
          <thead>
            <tr className="text-gray-500 text-sm text-left">
              <th className="pb-2">Medicine</th>
              <th>Stock</th>
              <th>Price</th>
            </tr>
          </thead>

          <tbody>
            {medicines.map((med) => (
              <tr
                key={med.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="py-3 font-medium">{med.name}</td>

                <td>
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                    {med.qty} units
                  </span>
                </td>

                <td className="font-semibold text-gray-700">
                  ₹{med.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Pharmacy;