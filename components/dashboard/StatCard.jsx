// StatCard — hiển thị 1 số liệu tổng quan
// Props:
//   label   (string)         — tên chỉ số
//   value   (number|string)  — giá trị chính
//   sub     (string)         — mô tả phụ
//   accent  (bool)           — highlight card bằng pink-soft (dùng cho streak)
export default function StatCard({ label, value, sub, accent = false }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: accent ? 'var(--pink-soft)' : 'var(--bg-surface)',
        border: `1px solid ${accent ? 'var(--pink-border)' : 'var(--border)'}`,
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <p
        className="text-[13px] mb-1.5 font-medium"
        style={{ color: accent ? 'var(--pink)' : 'var(--text-muted)' }}
      >
        {label}
      </p>
      <p
        className="text-4xl font-semibold leading-none"
        style={{ color: accent ? 'var(--pink)' : 'var(--text-primary)' }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[13px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
          {sub}
        </p>
      )}
    </div>
  )
}
