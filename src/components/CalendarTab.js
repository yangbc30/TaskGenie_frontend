import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { API_URL, TAG_COLORS } from '../context/TaskContext';
import { formatDateTime } from '../utils/dateUtils';
import AIScheduleModal from './AIScheduleModal';

const CalendarTab = ({ pullUpPanResponder }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarTasks, setCalendarTasks] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [aiScheduleModalVisible, setAiScheduleModalVisible] = useState(false);
  const [daySchedule, setDaySchedule] = useState(null); // 存储AI安排结果
  const [tasksChanged, setTasksChanged] = useState(false); // 任务是否发生变化

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

  // 获取指定日期的AI安排
  const fetchDaySchedule = async (dateStr) => {
    try {
      const response = await fetch(`${API_URL}/ai/schedule/${dateStr}`);
      const data = await response.json();
      
      if (data.has_schedule) {
        setDaySchedule(data.schedule);
        setTasksChanged(data.tasks_changed);
      } else {
        setDaySchedule(null);
        setTasksChanged(false);
      }
    } catch (error) {
      console.error('获取AI安排失败', error);
      setDaySchedule(null);
      setTasksChanged(false);
    }
  };

  useEffect(() => {
    fetchCalendarTasks();
  }, [currentMonth]);

  // 当选中日期变化时，获取AI安排
  useEffect(() => {
    if (selectedDate) {
      fetchDaySchedule(selectedDate.date);
    }
  }, [selectedDate]);

  // 刷新日历数据和AI安排
  const handleRefresh = () => {
    fetchCalendarTasks();
    if (selectedDate) {
      fetchDaySchedule(selectedDate.date);
    }
  };

  // 打开AI安排模态框
  const handleOpenAISchedule = () => {
    setAiScheduleModalVisible(true);
  };

  // 重新生成AI安排
  const handleRegenerateSchedule = () => {
    Alert.alert(
      '重新生成安排',
      '确定要重新生成AI安排吗？这将覆盖现有的安排。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: () => {
            setDaySchedule(null); // 清空当前安排
            setAiScheduleModalVisible(true);
          }
        }
      ]
    );
  };

  // 删除AI安排
  const handleDeleteSchedule = async () => {
    Alert.alert(
      '删除安排',
      '确定要删除这个AI安排吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_URL}/ai/schedule/${selectedDate.date}`, {
                method: 'DELETE',
              });
              setDaySchedule(null);
              setTasksChanged(false);
            } catch (error) {
              Alert.alert('错误', '删除安排失败');
              console.error(error);
            }
          }
        }
      ]
    );
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

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ff4757',
      medium: '#ffa502',
      low: '#2ed573',
    };
    return colors[priority] || '#747d8c';
  };

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m}分钟`;
    if (m === 0) return `${h}小时`;
    return `${h}小时${m}分钟`;
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
                    selectedDate?.date === dateStr && styles.selectedDay,
                  ]}
                  onPress={() => {
                    if (day && dayTasks) {
                      setSelectedDate({ date: dateStr, tasks: dayTasks });
                    } else if (day) {
                      setSelectedDate({ date: dateStr, tasks: { due: [], scheduled: [] } });
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

  const styles = {
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
    selectedDay: {
      backgroundColor: '#3498db',
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
    dueDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      marginHorizontal: 1,
      backgroundColor: '#e74c3c',
    },
    scheduledDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      marginHorizontal: 1,
      backgroundColor: '#3498db',
    },
    selectedDateContainer: {
      backgroundColor: '#fff',
      borderRadius: 15,
      padding: 20,
      marginTop: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    selectedDateHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    selectedDateTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#2c3e50',
      flex: 1,
    },
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    aiScheduleButton: {
      backgroundColor: '#9b59b6',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      marginLeft: 10,
    },
    aiScheduleButtonText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: 'bold',
    },
    regenerateButton: {
      backgroundColor: '#f39c12',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      marginLeft: 8,
    },
    regenerateButtonText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: 'bold',
    },
    deleteButton: {
      backgroundColor: '#e74c3c',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      marginLeft: 8,
    },
    deleteButtonText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: 'bold',
    },
    warningBanner: {
      backgroundColor: '#fff3cd',
      padding: 12,
      borderRadius: 8,
      marginBottom: 15,
      borderLeftWidth: 4,
      borderLeftColor: '#ffc107',
    },
    warningText: {
      color: '#856404',
      fontSize: 14,
      fontWeight: '500',
    },
    // AI安排显示样式
    aiScheduleContainer: {
      backgroundColor: '#f8f9fa',
      borderRadius: 12,
      padding: 15,
      marginBottom: 20,
      borderLeftWidth: 4,
      borderLeftColor: '#9b59b6',
    },
    aiScheduleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    aiScheduleTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#2c3e50',
    },
    efficiencyBadge: {
      backgroundColor: '#e8f5e8',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    efficiencyText: {
      color: '#27ae60',
      fontSize: 11,
      fontWeight: 'bold',
    },
    scheduleMetrics: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: '#fff',
      padding: 12,
      borderRadius: 8,
      marginBottom: 15,
    },
    metricItem: {
      alignItems: 'center',
    },
    metricValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#3498db',
    },
    metricLabel: {
      fontSize: 11,
      color: '#7f8c8d',
      marginTop: 2,
    },
    scheduleItem: {
      backgroundColor: '#fff',
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      borderLeftWidth: 3,
    },
    scheduleTime: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    timeText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#2c3e50',
    },
    durationText: {
      fontSize: 11,
      color: '#7f8c8d',
    },
    scheduleTaskName: {
      fontSize: 14,
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: 4,
    },
    scheduleReason: {
      fontSize: 12,
      color: '#7f8c8d',
      fontStyle: 'italic',
    },
    suggestionsContainer: {
      backgroundColor: '#e8f4fd',
      padding: 12,
      borderRadius: 8,
      marginTop: 10,
    },
    suggestionsTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: 8,
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 6,
    },
    suggestionBullet: {
      color: '#3498db',
      fontSize: 14,
      marginRight: 6,
      marginTop: 1,
    },
    suggestionText: {
      flex: 1,
      fontSize: 12,
      color: '#34495e',
      lineHeight: 16,
    },
    taskSection: {
      marginBottom: 20,
    },
    taskSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#34495e',
      marginBottom: 12,
    },
    taskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      marginBottom: 10,
      backgroundColor: '#f8f9fa',
      borderRadius: 10,
    },
    taskPriority: {
      width: 4,
      height: '100%',
      minHeight: 40,
      borderRadius: 2,
      marginRight: 15,
    },
    taskInfo: {
      flex: 1,
    },
    taskInfoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    taskItemName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#2c3e50',
      flex: 1,
    },
    taskTagBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      marginLeft: 8,
    },
    taskTagText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
    },
    taskItemDescription: {
      fontSize: 14,
      color: '#7f8c8d',
      lineHeight: 20,
      marginBottom: 4,
    },
    taskItemTime: {
      fontSize: 12,
      color: '#95a5a6',
    },
    noTasksContainer: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    noTasksText: {
      fontSize: 16,
      color: '#7f8c8d',
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
  };

  return (
    <>
      <ScrollView style={styles.calendarContainer} {...pullUpPanResponder.panHandlers}>
        {renderCalendar()}
        
        {/* 选中日期的详情 */}
        {selectedDate && (
          <View style={styles.selectedDateContainer}>
            <View style={styles.selectedDateHeader}>
              <Text style={styles.selectedDateTitle}>
                {new Date(selectedDate.date).toLocaleDateString('zh-CN', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </Text>
              
              {/* 按钮组 */}
              <View style={styles.buttonContainer}>
                {/* 根据是否有任务和AI安排显示不同按钮 */}
                {(selectedDate.tasks?.due?.length > 0 || selectedDate.tasks?.scheduled?.length > 0) && (
                  <>
                    {!daySchedule ? (
                      <TouchableOpacity
                        style={styles.aiScheduleButton}
                        onPress={handleOpenAISchedule}
                      >
                        <Text style={styles.aiScheduleButtonText}>🤖 AI安排</Text>
                      </TouchableOpacity>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={styles.regenerateButton}
                          onPress={handleRegenerateSchedule}
                        >
                          <Text style={styles.regenerateButtonText}>🔄 重新生成</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={handleDeleteSchedule}
                        >
                          <Text style={styles.deleteButtonText}>🗑️ 删除</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </>
                )}
              </View>
            </View>

            {/* 任务变化警告 */}
            {tasksChanged && daySchedule && (
              <View style={styles.warningBanner}>
                <Text style={styles.warningText}>
                  ⚠️ 检测到任务发生变化，建议重新生成AI安排以获得最佳效果
                </Text>
              </View>
            )}

            {/* 显示AI安排结果 */}
            {daySchedule && daySchedule.schedule_items && daySchedule.schedule_items.length > 0 && (
              <View style={styles.aiScheduleContainer}>
                <View style={styles.aiScheduleHeader}>
                  <Text style={styles.aiScheduleTitle}>🤖 AI智能安排</Text>
                  <View style={styles.efficiencyBadge}>
                    <Text style={styles.efficiencyText}>
                      效率: {daySchedule.efficiency_score}/10
                    </Text>
                  </View>
                </View>

                {/* 安排统计 */}
                <View style={styles.scheduleMetrics}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{daySchedule.schedule_items.length}</Text>
                    <Text style={styles.metricLabel}>个任务</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{formatDuration(daySchedule.total_hours)}</Text>
                    <Text style={styles.metricLabel}>总时长</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>
                      {new Date(daySchedule.created_at).toLocaleDateString()}
                    </Text>
                    <Text style={styles.metricLabel}>生成时间</Text>
                  </View>
                </View>

                {/* 时间安排列表 */}
                {daySchedule.schedule_items.map((item, index) => (
                  <View 
                    key={index}
                    style={[
                      styles.scheduleItem,
                      { borderLeftColor: getPriorityColor(item.priority) }
                    ]}
                  >
                    <View style={styles.scheduleTime}>
                      <Text style={styles.timeText}>
                        {item.start_time} - {item.end_time}
                      </Text>
                      <Text style={styles.durationText}>
                        {formatDuration(item.duration)}
                      </Text>
                    </View>
                    <Text style={styles.scheduleTaskName}>{item.task_name}</Text>
                    <Text style={styles.scheduleReason}>💡 {item.reason}</Text>
                  </View>
                ))}

                {/* AI建议 */}
                {daySchedule.suggestions && daySchedule.suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsTitle}>💡 AI建议</Text>
                    {daySchedule.suggestions.map((suggestion, index) => (
                      <View key={index} style={styles.suggestionItem}>
                        <Text style={styles.suggestionBullet}>•</Text>
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
            
            {/* 原始任务列表 */}
            {selectedDate.tasks?.due?.length > 0 && (
              <View style={styles.taskSection}>
                <Text style={styles.taskSectionTitle}>📅 截止任务</Text>
                {selectedDate.tasks.due.map((task) => (
                  <View key={task.id} style={styles.taskItem}>
                    <View style={[styles.taskPriority, { backgroundColor: getPriorityColor(task.priority) }]} />
                    <View style={styles.taskInfo}>
                      <View style={styles.taskInfoHeader}>
                        <Text style={styles.taskItemName}>{task.name}</Text>
                        <View style={[styles.taskTagBadge, { backgroundColor: TAG_COLORS[task.task_tag] }]}>
                          <Text style={styles.taskTagText}>{task.task_tag}</Text>
                        </View>
                      </View>
                      {task.description && (
                        <Text style={styles.taskItemDescription} numberOfLines={2}>
                          {task.description}
                        </Text>
                      )}
                      {task.due_date && (
                        <Text style={styles.taskItemTime}>
                          ⏰ {formatDateTime(task.due_date)}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            {selectedDate.tasks?.scheduled?.length > 0 && (
              <View style={styles.taskSection}>
                <Text style={styles.taskSectionTitle}>📋 计划任务</Text>
                {selectedDate.tasks.scheduled.map((task) => (
                  <View key={task.id} style={styles.taskItem}>
                    <View style={[styles.taskPriority, { backgroundColor: getPriorityColor(task.priority) }]} />
                    <View style={styles.taskInfo}>
                      <View style={styles.taskInfoHeader}>
                        <Text style={styles.taskItemName}>{task.name}</Text>
                        <View style={[styles.taskTagBadge, { backgroundColor: TAG_COLORS[task.task_tag] }]}>
                          <Text style={styles.taskTagText}>{task.task_tag}</Text>
                        </View>
                      </View>
                      {task.description && (
                        <Text style={styles.taskItemDescription} numberOfLines={2}>
                          {task.description}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            {(!selectedDate.tasks?.due?.length && !selectedDate.tasks?.scheduled?.length) && !daySchedule && (
              <View style={styles.noTasksContainer}>
                <Text style={styles.noTasksText}>📋 这一天暂无任务</Text>
              </View>
            )}
          </View>
        )}
        
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={styles.dueDot} />
            <Text style={styles.legendText}>截止任务</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.scheduledDot} />
            <Text style={styles.legendText}>计划任务</Text>
          </View>
          <Text style={styles.legendHint}>颜色越深表示任务越紧急</Text>
        </View>
      </ScrollView>

      {/* AI安排模态框 */}
      <AIScheduleModal
        visible={aiScheduleModalVisible}
        onClose={() => setAiScheduleModalVisible(false)}
        selectedDate={selectedDate}
        onRefresh={handleRefresh}
        forceRegenerate={!daySchedule} // 如果没有现有安排，则强制生成
      />
    </>
  );
};

export default CalendarTab;