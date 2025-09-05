import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex gap-2 flex-wrap mb-2">
      <button
      type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 rounded text-sm ${
          editor.isActive("bold")
            ? "bg-purple-200 text-purple-700"
            : "text-gray-600 hover:text-purple-700"
        }`}
      >
        Bold
      </button>
      <button
      type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 rounded text-sm ${
          editor.isActive("italic")
            ? "bg-purple-200 text-purple-700"
            : "text-gray-600 hover:text-purple-700"
        }`}
      >
        Italic
      </button>
      <button
      type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 rounded text-sm ${
          editor.isActive("bulletList")
            ? "bg-purple-200 text-purple-700"
            : "text-gray-600 hover:text-purple-700"
        }`}
      >
        • List
      </button>
    </div>
  );
};

export default function ProjectDescriptionEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "<p></p>" ,
    editorProps: {
      attributes: {
        class:
          "min-h-[100px] max-h-[300px] p-3 border rounded-xl shadow bg-white outline-none",
        style: "direction: ltr; unicode-bidi: plaintext; text-align: left;",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">
        Description
      </label>
      <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-3">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
