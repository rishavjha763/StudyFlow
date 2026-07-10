import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FiTrendingUp } from "react-icons/fi";

// Weekly study time bar chart. Axis label colors are handled globally in index.css
// (.recharts-cartesian-axis-tick text) since Recharts renders raw SVG text that
// Tailwind's dark: variant can't reach through className alone.
export default function StudyChart({ data }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <FiTrendingUp className="text-primary-600 dark:text-primary-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          This week
        </h3>
      </div>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-100 dark:stroke-gray-800"
            />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} unit="m" width={36} />
            <Tooltip
              formatter={(value) => [`${value} min`, "Studied"]}
              contentStyle={{
                borderRadius: 10,
                fontSize: 13,
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Bar dataKey="minutes" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
