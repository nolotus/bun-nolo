import React, { useState } from 'react';
import BalanceCard from './BalanceCard';
import RechargeRecord from './RechargeRecord';
import UsageRecord from './UsageRecord';
import UsageChart from './UsageChart';

const Usage: React.FC = () => {
  const [isRechargeRecordVisible, setRechargeRecordVisible] = useState(false);



  // 样式定义
  const containerStyle: React.CSSProperties = {
    backgroundColor: '#f9fafb',
    padding: '2rem',
  };




  return (
    <div style={containerStyle}>


      {/* 余额显示区域 */}
      <BalanceCard />
      {/* 充值记录模块 */}
      <RechargeRecord isVisible={isRechargeRecordVisible}
        onToggleVisibility={() => setRechargeRecordVisible(!isRechargeRecordVisible)}
      />
      {/* 使用量统计区域 */}
      <UsageChart />

      {/* 使用记录模块 */}
      <UsageRecord />
    </div>
  );
}

export default Usage;
