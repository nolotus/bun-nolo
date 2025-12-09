// file: src/pages/HomeActions.tsx
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppDispatch } from "app/store";
import { createPage } from "render/page/pageSlice";
import { CreateRoutePaths } from "create/routePaths";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import {
  LuMessagesSquare,
  LuPencil,
  LuDollarSign,
  LuBook,
  LuBot,
} from "react-icons/lu";

const HomeActions: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading: isChatLoading, createNewDialog } = useCreateDialog();

  // 立即聊天
  const startQuickChat = useCallback(async () => {
    if (isChatLoading) return;
    try {
      await createNewDialog({
        agents: ["cybot-pub-01JYRSTM0MPPGQC9S25S3Y9J20"],
      });
    } catch {
      toast.error("启动失败");
    }
  }, [isChatLoading, createNewDialog]);

  // 创建笔记
  const createNewPageHandler = useCallback(async () => {
    try {
      const pageKey = await dispatch(createPage()).unwrap();
      navigate(`/${pageKey}?edit=true`);
    } catch {
      toast.error("创建失败");
    }
  }, [dispatch, navigate]);

  // 创建 AI 助手
  const createNewCybot = useCallback(() => {
    navigate(`/${CreateRoutePaths.CREATE_CYBOT}`);
  }, [navigate]);

  // 计费
  const goPricing = useCallback(() => {
    navigate("/pricing");
  }, [navigate]);

  // 使用指南
  const goGuide = useCallback(() => {
    navigate(
      "/page-0e95801d90-01JRDMA6Q85PQDCEAC7EXHWF67?spaceId=01JRDM39VSNYD1PKS4B53W6BGE"
    );
  }, [navigate]);

  return (
    <>
      <section className="actions-section">
        <div className="action-grid action-grid-home">
          {/* 第一列：立即聊天（占两行，高度是其他卡片的两倍） */}
          <div
            className={`action-card primary action-card-quick ${
              isChatLoading ? "loading" : ""
            }`}
            onClick={startQuickChat}
          >
            <div className="action-header">
              <div className="action-icon">
                <LuMessagesSquare size={22} />
              </div>
              <h3 className="action-title">
                {isChatLoading ? "正在启动..." : "立即聊天"}
              </h3>
            </div>
            <p className="action-desc">与 AI 助手开始对话</p>
          </div>

          {/* 第二列：上 创建笔记 */}
          <div className="action-card" onClick={createNewPageHandler}>
            <div className="action-header">
              <div className="action-icon">
                <LuPencil size={22} />
              </div>
              <h3 className="action-title">创建笔记</h3>
            </div>
            <p className="action-desc">记录想法，构建知识</p>
          </div>

          {/* 第三列：上 计费详情 */}
          <div className="action-card" onClick={goPricing}>
            <div className="action-header">
              <div className="action-icon">
                <LuDollarSign size={22} />
              </div>
              <h3 className="action-title">计费详情</h3>
            </div>
            <p className="action-desc">查看价格规则</p>
          </div>

          {/* 第二列：下 创建 AI 助手 */}
          <div className="action-card" onClick={createNewCybot}>
            <div className="action-header">
              <div className="action-icon">
                <LuBot size={22} />
              </div>
              <h3 className="action-title">创建 AI 助手</h3>
            </div>
            <p className="action-desc">定制你的专属智能体</p>
          </div>

          {/* 第三列：下 使用指南 */}
          <div className="action-card" onClick={goGuide}>
            <div className="action-header">
              <div className="action-icon">
                <LuBook size={22} />
              </div>
              <h3 className="action-title">使用指南</h3>
            </div>
            <p className="action-desc">快速上手技巧</p>
          </div>
        </div>
      </section>

      <style href="home-actions" precedence="high">{`
        .actions-section { 
          margin-bottom: var(--space-10); 
          opacity: 0; 
          animation: fadeInUp 0.6s ease forwards; 
        }

        /* 大屏：3 列 2 行
           每行同高，立即聊天 span 2 行 => 高度是其它卡片的两倍，三列底部对齐 */
        .action-grid-home { 
          display: grid; 
          grid-template-columns: repeat(3, minmax(0, 1fr)); 
          grid-auto-rows: minmax(90px, auto);
          gap: var(--space-4); 
        }

        /* 立即聊天占两行，其它默认只占一行 */
        .action-card-quick {
          grid-row: span 2;
        }

        .action-card {
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          box-shadow:
            0 0 0 0.5px var(--shadowLight),
            0 1px 2px 0 var(--shadowLight),
            0 2px 8px -1px var(--shadowMedium),
            0 4px 16px -2px var(--shadowMedium);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

          background: var(--background); 
          border: none;
          border-radius: 18px; 
          padding: var(--space-4); 
          cursor: pointer; 
          min-height: 70px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .action-card:hover { 
          transform: translateY(-4px); 
          box-shadow:
            0 0 0 1px var(--primaryGhost),
            0 2px 4px 0 var(--shadowLight),
            0 8px 20px -2px var(--shadowMedium),
            0 16px 40px -4px var(--shadowMedium),
            0 4px 24px -2px var(--primaryGhost);
        }
        
        .action-card.primary { 
          background: linear-gradient(135deg, var(--primaryGhost) 0%, var(--background) 80%); 
          box-shadow: 
            0 0 0 0.5px var(--primaryGhost),
            0 1px 2px 0 var(--primaryGhost),
            0 2px 8px -1px var(--shadowMedium),
            0 4px 16px -2px var(--shadowMedium);
        }
        
        .action-card.primary:hover {
          box-shadow: 
            0 0 0 1px var(--primary),
            0 2px 4px 0 var(--shadowLight),
            0 8px 20px -2px var(--shadowMedium),
            0 16px 40px -4px var(--shadowMedium),
            0 4px 32px -2px var(--primaryGhost);
        }
        
        .action-card.loading { 
          opacity: 0.6; 
          pointer-events: none; 
        }
        
        .action-header { 
          display: flex; 
          align-items: center; 
          gap: var(--space-3); 
          margin-bottom: var(--space-2); 
        }
        
        .action-icon { 
          width: 40px; 
          height: 40px; 
          border-radius: 10px; 
          background: linear-gradient(135deg, var(--primaryGhost), var(--background)); 
          border: 1px solid var(--primaryGhost); 
          color: var(--primary); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        
        .action-card:hover .action-icon { 
          background: var(--primary); 
          color: var(--background); 
          transform: scale(1.05);
          box-shadow: 0 4px 12px 0 var(--primaryGhost);
        }
        
        .action-title { 
          font-size: 1.1rem; 
          font-weight: 600; 
          color: var(--text); 
          margin: 0; 
        }

        .action-desc { 
          font-size: 0.85rem; 
          color: var(--textSecondary); 
          margin: 0; 
          line-height: 1.4; 
        }

        /* 中屏：2 列，不再做行 span，方便自适应 */
        @media (max-width: 1024px) {
          .action-grid-home {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .action-card-quick {
            grid-row: auto;
          }
        }

        /* 小屏：1 列，所有卡片堆叠 */
        @media (max-width: 768px) {
          .action-grid-home { 
            grid-template-columns: 1fr; 
            gap: var(--space-3); 
          }
        }

        @media (max-width: 480px) {
          .action-icon { 
            width: 32px; 
            height: 32px; 
          }
        }
      `}</style>
    </>
  );
};

export default HomeActions;
