'use client';

import { useEffect, useState } from 'react';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function QuillEditor({ value, onChange }: QuillEditorProps) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return <div className="articles-form-textarea">Загрузка редактора...</div>;
  }
  
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="articles-form-textarea w-full min-h-[200px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      placeholder="Введите содержимое статьи..."
    />
  );
}
