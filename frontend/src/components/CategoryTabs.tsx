"use client";
interface Props {
  categories: string[];
  active: string;
  onChange: (cat: string) => void;
}

export default function CategoryTabs({ categories, active, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onChange("All")}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
          ${active === "All"
            ? "bg-orange-500 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
            ${active === cat
              ? "bg-orange-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}