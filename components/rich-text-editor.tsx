'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect } from 'react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import ListItem from '@tiptap/extension-list-item'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Type
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  error?: boolean
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
      {/* Text Formatting */}
      <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('bold') ? 'bg-gray-200' : ''
          )}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('italic') ? 'bg-gray-200' : ''
          )}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('strike') ? 'bg-gray-200' : ''
          )}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('code') ? 'bg-gray-200' : ''
          )}
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      {/* Headings */}
      <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(
            "h-8 px-2 text-xs font-bold",
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
          )}
        >
          H1
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "h-8 px-2 text-xs font-bold",
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
          )}
        >
          H2
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            "h-8 px-2 text-xs font-bold",
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''
          )}
        >
          H3
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('paragraph') ? 'bg-gray-200' : ''
          )}
        >
          <Type className="h-4 w-4" />
        </Button>
      </div>

      {/* Text Alignment */}
      <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''
          )}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''
          )}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''
          )}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''
          )}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>

      {/* Lists */}
      <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('bulletList') ? 'bg-gray-200' : ''
          )}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('orderedList') ? 'bg-gray-200' : ''
          )}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('blockquote') ? 'bg-gray-200' : ''
          )}
        >
          <Quote className="h-4 w-4" />
        </Button>
      </div>

      {/* Undo/Redo */}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing...", 
  className,
  error = false 
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'bullet-list',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'ordered-list',
        },
      }),
      ListItem,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
          'prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl',
          'prose-p:text-gray-700 prose-p:leading-relaxed',
          'prose-ul:list-disc prose-ol:list-decimal',
          'prose-li:text-gray-700',
          'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic',
          'prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
          className
        ),
      },
    },
  })

  // Update editor content when the content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  return (
    <div className={cn(
      "border rounded-md overflow-hidden",
      error ? "border-red-500" : "border-gray-200",
      "focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
    )}>
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
        placeholder={placeholder}
        className="min-h-[400px]"
      />
    </div>
  )
}

// Custom styles for the editor
export const editorStyles = `
  .ProseMirror {
    outline: none;
  }
  
  .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: #adb5bd;
    pointer-events: none;
    height: 0;
  }
  
  .ProseMirror .bullet-list {
    list-style-type: disc;
    padding-left: 1.5rem;
  }
  
  .ProseMirror .ordered-list {
    list-style-type: decimal;
    padding-left: 1.5rem;
  }
  
  .ProseMirror .ordered-list[data-type="a"] {
    list-style-type: lower-alpha;
  }
  
  .ProseMirror .ordered-list[data-type="A"] {
    list-style-type: upper-alpha;
  }
  
  .ProseMirror .ordered-list[data-type="i"] {
    list-style-type: lower-roman;
  }
  
  .ProseMirror .ordered-list[data-type="I"] {
    list-style-type: upper-roman;
  }
  
  .ProseMirror li {
    margin: 0.25rem 0;
  }
  
  .ProseMirror blockquote {
    border-left: 4px solid #e5e7eb;
    padding-left: 1rem;
    margin: 1rem 0;
    font-style: italic;
    color: #6b7280;
  }
  
  .ProseMirror code {
    background-color: #f3f4f6;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family: 'Courier New', monospace;
  }
  
  .ProseMirror h1 {
    font-size: 2rem;
    font-weight: bold;
    margin: 1.5rem 0 1rem 0;
    line-height: 1.2;
  }
  
  .ProseMirror h2 {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 1.25rem 0 0.75rem 0;
    line-height: 1.3;
  }
  
  .ProseMirror h3 {
    font-size: 1.25rem;
    font-weight: bold;
    margin: 1rem 0 0.5rem 0;
    line-height: 1.4;
  }
  
  .ProseMirror p {
    margin: 0.75rem 0;
    line-height: 1.6;
  }
`