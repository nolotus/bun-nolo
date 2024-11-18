import React from 'react';
import useMediaQuery from 'react-responsive';

interface MoodNote {
  content: string;
  createdAt: number;
  images?: string[]; // 添加可选属性 images
}

interface MoodNoteListProps {
  notes: MoodNote[];
}

const MoodNoteList: React.FC<MoodNoteListProps> = ({ notes }) => {
  const isMobile = useMediaQuery({ query: '(max-width: 600px)' });
  const isTablet = useMediaQuery({ query: '(min-width: 601px) and (max-width: 1024px)' });
  const isDesktop = useMediaQuery({ query: '(min-width: 1025px)' });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      time: date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
  };

  return (
    <ul
      style={{
        padding: isMobile ? '20px 10px' : isTablet ? '30px 20px' : '40px 30px',
        listStyle: 'none',
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {notes.map((note, index) => {
        const { date, time } = formatDate(note.createdAt);

        return (
          <li
            key={index}
            style={{
              padding: isMobile ? '15px' : isTablet ? '20px' : '25px',
              marginBottom: isMobile ? '15px' : isTablet ? '20px' : '25px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              minWidth: '90vw',
            }}
          >
            {/* 时间显示区域 */}
            <div
              style={{
                minWidth: isMobile ? '80px' : isTablet ? '120px' : '150px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
              }}
            >
              <div style={{ fontSize: isMobile ? '14px' : isTablet ? '16px' : '18px' }}>
                {date}
              </div>
              <div style={{ fontSize: isMobile ? '14px' : isTablet ? '16px' : '18px', marginTop: '4px' }}>
                {time}
              </div>
            </div>

            {/* 内容区域 */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'stretch', // 改为stretch使内容宽度填充
                marginLeft: isMobile ? '10px' : isTablet ? '15px' : '20px',
                marginRight: isMobile ? '10px' : isTablet ? '15px' : '20px', // 添加右边距
                maxWidth: '100%', // 确保不会超出父容器
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? '14px' : isTablet ? '16px' : '18px',
                  color: '#333',
                  lineHeight: '1.8', // 增加行高提升可读性
                  textAlign: 'justify', // 文本两端对齐
                  wordBreak: 'break-word', // 防止文字溢出
                  padding: isMobile ? '10px 0' : '15px 0', // 增加上下内边距
                  letterSpacing: '0.5px', // 适当增加字间距
                  fontWeight: 400, // 设置字重
                  opacity: 0.9, // 轻微调整文字透明度提高观感
                }}
              >
                {note.content}
              </div>

              {/* 图片展示区域 */}
              {note.images?.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: isMobile ? '10px' : isTablet ? '15px' : '20px',
                    marginTop: isMobile ? '15px' : isTablet ? '20px' : '25px',
                  }}
                >
                  {note.images.map((image, imgIndex) => (
                    <div
                      key={imgIndex}
                      style={{
                        width: isMobile ? '100px' : isTablet ? '150px' : '200px',
                        height: isMobile ? '100px' : isTablet ? '150px' : '200px',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={image}
                        alt={`图片 ${imgIndex + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
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