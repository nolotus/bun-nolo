export const MessageStyles = () => (
  <style>{`
      .message-container {
        display: flex;
        margin-bottom: 16px;
        padding: 0 16px;
      }
      
      .message-container.self {
        justify-content: flex-end;
      }
      
      .message-container.other {
        justify-content: flex-start;
      }
  
      .content-wrapper {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
  
      .content-wrapper.self {
        flex-direction: row-reverse;
      }
  
      .avatar-wrapper {
        flex-shrink: 0;
      }
  
      .controller-button {
        position: absolute;
        bottom: 0;
        right: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        font-size: 16px;
        transform: translate(50%, 50%);
      }
    `}</style>
);
