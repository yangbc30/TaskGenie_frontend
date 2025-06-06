import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import SwipeableTaskItem from './SwipeableTaskItem';
import TaskModal from './TaskModal';
import TagFilter from './TagFilter';
import { useTask, TASK_TAGS } from '../context/TaskContext';
import { formatDateTime } from '../utils/dateUtils';
import { styles } from '../styles/ComponentStyles';

const TaskListTab = ({ 
  tasks, 
  onCreateTask, 
  onUpdateTask, 
  onDeleteTask, 
  onOpenAIModal,
  pullUpPanResponder 
}) => {
  const {
    selectedTag,
    setSelectedTag,
    editModalVisible,
    setEditModalVisible,
    createModalVisible,
    setCreateModalVisible,
    editingTask,
    setEditingTask,
  } = useTask();

  const [filteredTasks, setFilteredTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // 根据标签过滤任务
  const filterTasksByTag = (tag) => {
    if (tag === '全部') {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.task_tag === tag));
    }
  };

  // 处理标签选择
  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
    filterTasksByTag(tag);
  };

  // 监听tasks变化，自动过滤
  useEffect(() => {
    filterTasksByTag(selectedTag);
  }, [tasks, selectedTag]);

  // 处理下拉刷新
  const onRefresh = async () => {
    setRefreshing(true);
    // 这里可以调用fetchTasks，但由于架构原因，暂时模拟刷新
    setTimeout(() => setRefreshing(false), 1000);
  };

  // 快速创建任务
  const quickCreateTask = async () => {
    if (!newTaskName.trim()) {
      Alert.alert('提示', '请输入任务名称');
      return;
    }

    const success = await onCreateTask({
      name: newTaskName,
      description: '',
      priority: 'medium',
      task_tag: selectedTag,
    });

    if (success) {
      setNewTaskName('');
    }
  };

  // 切换任务完成状态
  const toggleTask = async (taskId, currentStatus) => {
    await onUpdateTask(taskId, { completed: !currentStatus });
  };

  // 编辑任务
  const handleEdit = (task) => {
    setEditingTask({...task});
    setEditModalVisible(true);
  };

  return (
    <>
      {/* 标签筛选器 */}
      <TagFilter
        tasks={tasks}
        selectedTag={selectedTag}
        onTagSelect={handleTagSelect}
      />

      {/* 添加任务区域 */}
      <View style={styles.addTaskContainer}>
        <View style={styles.quickCreateContainer}>
          <TextInput
            style={styles.quickInput}
            placeholder={`快速添加到"${selectedTag}"...`}
            value={newTaskName}
            onChangeText={setNewTaskName}
            onSubmitEditing={quickCreateTask}
          />
          <TouchableOpacity style={styles.quickAddButton} onPress={quickCreateTask}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.detailButton} 
            onPress={() => setCreateModalVisible(true)}
          >
            <Text style={styles.detailButtonText}>详细</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.aiButton} 
            onPress={onOpenAIModal}
          >
            <Text style={styles.aiButtonText}>AI规划</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 任务列表 */}
      <ScrollView 
        style={styles.taskList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3498db"
            title="下拉刷新"
            titleColor="#3498db"
          />
        }
        {...pullUpPanResponder.panHandlers}
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无"{selectedTag}"任务</Text>
            <Text style={styles.emptyHint}>点击上方输入框快速创建任务</Text>
            <Text style={styles.emptyHint}>或下拉页面搜索任务</Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <SwipeableTaskItem
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={onDeleteTask}
              onToggle={toggleTask}
              formatDateTime={formatDateTime}
            />
          ))
        )}
      </ScrollView>

      {/* 任务模态框 */}
      <TaskModal
        visible={createModalVisible || editModalVisible}
        isEdit={editModalVisible}
        onClose={() => {
          setCreateModalVisible(false);
          setEditModalVisible(false);
        }}
        onSave={editModalVisible ? onUpdateTask : onCreateTask}
      />
    </>
  );
};

export default TaskListTab;