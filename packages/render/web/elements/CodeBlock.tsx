import { useMemo, useState, useEffect } from "react";
import { useTheme } from "app/theme";
import copyToClipboard from "utils/clipboard";
import { Tooltip } from "render/web/ui/Tooltip";
import ReactLiveBlock, { createLiveScope } from "./ReactLiveBlock";
import JsonBlock from "./JsonBlock";
import MermaidContent from "./MermaidContent";
import { BaseModal } from "render/web/ui/BaseModal";
import {
  CheckIcon,
  CodeIcon,
  CopyIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ScreenFullIcon,
} from "@primer/octicons-react";

const loaders = {
  chart: () => import("echarts-for-react"),
  docx: () => import("docx"),
  flow: () => import("@xyflow/react"),
  three: () =>
    Promise.all([
      import("three"),
      import("@react-three/fiber"),
      import("@react-three/drei"),
    ]),
};

const needChart = (lang: string, code: string) =>
  /chart|echart|option\s*=/i.test(lang) || /ReactECharts/.test(code);

const needDocx = (lang: string, code: string, flag?: string) =>
  flag === "true" || /docx|Document|Packer|Paragraph/.test(lang + code);

const needFlow = (lang: string, code: string) =>
  /(flow|graph|dag)/i.test(lang) ||
  /ReactFlow|MiniMap|useNodesState/.test(code);

const needThree = (lang: string, code: string) =>
  /(three|r3f|gltf|glb|3d)/i.test(lang) ||
  /(Canvas|OrbitControls|useFrame|useThree|THREE|meshStandardMaterial)/i.test(
    code
  );

