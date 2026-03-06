"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WeightTrendChartProps {
  data: Array<{ date: string | Date; bodyWeight: number | null }>;
}

export default function WeightTrendChart({ data }: WeightTrendChartProps) {
  const formattedData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString(),
    weight: d.bodyWeight,
  }));

  if (formattedData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg text-gray-400">
        No weight data recorded yet.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h3 className="text-lg font-semibold mb-6">Body Weight Trend</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex justify-end space-x-2">
        <button className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">Daily</button>
        <button className="px-3 py-1 text-xs font-medium rounded-full text-gray-500 hover:bg-gray-100">Monthly</button>
      </div>
    </div>
  );
}
