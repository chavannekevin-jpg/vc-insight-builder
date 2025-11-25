import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import { Bold, Italic, UnderlineIcon, Heading1, Heading2, Heading3, List, ListOrdered, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, Pilcrow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({ content, onChange, placeholder }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      FontFamily,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
        style: 'font-size: 16px',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    icon: Icon, 
    label 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: React.ElementType; 
    label: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        'h-8 w-8 p-0',
        isActive && 'bg-muted'
      )}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  const getFontSize = () => {
    const fontSize = editor.getAttributes('textStyle').fontSize;
    return fontSize || '16px';
  };

  const getFontFamily = () => {
    const fontFamily = editor.getAttributes('textStyle').fontFamily;
    return fontFamily || 'default';
  };

  return (
    <div className="border rounded-md">
      <div className="flex gap-1 p-2 border-b bg-muted/30 flex-wrap items-center">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={Bold}
          label="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={Italic}
          label="Italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          icon={UnderlineIcon}
          label="Underline"
        />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Select
          value={getFontSize()}
          onValueChange={(value) => {
            if (value === 'default') {
              editor.chain().focus().unsetMark('textStyle').run();
            } else {
              editor.chain().focus().setMark('textStyle', { fontSize: value }).run();
            }
          }}
        >
          <SelectTrigger className="w-[100px] h-8 text-xs">
            <Type className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border z-50">
            <SelectItem value="default">Normal</SelectItem>
            <SelectItem value="12px">Small</SelectItem>
            <SelectItem value="14px">14px</SelectItem>
            <SelectItem value="16px">16px</SelectItem>
            <SelectItem value="18px">18px</SelectItem>
            <SelectItem value="20px">20px</SelectItem>
            <SelectItem value="24px">Large</SelectItem>
            <SelectItem value="32px">X-Large</SelectItem>
            <SelectItem value="40px">XX-Large</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={getFontFamily()}
          onValueChange={(value) => {
            if (value === 'default') {
              editor.chain().focus().unsetFontFamily().run();
            } else {
              editor.chain().focus().setFontFamily(value).run();
            }
          }}
        >
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border z-50">
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="Arial, sans-serif">Arial</SelectItem>
            <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
            <SelectItem value="Georgia, serif">Georgia</SelectItem>
            <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
            <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
            <SelectItem value="'Comic Sans MS', cursive">Comic Sans</SelectItem>
            <SelectItem value="Impact, sans-serif">Impact</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive('paragraph')}
          icon={Pilcrow}
          label="Paragraph"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon={Heading1}
          label="Heading 1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={Heading2}
          label="Heading 2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          icon={Heading3}
          label="Heading 3"
        />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          icon={AlignLeft}
          label="Align Left"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          icon={AlignCenter}
          label="Align Center"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          icon={AlignRight}
          label="Align Right"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          icon={AlignJustify}
          label="Justify"
        />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={List}
          label="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={ListOrdered}
          label="Numbered List"
        />
      </div>
      
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none"
      />
      
      {placeholder && !editor.getText() && (
        <div className="absolute top-14 left-4 text-muted-foreground pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};
