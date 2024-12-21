import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';

const Usage: React.FC = () => {
  const [isRechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [isRechargeRecordVisible, setRechargeRecordVisible] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');

  // Echarts配置项
  const getChartOption = () => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#ddd',
          width: 1,
          type: 'dashed'
        }
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['3月', '4月', '5月', '6月'],
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#666'
      },
      splitLine: {
        lineStyle: {
          color: '#eee'
        }
      }
    },
    series: [
      {
        name: 'Token使用量',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: [12, 19, 3, 5, 2, 3],
        itemStyle: {
          color: '#1a73e8'
        },
        lineStyle: {
          width: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: 'rgba(26, 115, 232, 0.3)'
            }, {
              offset: 1,
              color: 'rgba(26, 115, 232, 0.05)'
            }]
          }
        }
      }
    ]
  });

  // 样式定义
  const containerStyle: React.CSSProperties = {
    backgroundColor: '#f9fafb',
    padding: '2rem',
  };

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    padding: '24px',
    marginBottom: '24px'
  };

  const btnPrimaryStyle: React.CSSProperties = {
    background: '#1a73e8',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse'
  };

  const tableHeaderStyle: React.CSSProperties = {
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #eee'
  };

  const tableRowStyle: React.CSSProperties = {
    borderBottom: '1px solid #eee'
  };

  // 处理充值
  const handleRecharge = () => {
    if (rechargeAmount && parseFloat(rechargeAmount) > 0) {
      // 这里可以添加实际的充值逻辑
      console.log(`充值金额: ${rechargeAmount}`);
      setRechargeModalVisible(false);
      setRechargeAmount('');
    } else {
      alert('请输入有效的充值金额');
    }
  };

  return (
    <div style={containerStyle}>
      <style>
        {`
          .btn-primary:hover {
            background: #1557b0 !important;
            transform: translateY(-1px);
          }
          .dropdown-content {
            display: none;
            position: absolute;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 6px;
            padding: 8px 0;
            z-index: 1;
          }
          .dropdown:hover .dropdown-content {
            display: block;
          }
          .dropdown-item {
            display: block;
            padding: 8px 16px;
            color: #333;
            text-decoration: none;
          }
          .dropdown-item:hover {
            background-color: #f8f9fa;
          }
        `}
      </style>

      {/* 余额显示区域 */}
      <div style={cardStyle}>
        <h2 style={{fontSize: '1.25rem', fontWeight: 500, marginBottom: '0.5rem', textAlign: 'center'}}>
          当前余额
        </h2>
        <div style={{
          fontSize: '1.875rem',
          fontWeight: 700,
          color: '#1a73e8',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          ¥ 1,280.00
        </div>
        <div style={{textAlign: 'center'}}>
          <button 
            className="btn-primary"
            style={btnPrimaryStyle}
            onClick={() => setRechargeModalVisible(true)}
          >
            立即充值
          </button>
        </div>
      </div>

      {/* 充值记录模块 */}
      <div style={cardStyle}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h2 style={{fontSize: '1.25rem', fontWeight: 500}}>充值记录</h2>
          <button 
            className="btn-primary" 
            style={btnPrimaryStyle}
            onClick={() => setRechargeRecordVisible(!isRechargeRecordVisible)}
          >
            {isRechargeRecordVisible ? '折叠' : '展开'}
          </button>
        </div>
        
        {isRechargeRecordVisible && (
          <div style={{overflowX: 'auto'}}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderStyle}>
                  <th style={{padding: '12px', textAlign: 'left'}}>充值时间</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>充值金额</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>支付方式</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>交易状态</th>
                </tr>
              </thead>
              <tbody>
                <tr style={tableRowStyle}>
                  <td style={{padding: '12px'}}>2024-02-20 14:30</td>
                  <td style={{padding: '12px'}}>¥500.00</td>
                  <td style={{padding: '12px'}}>信用卡</td>
                  <td style={{padding: '12px', color: 'green'}}>成功</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 使用量统计区域 */}
      <div style={cardStyle}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h2 style={{fontSize: '1.25rem', fontWeight: 500}}>使用量统计</h2>
          <div style={{display: 'flex', gap: '1rem'}}>
            <div className="dropdown">
              <button style={btnPrimaryStyle}>时间维度</button>
              <div className="dropdown-content">
                <a href="#" className="dropdown-item">按天</a>
                <a href="#" className="dropdown-item">按周</a>
                <a href="#" className="dropdown-item">按月</a>
              </div>
            </div>
            <div className="dropdown">
              <button style={btnPrimaryStyle}>模型类型</button>
              <div className="dropdown-content">
                <a href="#" className="dropdown-item">全部模型</a>
                <a href="#" className="dropdown-item">GPT-3.5</a>
                <a href="#" className="dropdown-item">GPT-4</a>
              </div>
            </div>
          </div>
        </div>
        
        <ReactECharts
          option={getChartOption()}
          style={{height: '300px'}}
          opts={{renderer: 'svg'}}
        />
      </div>

      {/* 使用记录模块 */}
      <div style={cardStyle}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h2 style={{fontSize: '1.25rem', fontWeight: 500}}>使用记录</h2>
          <div style={{display: 'flex', gap: '1rem'}}>
            <input 
              type="date" 
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '6px'
              }} 
            />
            <select 
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '6px'
              }}
            >
              <option>全部模型</option>
              <option>GPT-3.5</option>
              <option>GPT-4</option>
            </select>
          </div>
        </div>

        <div style={{overflowX: 'auto'}}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderStyle}>
                <th style={{padding: '12px', textAlign: 'left'}}>创建时间</th>
                <th style={{padding: '12px', textAlign: 'left'}}>使用名称</th>
                <th style={{padding: '12px', textAlign: 'left'}}>Token用量</th>
                <th style={{padding: '12px', textAlign: 'left'}}>模型</th>
                <th style={{padding: '12px', textAlign: 'left'}}>统计截至时间</th>
              </tr>
            </thead>
            <tbody>
              <tr style={tableRowStyle}>
                <td style={{padding: '12px'}}>2024-02-20 14:30</td>
                <td style={{padding: '12px'}}>项目方案讨论</td>
                <td style={{padding: '12px'}}>1,234</td>
                <td style={{padding: '12px'}}>GPT-4</td>
                <td style={{padding: '12px'}}>2024-02-21 14:30</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: '1rem'
        }}>
          <span>共 24 条记录</span>
          <div style={{display: 'flex', gap: '0.5rem'}}>
            <button style={{...btnPrimaryStyle, background: 'white', color: '#333', border: '1px solid #ddd'}}>上一页</button>
            <button style={{...btnPrimaryStyle}}>1</button>
            <button style={{...btnPrimaryStyle, background: 'white', color: '#333', border: '1px solid #ddd'}}>2</button>
            <button style={{...btnPrimaryStyle, background: 'white', color: '#333', border: '1px solid #ddd'}}>3</button>
            <button style={{...btnPrimaryStyle, background: 'white', color: '#333', border: '1px solid #ddd'}}>下一页</button>
          </div>
        </div>
      </div>

      {/* 充值弹窗 */}
      {isRechargeModalVisible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            width: '400px'
          }}>
            <h3 style={{fontSize: '1.25rem', marginBottom: '1rem'}}>充值</h3>
            <input 
              type="number"
              placeholder="请输入充值金额"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                marginBottom: '1rem'
              }}
            />
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
              <button 
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: 'pointer'
                }}
                onClick={() => setRechargeModalVisible(false)}
              >
                取消
              </button>
              <button 
                className="btn-primary"
                style={btnPrimaryStyle}
                onClick={handleRecharge}
              >
                确认充值
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usage;
