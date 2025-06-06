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

  useEffect(() => {
    if (!visible) {
      setAiPrompt('');
    }
  }, [visible]);

  const handlePlan = () => {
    if (!aiPrompt.trim()) {
      Alert.alert('提示', '请输入任务描述');
      return;
    }
    onPlan(aiPrompt);
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
      height: screenHeight * 0.5,
      maxHeight: screenHeight * 0.5,
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
    aiButton: {
      backgroundColor: '#9b59b6',
      paddingVertical: 12,
      borderRadius: 8,
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
            <Text style={styles.aiTitle}>AI 任务规划助手</Text>
            <TouchableOpacity onPress={onClose} style={styles.aiCloseButton}>
              <Text style={styles.aiCloseButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.aiHint}>
            描述你想要完成的事情，AI 会帮你分解成具体的任务步骤（最多3个）
          </Text>
          
          <TextInput
            style={styles.aiInput}
            placeholder="例如：准备一场生日派对、学习新技能、完成项目报告..."
            value={aiPrompt}
            onChangeText={setAiPrompt}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          
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
              <Text style={styles.aiButtonText}>🤖 开始 AI 规划</Text>
            )}
          </TouchableOpacity>
          
          {aiJobId && (
            <View style={styles.processingContainer}>
              <Text style={styles.processingText}>AI 正在分析您的需求并生成任务...</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default AIPlanningModal;