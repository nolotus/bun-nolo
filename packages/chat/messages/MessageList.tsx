// chat/MessagesList.tsx

import { useAppDispatch, useAppSelector, useFetchData } from "app/hooks";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { reverse } from "rambda";
import type React from "react";
import { useEffect, useRef } from "react";
import { BASE_COLORS } from "render/styles/colors";
import { MessageItem } from "./MessageItem";
import { initMessages } from "./messageSlice";
import { selectMergedMessages, selectStreamMessages } from "./selector";

const MessagesList: React.FC = () => {
	const dispatch = useAppDispatch();
	const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
	const messages = useAppSelector(selectMergedMessages);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const id = currentDialogConfig.messageListId;

	if (!id) {
		return <div>mei id</div>;
	}

	const { data, isLoading, error } = useFetchData(id);
	const streamingMessages = useAppSelector(selectStreamMessages);

	const scrollToBottom = () => {
		if (containerRef.current) {
			containerRef.current.scrollTop = containerRef.current.scrollHeight;
		}
	};

	useEffect(() => {
		if (streamingMessages) {
			scrollToBottom();
		}
	}, [streamingMessages, messages]);

	useEffect(() => {
		if (data) {
			dispatch(initMessages(reverse(data.array)));
		}
		return () => {
			dispatch(initMessages());
		};
	}, [data]);

	// 加载状态显示改为:
	if (isLoading) {
		return (
			<div
				style={{
					height: "100%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<div
					style={{
						width: "40px",
						height: "40px",
						border: `3px solid ${BASE_COLORS.border}`,
						borderTop: `3px solid ${BASE_COLORS.primary}`,
						borderRadius: "50%",
						animation: "spin 1s linear infinite",
					}}
				>
					<style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
				</div>
			</div>
		);
	}

	if (error) {
		return <div style={{ height: "100%" }}>{error.message}</div>;
	}

	return (
		<>
			<style>
				{`
          .message-list {
            display: flex;
            flex-direction: column-reverse;
            gap: 12px;
            overflow-y: auto;
            padding: 20px 15% 10px 15%;
            height: 100%;
            position: relative;
            background-color: ${BASE_COLORS.background};
            scroll-behavior: smooth;
            scrollbar-width: thin;
            scrollbar-color: ${BASE_COLORS.border} transparent;
            container-type: inline-size;
          }
  
          /* 容器查询 */
          @container (max-width: 768px) {
            .message-list {
              padding: 12px 8px 8px 8px !important;
              gap: 8px !important;
            }
            
            .message-list img {
              max-width: 100% !important;
              height: auto !important;
            }
            
            .message-list pre {
              max-width: 100% !important;
              overflow-x: auto !important;
              font-size: 14px !important;
            }
          }
  
          @container (min-width: 769px) and (max-width: 1024px) {
            .message-list {
              padding: 20px 10% 10px 10% !important;
              gap: 10px !important;
            }
          }
  
          /* 媒体查询 */
          @media screen and (max-width: 768px) {
            .message-list {
              padding: 12px 8px 8px 8px;
              gap: 8px;
            }
          }
  
          @media screen and (min-width: 769px) and (max-width: 1024px) {
            .message-list {
              padding: 20px 10% 10px 10%;
              gap: 10px;
            }
          }
        `}
			</style>
			<div ref={containerRef} className="message-list">
				{messages.map((message) => (
					<MessageItem key={message.id} message={message} />
				))}
			</div>
		</>
	);
};

export default MessagesList;