const CodeBlock = ({ attributes, children, element }) => {
  const theme = useTheme();
  const [isCopied, setIsCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(element.preview === "true");
  const [isCollapsed, setIsCollapsed] = useState(element.collapsed === "true");
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [extraScope, setExtraScope] = useState<Record<string, any>>({});

  const [language, filename] = useMemo(() => {
    const lang = element.language || "";
    const idx = lang.indexOf(":");
    return idx > -1 ? [lang.slice(0, idx), lang.slice(idx + 1)] : [lang, null];
  }, [element.language]);

  const content = useMemo(() => {
    const walk = (nodes) =>
      Array.isArray(nodes)
        ? nodes
            .map((node) => {
              if (!node) return "";
              if (typeof node.text === "string") return node.text;
              if (node.type === "code-line") return walk(node.children) + "\n";
              if (Array.isArray(node.children)) return walk(node.children);
              return "";
            })
            .join("")
        : "";
    try {
      return walk(element.children).replace(/\n$/, "");
    } catch (err) {
      console.error("Extract code error:", err, element);
      return "";
    }
  }, [element.children]);

  useEffect(() => {
    let cancelled = false;

    async function loadDependencies() {
      const scope: Record<string, any> = {};
      const tasks: Promise<void>[] = [];

      if (needChart(language, content)) {
        tasks.push(
          loaders.chart().then(({ default: ReactECharts }) => {
            scope.ReactECharts = ReactECharts;
          })
        );
      }

      if (needDocx(language, content, element.useDocx)) {
        tasks.push(
          loaders.docx().then((docx) => {
            scope.docx = docx;
          })
        );
      }

      if (needFlow(language, content)) {
        tasks.push(
          loaders.flow().then((flow) => {
            Object.assign(scope, {
              ReactFlow: flow.ReactFlow,
              Background: flow.Background,
              Controls: flow.Controls,
              MiniMap: flow.MiniMap,
              useNodesState: flow.useNodesState,
              useEdgesState: flow.useEdgesState,
              addEdge: flow.addEdge,
            });
          })
        );
      }

      if (needThree(language, content)) {
        tasks.push(
          loaders.three().then(([THREE, fiber, drei]) => {
            Object.assign(scope, {
              THREE,
              Canvas: fiber.Canvas,
              useFrame: fiber.useFrame,
              useThree: fiber.useThree,
              OrbitControls: drei.OrbitControls,
            });
          })
        );
      }

      try {
        await Promise.all(tasks);
        if (!cancelled) setExtraScope(scope);
      } catch (err) {
        console.error("Lazy dependency load failed:", err);
      }
    }

    loadDependencies();
    return () => {
      cancelled = true;
    };
  }, [language, content, element.useDocx]);

  const liveScope = useMemo(
    () => ({
      ...createLiveScope(theme),
      ...extraScope,
    }),
    [theme, extraScope]
  );

  const styles = `
    .code-block-wrapper {
      margin: var(--space-6) 0;
      background: var(--background);
      border-radius: var(--space-2);
      overflow: hidden;
    }
    .code-block-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 var(--space-2);
      background: var(--backgroundGhost);
      height: var(--space-8);
    }
    .language-tag,
    .filename-tag {
      font-size: 12px;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--space-1);
      color: var(--textSecondary);
    }
    .language-tag { background: var(--primaryGhost); text-transform: uppercase; }
    .filename-tag {
      background: var(--backgroundSecondary);
      margin-left: var(--space-2);
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .action-buttons { display: flex; gap: var(--space-1); }
    .action-button {
      border: none;
      background: transparent;
      padding: var(--space-2);
      color: var(--textSecondary);
      border-radius: var(--space-1);
      cursor: pointer;
    }
    .action-button:hover,
    .action-button.active {
      color: var(--text);
      background: var(--primaryGhost);
    }
    .code-content {
      margin: 0;
      padding: var(--space-4);
      font-family: 'SF Mono','Monaco',monospace;
      font-size: 14px;
      line-height: 1.6;
      color: var(--text);
      overflow-x: auto;
    }
    .preview-content { padding: 0; }
    .preview-content-fullscreen {
      min-height: 70vh;
      display: flex;
      flex-direction: column;
    }
    .preview-content-fullscreen .live-preview-wrapper,
    .preview-content-fullscreen .live-preview-content {
      flex: 1;
      min-height: 70vh;
      display: flex;
      flex-direction: column;
    }
    .preview-content-fullscreen .react-live-preview,
    .preview-content-fullscreen canvas,
    .preview-content-fullscreen .mermaid {
      flex: 1;
      width: 100%;
    }
    .fullscreen-preview-shell {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--background);
    }
    .fullscreen-preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--border);
    }
    .fullscreen-preview-body {
      flex: 1;
      padding: var(--space-2);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .fullscreen-close-button {
      border: none;
      background: var(--backgroundGhost);
      color: var(--text);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--space-1);
      cursor: pointer;
    }
    .fullscreen-close-button:hover { background: var(--primaryGhost); }
  `;

  const elementId = useMemo(
    () => element.id || `code-${Math.random().toString(36).slice(2, 11)}`,
    [element.id]
  );

  const renderPreview = ({
    previewMode = showPreview,
    collapsed = isCollapsed,
    fullscreen = false,
  }: {
    previewMode?: boolean;
    collapsed?: boolean;
    fullscreen?: boolean;
  } = {}) => {
    const wrapperClass = `preview-content${
      fullscreen ? " preview-content-fullscreen" : ""
    }`;

    if (language === "json" && previewMode && content && !collapsed) {
      return (
        <div className={wrapperClass}>
          <JsonBlock rawCode={content} showPreview={previewMode} />
        </div>
      );
    }

    if (language === "mermaid") {
      return (
        <div className={wrapperClass}>
          <MermaidContent
            elementId={elementId}
            content={content}
            showPreview={previewMode}
            isCollapsed={collapsed}
            children={children}
            theme={theme}
          />
        </div>
      );
    }

    if (
      (language === "jsx" || language === "tsx") &&
      previewMode &&
      !collapsed
    ) {
      return (
        <div className={wrapperClass}>
          <ReactLiveBlock
            rawCode={content}
            language={language}
            theme={theme}
            showPreview={previewMode}
            liveScope={liveScope}
            className={fullscreen ? "fullscreen-live" : undefined}
          />
        </div>
      );
    }

    if (!collapsed) {
      return (
        <pre className={`code-content language-${language || "plaintext"}`}>
          <code>{children}</code>
        </pre>
      );
    }
    return null;
  };

  const handleCopy = () => {
    copyToClipboard(content, {
      onSuccess: () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      },
      onError: (err) => console.error("Failed to copy:", err),
    });
  };

  return (
    <>
      <style href="code-block" precedence="medium">
        {styles}
      </style>

      <div {...attributes} className="code-block-wrapper">
        <div className="code-block-actions">
          <div style={{ display: "flex", alignItems: "center" }}>
            <span className="language-tag">{language || "text"}</span>
            {filename && (
              <Tooltip content={filename}>
                <span className="filename-tag">{filename}</span>
              </Tooltip>
            )}
          </div>
          <div className="action-buttons">
            <Tooltip content={showPreview ? "显示代码" : "显示预览"}>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`action-button ${showPreview ? "active" : ""}`}
              >
                {showPreview ? <CodeIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </Tooltip>
            <Tooltip content={isCopied ? "已复制!" : "复制代码"}>
              <button onClick={handleCopy} className="action-button">
                {isCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
              </button>
            </Tooltip>
            <Tooltip content={isCollapsed ? "展开代码" : "折叠代码"}>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`action-button ${isCollapsed ? "active" : ""}`}
              >
                {isCollapsed ? (
                  <ChevronUpIcon size={16} />
                ) : (
                  <ChevronDownIcon size={16} />
                )}
              </button>
            </Tooltip>
            <Tooltip content="全屏预览">
              <button
                onClick={() => setIsFullscreenOpen(true)}
                className="action-button"
              >
                <ScreenFullIcon size={16} />
              </button>
            </Tooltip>
          </div>
        </div>
        {renderPreview()}
      </div>

      <BaseModal
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        variant="fullscreen"
        closeOnBackdrop
        preventBodyScroll
        className="code-block-fullscreen-modal"
        zIndex={1200}
      >
        <div className="fullscreen-preview-shell">
          <div className="fullscreen-preview-header">
            <div>
              <span style={{ fontWeight: 500 }}>{language || "Preview"}</span>
              {filename && (
                <span style={{ marginLeft: 12, color: "var(--textSecondary)" }}>
                  {filename}
                </span>
              )}
            </div>
            <button
              className="fullscreen-close-button"
              onClick={() => setIsFullscreenOpen(false)}
            >
              退出全屏
            </button>
          </div>
          <div className="fullscreen-preview-body">
            {renderPreview({
              previewMode: true,
              collapsed: false,
              fullscreen: true,
            })}
          </div>
        </div>
      </BaseModal>
    </>
  );
};

export default CodeBlock;
