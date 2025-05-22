import React from "react";
import { useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import { NavLink } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

const SectionHeader = ({ title, icon, linkText, linkTo }) => {
  const theme = useAppSelector(selectTheme);

  return (
    <div className="section-header">
      <h2 className="section-title">
        {icon &&
          React.cloneElement(icon, {
            className: "section-title-icon",
            size: 20,
          })}
        {title}
      </h2>
      {linkText && linkTo && (
        <NavLink to={linkTo} className="explore-more-link">
          <span>{linkText}</span>
          <FiChevronRight size={16} aria-hidden="true" />
        </NavLink>
      )}

      <style>{`
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 2rem 0 1.5rem; /* 调整上边距，视觉上更紧凑 */
        }

        .section-title {
          font-size: 1.4rem; /* 减小字体大小，与"开始创建"一致 */
          color: ${theme.text};
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
        }

        .section-title-icon {
          color: ${theme.primary};
        }
        
        .explore-more-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: ${theme.primary};
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem; /* 字体稍小，保持次要视觉 */
          padding: 0.4rem 0.9rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .explore-more-link:hover {
          background-color: ${theme.backgroundLight};
          transform: translateX(3px);
        }

        @media (max-width: 768px) {
          .section-header {
            margin: 1.5rem 0 1.2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.5rem;
          }

          .section-title {
            font-size: 1.3rem; /* 移动端稍小 */
            flex-shrink: 1;
            min-width: 0;
          }

          .explore-more-link {
            font-size: 0.85rem;
            padding: 0.3rem 0.7rem;
            flex-shrink: 0;
          }
        }

        @media (max-width: 480px) {
          .section-title {
            font-size: 1.2rem;
          }

          .explore-more-link {
            font-size: 0.8rem;
            padding: 0.3rem 0.6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SectionHeader;
