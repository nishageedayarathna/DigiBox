import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const AnalyticsChart = ({ data, showLabels = true }) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="month" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #26bfef",
              color: "#fff",
            }}
          />
          <Bar dataKey="causes" fill="#26bfef" radius={[6, 6, 0, 0]}>
            {showLabels && (
              <LabelList
                dataKey="causes"
                position="top"
                fill="#fff"
                fontSize={12}
                fontWeight="bold"
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart;
