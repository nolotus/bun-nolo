import React from "react";
import Button from "render/web/ui/Button";
import { SearchIcon } from "@primer/octicons-react";

const Lab = () => {
  return (
    <div className="container">
      {/* Button Demo */}
      <section>
        <div className="section-header">
          <h2>Button 示例</h2>
        </div>
        <div className="demo-grid">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button icon={<SearchIcon size={16} />}>With Icon</Button>
        </div>
      </section>

      {/* Combobox Demo */}
      <header>
        <h1>Combobox</h1>
        <p>可搜索的下拉选择器组件</p>
      </header>

      <div>
        <section>
          <div className="section-header">
            <h2>基础用法</h2>
            <p>基础的 Combobox 用法展示</p>
          </div>
        </section>

        <section>
          <div className="section-header">
            <h2>自定义字段</h2>
            <p>使用自定义的标签和值字段</p>
          </div>
        </section>

        <section>
          <div className="section-header">
            <h2>状态展示</h2>
            <p>禁用状态和自定义样式</p>
          </div>
        </section>
      </div>

      <style>{`
        .container {
          max-width: 960px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        header {
          margin-bottom: 48px;
        }

        h1 {
          font-size: 36px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #111;
        }

        header p {
          color: #666;
          font-size: 16px;
        }

        section {
          margin-bottom: 48px;
          background: #fff;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          margin-bottom: 24px;
        }

        h2 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #111;
        }

        .section-header p {
          color: #666;
          font-size: 14px;
        }

        .demo-grid {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .demo-table {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .row {
          display: flex;
          align-items: center;
        }

        .label {
          width: 80px;
          color: #666;
          font-size: 14px;
        }

        .content {
          display: flex;
          gap: 16px;
          flex: 1;
        }

        /* 响应式布局 */
        @media (max-width: 640px) {
          .container {
            padding: 24px 16px;
          }

          section {
            padding: 24px 16px;
          }

          .row {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .label {
            margin-bottom: 8px;
          }

          .demo-grid > div {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Lab;
