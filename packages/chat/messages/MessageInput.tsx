import { UploadIcon } from "@primer/octicons-react";
import { retrieveFirstToken } from "auth/client/token";
import { useAuth } from "auth/useAuth";
import { setKeyPrefix } from "core/prefix";
import { generateFileID } from "database/fileUpload/generateFileID";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { defaultTheme } from "render/styles/colors";
import SendButton from "./ActionButton";
import ImagePreview from "./ImagePreview";

interface MessageInputProps {
	onSendMessage: (content: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
	const { t } = useTranslation();
	const auth = useAuth();
	const [textContent, setTextContent] = useState("");
	const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
	const [isDragOver, setIsDragOver] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleMessageChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			const textarea = e.target;
			textarea.style.height = "auto";
			textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
			setTextContent(e.target.value);
		},
		[],
	);

	const handleSend = useCallback(() => {
		if (!textContent.trim()) return;

		const content = imagePreviewUrls[0]
			? [
					{ type: "text", text: textContent },
					{ type: "image_url", image_url: { url: imagePreviewUrls[0] } },
				]
			: textContent;

		onSendMessage(content);
		setTextContent("");
		setImagePreviewUrls([]);
	}, [textContent, imagePreviewUrls, onSendMessage]);

	const uploadImage = async (file: File) => {
		/* 
    const buffer = await file.arrayBuffer();
    const formData = new FormData();
    formData.append("file", file);

    const prefix = setKeyPrefix({ isHash: true, isFile: true });
    const fileID = generateFileID(buffer);
    formData.append("id", `${prefix}-${auth.user?.userId}-${fileID}`);

    const token = await retrieveFirstToken();

    try {
      const response = await fetch("http://localhost/api/v1/db/write", {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Upload failed");

      const responseBody = await response.json();
      setImagePreviewUrls(prev => [
        ...prev,
        `http://localhost/api/v1/db/read/${responseBody.id}`
      ]);
    } catch (error) {
      console.error("Upload error:", error);
    }
    */
	};

	const previewImage = useCallback((file: File) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			setImagePreviewUrls((prev) => [...prev, reader.result as string]);
			// uploadImage(file);
		};
		reader.readAsDataURL(file);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			const files = Array.from(e.dataTransfer.files);
			files.forEach((file) => {
				if (file.type.startsWith("image/")) {
					previewImage(file);
				}
			});
			setIsDragOver(false);
		},
		[previewImage],
	);

	return (
		<>
			<style>
				{`
          .message-input-container {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 16px 20%;
            background: ${defaultTheme.background};
            container-type: inline-size;
          }

          .message-preview-wrapper {
            position: relative;
            width: 100%;
          }

          .input-controls {
            display: flex;
            gap: 8px;
            width: 100%;
          }

          .message-textarea {
            flex: 1;
            min-height: 48px;
            padding: 12px 16px;
            font-size: 15px;
            line-height: 1.5;
            border: 1px solid ${defaultTheme.border};
            border-radius: 10px;
            background: ${defaultTheme.backgroundSecondary};
            color: ${defaultTheme.text};
            resize: none;
            font-family: -apple-system, system-ui, sans-serif;
            transition: border-color 0.2s ease-out;
          }

          .message-textarea:focus {
            border-color: ${defaultTheme.primary};
            outline: none;
          }

          .upload-button {
            width: 48px;
            height: 48px;
            padding: 0;
            border: 1px solid ${defaultTheme.border};
            border-radius: 10px;
            background: ${defaultTheme.background};
            color: ${defaultTheme.textSecondary};
            cursor: pointer;
            transition: all 0.2s ease-out;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .upload-button:hover {
            border-color: ${defaultTheme.primary};
            color: ${defaultTheme.primary};
            background: ${defaultTheme.backgroundSecondary};
          }

          .drop-zone {
            position: absolute;
            inset: 0;
            border-radius: 12px;
            background: ${defaultTheme.backgroundGhost};
            border: 2px dashed ${defaultTheme.primary};
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            color: ${defaultTheme.primary};
            font-size: 15px;
            opacity: ${isDragOver ? 1 : 0};
            pointer-events: ${isDragOver ? "all" : "none"};
            transition: opacity 0.2s ease-out;
          }

          @container (max-width: 768px) {
            .message-input-container {
              padding: 12px;
              gap: 6px;
            }
            .message-textarea {
              font-size: 14px;
              padding: 10px;
            }
            .upload-button {
              width: 40px;
              height: 40px;
            }
          }
        `}
			</style>

			<div
				className="message-input-container"
				onDragOver={(e) => {
					e.preventDefault();
					setIsDragOver(true);
				}}
				onDragLeave={(e) => {
					e.preventDefault();
					setIsDragOver(false);
				}}
				onDrop={handleDrop}
			>
				{imagePreviewUrls.length > 0 && (
					<div className="message-preview-wrapper">
						<ImagePreview
							imageUrls={imagePreviewUrls}
							onRemove={(index) => {
								setImagePreviewUrls((prev) =>
									prev.filter((_, i) => i !== index),
								);
							}}
						/>
					</div>
				)}

				<div className="input-controls">
					<button
						className="upload-button"
						onClick={() => fileInputRef.current?.click()}
						title={t("uploadImage")}
					>
						<UploadIcon size={20} />
					</button>

					<textarea
						className="message-textarea"
						value={textContent}
						placeholder={t("messageOrImageHere")}
						onChange={handleMessageChange}
						onKeyDown={(e) => {
							if (
								e.key === "Enter" &&
								!e.shiftKey &&
								!e.nativeEvent.isComposing
							) {
								e.preventDefault();
								handleSend();
							}
						}}
						onPaste={(e) => {
							const items = Array.from(e.clipboardData.items);
							items.forEach((item) => {
								if (item.type.indexOf("image") !== -1) {
									const file = item.getAsFile();
									if (file) previewImage(file);
								}
							});
						}}
					/>

					<SendButton onClick={handleSend} />
				</div>

				{isDragOver && (
					<div className="drop-zone">
						<UploadIcon size={24} />
						<span>{t("dropToUpload")}</span>
					</div>
				)}

				<input
					ref={fileInputRef}
					type="file"
					hidden
					accept="image/*"
					multiple
					onChange={(e) => {
						Array.from(e.target.files || []).forEach(previewImage);
					}}
				/>
			</div>
		</>
	);
};

export default MessageInput;
