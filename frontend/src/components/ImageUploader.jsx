import React, { useRef, useState } from "react";
import { api, API } from "../lib/api";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export const ImageUploader = ({ value, onChange, "data-testid": testId = "image-uploader" }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);

  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Image uniquement"); return; }
    if (file.size > 6 * 1024 * 1024) { toast.error("Image trop lourde (max 6 MB)"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      // Backend returns a path like "/api/files/..."; combine with API origin so <img> can load it
      const apiOrigin = API.replace(/\/api$/, "");
      const fullUrl = `${apiOrigin}${r.data.url}`;
      onChange(fullUrl);
      toast.success("Image uploadée");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Upload échoué");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files?.[0]) upload(e.dataTransfer.files[0]);
  };

  return (
    <div data-testid={testId}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-colors overflow-hidden ${drag ? "border-[#1A8F4D] bg-[#1A8F4D]/5" : "border-black/15 bg-[#F8F9FA] hover:border-[#1A8F4D]"}`}
        style={{ aspectRatio: "16/9" }}
      >
        {value ? (
          <>
            <img src={value} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(""); }}
                data-testid="image-uploader-remove"
                className="px-4 py-2 rounded-full bg-white text-[#0A0A0A] text-sm font-semibold inline-flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Retirer
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#736B63]">
            {uploading ? <Loader2 className="w-7 h-7 animate-spin text-[#1A8F4D]" /> : <Upload className="w-7 h-7 text-[#1A8F4D]" />}
            <p className="mt-3 text-sm font-semibold">{uploading ? "Upload en cours…" : "Glissez une image ou cliquez"}</p>
            <p className="mt-1 text-xs">JPG · PNG · WebP · max 6 MB</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => upload(e.target.files?.[0])}
        data-testid="image-uploader-input"
      />
      {value && (
        <p className="mt-2 text-xs text-[#736B63] truncate">URL : <span className="font-mono">{value}</span></p>
      )}
    </div>
  );
};
