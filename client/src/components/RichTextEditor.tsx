import { useState, useEffect, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Quote, Image, Link, AlignCenter } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Write your thoughts here...", 
  minHeight = 200 
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize on content change
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(minHeight, textarea.scrollHeight)}px`;
    }
  }, [value, minHeight]);

  // Format functions (simplified without actual rich text capabilities)
  function handleFormat(formatType: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const selectedText = value.substring(selectionStart, selectionEnd);

    let newText = value;
    let newCursorPos = selectionEnd;

    switch (formatType) {
      case 'bold':
        newText = value.substring(0, selectionStart) + `**${selectedText}**` + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 4;
        break;
      case 'italic':
        newText = value.substring(0, selectionStart) + `*${selectedText}*` + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 2;
        break;
      case 'underline':
        newText = value.substring(0, selectionStart) + `__${selectedText}__` + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 4;
        break;
      case 'unordered-list':
        newText = value.substring(0, selectionStart) + `- ${selectedText}` + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 2;
        break;
      case 'ordered-list':
        newText = value.substring(0, selectionStart) + `1. ${selectedText}` + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 3;
        break;
      case 'quote':
        newText = value.substring(0, selectionStart) + `> ${selectedText}` + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 2;
        break;
      default:
        break;
    }

    onChange(newText);
    
    // Set cursor position after formatting
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }

  return (
    <div className="w-full">
      {/* Rich Text Editor Toolbar */}
      <div className="flex items-center border-b border-neutral-200 dark:border-gray-700 pb-3 mb-4 flex-wrap">
        <button 
          className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-gray-700 text-neutral-400 dark:text-gray-400 mr-1"
          onClick={() => handleFormat('bold')}
          type="button"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button 
          className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-gray-700 text-neutral-400 dark:text-gray-400 mr-1"
          onClick={() => handleFormat('italic')}
          type="button"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button 
          className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-gray-700 text-neutral-400 dark:text-gray-400 mr-1"
          onClick={() => handleFormat('underline')}
          type="button"
        >
          <Underline className="h-4 w-4" />
        </button>
        <button 
          className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-gray-700 text-neutral-400 dark:text-gray-400 mr-1"
          onClick={() => handleFormat('unordered-list')}
          type="button"
        >
          <List className="h-4 w-4" />
        </button>
        <button 
          className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-gray-700 text-neutral-400 dark:text-gray-400 mr-1"
          onClick={() => handleFormat('ordered-list')}
          type="button"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button 
          className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-gray-700 text-neutral-400 dark:text-gray-400 mr-1"
          onClick={() => handleFormat('quote')}
          type="button"
        >
          <Quote className="h-4 w-4" />
        </button>
        <span className="mx-2 text-neutral-200 dark:text-gray-600">|</span>
        <button 
          className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-gray-700 text-neutral-400 dark:text-gray-400 mr-1"
          type="button"
        >
          <Image className="h-4 w-4" />
        </button>
        <button 
          className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-gray-700 text-neutral-400 dark:text-gray-400 mr-1"
          type="button"
        >
          <Link className="h-4 w-4" />
        </button>
      </div>
      
      {/* Text Editor */}
      <textarea
        ref={textareaRef}
        className="w-full min-h-[200px] border-none focus:outline-none focus:ring-0 font-serif leading-relaxed text-neutral-600 dark:text-gray-300 resize-none bg-transparent"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
