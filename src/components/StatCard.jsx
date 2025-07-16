export default function StatCard({ label, value }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow text-center">
      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{value}</div>
      <div className="text-gray-600 dark:text-gray-300 text-sm">{label}</div>
    </div>
  );
}
