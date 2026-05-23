// ==============================
// 📁 SchedulerControl.jsx
// ==============================

import { useState } from "react";
import toast from "react-hot-toast";

import {
  FaPlay,
  FaSpinner,
  FaDatabase,
  FaBoxes,
  FaGift,
} from "react-icons/fa";

import API from "../../api/axios";

export default function SchedulerControl() {
  const [loading, setLoading] = useState("");

  const schedulerList = [
    {
      key: "sampling",
      title: "Sampling Sync",
      desc: "Sync sampling sheet data instantly.",
      icon: <FaDatabase />,
      color:
        "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },

    {
      key: "not_in_stock",
      title: "Not In Stock",
      desc: "Run unavailable inventory sync manually.",
      icon: <FaBoxes />,
      color: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
      bg: "bg-red-50",
      text: "text-red-700",
    },

    {
      key: "mahotsav",
      title: "Mahotsav Sync",
      desc: "Update Mahotsav data immediately.",
      icon: <FaGift />,
      color:
        "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
      bg: "bg-green-50",
      text: "text-green-700",
    },
  ];

  const handleRun = async (type) => {
    try {
      setLoading(type);

      const res = await API.post("run-scheduler/", {
        type,
      });

      toast.success(
        res.data?.message || `${type} sync started`
      );
    } catch (err) {
      console.log(err);

      toast.error(
        err?.response?.data?.error ||
          "Failed to run scheduler"
      );
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {schedulerList.map((item) => {
        const isRunning = loading === item.key;

        return (
          <div
            key={item.key}
            className="group border border-gray-200 rounded p-5 bg-white transition-all duration-300"
          >
            {/* Top */}
            <div className="flex items-start justify-between">
              <div
                className={`${item.bg} ${item.text} p-4 rounded text-2xl`}
              >
                {item.icon}
              </div>

              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                Manual
              </span>
            </div>

            {/* Content */}
            <div className="mt-5">
              <h3 className="text-lg font-bold text-gray-800">
                {item.title}
              </h3>

              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                {item.desc}
              </p>
            </div>

            {/* Button */}
            <button
              onClick={() => handleRun(item.key)}
              disabled={isRunning}
              className={`mt-6 w-full bg-gradient-to-r ${item.color} text-white py-3 rounded font-semibold shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {isRunning ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <FaPlay />
                  Run Now
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}