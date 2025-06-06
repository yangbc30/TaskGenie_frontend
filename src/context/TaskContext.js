import React, { createContext, useContext, useState } from 'react';

// 任务标签和颜色配置
export const TASK_TAGS = {
  '今日': '今日',
  '明日': '明日',
  '重要': '重要',
  '已完成': '已完成',
  '已过期': '已过期',
};

export const TAG_COLORS = {
  '今日': '#3498db',
  '明日': '#2ecc71',
  '重要': '#e74c3c',
  '已完成': '#95a5a6',
  '已过期': '#e67e22',
};

// API 配置
export const API_URL = 'http://10.0.2.2:8000'; // Android 模拟器使用
// export const API_URL = 'http://localhost:8000'; // iOS 模拟器使用

const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [selectedTag, setSelectedTag] = useState('今日');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    priority: 'medium',
    due_date: '',
    estimated_hours: '',
    task_tag: '今日',
  });

  const resetNewTask = () => {
    setNewTask({
      name: '',
      description: '',
      priority: 'medium',
      due_date: '',
      estimated_hours: '',
      task_tag: '今日',
    });
  };

  const value = {
    selectedTag,
    setSelectedTag,
    editModalVisible,
    setEditModalVisible,
    createModalVisible,
    setCreateModalVisible,
    editingTask,
    setEditingTask,
    newTask,
    setNewTask,
    resetNewTask,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};