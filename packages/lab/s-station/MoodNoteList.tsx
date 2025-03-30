import type React from "react";
import { useState } from "react";
import { RiDeleteBin5Line } from "react-icons/ri";
import useMediaQuery from "react-responsive"; // Assuming this import is correct
import { layout } from "render/styles/layout"; // Assuming this import is correct

// Updated MoodNote interface to include id
interface MoodNote {
  id: string; // Use ID for identification
  content: string;
  createdAt: number;
  images?: string[];
}

interface MoodNoteListProps {
  notes: MoodNote[];
  onDelete: (id: string) => void; // Changed signature to use id
}

// Updated DeleteMoment props and logic
interface DeleteMomentProps {
  onDelete: (id: string) => void;
  id: string; // Receive id instead of index
  isHovered: boolean;
}

const DeleteMoment: React.FC<DeleteMomentProps> = ({
  onDelete,
  id,
  isHovered,
}) => {
  // console.log(`DeleteMoment: id=${id}, isHovered = ${isHovered}`); // Debug log
  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering li's onClick if any added later
        console.log(`Delete button clicked for note ${id}`); // Debug log
        onDelete(id); // Use id
      }}
      aria-label={`删除笔记 ${id}`} // Accessibility
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        width: "32px",
        height: "32px",
        backgroundColor: "rgba(255, 255, 255, 0.7)", // Slightly visible background
        border: "1px solid #eee", // Subtle border
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)", // Softer shadow
        color: "#e57373", // Reddish color for delete
        fontSize: "14px",
        padding: 0,
        opacity: isHovered ? 1 : 0,
        visibility: isHovered ? "visible" : "hidden", // Use visibility for better performance?
        transition:
          "opacity 0.2s ease, visibility 0.2s ease, background-color 0.2s ease",
        zIndex: 10,
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = "rgba(240, 240, 240, 0.8)")
      } // Hover effect
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.7)")
      }
    >
      <RiDeleteBin5Line size={18} />
    </button>
  );
};

const MoodNoteList: React.FC<MoodNoteListProps> = ({ notes, onDelete }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });
  const isTablet = useMediaQuery({
    query: "(min-width: 601px) and (max-width: 1024px)",
  });
  // const isDesktop = useMediaQuery({ query: "(min-width: 1025px)" }); // isDesktop might not be needed if styles default

  // Use string (id) as key for hover state
  const [hoveredIds, setHoveredIds] = useState<Record<string, boolean>>({});

  const formatDate = (timestamp: number) => {
    if (!timestamp || isNaN(timestamp)) {
      return { date: "无效日期", time: "" }; // Handle invalid timestamp
    }
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString("zh-CN", {
        // year: "numeric", // Maybe hide year for brevity?
        month: "2-digit",
        day: "2-digit",
      }),
      time: date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        // second: "2-digit", // Hide seconds?
      }),
    };
  };

  // Use ID for hover handlers
  const handleMouseEnter = (id: string) => {
    // console.log(`Mouse entered on note ${id}`);
    setHoveredIds((prevIds) => ({ ...prevIds, [id]: true }));
  };

  const handleMouseLeave = (id: string) => {
    // console.log(`Mouse left on note ${id}`);
    setHoveredIds((prevIds) => ({ ...prevIds, [id]: false }));
  };

  return (
    <ul
      style={{
        // padding: isMobile ? "20px 10px" : isTablet ? "30px 20px" : "40px 30px",
        padding: "20px 0", // Reduce padding, let items handle spacing
        listStyle: "none",
        margin: 0,
        // display: "flex", // Let items flow naturally
        // flexDirection: "column",
        // alignItems: "center",
        maxWidth: "700px", // Constrain width like other content
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {notes.map((note) => {
        // Iterate directly, index no longer primary key for logic
        const { date, time } = formatDate(note.createdAt);
        const noteId = note.id; // Get the ID

        return (
          <li
            key={noteId} // Use note.id as the key
            style={{
              padding: isMobile ? "15px" : "20px",
              marginBottom: isMobile ? "12px" : "16px",
              // borderBottom: "1px solid #eee",
              border: "1px solid #e6ece8", // Match other list item style
              borderRadius: "6px", // Add some rounding
              backgroundColor: "#fff", // White background
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              // minWidth: "90vw", // Remove minWidth, rely on parent max-width
              width: "100%", // Take full width of parent
              position: "relative", // For the delete button
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              transition: "box-shadow 0.2s ease", // Hover effect
            }}
            onMouseEnter={() => handleMouseEnter(noteId)} // Pass ID
            onMouseLeave={() => handleMouseLeave(noteId)} // Pass ID
            onMouseOver={() => {
              // Add hover style to li
              const element = document.getElementById(`note-${noteId}`); // Need an ID on the li
              if (element)
                element.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
            }}
            onMouseOut={() => {
              const element = document.getElementById(`note-${noteId}`);
              if (element)
                element.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
            }}
            id={`note-${noteId}`} // Add ID for hover style targeting
          >
            {/* 时间显示区域 */}
            <div
              style={{
                minWidth: isMobile ? "60px" : "80px", // Slightly smaller width
                paddingRight: isMobile ? "10px" : "15px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center", // Center align time? Or left? Let's try center
                justifyContent: "center",
                color: "#888", // Lighter gray
                borderRight: "1px solid #eee", // Separator line
                marginRight: isMobile ? "10px" : "15px",
                alignSelf: "stretch", // Make it full height
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? "12px" : "13px",
                  fontWeight: 500,
                  color: "#666",
                }}
              >
                {date}
              </div>
              <div
                style={{
                  fontSize: isMobile ? "11px" : "12px",
                  marginTop: "4px",
                  color: "#999",
                }}
              >
                {time}
              </div>
            </div>

            {/* 内容区域 */}
            <div
              style={{
                flex: 1, // Take remaining space
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "stretch", // Content stretches full width
                // marginLeft: isMobile ? "10px" : isTablet ? "15px" : "20px", // Removed, using separator
                maxWidth: "100%",
                position: "relative", // Keep for delete button
              }}
            >
              {/* 删除按钮 - Pass ID */}
              <DeleteMoment
                onDelete={onDelete}
                id={noteId} // Pass ID here
                isHovered={hoveredIds[noteId] || false} // Use ID for hover state check
              />
              {/* Content Text */}
              <div
                style={{
                  fontSize: isMobile ? "14px" : "15px", // Standard text size
                  color: "#444", // Darker text
                  lineHeight: "1.7", // Slightly increased line height
                  textAlign: "left", // Left align text
                  wordBreak: "break-word",
                  // padding: isMobile ? "10px 0" : "15px 0", // Remove padding here, li has padding
                  paddingRight: "30px", // Ensure space for delete button
                  letterSpacing: "0.3px", // Reduce letter spacing
                  fontWeight: 400,
                  // opacity: 0.9, // Remove opacity
                  whiteSpace: "pre-wrap", // Preserve line breaks
                }}
              >
                {note.content}
              </div>

              {/* 图片展示区域 */}
              {note.images?.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap", // Use standard flex-wrap
                    gap: "8px", // Smaller gap
                    marginTop: "12px", // Consistent margin
                  }}
                >
                  {note.images.map((image, imgIndex) => (
                    <div
                      key={imgIndex}
                      style={{
                        width: isMobile ? "60px" : "80px", // Smaller image previews
                        height: isMobile ? "60px" : "80px",
                        borderRadius: "4px",
                        overflow: "hidden",
                        border: "1px solid #eee", // Add border to images
                      }}
                    >
                      <img
                        src={image}
                        alt={`图片 ${imgIndex + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover", // Keep cover
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default MoodNoteList;
