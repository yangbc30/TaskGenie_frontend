import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';

// 后端 API 地址
const API_URL = 'http://10.0.2.2:8000'; // Android 模拟器使用
// const API_URL = 'http://localhost:8000'; // iOS 模拟器使用

const { width: screenWidth } = Dimensions.get('window');

// 滑动删除组件
const SwipeableTaskItem = ({ task, onEdit, onDelete, onToggle, formatDateTime }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -150));
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

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;

  return (
    <View style={styles.swipeContainer}>
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={[styles.swipeAction, styles.editAction]}
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
        <TouchableOpacity
          style={[styles.swipeAction, styles.deleteAction]}
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
            <Text style={[styles.taskName, task.completed && styles.taskCompleted, isOverdue && styles.taskOverdue]}>
              {task.name}
            </Text>
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

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    priority: 'medium',
    due_date: '',
    estimated_hours: '',
  });
  const [aiJobId, setAiJobId] = useState(null);
  const [scheduledTasks, setScheduledTasks] = useState(null);
  const [quickCreate, setQuickCreate] = useState(true);

  // 日历相关状态
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarTasks, setCalendarTasks] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  // 获取所有任务
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      Alert.alert('错误', '获取任务失败');
      console.error(error);
    }
  };

  // 获取日历数据
  const fetchCalendarTasks = async () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    try {
      const response = await fetch(`${API_URL}/tasks/calendar/${year}/${month}`);
      const data = await response.json();
      setCalendarTasks(data);
    } catch (error) {
      console.error('获取日历数据失败', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (activeTab === 'calendar') {
      fetchCalendarTasks();
    }
  }, [activeTab, currentMonth]);

  // 检查 AI 任务状态
  useEffect(() => {
    if (aiJobId) {
      const checkJobStatus = setInterval(async () => {
        try {
          const response = await fetch(`${API_URL}/ai/jobs/${aiJobId}`);
          const job = await response.json();
          
          if (job.status === 'completed') {
            setAiJobId(null);
            setAiPrompt('');
            fetchTasks();
            Alert.alert('成功', 'AI 已为您规划任务');
            setActiveTab('tasks');
          } else if (job.status === 'failed') {
            setAiJobId(null);
            Alert.alert('错误', job.error || 'AI 处理失败');
          }
        } catch (error) {
          console.error('检查任务状态失败', error);
        }
      }, 2000);

      return () => clearInterval(checkJobStatus);
    }
  }, [aiJobId]);

  // 快速创建任务
  const quickCreateTask = async () => {
    if (!newTaskName.trim()) {
      Alert.alert('提示', '请输入任务名称');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTaskName,
          description: '',
          priority: 'medium',
        }),
      });

      if (response.ok) {
        setNewTaskName('');
        fetchTasks();
      }
    } catch (error) {
      Alert.alert('错误', '创建任务失败');
      console.error(error);
    }
  };

  // 详细创建任务
  const createDetailedTask = async () => {
    if (!newTask.name.trim()) {
      Alert.alert('提示', '请输入任务名称');
      return;
    }

    try {
      const taskData = {
        name: newTask.name,
        description: newTask.description,
        priority: newTask.priority,
        due_date: newTask.due_date || null,
        estimated_hours: newTask.estimated_hours ? parseFloat(newTask.estimated_hours) : null,
      };

      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        setCreateModalVisible(false);
        setNewTask({
          name: '',
          description: '',
          priority: 'medium',
          due_date: '',
          estimated_hours: '',
        });
        fetchTasks();
      }
    } catch (error) {
      Alert.alert('错误', '创建任务失败');
      console.error(error);
    }
  };

  // 保存编辑的任务
  const saveEditedTask = async () => {
    if (!editingTask.name.trim()) {
      Alert.alert('提示', '任务名称不能为空');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingTask.name,
          description: editingTask.description,
          priority: editingTask.priority,
          due_date: editingTask.due_date || null,
          estimated_hours: editingTask.estimated_hours ? parseFloat(editingTask.estimated_hours) : null,
        }),
      });

      if (response.ok) {
        setEditModalVisible(false);
        fetchTasks();
        Alert.alert('成功', '任务已更新');
      }
    } catch (error) {
      Alert.alert('错误', '更新任务失败');
      console.error(error);
    }
  };

  // 切换任务完成状态
  const toggleTask = async (taskId, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !currentStatus,
        }),
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      Alert.alert('错误', '更新任务失败');
      console.error(error);
    }
  };

  // 删除任务
  const deleteTask = async (taskId) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个任务吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                fetchTasks();
              }
            } catch (error) {
              Alert.alert('错误', '删除任务失败');
              console.error(error);
            }
          },
        },
      ],
    );
  };

  // AI 规划任务
  const aiPlanTasks = async () => {
    if (!aiPrompt.trim()) {
      Alert.alert('提示', '请输入任务描述');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/ai/plan-tasks/async`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          max_tasks: 3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiJobId(data.job_id);
        Alert.alert('处理中', 'AI 正在为您规划任务，请稍候...');
      } else {
        const error = await response.json();
        Alert.alert('错误', error.detail || 'AI 处理失败');
      }
    } catch (error) {
      Alert.alert('错误', 'AI 规划失败，请检查网络连接');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // AI 智能调度
  const aiScheduleTasks = async () => {
    setLoading(true);
    try {
      // 先获取未完成的任务
      const pendingTasks = tasks.filter(t => !t.completed);
      if (pendingTasks.length === 0) {
        Alert.alert('提示', '没有待完成的任务需要调度');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/ai/schedule-tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        setScheduledTasks(data);
        Alert.alert('成功', 'AI 已为您安排任务时间');
      } else {
        Alert.alert('错误', 'AI 调度失败，请确保有未完成的任务');
      }
    } catch (error) {
      Alert.alert('错误', 'AI 调度失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期时间
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 格式化日期用于输入显示
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (e) {
      return '';
    }
  };

  // 解析用户输入的日期
  const parseDateInput = (input) => {
    if (!input) return null;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // 处理快捷输入
    const shortcuts = {
      '今天': 0,
      '明天': 1,
      '后天': 2,
      '大后天': 3,
    };
    
    for (const [key, days] of Object.entries(shortcuts)) {
      if (input.includes(key)) {
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + days);
        const timeMatch = input.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          targetDate.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]));
        } else {
          targetDate.setHours(9, 0); // 默认上午9点
        }
        return targetDate.toISOString();
      }
    }
    
    // 尝试解析标准格式
    try {
      // 支持多种格式
      let dateStr = input.trim();
      
      // 如果只有月日，添加当前年份
      if (dateStr.match(/^\d{1,2}-\d{1,2}/)) {
        dateStr = `${currentYear}-${dateStr}`;
      }
      
      // 如果没有时间，添加默认时间
      if (!dateStr.includes(':')) {
        dateStr += ' 09:00';
      }
      
      // 替换空格为T以符合ISO格式
      dateStr = dateStr.replace(' ', 'T') + ':00';
      
      const date = new Date(dateStr);
      if (!isNaN(date.getTime()) && date > now) {
        return date.toISOString();
      }
    } catch (e) {
      // 解析失败，返回null
    }
    
    return null;
  };

  // 计算任务紧急程度（用于日历颜色）
  const calculateUrgency = (dayTasks) => {
    if (!dayTasks || (!dayTasks.due?.length && !dayTasks.scheduled?.length)) return 0;
    
    let urgency = 0;
    const dueTasks = dayTasks.due || [];
    const scheduledTasks = dayTasks.scheduled || [];
    
    // 高优先级任务增加紧急度
    dueTasks.forEach(task => {
      if (task.priority === 'high') urgency += 3;
      else if (task.priority === 'medium') urgency += 2;
      else urgency += 1;
    });
    
    scheduledTasks.forEach(task => {
      if (task.priority === 'high') urgency += 2;
      else if (task.priority === 'medium') urgency += 1;
    });
    
    return Math.min(urgency, 10); // 最高10级
  };

  // 渲染日历
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    const weeks = [];
    
    // 填充空白
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // 填充日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    // 填充尾部空白保持6周显示
    while (days.length < 42) {
      days.push(null);
    }
    
    // 分组成周
    while (days.length > 0) {
      weeks.push(days.splice(0, 7));
    }
    
    return (
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => setCurrentMonth(new Date(year, month - 1))}>
            <Text style={styles.calendarNav}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>
            {year}年{month + 1}月
          </Text>
          <TouchableOpacity onPress={() => setCurrentMonth(new Date(year, month + 1))}>
            <Text style={styles.calendarNav}>{'>'}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.weekDays}>
          {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
            <Text key={day} style={styles.weekDay}>{day}</Text>
          ))}
        </View>
        
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.week}>
            {week.map((day, dayIndex) => {
              const dateStr = day ? `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` : null;
              const dayTasks = dateStr ? calendarTasks[dateStr] : null;
              const urgency = calculateUrgency(dayTasks);
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
              
              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.day,
                    urgency > 0 && { backgroundColor: `rgba(255, 71, 87, ${urgency * 0.1})` },
                    isToday && styles.today,
                  ]}
                  onPress={() => {
                    if (day && dayTasks) {
                      setSelectedDate({ date: dateStr, tasks: dayTasks });
                    }
                  }}
                  disabled={!day}
                >
                  {day && (
                    <>
                      <Text style={[styles.dayText, isToday && styles.todayText]}>{day}</Text>
                      {dayTasks && (dayTasks.due?.length > 0 || dayTasks.scheduled?.length > 0) && (
                        <View style={styles.taskDots}>
                          {dayTasks.due?.length > 0 && <View style={styles.dueDot} />}
                          {dayTasks.scheduled?.length > 0 && <View style={styles.scheduledDot} />}
                        </View>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  // 渲染智能调度结果
  const renderScheduledTasks = () => {
    if (!scheduledTasks) {
      return (
        <View style={styles.scheduleEmptyContainer}>
          <Text style={styles.scheduleEmptyText}>
            AI 智能调度可以根据任务的优先级、截止日期和预计时长，
            智能安排您的任务执行时间
          </Text>
          <TouchableOpacity 
            style={[styles.scheduleButton, loading && styles.disabledButton]} 
            onPress={aiScheduleTasks}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.scheduleButtonText}>开始智能调度</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    const sections = [
      { title: '今天', key: 'today', color: '#ff4757', icon: '🔥' },
      { title: '明天', key: 'tomorrow', color: '#ffa502', icon: '📅' },
      { title: '本周', key: 'this_week', color: '#3742fa', icon: '📋' },
      { title: '稍后', key: 'later', color: '#747d8c', icon: '📌' },
    ];

    return (
      <ScrollView style={styles.scheduleContainer}>
        <TouchableOpacity style={styles.refreshButton} onPress={aiScheduleTasks}>
          <Text style={styles.refreshButtonText}>重新规划 🔄</Text>
        </TouchableOpacity>
        
        {sections.map((section) => {
          const sectionTasks = scheduledTasks[section.key] || [];
          if (sectionTasks.length === 0) return null;
          
          return (
            <View key={section.key} style={styles.scheduleSection}>
              <View style={[styles.sectionHeader, { borderLeftColor: section.color }]}>
                <Text style={styles.sectionTitle}>
                  {section.icon} {section.title}
                </Text>
                <Text style={styles.sectionCount}>{sectionTasks.length} 个任务</Text>
              </View>
              {sectionTasks.map((task) => (
                <View key={task.id} style={styles.scheduledTask}>
                  <View style={styles.scheduledTaskHeader}>
                    <Text style={styles.scheduledTaskName}>{task.name}</Text>
                    <View style={[styles.scheduledPriority, { backgroundColor: getPriorityColor(task.priority) }]}>
                      <Text style={styles.scheduledPriorityText}>
                        {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                      </Text>
                    </View>
                  </View>
                  {task.description && (
                    <Text style={styles.scheduledTaskDesc} numberOfLines={2}>{task.description}</Text>
                  )}
                  <View style={styles.scheduledTaskMeta}>
                    {task.estimated_hours && (
                      <Text style={styles.scheduledTaskHours}>⏱ {task.estimated_hours} 小时</Text>
                    )}
                    {task.due_date && (
                      <Text style={styles.scheduledTaskDue}>📅 {formatDateTime(task.due_date)}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ff4757',
      medium: '#ffa502',
      low: '#2ed573',
    };
    return colors[priority] || '#747d8c';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 标题 */}
      <View style={styles.header}>
        <Text style={styles.title}>备忘录</Text>
      </View>

      {/* 标签页切换 */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}
              onPress={() => setActiveTab('tasks')}
            >
              <Text style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}>
                任务列表
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'ai' && styles.activeTab]}
              onPress={() => setActiveTab('ai')}
            >
              <Text style={[styles.tabText, activeTab === 'ai' && styles.activeTabText]}>
                AI 规划
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'calendar' && styles.activeTab]}
              onPress={() => setActiveTab('calendar')}
            >
              <Text style={[styles.tabText, activeTab === 'calendar' && styles.activeTabText]}>
                日历视图
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
              onPress={() => setActiveTab('schedule')}
            >
              <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>
                智能调度
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* 任务列表标签页 */}
      {activeTab === 'tasks' && (
        <>
          {/* 添加任务区域 */}
          <View style={styles.addTaskContainer}>
            {quickCreate ? (
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
              </View>
            ) : null}
          </View>

          {/* 任务列表 */}
          <ScrollView style={styles.taskList}>
            {tasks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>暂无任务</Text>
                <Text style={styles.emptyHint}>点击上方输入框快速创建任务</Text>
              </View>
            ) : (
              tasks.map((task) => (
                <SwipeableTaskItem
                  key={task.id}
                  task={task}
                  onEdit={(task) => {
                    setEditingTask({...task});
                    setEditModalVisible(true);
                  }}
                  onDelete={deleteTask}
                  onToggle={toggleTask}
                  formatDateTime={formatDateTime}
                />
              ))
            )}
          </ScrollView>
        </>
      )}

      {/* AI 规划标签页 */}
      {activeTab === 'ai' && (
        <View style={styles.aiContainer}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiTitle}>AI 任务规划助手</Text>
            <Text style={styles.aiHint}>
              描述你想要完成的事情，AI 会帮你分解成具体的任务步骤（最多3个）
            </Text>
          </View>
          
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
            onPress={aiPlanTasks}
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
      )}

      {/* 日历视图标签页 */}
      {activeTab === 'calendar' && (
        <ScrollView style={styles.calendarContainer}>
          {renderCalendar()}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, styles.dueDot]} />
              <Text style={styles.legendText}>截止任务</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, styles.scheduledDot]} />
              <Text style={styles.legendText}>计划任务</Text>
            </View>
            <Text style={styles.legendHint}>颜色越深表示任务越紧急</Text>
          </View>
        </ScrollView>
      )}

      {/* 智能调度标签页 */}
      {activeTab === 'schedule' && renderScheduledTasks()}

      {/* 创建任务模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>创建新任务</Text>
            
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.inputLabel}>任务名称 *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="输入任务名称"
                value={newTask.name}
                onChangeText={(text) => setNewTask({...newTask, name: text})}
              />
              
              <Text style={styles.inputLabel}>描述</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                placeholder="详细描述任务内容"
                value={newTask.description}
                onChangeText={(text) => setNewTask({...newTask, description: text})}
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
                      newTask.priority === priority && styles.selectedPriority,
                    ]}
                    onPress={() => setNewTask({...newTask, priority})}
                  >
                    <Text style={[
                      styles.priorityOptionText,
                      newTask.priority === priority && styles.selectedPriorityText,
                    ]}>
                      {priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.inputLabel}>截止时间</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="例如: 2025-05-31 15:30 或 明天 14:00"
                value={formatDateForInput(newTask.due_date)}
                onChangeText={(text) => {
                  setNewTask({...newTask, due_date: text});
                }}
                onBlur={() => {
                  const parsed = parseDateInput(newTask.due_date);
                  if (parsed) {
                    setNewTask({...newTask, due_date: parsed});
                  } else if (newTask.due_date && !newTask.due_date.includes('T')) {
                    Alert.alert('提示', '日期格式不正确，请使用如 "2025-05-31 15:30" 或 "明天 14:00" 的格式');
                    setNewTask({...newTask, due_date: ''});
                  }
                }}
              />
              <Text style={styles.dateHint}>
                支持: 明天/后天 15:30、2025-05-31 15:30、05-31 15:30
              </Text>
              
              <Text style={styles.inputLabel}>预计时长（小时）</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="例如: 2.5"
                value={newTask.estimated_hours}
                onChangeText={(text) => setNewTask({...newTask, estimated_hours: text})}
                keyboardType="numeric"
              />
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCreateModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={createDetailedTask}
              >
                <Text style={styles.saveButtonText}>创建</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 编辑任务模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>编辑任务</Text>
            
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.inputLabel}>任务名称</Text>
              <TextInput
                style={styles.modalInput}
                value={editingTask?.name}
                onChangeText={(text) => setEditingTask({...editingTask, name: text})}
              />
              
              <Text style={styles.inputLabel}>描述</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                value={editingTask?.description}
                onChangeText={(text) => setEditingTask({...editingTask, description: text})}
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
                      editingTask?.priority === priority && styles.selectedPriority,
                    ]}
                    onPress={() => setEditingTask({...editingTask, priority})}
                  >
                    <Text style={[
                      styles.priorityOptionText,
                      editingTask?.priority === priority && styles.selectedPriorityText,
                    ]}>
                      {priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.inputLabel}>截止时间</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="例如: 2025-05-31 15:30 或 明天 14:00"
                value={formatDateForInput(editingTask?.due_date)}
                onChangeText={(text) => {
                  setEditingTask({...editingTask, due_date: text});
                }}
                onBlur={() => {
                  const parsed = parseDateInput(editingTask?.due_date);
                  if (parsed) {
                    setEditingTask({...editingTask, due_date: parsed});
                  } else if (editingTask?.due_date && !editingTask.due_date.includes('T')) {
                    Alert.alert('提示', '日期格式不正确，请使用如 "2025-05-31 15:30" 或 "明天 14:00" 的格式');
                    setEditingTask({...editingTask, due_date: ''});
                  }
                }}
              />
              <Text style={styles.dateHint}>
                支持: 今天/明天/后天 15:30、2025-05-31 15:30
              </Text>
              
              <Text style={styles.inputLabel}>预计时长（小时）</Text>
              <TextInput
                style={styles.modalInput}
                value={editingTask?.estimated_hours?.toString() || ''}
                onChangeText={(text) => setEditingTask({
                  ...editingTask, 
                  estimated_hours: text
                })}
                keyboardType="numeric"
              />
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveEditedTask}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 日期任务详情模态框 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!selectedDate}
        onRequestClose={() => setSelectedDate(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setSelectedDate(null)}
        >
          <View style={styles.dateModalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.dateModalTitle}>
              {selectedDate?.date && new Date(selectedDate.date).toLocaleDateString('zh-CN', {
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </Text>
            
            {selectedDate?.tasks?.due?.length > 0 && (
              <View style={styles.dateTaskSection}>
                <Text style={styles.dateTaskSectionTitle}>📅 截止任务</Text>
                {selectedDate.tasks.due.map((task) => (
                  <View key={task.id} style={styles.dateTaskItem}>
                    <View style={[styles.dateTaskPriority, { backgroundColor: getPriorityColor(task.priority) }]} />
                    <Text style={styles.dateTaskName}>{task.name}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {selectedDate?.tasks?.scheduled?.length > 0 && (
              <View style={styles.dateTaskSection}>
                <Text style={styles.dateTaskSectionTitle}>📋 计划任务</Text>
                {selectedDate.tasks.scheduled.map((task) => (
                  <View key={task.id} style={styles.dateTaskItem}>
                    <View style={[styles.dateTaskPriority, { backgroundColor: getPriorityColor(task.priority) }]} />
                    <Text style={styles.dateTaskName}>{task.name}</Text>
                  </View>
                ))}
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.dateModalClose} 
              onPress={() => setSelectedDate(null)}
            >
              <Text style={styles.dateModalCloseText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  tabsWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 5,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 15,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  
  // 任务列表样式
  addTaskContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  quickCreateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#f8f9fa',
  },
  quickAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginLeft: 10,
  },
  detailButtonText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  taskList: {
    flex: 1,
    paddingTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    color: '#95a5a6',
    marginBottom: 10,
  },
  emptyHint: {
    fontSize: 14,
    color: '#bdc3c7',
  },
  
  // 滑动任务样式
  swipeContainer: {
    marginHorizontal: 15,
    marginBottom: 8,
  },
  swipeActions: {
    position: 'absolute',
    right: 0,
    height: '100%',
    flexDirection: 'row',
  },
  swipeAction: {
    width: 75,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAction: {
    backgroundColor: '#3498db',
  },
  deleteAction: {
    backgroundColor: '#e74c3c',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  swipeActionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  taskItemContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  taskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckboxCompleted: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priorityIndicator: {
    width: 3,
    height: 30,
    borderRadius: 2,
    marginLeft: 10,
  },
  taskContent: {
    flex: 1,
  },
  taskName: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#95a5a6',
  },
  taskOverdue: {
    color: '#e74c3c',
  },
  taskDescription: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 3,
  },
  taskDueDate: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 5,
  },
  textOverdue: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  
  // AI 规划样式
  aiContainer: {
    flex: 1,
    padding: 20,
  },
  aiHeader: {
    marginBottom: 25,
  },
  aiTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  aiHint: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
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
  },
  aiButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  aiButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 10,
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
  
  // 日历样式
  calendarContainer: {
    flex: 1,
    padding: 15,
  },
  calendar: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarNav: {
    fontSize: 22,
    color: '#3498db',
    paddingHorizontal: 15,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  week: {
    flexDirection: 'row',
    height: 45,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1,
    borderRadius: 8,
  },
  today: {
    borderWidth: 2,
    borderColor: '#3498db',
  },
  dayText: {
    fontSize: 15,
    color: '#2c3e50',
  },
  todayText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  taskDots: {
    flexDirection: 'row',
    marginTop: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  dueDot: {
    backgroundColor: '#e74c3c',
  },
  scheduledDot: {
    backgroundColor: '#3498db',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  legendText: {
    marginLeft: 5,
    fontSize: 13,
    color: '#7f8c8d',
  },
  legendHint: {
    fontSize: 12,
    color: '#95a5a6',
    marginLeft: 20,
  },
  
  // 智能调度样式
  scheduleEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  scheduleEmptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  scheduleButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  scheduleContainer: {
    flex: 1,
    padding: 15,
  },
  refreshButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3498db',
  },
  refreshButtonText: {
    color: '#3498db',
    fontSize: 15,
    fontWeight: '600',
  },
  scheduleSection: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 12,
    paddingVertical: 10,
    borderLeftWidth: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  sectionCount: {
    fontSize: 13,
    color: '#95a5a6',
  },
  scheduledTask: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  scheduledTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  scheduledTaskName: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
    flex: 1,
  },
  scheduledPriority: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 10,
  },
  scheduledPriorityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  scheduledTaskDesc: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  scheduledTaskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scheduledTaskHours: {
    fontSize: 12,
    color: '#95a5a6',
    marginRight: 15,
  },
  scheduledTaskDue: {
    fontSize: 12,
    color: '#95a5a6',
  },
  
  // 模态框样式
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
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3498db',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // 日期详情模态框
  dateModalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '85%',
    maxHeight: '60%',
  },
  dateModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  dateTaskSection: {
    marginBottom: 20,
  },
  dateTaskSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 10,
  },
  dateTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 5,
  },
  dateTaskPriority: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 10,
  },
  dateTaskName: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  dateModalClose: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  dateModalCloseText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default App;