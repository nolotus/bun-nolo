import React from 'react';
import Button from 'render/ui/Button';
import { SearchIcon, PlusIcon, ChevronRightIcon, HeartIcon, SyncIcon, TrashIcon } from '@primer/octicons-react';

const Lab = () => {
  return (
    <div className="container">
      <header>
        <h1>Button</h1>
        <p>可自定义的现代按钮组件</p>
      </header>

      <main>
        <section>
          <div className="section-header">
            <h2>基础用法</h2>
            <p>按钮支持多种变体样式</p>
          </div>
          <div className="demo-grid">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </section>

        <section>
          <div className="section-header">
            <h2>尺寸</h2>
            <p>提供三种尺寸适应不同场景</p>
          </div>
          <div className="demo-grid">
            <Button size="small">Small</Button>
            <Button size="medium">Medium</Button>
            <Button size="large">Large</Button>
          </div>
        </section>

        <section>
          <div className="section-header">
            <h2>图标按钮</h2>
            <p>支持在按钮中添加图标</p>
          </div>
          <div className="demo-grid">
            <Button icon={<SearchIcon size={16} />}>搜索</Button>
            <Button icon={<PlusIcon size={16} />}>新增</Button>
            <Button icon={<SyncIcon size={16} />}>同步</Button>
          </div>
        </section>

        <section>
          <div className="section-header">
            <h2>状态</h2>
            <p>按钮的不同状态展示</p>
          </div>
          <div className="demo-table">
            <div className="row">
              <div className="label">加载中</div>
              <div className="content">
                <Button loading>Loading</Button>
                <Button loading variant="secondary">Loading</Button>
              </div>
            </div>
            <div className="row">
              <div className="label">禁用</div>
              <div className="content">
                <Button disabled>Disabled</Button>
                <Button disabled variant="secondary">Disabled</Button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="section-header">
            <h2>块级按钮</h2>
            <p>适合独占一行的场景</p>
          </div>
          <div className="demo-block">
            <Button block>Block Button</Button>
            <Button block variant="secondary" className="mt-3">Block Button</Button>
          </div>
        </section>
      </main>

      <style jsx>{`
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
          background: linear-gradient(to right, #000, #333);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
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
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
        }

        .demo-block {
          max-width: 400px;
        }

        .mt-3 {
          margin-top: 12px;
        }

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
        }
      `}</style>
    </div>
  );
};

export default Lab;
