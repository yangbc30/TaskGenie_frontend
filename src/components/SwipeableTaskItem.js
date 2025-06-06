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
  const [isActionExecuted, setIsActionExecuted] = useState(false);
  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        setIsActionExecuted(false);
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
        
        if (!isActionExecuted) {
          if (gestureState.dx < -120) {
            setIsActionExecuted(true);
            onEdit(task);
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          } else if (gestureState.dx > 120) {
            setIsActionExecuted(true);
            onDelete(task.id);
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!isActionExecuted) {
          if (gestureState.dx < -30) {
            Animated.spring(translateX, {
              toValue: -75,
              useNativeDriver: true,
            }).start();
          } else if (gestureState.dx > 30) {
            Animated.spring(translateX, {
              toValue: 75,
              useNativeDriver: true,
            }).start();
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
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

  return (
    <View style={styles.swipeContainer}>
      {/* 左侧编辑按钮 */}
      <View style={styles.leftAction}>
        <TouchableOpacity
          style={styles.swipeActionFull}
          onPress={() => {
            onEdit(task);
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }}
        >
          <Text style={styles.swipeActionText}>编辑</Text>
        </TouchableOpacity>
      </View>
      
      {/* 右侧删除按钮 */}
      <View style={styles.rightAction}>
        <TouchableOpacity
          style={styles.swipeActionFull}
          onPress={() => {
            onDelete(task.id);
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }}
        >
          <Text style={styles.swipeActionText}>删除</Text>
        </TouchableOpacity>
      </View>
      
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