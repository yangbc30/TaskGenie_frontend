import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

const AIPlanningModal = ({ visible, onClose, onPlan, loading, aiJobId }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [maxTasks, setMaxTasks] = useState(5); // 默认5个任务

  useEffect(() => {
    if (!visible) {
      setAiPrompt('');
      setMaxTasks(5); // 重置为默认值
    }
  }, [visible]);

  const handlePlan = () => {
    if (!aiPrompt.trim()) {
      Alert.alert('提示', '请输入任务描述');
      return;
    }
    
    if (maxTasks < 1 || maxTasks > 10) {
      Alert.alert('提示', '任务数量应该在1-10之间');
      return;
    }
    
    onPlan(aiPrompt, maxTasks);
  };

  const handleMaxTasksChange = (text) => {
    const num = parseInt(text);
    if (isNaN(num)) {
      setMaxTasks('');
    } else {
      setMaxTasks(Math.max(1, Math.min(10, num))); // 限制在1-10之间
    }
  };

  const styles = {
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    aiModalContent: {
      backgroundColor: '#fff',
      borderRadius: 15,
      padding: 20,
      width: '90%',
      height: screenHeight * 0.6,
      maxHeight: screenHeight * 0.6,
    },
    aiHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    aiTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2c3e50',
    },
    aiCloseButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#ecf0f1',
      justifyContent: 'center',
      alignItems: 'center',
    },
    aiCloseButtonText: {
      fontSize: 16,
      color: '#7f8c8d',
      fontWeight: 'bold',
    },
    aiHint: {
      fontSize: 14,
      color: '#7f8c8d',
      lineHeight: 20,
      marginBottom: 20,
    },
    aiInput: {
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 12,
      padding: 15,
      fontSize: 15,
      backgroundColor: '#fff',
      minHeight: 120,
      marginBottom: 20,
      textAlignVertical: 'top',
    },
    settingsContainer: {
      backgroundColor: '#f8f9fa',
      padding: 15,
      borderRadius: 12,
      marginBottom: 20,
    },
    settingsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: 12,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    settingLabel: {
      fontSize: 14,
      color: '#34495e',
      flex: 1,
    },
    taskCountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    taskCountButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#3498db',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 8,
    },
    taskCountButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    taskCountInput: {
      width: 50,
      height: 36,
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 8,
      textAlign: 'center',
      fontSize: 16,
      backgroundColor: '#fff',
    },
    exampleContainer: {
      backgroundColor: '#e8f4fd',
      padding: 12,
      borderRadius: 8,
      marginBottom: 20,
    },
    exampleTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#2980b9',
      marginBottom: 8,
    },
    exampleText: {
      fontSize: 13,
      color: '#34495e',
      lineHeight: 18,
    },
    aiButton: {
      backgroundColor: '#9b59b6',
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: 'center',
    },
    aiButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    aiButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    disabledButton: {
      opacity: 0.7,
    },
    processingContainer: {
      marginTop: 20,
      alignItems: 'center',
    },
    processingText: {
      color: '#3498db',
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.aiModalContent}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiTitle}>🤖 AI 任务规划助手</Text>
            <TouchableOpacity onPress={onClose} style={styles.aiCloseButton}>
              <Text style={styles.aiCloseButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.aiHint}>
            描述你想要完成的目标，AI 会帮你分解成具体的、可执行的任务步骤
          </Text>
          
          <TextInput
            style={styles.aiInput}
            placeholder="例如：准备一场生日派对、学习React Native、写一份项目报告..."
            value={aiPrompt}
            onChangeText={setAiPrompt}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* 任务设置 */}
          <View style={styles.settingsContainer}>
            <Text style={styles.settingsTitle}>⚙️ 分解设置</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>分解任务数量：</Text>
              <View style={styles.taskCountContainer}>
                <TouchableOpacity
                  style={styles.taskCountButton}
                  onPress={() => setMaxTasks(Math.max(1, maxTasks - 1))}
                >
                  <Text style={styles.taskCountButtonText}>−</Text>
                </TouchableOpacity>
                
                <TextInput
                  style={styles.taskCountInput}
                  value={maxTasks.toString()}
                  onChangeText={handleMaxTasksChange}
                  keyboardType="numeric"
                  maxLength={2}
                />
                
                <TouchableOpacity
                  style={styles.taskCountButton}
                  onPress={() => setMaxTasks(Math.min(10, maxTasks + 1))}
                >
                  <Text style={styles.taskCountButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 示例提示 */}
          <View style={styles.exampleContainer}>
            <Text style={styles.exampleTitle}>💡 输入示例</Text>
            <Text style={styles.exampleText}>
              输入："学习React Native开发"
              {'\n'}AI会生成主题："React Native学习计划"
              {'\n'}分解为：
              {'\n'}• React Native学习计划 Step1：搭建开发环境
              {'\n'}• React Native学习计划 Step2：学习基础组件
              {'\n'}• React Native学习计划 Step3：制作第一个应用
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.aiButton, (loading || aiJobId) && styles.disabledButton]}
            onPress={handlePlan}
            disabled={loading || !!aiJobId}
          >
            {loading || aiJobId ? (
              <View style={styles.aiButtonContent}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.aiButtonText}>AI 正在思考中...</Text>
              </View>
            ) : (
              <Text style={styles.aiButtonText}>🚀 开始 AI 规划</Text>
            )}
          </TouchableOpacity>
          
          {aiJobId && (
            <View style={styles.processingContainer}>
              <Text style={styles.processingText}>
                🤖 AI 正在为您分析需求并生成 {maxTasks} 个具体可行的任务...
                {'\n'}✨ 完成后任务会自动出现在任务列表中，无需等待
                {'\n'}📝 您可以关闭此窗口继续使用其他功能
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default AIPlanningModal;