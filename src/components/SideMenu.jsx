export default function SideMenu({ items, activeKey, onSelect }) {
  return (
    <div className="side-menu">
      {items.map((m) => (
        <button
          key={m.key}
          onClick={() => onSelect(m.key)}
          className={`btn panel ${activeKey === m.key ? "active" : ""}`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
