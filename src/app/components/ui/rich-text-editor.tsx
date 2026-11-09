import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link } from "@/app/lib/lucide-icons";
import { Button } from "./button";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Enter text...",
  id,
  className = "",
  minHeight = "150px"
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // Keep the editor in step with `value` — including when the parent
  // switches record or clears it — but never rewrite content the user is
  // typing (the value then already equals the editor's own innerHTML).
  useEffect(() => {
    const el = editorRef.current;
    if (el && el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    const formats = new Set<string>();
    
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('insertUnorderedList')) formats.add('ul');
    if (document.queryCommandState('insertOrderedList')) formats.add('ol');
    if (document.queryCommandState('justifyLeft')) formats.add('left');
    if (document.queryCommandState('justifyCenter')) formats.add('center');
    if (document.queryCommandState('justifyRight')) formats.add('right');
    
    setActiveFormats(formats);
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveFormats();
    handleInput();
  };

  const createLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const isActive = (format: string) => activeFormats.has(format);

  return (
    <div className={className}>
      {/* Toolbar */}
      <div 
        className="flex items-center gap-1 p-2 rounded-t border-b"
        style={{
          backgroundColor: 'var(--slds-g-color-neutral-95)',
          borderColor: 'var(--slds-g-color-border-base-1)'
        }}
      >
        {/* Text Formatting */}
        <Button
          type="button"
          onClick={() => execCommand('bold')}
          className="h-8 w-8 p-0 rounded-full"
          style={{
            backgroundColor: isActive('bold') ? 'var(--slds-g-color-neutral-90)' : 'transparent',
            color: 'var(--slds-g-color-text-default)',
            border: '1px solid var(--slds-g-color-border-base-1)'
          }}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          onClick={() => execCommand('italic')}
          className="h-8 w-8 p-0 rounded-full"
          style={{
            backgroundColor: isActive('italic') ? 'var(--slds-g-color-neutral-90)' : 'transparent',
            color: 'var(--slds-g-color-text-default)',
            border: '1px solid var(--slds-g-color-border-base-1)'
          }}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          onClick={() => execCommand('underline')}
          className="h-8 w-8 p-0 rounded-full"
          style={{
            backgroundColor: isActive('underline') ? 'var(--slds-g-color-neutral-90)' : 'transparent',
            color: 'var(--slds-g-color-text-default)',
            border: '1px solid var(--slds-g-color-border-base-1)'
          }}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>

        {/* Separator */}
        <div 
          className="h-6 w-px mx-1"
          style={{ backgroundColor: 'var(--slds-g-color-border-base-1)' }}
        />

        {/* Lists */}
        <Button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="h-8 w-8 p-0 rounded-full"
          style={{
            backgroundColor: isActive('ul') ? 'var(--slds-g-color-neutral-90)' : 'transparent',
            color: 'var(--slds-g-color-text-default)',
            border: '1px solid var(--slds-g-color-border-base-1)'
          }}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="h-8 w-8 p-0 rounded-full"
          style={{
            backgroundColor: isActive('ol') ? 'var(--slds-g-color-neutral-90)' : 'transparent',
            color: 'var(--slds-g-color-text-default)',
            border: '1px solid var(--slds-g-color-border-base-1)'
          }}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        {/* Separator */}
        <div 
          className="h-6 w-px mx-1"
          style={{ backgroundColor: 'var(--slds-g-color-border-base-1)' }}
        />

        {/* Alignment */}
        <Button
          type="button"
          onClick={() => execCommand('justifyLeft')}
          className="h-8 w-8 p-0 rounded-full"
          style={{
            backgroundColor: isActive('left') ? 'var(--slds-g-color-neutral-90)' : 'transparent',
            color: 'var(--slds-g-color-text-default)',
            border: '1px solid var(--slds-g-color-border-base-1)'
          }}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          onClick={() => execCommand('justifyCenter')}
          className="h-8 w-8 p-0 rounded-full"
          style={{
            backgroundColor: isActive('center') ? 'var(--slds-g-color-neutral-90)' : 'transparent',
            color: 'var(--slds-g-color-text-default)',
            border: '1px solid var(--slds-g-color-border-base-1)'
          }}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          onClick={() => execCommand('justifyRight')}
          className="h-8 w-8 p-0 rounded-full"
          style={{
            backgroundColor: isActive('right') ? 'var(--slds-g-color-neutral-90)' : 'transparent',
            color: 'var(--slds-g-color-text-default)',
            border: '1px solid var(--slds-g-color-border-base-1)'
          }}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        {/* Separator */}
        <div 
          className="h-6 w-px mx-1"
          style={{ backgroundColor: 'var(--slds-g-color-border-base-1)' }}
        />

        {/* Link */}
        <Button
          type="button"
          onClick={createLink}
          className="h-8 w-8 p-0 rounded-full"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--slds-g-color-text-default)',
            border: '1px solid var(--slds-g-color-border-base-1)'
          }}
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
        onInput={handleInput}
        onMouseUp={updateActiveFormats}
        onKeyUp={updateActiveFormats}
        id={id}
        className="text-[13px] p-3 rounded-b outline-none overflow-auto border border-t-0 border-[var(--slds-g-color-border-base-1)] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        style={{
          backgroundColor: 'var(--slds-g-color-background-base)',
          color: 'var(--slds-g-color-text-default)',
          minHeight
        }}
        data-placeholder={placeholder}
      />

      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: var(--slds-g-color-text-placeholder);
          pointer-events: none;
          position: absolute;
        }
        [contenteditable] {
          position: relative;
        }
        [contenteditable] ul,
        [contenteditable] ol {
          margin-left: 1.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        [contenteditable] li {
          margin-bottom: 0.25rem;
        }
        [contenteditable] a {
          color: #0176d3;
          text-decoration: underline;
        }
        [contenteditable]:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
