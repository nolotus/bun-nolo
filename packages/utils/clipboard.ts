// "utils/clipboard";

import { toast } from "react-hot-toast";

interface CopyOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const copyToClipboard = (text: string, options: CopyOptions = {}): void => {
  const { onSuccess, onError } = options;

  const fallbackCopyTextToClipboard = () => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        console.log("Fallback: Copying text command was successful");
        toast.success("Content copied to clipboard");
        onSuccess?.();
      } else {
        throw new Error("Fallback: Unable to copy");
      }
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
      toast.error("Failed to copy content");
      onError?.(err instanceof Error ? err : new Error("Failed to copy"));
    } finally {
      document.body.removeChild(textArea);
    }
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Content successfully copied to clipboard");
        toast.success("Content copied to clipboard");
        onSuccess?.();
      })
      .catch((err) => {
        console.error("Failed to copy content: ", err);
        fallbackCopyTextToClipboard();
      });
  } else {
    fallbackCopyTextToClipboard();
  }
};

export default copyToClipboard;
