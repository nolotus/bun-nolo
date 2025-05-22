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
            size: 24,
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
          margin: 2.5rem 0 2rem;
        }

        .section-title {
          font-size: 1.8rem;
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
          font-size: 0.95rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .explore-more-link:hover {
          background-color: ${theme.backgroundLight};
          transform: translateX(3px);
        }

        @media (max-width: 768px) {
          .section-header {
            margin: 2rem 0 1.5rem;
            display: flex; /* 保持行布局 */
            align-items: center; /* 垂直居中 */
            justify-content: space-between; /* 保持两端对齐 */
            gap: 0.75rem;
          }

          .section-title {
            font-size: 1.6rem;
            flex-shrink: 1; /* 允许标题缩小 */
            min-width: 0; /* 确保标题不会溢出 */
          }

          .explore-more-link {
            font-size: 0.9rem;
            padding: 0.4rem 0.8rem;
            flex-shrink: 0; /* 链接不缩小 */
          }
        }

        @media (max-width: 480px) {
          .section-title {
            font-size: 1.4rem;
          }

          .explore-more-link {
            font-size: 0.85rem;
            padding: 0.3rem 0.6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SectionHeader;
