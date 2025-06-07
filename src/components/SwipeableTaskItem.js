import React, { useState, useRef } from 'react';
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
  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        // 只允许左滑
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          // 左滑超过50像素，显示操作按钮
          Animated.spring(translateX, {
            toValue: -150, // 显示两个按钮的宽度
            useNativeDriver: true,
          }).start();
        } else {
          // 回到原位
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

  const isOverdue = task.task_tag === '已过期';

  const handleEdit = () => {
    onEdit(task);
    // 操作后收回按钮
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleDelete = () => {
    onDelete(task.id);
    // 操作后收回按钮
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.swipeContainer}>
      {/* 右侧操作按钮区域 */}
      <View style={styles.actionButtonsContainer}>
        {/* 修改按钮 */}
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
        >
          <Text style={styles.actionButtonIcon}>✏️</Text>
          <Text style={styles.actionButtonText}>修改</Text>
        </TouchableOpacity>
        
        {/* 删除按钮 */}
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
              <View style={[styles.taskTagBadge, { backgroundColor: TAG_COLORS[task.task_tag] }]}>
                <Text style={styles.taskTagText}>{task.task_tag}</Text>
              </View>
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