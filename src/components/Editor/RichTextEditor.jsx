import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// Thin wrapper so the rest of the app never imports CKEditor directly —
// keeps the editor swappable and styling centralized.
const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Write your networking guide…",
}) => {
  return (
    <div className="ckeditor-wrapper text-black rounded-xl border border-gray-200 bg-white/70 overflow-hidden dark:border-white/10 dark:!bg-slate-100">
      <CKEditor
        editor={ClassicEditor}
        data={value || ""}
        config={{
          placeholder,
          toolbar: {
            items: [
              "heading",
              "|",
              "bold",
              "italic",
              "link",
              "bulletedList",
              "numberedList",
              "|",
              "blockQuote",
              "insertTable",
              "codeBlock", // ← Code Block
              "|",
              "undo",
              "redo",
            ],
            shouldNotGroupWhenFull: true,
          },
          // Konfigurasi Code Block
          codeBlock: {
            languages: [
              { language: "plaintext", label: "Plain text" },
              { language: "bash", label: "Bash" },
              { language: "javascript", label: "JavaScript" },
              { language: "typescript", label: "TypeScript" },
              { language: "html", label: "HTML" },
              { language: "css", label: "CSS" },
              { language: "json", label: "JSON" },
              { language: "python", label: "Python" },
              { language: "sql", label: "SQL" },
              { language: "yaml", label: "YAML" },
            ],
          },
          // Styling heading agar konsisten
          heading: {
            options: [
              { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
              { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
              { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
              { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
            ],
          },
        }}
        onChange={(_event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
        onReady={(editor) => {
          // Optional: set default language for code block
          // editor.commands.get("codeBlock")?.execute({ language: "bash" });
        }}
      />
    </div>
  );
};

export default RichTextEditor;