// AccountStatisticsScreen.jsx
import { useState } from 'react'; 
import { StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, ScrollView } from "react-native";
import { useTheme } from 'app/theme';
import RNEChartsPro from '@wuba/react-native-echarts'; 


  
const AccountStatisticsScreen = () => {
  const theme = useTheme();
  const [isRechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');

  // Echarts配置
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['4月', '5月', '6月'],
        axisLine: {
          lineStyle: { color: theme.border }
        },
        axisLabel: { color: theme.textSecondary }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: theme.textSecondary },
        splitLine: {
          lineStyle: { color: theme.border }
        }
      },
    series: [{
        name: 'Token使用量',
        type: 'line',
        smooth: true,
        data: [3, 4, 5],
        itemStyle: {
          color: theme.primary
        },
        areaStyle: {
          color: theme.primaryGhost
        }
      }]
    };


  const handleRecharge = () => {
    if (rechargeAmount && parseFloat(rechargeAmount) > 0) {
      // 处理充值逻辑
      setRechargeModalVisible(false);
      setRechargeAmount('');
    }
  };

  return (
    <ScrollView style={[styles.container, {backgroundColor: theme.background}]}>
      {/* 余额卡片 */}
      <View style={[styles.card, {backgroundColor: theme.backgroundSecondary}]}>
        <Text style={[styles.cardTitle, {color: theme.textSecondary}]}>当前余额</Text>
        <Text style={[styles.balanceAmount, {color: theme.primary}]}>¥1,280.00</Text>
        <TouchableOpacity 
          style={[styles.button, {backgroundColor: theme.primary}]}
          onPress={() => setRechargeModalVisible(true)}
        >
          <Text style={styles.buttonText}>立即充值</Text>
        </TouchableOpacity>
      </View>

      {/* 使用统计图表 */}
      <View style={[styles.card, {backgroundColor: theme.backgroundSecondary}]}>
        <Text style={[styles.cardTitle, {color: theme.text}]}>使用量统计</Text>
        <View style={styles.chartContainer}>
          <RNEChartsPro 
            option={option}
            height={300}
            width={300}
            backgroundColor="transparent"
            webViewSettings={{
              allowsInlineMediaPlayback: true,
              mediaPlaybackRequiresUserAction: false,
              scrollEnabled: false,
            }}
          />
        </View>
      </View>




 
       {/* 使用记录 */}
       <View style={[styles.card, {backgroundColor: theme.backgroundSecondary}]}>
        <Text style={[styles.cardTitle, {color: theme.text}]}>使用记录</Text>
        <View style={styles.recordItem}>
          <View style={styles.recordHeader}>
            <Text style={[styles.recordText, {color: theme.text}]}>2024-02-20 14:30</Text>
            <Text style={[styles.recordText, {color: theme.primary}]}>1,234 Tokens</Text>
          </View>
          <Text style={[styles.recordDescription, {color: theme.textSecondary}]}>
            项目方案讨论 - GPT-4
          </Text>
        </View>
      </View>

      {/* 充值弹窗 */}
      <Modal
        visible={isRechargeModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: theme.background}]}>
            <Text style={[styles.modalTitle, {color: theme.text}]}>充值</Text>
            <TextInput
              style={[styles.input, {
                borderColor: theme.border,
                color: theme.text,
                backgroundColor: theme.backgroundSecondary
              }]}
              placeholder="请输入充值金额"
              placeholderTextColor={theme.placeholder}
              value={rechargeAmount}
              onChangeText={setRechargeAmount}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, {backgroundColor: theme.backgroundSecondary}]}
                onPress={() => setRechargeModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, {color: theme.text}]}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, {backgroundColor: theme.primary}]}
                onPress={handleRecharge}
              >
                <Text style={styles.modalButtonText}>确认</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  chartContainer: {
    height: 300,
    marginTop: 16,
  },
  recordItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  recordText: {
    fontSize: 14,
  },
  recordDescription: {
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 16,
  },
});


export default AccountStatisticsScreen;
