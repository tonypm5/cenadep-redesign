import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Eye, Edit3 } from "lucide-react";

export const MarkdownEditor = ({ value, onChange, placeholder, "data-testid": testId, rows = 12 }) => {
  const [tab, setTab] = useState("edit");
  return (
    <div className="rounded-2xl border border-black/10 overflow-hidden bg-[#F8F9FA]">
      <div className="flex border-b border-black/5 bg-white">
        <button type="button" onClick={() => setTab("edit")} className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 ${tab === "edit" ? "text-[#1A8F4D] border-b-2 border-[#1A8F4D]" : "text-[#736B63]"}`}>
          <Edit3 className="w-3.5 h-3.5" /> Markdown
        </button>
        <button type="button" onClick={() => setTab("preview")} className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 ${tab === "preview" ? "text-[#1A8F4D] border-b-2 border-[#1A8F4D]" : "text-[#736B63]"}`}>
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
        <span className="ml-auto pr-4 self-center text-[10px] text-[#736B63]">**bold** *italic* [link](url) ## heading</span>
      </div>
      {tab === "edit" ? (
        <textarea
          data-testid={testId}
          required
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-5 py-4 bg-white focus:outline-none font-mono text-sm leading-relaxed"
          style={{ fontFamily: "SFMono-Regular, Menlo, monospace" }}
        />
      ) : (
        <div className="px-5 py-5 bg-white prose-cenadep text-[15px] text-[#0A0A0A] leading-relaxed min-h-[200px]">
          {value ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown> : <p className="text-[#736B63] italic">{placeholder || "Preview"}</p>}
        </div>
      )}
    </div>
  );
};
