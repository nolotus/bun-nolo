import React from "react";
import { RiDeleteBin5Line } from "react-icons/ri";

interface MoodNote {
  id: string;
  content: string;
  createdAt: number;
  images?: string[];
}

interface MoodNoteListProps {
  notes: MoodNote[];
  onDelete: (id: string) => void;
}

interface DeleteMomentProps {
  id: string;
  onDelete: (id: string) => void;
}

const DeleteMoment: React.FC<DeleteMomentProps> = ({ id, onDelete }) => (
  <button
    className="delete-btn"
    aria-label={`删除笔记 ${id}`}
    onClick={(e) => {
      e.stopPropagation();
      onDelete(id);
    }}
  >
    <RiDeleteBin5Line size={18} />
  </button>
);

const MoodNoteList: React.FC<MoodNoteListProps> = ({ notes, onDelete }) => {
  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return {
      date: isNaN(d.getTime())
        ? "无效日期"
        : d.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" }),
      time: isNaN(d.getTime())
        ? ""
        : d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <>
      <style>{`
        .mood-list {
          padding: 20px 0;
          margin: 0 auto;
          max-width: 700px;
          list-style: none;
        }
        .note-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          background: #fff;
          border: 1px solid #e6ece8;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: box-shadow 0.2s ease;
        }
        .note-item:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .note-time {
          min-width: 80px;
          padding-right: 15px;
          margin-right: 15px;
          border-right: 1px solid #eee;
          text-align: center;
          color: #888;
        }
        .note-time .date {
          font-size: 13px;
          font-weight: 500;
          color: #666;
        }
        .note-time .time {
          font-size: 12px;
          margin-top: 4px;
          color: #999;
        }
        .note-content {
          flex: 1;
        }
        .note-content-text {
          font-size: 15px;
          color: #444;
          line-height: 1.7;
          word-break: break-word;
          white-space: pre-wrap;
          padding-right: 30px;
        }
        .note-images {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }
        .note-image {
          width: 80px;
          height: 80px;
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid #eee;
        }
        .note-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .delete-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.7);
          border: 1px solid #eee;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
          color: #e57373;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s, visibility 0.2s, background-color 0.2s;
          z-index: 10;
        }
        .note-item:hover .delete-btn {
          opacity: 1;
          visibility: visible;
        }
        .delete-btn:hover {
          background: rgba(240,240,240,0.8);
        }

        /* Tablet */
        @media (min-width: 601px) and (max-width: 1024px) {
          .note-item {
            padding: 18px;
            margin-bottom: 14px;
          }
          .note-time {
            min-width: 70px;
            padding-right: 12px;
            margin-right: 12px;
          }
          .note-time .date { font-size: 13px; }
          .note-time .time { font-size: 12px; }
          .note-content-text { font-size: 14px; }
          .note-image {
            width: 70px;
            height: 70px;
          }
        }
        /* Mobile */
        @media (max-width: 600px) {
          .note-item {
            padding: 15px;
            margin-bottom: 12px;
          }
          .note-time {
            min-width: 60px;
            padding-right: 10px;
            margin-right: 10px;
          }
          .note-time .date { font-size: 12px; }
          .note-time .time { font-size: 11px; }
          .note-content-text { font-size: 14px; }
          .note-image {
            width: 60px;
            height: 60px;
          }
        }
      `}</style>

      <ul className="mood-list">
        {notes.map((note) => {
          const { date, time } = formatDate(note.createdAt);
          return (
            <li className="note-item" key={note.id}>
              <div className="note-time">
                <div className="date">{date}</div>
                <div className="time">{time}</div>
              </div>
              <div className="note-content">
                <DeleteMoment id={note.id} onDelete={onDelete} />
                <div className="note-content-text">{note.content}</div>
                {note.images && note.images.length > 0 && (
                  <div className="note-images">
                    {note.images.map((img, idx) => (
                      <div className="note-image" key={idx}>
                        <img src={img} alt={`图片 ${idx + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default MoodNoteList;
