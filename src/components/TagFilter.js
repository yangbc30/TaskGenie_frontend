import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { TASK_TAGS, TAG_COLORS } from '../context/TaskContext';
import { styles } from '../styles/ComponentStyles';

const TagFilter = ({ tasks, selectedTags, onTagToggle }) => {
  const [tagStats, setTagStats] = useState({});

  // 本地计算任务标签（与后端保持一致）
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

  // 计算本地标签统计 - 实时更新
  const calculateLocalTagStats = () => {
    const stats = {};
    
    // 初始化统计
    Object.keys(TASK_TAGS).forEach(tag => {
      stats[tag] = 0;
    });
    
    // 计算每个任务的标签并统计
    if (tasks && tasks.length > 0) {
      tasks.forEach(task => {
        const taskTags = calculateTaskTags(task);
        taskTags.forEach(tag => {
          if (stats.hasOwnProperty(tag)) {
            stats[tag]++;
          }
        });
      });
    }
    
    return stats;
  };

  // 监听任务变化，实时更新标签统计
  useEffect(() => {
    const newStats = calculateLocalTagStats();
    setTagStats(newStats);
  }, [tasks]);

  const availableTags = Object.keys(TASK_TAGS);

  return (
    <View style={styles.tagFilterContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagScrollContainer}
      >
        {availableTags.map((tag) => {
          const tagCount = tagStats[tag] || 0;
          const isSelected = selectedTags.includes(tag);
          
          return (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagFilterItem,
                { backgroundColor: TAG_COLORS[tag] },
                isSelected ? styles.selectedTagFilter : styles.unselectedTagFilter
              ]}
              onPress={() => onTagToggle(tag)}
            >
              <Text style={[
                styles.tagFilterText,
                !isSelected && styles.unselectedTagText
              ]}>
                {tag}
              </Text>
              <View style={[
                styles.tagCountBadge,
                !isSelected && styles.unselectedTagCountBadge
              ]}>
                <Text style={[
                  styles.tagCountText,
                  !isSelected && styles.unselectedTagCountText
                ]}>
                  {tagCount}
                </Text>
              </View>
              {/* 选中状态指示器 */}
              {isSelected && (
                <Text style={styles.selectedIndicator}>✓</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default TagFilter;