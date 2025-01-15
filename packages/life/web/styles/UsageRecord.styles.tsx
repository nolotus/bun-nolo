// styles/UsageRecord.styles.tsx

export const createStyles = (theme) => `
  .usage-card {
    background: ${theme.background};
    border-radius: 12px;
    box-shadow: 0 2px 8px ${theme.shadowLight};
    padding: 24px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  .title {
    font-size: 1.25rem;
    font-weight: 500;
    color: ${theme.text};
  }
  .filters {
    display: flex;
    gap: 1rem;
  }
  .input {
    padding: 8px;
    border: 1px solid ${theme.border};
    border-radius: 6px;
    color: ${theme.text};
    background: ${theme.background};
  }
  .table {
    width: 100%;
    border-collapse: collapse;
  }
  .table-row {
    border-bottom: 1px solid ${theme.border};
  }
  .table td, .table th {
    padding: 12px;
    color: ${theme.text};
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
  }
  .count {
    color: ${theme.textSecondary};
  }
  .pagination {
    display: flex;
    gap: 0.5rem;
  }
  .button {
    background: ${theme.primary};
    color: ${theme.text};
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }
  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
