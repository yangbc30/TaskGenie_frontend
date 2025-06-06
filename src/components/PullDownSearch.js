import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { TAG_COLORS } from '../context/TaskContext';
import { formatDateTime } from '../utils/dateUtils';
import { styles } from '../styles/ComponentStyles';

const PullDownSearch = ({ visible, onClose, tasks, onTaskSelect, translateY, opacity }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    if (!visible) {
      setSearchText('');
      setFilteredTasks([]);
    } else {
      if (searchText.trim()) {
        const filtered = tasks.filter(task =>
          task.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchText.toLowerCase()))
        );
        setFilteredTasks(filtered);
      }
    }
  }, [visible, tasks, searchText]);

  useEffect(() => {
    if (searchText.trim()) {
      const filtered = tasks.filter(task =>
        task.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks([]);
    }
  }, [searchText, tasks]);

  const handleTaskSelect = (task) => {
    if (searchText.trim()) {
      const newHistory = [searchText, ...searchHistory.filter(h => h !== searchText)].slice(0, 5);
      setSearchHistory(newHistory);
    }
    
    onTaskSelect(task);
    onClose();
  };

  const handleHistorySelect = (historyText) => {
    setSearchText(historyText);
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const priorityColors = {
    high: '#ff4757',
    medium: '#ffa502',
    low: '#2ed573',
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.searchOverlay, 
        { 
          opacity,
          transform: [{ translateY }]
        }
      ]}
    >
      <View style={styles.searchContainer}>
        {/* 搜索头部 */}
        <View style={styles.searchHeader}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="搜索任务名称或描述..."
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={false}
              placeholderTextColor="#95a5a6"
            />
            {searchText.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchText('')}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
        </View>

        {/* 下拉指示器 */}
        <View style={styles.pullIndicator}>
          <View style={styles.pullBar} />
          <Text style={styles.pullHint}>上拉关闭搜索</Text>
        </View>

        {/* 搜索内容区域 */}
        <ScrollView style={styles.searchContent} showsVerticalScrollIndicator={false}>
          {searchText.trim() === '' ? (
            <View>
              {searchHistory.length > 0 && (
                <View style={styles.historySection}>
                  <View style={styles.historySectionHeader}>
                    <Text style={styles.sectionTitle}>搜索历史</Text>
                    <TouchableOpacity onPress={clearHistory}>
                      <Text style={styles.clearHistoryText}>清空</Text>
                    </TouchableOpacity>
                  </View>
                  {searchHistory.map((item, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.historyItem}
                      onPress={() => handleHistorySelect(item)}
                    >
                      <Text style={styles.historyIcon}>🕐</Text>
                      <Text style={styles.historyText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>任务概览</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{tasks.length}</Text>
                    <Text style={styles.statLabel}>总任务</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{tasks.filter(t => !t.completed).length}</Text>
                    <Text style={styles.statLabel}>待完成</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{tasks.filter(t => t.completed).length}</Text>
                    <Text style={styles.statLabel}>已完成</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {tasks.filter(t => t.task_tag === '已过期').length}
                    </Text>
                    <Text style={styles.statLabel}>已逾期</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View>
              {filteredTasks.length > 0 ? (
                <>
                  <Text style={styles.searchResultHeader}>
                    找到 {filteredTasks.length} 个相关任务
                  </Text>
                  {filteredTasks.map((task) => {
                    const isOverdue = task.task_tag === '已过期';
                    return (
                      <TouchableOpacity
                        key={task.id}
                        style={styles.searchResultItem}
                        onPress={() => handleTaskSelect(task)}
                      >
                        <View style={styles.taskResultLeft}>
                          <View style={[styles.taskResultCheckbox, task.completed && styles.taskResultCheckboxCompleted]}>
                            {task.completed && <Text style={styles.checkmark}>✓</Text>}
                          </View>
                          <View style={[styles.priorityIndicator, { backgroundColor: priorityColors[task.priority] }]} />
                        </View>
                        
                        <View style={styles.taskResultContent}>
                          <View style={styles.taskResultHeader}>
                            <Text style={[
                              styles.taskResultName, 
                              task.completed && styles.taskCompleted,
                              isOverdue && styles.taskOverdue
                            ]}>
                              {task.name}
                            </Text>
                            <View style={[styles.taskTagBadge, { backgroundColor: TAG_COLORS[task.task_tag] }]}>
                              <Text style={styles.taskTagText}>{task.task_tag}</Text>
                            </View>
                          </View>
                          {task.description ? (
                            <Text style={styles.taskResultDescription} numberOfLines={2}>
                              {task.description}
                            </Text>
                          ) : null}
                          {task.due_date && (
                            <Text style={[styles.taskResultDueDate, isOverdue && styles.textOverdue]}>
                              📅 {formatDateTime(task.due_date)}
                            </Text>
                          )}
                        </View>
                        
                        <View style={styles.taskResultRight}>
                          <Text style={styles.taskResultArrow}>→</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </>
              ) : (
                <View style={styles.noResultContainer}>
                  <Text style={styles.noResultIcon}>🔍</Text>
                  <Text style={styles.noResultText}>未找到相关任务</Text>
                  <Text style={styles.noResultHint}>试试其他关键词</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Animated.View>
  );
};

export default PullDownSearch;