import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const taskBarColors = ['#8F87F1', '#C68EFD', '#E9A5F1', '#FED2E2'];

const TaskChart = ({ data }) => {
  // Expected data format:
  // data = [{ name: 'Project A', tasks: 12 }, { name: 'Project B', tasks: 8 }, ...]

  return (
    <div className="bg-white shadow rounded-2xl p-4 w-full h-[300px]">
      <h2 className="text-lg font-semibold mb-4">Tasks by Project</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="tasks" fill={taskBarColors[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TaskChart;
