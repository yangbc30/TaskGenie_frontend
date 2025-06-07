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
import { useTask } from '../context/TaskContext';
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
    selectedTags,
    toggleTag,
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

  // 本地计算任务标签的函数（与后端逻辑保持一致）
  const calculateTaskTags = (task) => {
    const tags = [];
    const now = new Date();
    const today = now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (task.completed) {
      return ['已完成'];
    }
    
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      const dueDateStr = dueDate.toDateString();
      
      if (dueDate < now) {
        tags.push('已过期');
      } else if (dueDateStr === today) {
        tags.push('今日');
      } else if (dueDateStr === tomorrow.toDateString()) {
        tags.push('明日');
      }
    } else {
      tags.push('今日');
    }
    
    if (task.priority === 'high') {
      tags.push('重要');
    }
    
    return tags;
  };

  // 根据选中的标签过滤任务（AND逻辑）
  const filterTasksByTags = (tags) => {
    if (tags.length === 0) {
      // 如果没有选中任何标签，显示所有任务
      setFilteredTasks(tasks);
      return;
    }

    const filtered = tasks.filter(task => {
      const taskTags = calculateTaskTags(task);
      // AND逻辑：任务必须包含所有选中的标签
      return tags.every(selectedTag => taskTags.includes(selectedTag));
    });
    
    setFilteredTasks(filtered);
  };

  // 处理标签切换
  const handleTagToggle = (tag) => {
    toggleTag(tag);
  };

  // 监听selectedTags和tasks变化，自动重新筛选
  useEffect(() => {
    filterTasksByTags(selectedTags);
  }, [selectedTags, tasks]);

  // 处理下拉刷新
  const onRefresh = async () => {
    setRefreshing(true);
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

  // 生成空状态提示文本
  const getEmptyStateText = () => {
    if (tasks.length === 0) {
      return {
        title: '暂无任务',
        hint: '点击上方输入框快速创建任务'
      };
    } else if (selectedTags.length === 0) {
      return {
        title: '暂无任务',
        hint: '选择标签来筛选任务'
      };
    } else if (selectedTags.length === 1) {
      return {
        title: `暂无"${selectedTags[0]}"任务`,
        hint: '试试调整标签筛选条件'
      };
    } else {
      return {
        title: `暂无"${selectedTags.join(' + ')}"任务`,
        hint: '试试调整标签筛选条件'
      };
    }
  };

  const emptyState = getEmptyStateText();

  return (
    <>
      {/* 标签筛选器 */}
      <TagFilter
        tasks={tasks}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
      />

      {/* 添加任务区域 */}
      <View style={styles.addTaskContainer}>
        <View style={styles.quickCreateContainer}>
          <TextInput
            style={styles.quickInput}
            placeholder="快速添加任务..."
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
            <Text style={styles.emptyText}>{emptyState.title}</Text>
            <Text style={styles.emptyHint}>{emptyState.hint}</Text>
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