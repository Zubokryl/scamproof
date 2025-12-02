"use client";

import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";
import { useState, useEffect } from "react";

// More robust dynamic import with error handling
const SunEditor = dynamic(() => import("suneditor-react").catch(() => {
  // Fallback component in case of import failure
  return Promise.resolve(() => (
    <div className="sun-editor-fallback">
      <textarea 
        defaultValue={""}
        style={{
          width: "100%",
          height: "300px",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px"
        }}
        placeholder="Rich text editor failed to load. Please refresh the page."
      />
    </div>
  ));
}), {
  ssr: false,
  loading: () => (
    <div style={{
      height: "300px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f5f5f5",
      borderRadius: "4px"
    }}>
      Loading editor...
    </div>
  )
});

export default function SunEditorClient({ value, onChange }: any) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render on server side
  if (!isClient) {
    return (
      <div style={{
        height: "300px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: "4px"
      }}>
        Loading editor...
      </div>
    );
  }

  return (
    <SunEditor
      defaultValue={value}
      onChange={onChange}
      height="300px"
      setOptions={{
        buttonList: [
          ["undo", "redo"],
          ["bold", "italic", "underline", "strike"],
          ["fontColor", "hiliteColor"],
          ["align", "list", "table"],
          ["link", "image", "video"],
          ["fullScreen", "codeView"]
        ]
      }}
    />
  );
}