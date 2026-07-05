import type { Extension } from "@codemirror/state";

// Lazily imports only the language package needed for the file being opened,
// instead of bundling all 8 language packages into every page load.
export async function languageForFile(
  filename: string,
): Promise<Extension | null> {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";

  switch (ext) {
    case "js":
    case "jsx":
      return (await import("@codemirror/lang-javascript")).javascript({
        jsx: true,
      });

    case "ts":
    case "tsx":
      return (await import("@codemirror/lang-javascript")).javascript({
        jsx: ext === "tsx",
        typescript: true,
      });

    case "vue":
      return (await import("@codemirror/lang-vue")).vue();

    case "md":
    case "markdown":
      return (await import("@codemirror/lang-markdown")).markdown();

    case "py":
      return (await import("@codemirror/lang-python")).python();

    case "rs":
      return (await import("@codemirror/lang-rust")).rust();

    case "c":
    case "h":
    case "cpp":
    case "hpp":
    case "cc":
      return (await import("@codemirror/lang-cpp")).cpp();

    case "java":
      return (await import("@codemirror/lang-java")).java();

    case "sql":
      return (await import("@codemirror/lang-sql")).sql();

    default:
      // Plain text fallback — no syntax highlighting, but the editor still works.
      // Add @codemirror/lang-html, @codemirror/lang-css, @codemirror/lang-json
      // if you want those covered too.
      return null;
  }
}
