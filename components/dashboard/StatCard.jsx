// StatCard — hiển thị 1 số liệu tổng quan
// Props: label (string), value (number|string), sub (string - mô tả nhỏ)
export default function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <p className="text-[11px] text-gray-400 mb-1.5">{label}</p>
      <p className="text-2xl font-medium text-gray-900">{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}
