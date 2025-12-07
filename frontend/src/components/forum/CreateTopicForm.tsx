import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/forum/Input";
import { Textarea } from "@/components/forum/Textarea";
import { Send, X } from "lucide-react";

interface CreateTopicFormProps {
  onSubmit: (title: string, content: string) => void;
  onCancel: () => void;
}

const CreateTopicForm = ({ onSubmit, onCancel }: CreateTopicFormProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSubmit(title.trim(), content.trim());
      setTitle("");
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative bg-transparent border border-cyan-500/30 rounded-sm p-4 transform skew-x-[-2deg]">
        <div className="transform skew-x-[2deg] space-y-4">
          <Input
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="Заголовок темы..."
            className="bg-background/50 border-cyan-500/20 focus:border-cyan-400/50"
          />
          
          <Textarea
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
            placeholder="Опишите вашу тему..."
            rows={4}
            className="bg-background/50 border-cyan-500/20 focus:border-cyan-400/50 resize-none"
          />
          
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-muted-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Отмена
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!title.trim() || !content.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 text-background"
            >
              <Send className="w-4 h-4 mr-1" />
              Создать тему
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateTopicForm;