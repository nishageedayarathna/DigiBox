import React from "react";

const RecentList = ({
  title = "Recent Activity",
  data = [],
  titleKey = "title",
  statusKey = "status",
  dateKey = "date",
}) => {
  return (
    <div className="bg-[#1F2937] p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-[#26bfef]">{title}</h2>

      {data.length > 0 ? (
        <ul className="space-y-3">
          {data.map((item, index) => {
            const status = item[statusKey];
            const statusColor =
              status === "Approved"
                ? "text-green-400"
                : status === "Pending"
                ? "text-yellow-400"
                : status === "Rejected"
                ? "text-red-400"
                : "text-gray-300";

            return (
              <li
                key={index}
                className="flex justify-between items-center bg-[#111827] p-3 rounded-lg hover:shadow-md transition"
              >
                <div>
                  <p className="font-medium">{item[titleKey]}</p>
                  <p className="text-sm text-gray-400">{item[dateKey]}</p>
                </div>
                <span className={`font-semibold ${statusColor}`}>{status}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-gray-400 text-sm text-center">No recent records found.</p>
      )}
    </div>
  );
};

export default RecentList;
