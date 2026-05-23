
import {
  FaCog,
  FaSyncAlt,
  FaDatabase,
  FaShieldAlt,
  FaServer,
  FaClock,
} from "react-icons/fa";

import SchedulerControl from "./SchedulerControl";
import MobilePageHeader from "../../components/MobilePageHeader";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <MobilePageHeader title="Settings" />

      <div className="max-w-7xl mx-auto px-3 sm:px-5 pt-[70px] sm:pt-5">
       
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-5 py-5">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 text-green-700 p-3 rounded-2xl">
                <FaSyncAlt className="text-xl" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Manual Scheduler Operations
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Run scheduler jobs manually whenever needed.
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6">
            <SchedulerControl />
          </div>
        </div>
      </div>
    </div>
  );
}