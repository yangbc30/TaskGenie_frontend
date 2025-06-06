import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTask, TASK_TAGS, TAG_COLORS } from '../context/TaskContext';
import { formatDateForInput, parseDateInput } from '../utils/dateUtils';

const TaskModal = ({ visible, isEdit, onClose, onSave }) => {
  const {
    editingTask,
    setEditingTask,
    newTask,
    setNewTask,
    resetNewTask,
  } = useTask();

  const currentTask = isEdit ? editingTask : newTask;
  const setCurrentTask = isEdit ? setEditingTask : setNewTask;

  const handleSave = async () => {
    if (!currentTask?.name?.trim()) {
      Alert.alert('提示', '请输入任务名称');
      return;
    }

    const taskData = {
      name: currentTask.name,
      description: currentTask.description,
      priority: currentTask.priority,
      due_date: currentTask.due_date || null,
      estimated_hours: currentTask.estimated_hours ? parseFloat(currentTask.estimated_hours) : null,
      task_tag: currentTask.task_tag,
    };

    let success;
    if (isEdit) {
      success = await onSave(currentTask.id, taskData);
    } else {
      success = await onSave(taskData);
    }

    if (success) {
      onClose();
      if (!isEdit) {
        resetNewTask();
      }
      Alert.alert('成功', isEdit ? '任务已更新' : '任务已创建');
    }
  };

  const handleDateChange = (text) => {
    setCurrentTask({...currentTask, due_date: text});
  };

  const handleDateBlur = () => {
    const parsed = parseDateInput(currentTask.due_date);
    if (parsed) {
      setCurrentTask({...currentTask, due_date: parsed});
    } else if (currentTask.due_date && !currentTask.due_date.includes('T')) {
      Alert.alert('提示', '日期格式不正确，请使用如 "2025-05-31 15:30" 或 "明天 14:00" 的格式');
      setCurrentTask({...currentTask, due_date: ''});
    }
  };

  const styles = {
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 15,
      padding: 20,
      width: '90%',
      maxHeight: '80%',
    },
    modalScroll: {
      maxHeight: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: 20,
      textAlign: 'center',
    },
    inputLabel: {
      fontSize: 14,
      color: '#7f8c8d',
      marginBottom: 8,
      marginTop: 15,
      fontWeight: '600',
    },
    modalInput: {
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 8,
      padding: 12,
      fontSize: 15,
      backgroundColor: '#f8f9fa',
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    prioritySelector: {
      flexDirection: 'row',
      marginTop: 5,
    },
    priorityOption: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e0e0e0',
      marginHorizontal: 5,
      borderRadius: 8,
      backgroundColor: '#f8f9fa',
    },
    selectedPriority: {
      backgroundColor: '#3498db',
      borderColor: '#3498db',
    },
    priorityOptionText: {
      color: '#7f8c8d',
      fontWeight: '600',
    },
    selectedPriorityText: {
      color: '#fff',
    },
    tagSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 5,
      marginBottom: 15,
    },
    tagOption: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 15,
      marginRight: 8,
      marginBottom: 8,
      opacity: 0.8,
    },
    selectedTag: {
      opacity: 1,
      borderWidth: 2,
      borderColor: '#fff',
    },
    tagOptionText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    selectedTagText: {
      fontWeight: 'bold',
    },
    dateHint: {
      fontSize: 12,
      color: '#95a5a6',
      marginTop: 4,
      marginLeft: 2,
    },
    modalButtons: {
      flexDirection: 'row',
      marginTop: 25,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 5,
    },
    cancelButton: {
      backgroundColor: '#ecf0f1',
    },
    cancelButtonText: {
      color: '#7f8c8d',
      fontWeight: 'bold',
    },
    saveButton: {
      backgroundColor: '#3498db',
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: 'bold',
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
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isEdit ? '编辑任务' : '创建新任务'}
          </Text>
          
          <ScrollView style={styles.modalScroll}>
            <Text style={styles.inputLabel}>任务名称 {!isEdit && '*'}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="输入任务名称"
              value={currentTask?.name || ''}
              onChangeText={(text) => setCurrentTask({...currentTask, name: text})}
            />
            
            <Text style={styles.inputLabel}>描述</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="详细描述任务内容"
              value={currentTask?.description || ''}
              onChangeText={(text) => setCurrentTask({...currentTask, description: text})}
              multiline
              numberOfLines={3}
            />
            
            <Text style={styles.inputLabel}>优先级</Text>
            <View style={styles.prioritySelector}>
              {['low', 'medium', 'high'].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityOption,
                    currentTask?.priority === priority && styles.selectedPriority,
                  ]}
                  onPress={() => setCurrentTask({...currentTask, priority})}
                >
                  <Text style={[
                    styles.priorityOptionText,
                    currentTask?.priority === priority && styles.selectedPriorityText,
                  ]}>
                    {priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.inputLabel}>任务标签</Text>
            <View style={styles.tagSelector}>
              {Object.keys(TASK_TAGS).filter(tag => tag !== '已完成' && tag !== '已过期').map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagOption,
                    { backgroundColor: TAG_COLORS[tag] },
                    currentTask?.task_tag === tag && styles.selectedTag,
                  ]}
                  onPress={() => setCurrentTask({...currentTask, task_tag: tag})}
                >
                  <Text style={[
                    styles.tagOptionText,
                    currentTask?.task_tag === tag && styles.selectedTagText,
                  ]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.inputLabel}>截止时间</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="例如: 2025-05-31 15:30 或 明天 14:00"
              value={formatDateForInput(currentTask?.due_date)}
              onChangeText={handleDateChange}
              onBlur={handleDateBlur}
            />
            <Text style={styles.dateHint}>
              支持: 明天/后天 15:30、2025-05-31 15:30、05-31 15:30
            </Text>
            
            <Text style={styles.inputLabel}>预计时长（小时）</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="例如: 2.5"
              value={currentTask?.estimated_hours?.toString() || ''}
              onChangeText={(text) => setCurrentTask({...currentTask, estimated_hours: text})}
              keyboardType="numeric"
            />
          </ScrollView>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {isEdit ? '保存' : '创建'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TaskModal;