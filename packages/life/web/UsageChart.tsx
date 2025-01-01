// UsageChart.tsx
import React from 'react';
import ReactECharts from 'echarts-for-react';

interface UsageChartProps {
    theme?: any; // 如果使用主题系统,可以传入theme
}

const UsageChart: React.FC<UsageChartProps> = ({ theme }) => {
    const btnPrimaryStyle: React.CSSProperties = {
        background: theme?.primary || '#1a73e8',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s'
    };

    const getChartOption = () => ({
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line',
                lineStyle: {
                    color: theme?.border || '#ddd',
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
                    color: theme?.border || '#ddd'
                }
            },
            axisLabel: {
                color: theme?.textSecondary || '#666'
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
                color: theme?.textSecondary || '#666'
            },
            splitLine: {
                lineStyle: {
                    color: theme?.borderLight || '#eee'
                }
            }
        },
        series: [{
            name: 'Token使用量',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            data: [12, 19, 3, 5, 2, 3],
            itemStyle: {
                color: theme?.primary || '#1a73e8'
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
                        color: theme?.primaryGhost || 'rgba(26, 115, 232, 0.3)'
                    }, {
                        offset: 1,
                        color: 'rgba(26, 115, 232, 0.05)'
                    }]
                }
            }
        }]
    });

    return (
        <div style={{
            background: theme?.background || 'white',
            borderRadius: '12px',
            boxShadow: `0 2px 8px ${theme?.shadowLight || 'rgba(0,0,0,0.05)'}`,
            padding: '24px',
            marginBottom: '24px'
        }}>
            <style>
                {`
          .btn-primary:hover {
            background: ${theme?.primaryLight || '#1557b0'} !important;
            transform: translateY(-1px);
          }
          .dropdown-content {
            display: none;
            position: absolute;
            background: ${theme?.background || 'white'};
            box-shadow: 0 2px 8px ${theme?.shadowLight || 'rgba(0,0,0,0.1)'};
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
            color: ${theme?.text || '#333'};
            text-decoration: none;
          }
          .dropdown-item:hover {
            background-color: ${theme?.backgroundSecondary || '#f8f9fa'};
          }
        `}
            </style>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>使用量统计</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
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
                style={{ height: '300px' }}
                opts={{ renderer: 'svg' }}
            />
        </div>
    );
};

export default UsageChart;
