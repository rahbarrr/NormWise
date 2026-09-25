import React from "react";

export const ExtractedAttributes = ({ attributes }) => {
  if (!attributes) return null;

  const items = [
    { label: "Product", value: attributes.product },
    { label: "Material", value: attributes.material },
    { label: "Capacity", value: attributes.capacity },
    { label: "Application", value: attributes.application },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 animate-in fade-in duration-200">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            {item.label}
          </span>
          <span className="font-semibold text-slate-800 block truncate font-sans">
            {item.value || "—"}
          </span>
        </div>
      ))}
    </div>
  );
};
