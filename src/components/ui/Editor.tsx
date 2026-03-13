"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, RotateCcw } from 'lucide-react'
import { clsx } from 'clsx'

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null

    return (
        <div className="flex flex-wrap items-center gap-1 p-1 bg-gray-50 border-b border-gray-200 rounded-t-xl">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={clsx(
                    "p-1.5 rounded transition-colors",
                    editor.isActive('bold') ? "bg-gray-200 text-[#0055ff]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}
                title="Bold"
            >
                <Bold size={14} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={clsx(
                    "p-1.5 rounded transition-colors",
                    editor.isActive('italic') ? "bg-gray-200 text-[#0055ff]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}
                title="Italic"
            >
                <Italic size={14} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={clsx(
                    "p-1.5 rounded transition-colors",
                    editor.isActive('underline') ? "bg-gray-200 text-[#0055ff]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}
                title="Underline"
            >
                <UnderlineIcon size={14} />
            </button>
            
            <div className="w-px h-4 bg-gray-200 mx-1" />
            
            <button
                type="button"
                onClick={() => {
                    const url = window.prompt('URL')
                    if (url) {
                        editor.chain().focus().setLink({ href: url }).run()
                    }
                }}
                className={clsx(
                    "p-1.5 rounded transition-colors",
                    editor.isActive('link') ? "bg-gray-200 text-[#0055ff]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}
                title="Link"
            >
                <LinkIcon size={14} />
            </button>
            
            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded transition-colors ml-auto"
                title="Undo"
            >
                <RotateCcw size={14} />
            </button>
        </div>
    )
}

export default function Editor({ value, onChange, placeholder = "Write something...", minHeight = "150px" }: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-[#0055ff] underline cursor-pointer',
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: clsx(
                    "prose prose-sm focus:outline-none max-w-none p-4 text-sm text-gray-800",
                    "min-h-[v-minHeight]"
                ),
                style: `min-height: ${minHeight};`,
            },
        },
    })

    // Update editor content if 'value' prop changes externally (e.g. from AI)
    // We only update if the content is truly different to avoid cursor jumping
    if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value, { emitUpdate: false })
    }

    return (
        <div className="border border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden focus-within:border-[#0055ff]/40 transition-colors">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}
