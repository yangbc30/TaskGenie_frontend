import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { API_URL, TAG_COLORS } from '../context/TaskContext';
import { formatDateTime } from '../utils/dateUtils';

const CalendarTab = ({ pullUpPanResponder }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarTasks, setCalendarTasks] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

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
    fetchCalendarTasks();
  }, [currentMonth]);

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
    selectedDateTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: 20,
      textAlign: 'center',
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
    <ScrollView style={styles.calendarContainer} {...pullUpPanResponder.panHandlers}>
      {renderCalendar()}
      
      {/* 选中日期的任务详情 */}
      {selectedDate && (
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateTitle}>
            {new Date(selectedDate.date).toLocaleDateString('zh-CN', {
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </Text>
          
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
          
          {(!selectedDate.tasks?.due?.length && !selectedDate.tasks?.scheduled?.length) && (
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
  );
};

export default CalendarTab;
    