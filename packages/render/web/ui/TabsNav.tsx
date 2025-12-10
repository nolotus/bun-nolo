import React, { useLayoutEffect, useRef, useState } from "react";

export interface Tab {
  id: number | string;
  label: React.ReactNode; // ⭐ 支持任意 JSX：图标 + 文本 等
  disabled?: boolean;
}

interface TabsNavProps {
  tabs: Tab[];
  activeTab: number | string;
  onChange: (tabId: number | string) => void;
  className?: string;
}

const TabsNav: React.FC<TabsNavProps> = ({
  tabs,
  activeTab,
  onChange,
  className = "",
}) => {
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  const rawIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const activeIndex = rawIndex < 0 ? 0 : rawIndex;

  const [slider, setSlider] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  // 根据当前激活的 tab 动态计算滑块的位置与宽度
  useLayoutEffect(() => {
    const tabsEl = tabsRef.current;
    if (!tabsEl) return;

    const activeEl = tabsEl.querySelector<HTMLButtonElement>(
      'button[data-active="true"]'
    );
    if (!activeEl) return;

    const left = activeEl.offsetLeft;
    const width = activeEl.offsetWidth;

    setSlider({ left, width });

    // 自动滚动：让当前 tab 尽量出现在中间
    const navEl = navRef.current;
    if (navEl) {
      const navWidth = navEl.clientWidth;
      const targetScrollLeft = left - navWidth / 2 + width / 2;
      navEl.scrollTo({
        left: targetScrollLeft,
        behavior: "smooth",
      });
    }
  }, [activeTab, tabs.length, activeIndex]);

  // 把 slider 的 left / width 用 CSS 变量传给样式层
  const tabsStyle = {
    "--sliderLeft": `${slider.left}px`,
    "--sliderWidth": `${slider.width}px`,
  } as React.CSSProperties;

  return (
    <nav
      ref={navRef as React.RefObject<HTMLElement>}
      className={`tabs-nav ${className}`}
      role="tablist"
      aria-orientation="horizontal"
    >
      <div className="tabs" style={tabsStyle} ref={tabsRef}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.id)}
              data-active={isActive}
              aria-selected={isActive}
              className="tab-item"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <style href="tabs-nav" precedence="medium">{`
        .tabs-nav {
          padding: 0 var(--space-1);
          overflow-x: auto;
          scrollbar-width: none;
        }

        .tabs-nav::-webkit-scrollbar {
          display: none;
        }

        .tabs {
          /* 局部变量 */
          --tabs-radius: 999px;
          --tabs-border: 1px;
          --tabs-height: 36px;
          --tabs-speed: 0.3s;

          height: var(--tabs-height);
          display: inline-grid;
          grid-auto-flow: column;
          grid-auto-columns: max-content;
          position: relative;
          border-radius: var(--tabs-radius);
          border: var(--tabs-border) solid var(--border);
          background: var(--backgroundTertiary);
          padding: 2px;
          align-items: stretch;

          /* 自定义缓动曲线，长距离切换也有「跑过去」的顺滑感 */
          --ease: linear(
            0, 0.1641 3.52%, 0.311 7.18%,
            0.4413 10.99%, 0.5553 14.96%,
            0.6539 19.12%, 0.738 23.5%,
            0.8086 28.15%, 0.8662 33.12%,
            0.9078 37.92%, 0.9405 43.12%,
            0.965 48.84%, 0.9821 55.28%,
            0.992 61.97%, 0.9976 70.09%, 1
          );
        }

        .tab-item {
          border: 0;
          outline: 0;
          margin: 0;
          padding: 0 clamp(0.75rem, 2vw + 0.25rem, 2rem);
          cursor: pointer;
          text-align: center;
          height: 100%;
          display: grid;
          place-items: center;
          background: transparent;
          border-radius: calc(var(--tabs-radius) - 2px);

          min-width: 64px;

          color: var(--textTertiary);
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;

          position: relative;
          z-index: 1;

          transition:
            color var(--tabs-speed) var(--ease),
            background-color var(--tabs-speed) var(--ease);
        }

        /* hover：只提亮文字，避免和滑块叠加出现「脏脏的」效果 */
        .tab-item:not([disabled]):hover {
          color: var(--text);
        }

        /* 激活项文字：用主题主色 */
        .tab-item[data-active="true"] {
          color: var(--primary);
          font-weight: 600;
        }

        /* 禁用态 */
        .tab-item[disabled] {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* 底部滑块：用 JS 计算 left & width，通过 CSS 变量驱动动画 */
        .tabs::after {
          content: "";
          position: absolute;
          top: 2px;
          left: 0;
          height: calc(100% - 4px);
          width: var(--sliderWidth, 0px);
          border-radius: calc(var(--tabs-radius) - 2px);

          /* 颜色用你的设计系统，可以按喜好二选一 */
          background: var(--background);      /* 干净白块风格 */
          /* background: var(--primaryBg);    // 想更主题色一点的话，改成这个 */

          box-shadow:
            0 1px 2px var(--shadowLight),
            0 4px 12px var(--shadowMedium);

          transform: translateX(var(--sliderLeft, 0px));
          transition:
            transform var(--tabs-speed) var(--ease),
            width var(--tabs-speed) var(--ease);
          will-change: transform, width;

          z-index: 0;
        }

        /* 键盘 focus 可选高亮描边 */
        .tabs:focus-within::after {
          outline: 1px solid var(--primaryGhost);
        }
      `}</style>
    </nav>
  );
};

export default TabsNav;
