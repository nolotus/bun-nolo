import { useState, useEffect } from "react";
import { useTheme } from "app/theme";
import { ReferenceItemType } from "ai/cybot/types";

const ReferencesSelector = ({ space, references, onChange, t }) => {
  const theme = useTheme();
  const [availableContents, setAvailableContents] = useState([]);

  // Load available content from space
  useEffect(() => {
    if (space?.contents) {
      const contents = Object.entries(space.contents)
        .filter(([key]) => !key.startsWith("dialog-"))
        .map(([key, value]) => ({
          type: ReferenceItemType.PAGE,
          dbKey: key,
          title: value.title,
        }));
      setAvailableContents(contents);
    }
  }, [space]);

  const handleToggleReference = (content) => {
    const exists = references.some((ref) => ref.dbKey === content.dbKey);
    let newReferences;

    if (exists) {
      newReferences = references.filter((ref) => ref.dbKey !== content.dbKey);
    } else {
      newReferences = [...references, content];
    }

    onChange(newReferences);
  };

  return (
    <div className="references-list">
      {availableContents.length === 0 ? (
        <p className="empty-message">{t("noPagesAvailable")}</p>
      ) : (
        availableContents.map((content) => {
          const isSelected = references.some(
            (ref) => ref.dbKey === content.dbKey
          );
          return (
            <div key={content.dbKey} className="reference-item">
              <label>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleReference(content)}
                />
                <span>{content.title}</span>
              </label>
            </div>
          );
        })
      )}

      <style jsx>{`
        .references-list {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid ${theme.border};
          border-radius: 6px;
          padding: 12px;
          background: ${theme.backgroundSecondary || theme.background};
        }
        .reference-item {
          margin: 8px 0;
        }
        .reference-item label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .empty-message {
          color: ${theme.textTertiary || theme.textSecondary};
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default ReferencesSelector;
