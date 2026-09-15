import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// Thin wrapper so the rest of the app never imports CKEditor directly —
// keeps the editor swappable and styling centralized.
const RichTextEditor = ({ value, onChange, placeholder = "Write your networking guide…" }) => {
  return (
    <div className="ckeditor-wrapper rounded-card border border-border-light bg-white/70 dark:border-border-dark dark:bg-white/5">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        config={{
          placeholder,
          toolbar: [
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
            "codeBlock",
            "|",
            "undo",
            "redo",
          ],
        }}
        onChange={(_event, editor) => onChange(editor.getData())}
      />
    </div>
  );
};

export default RichTextEditor;
