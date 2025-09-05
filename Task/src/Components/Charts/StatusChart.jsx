import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const statusColors = ['#8F87F1', '#C68EFD', '#E9A5F1', '#FED2E2'];

const StatusChart = ({ data }) => {
  // Expected data format:
  // data = [{ name: 'Pending', value: 10 }, { name: 'In Progress', value: 5 }, ...]
  
  return (
    <div className="bg-white shadow rounded-2xl p-4 w-full h-[300px]">
      <h2 className="text-lg font-semibold mb-4">Task Status Distribution</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={40}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusChart;
