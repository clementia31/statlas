export default function TopBar() {
  return (
    <div className="h-[54px] border-b border-border flex items-center gap-3.5 px-[22px] shrink-0">
      <input
        type="text"
        placeholder="Rechercher un indicateur, un pays..."
        className="flex-1 max-w-[380px] bg-panel2 border border-border rounded-md px-3 py-1.5 text-[13px] text-textSecondary outline-none"
      />
      <select className="bg-panel2 border border-border rounded-md px-3 py-1.5 text-xs font-mono text-textSecondary">
        <option>IDH</option>
        <option>PIB nominal</option>
        <option>Fécondité</option>
      </select>
      <select className="bg-panel2 border border-border rounded-md px-3 py-1.5 text-xs font-mono text-textSecondary">
        <option>2024</option>
        <option>2023</option>
        <option>2020</option>
      </select>
    </div>
  );
}
