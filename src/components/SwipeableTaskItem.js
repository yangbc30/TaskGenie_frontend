// 清理后的 SwipeableTaskItem.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import { TAG_COLORS } from '../context/TaskContext';
import { styles } from '../styles/ComponentStyles';

const SwipeableTaskItem = ({ task, onEdit, onDelete, onToggle, formatDateTime }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [taskTags, setTaskTags] = useState([]);

  // 本地计算任务标签（与后端逻辑保持一致）
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

  useEffect(() => {
    const tags = calculateTaskTags(task);
    setTaskTags(tags);
  }, [task.completed, task.due_date, task.priority]);
  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          Animated.spring(translateX, {
            toValue: -150,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const priorityColors = {
    high: '#ff4757',
    medium: '#ffa502',
    low: '#2ed573',
  };

  const isOverdue = taskTags.includes('已过期');

  const handleEdit = () => {
    onEdit(task);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleDelete = () => {
    onDelete(task.id);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.swipeContainer}>
      {/* 右侧操作按钮区域 */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
        >
          <Text style={styles.actionButtonIcon}>✏️</Text>
          <Text style={styles.actionButtonText}>修改</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.actionButtonIcon}>🗑️</Text>
          <Text style={styles.actionButtonText}>删除</Text>
        </TouchableOpacity>
      </View>
      
      {/* 任务内容区域 */}
      <Animated.View
        style={[
          styles.taskItemContainer,
          { transform: [{ translateX }] }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.taskItem}
          onPress={() => onToggle(task.id, task.completed)}
          activeOpacity={0.9}
        >
          <View style={styles.taskLeft}>
            <View style={[styles.taskCheckbox, task.completed && styles.taskCheckboxCompleted]}>
              {task.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={[styles.priorityIndicator, { backgroundColor: priorityColors[task.priority] }]} />
          </View>
          
          <View style={styles.taskContent}>
            <View style={styles.taskHeader}>
              <Text style={[styles.taskName, task.completed && styles.taskCompleted, isOverdue && styles.taskOverdue]}>
                {task.name}
              </Text>
              {/* 显示动态计算的标签 */}
              {taskTags.map((tag, index) => (
                <View key={index} style={[styles.taskTagBadge, { backgroundColor: TAG_COLORS[tag] }]}>
                  <Text style={styles.taskTagText}>{tag}</Text>
                </View>
              ))}
            </View>
            {task.description ? (
              <Text style={styles.taskDescription} numberOfLines={1}>{task.description}</Text>
            ) : null}
            {task.due_date && (
              <Text style={[styles.taskDueDate, isOverdue && styles.textOverdue]}>
                📅 {formatDateTime(task.due_date)}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default SwipeableTaskItem;