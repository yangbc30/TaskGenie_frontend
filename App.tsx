import React, { useState, useEffect } from 'react';
import { View, Platform, Alert } from 'react-native';
import { TaskProvider } from './src/context/TaskContext';
import TaskListTab from './src/components/TaskListTab';
import CalendarTab from './src/components/CalendarTab';
import BottomNavigation from './src/components/BottomNavigation';
import PullDownSearch from './src/components/PullDownSearch';
import AIPlanningModal from './src/components/AIPlanningModal';
import { useTaskOperations } from './src/hooks/useTaskOperations';
import { usePullDownSearch } from './src/hooks/usePullDownSearch';
import { styles } from './src/styles/AppStyles';

const App = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [aiModalVisible, setAiModalVisible] = useState(false);
  
  const {
    tasks,
    loading,
    aiJobId,
    fetchTasks,
    createTask,
    updateTask,
    toggleTaskCompletion, // 获取新的切换方法
    deleteTask,
    aiPlanTasks,
  } = useTaskOperations();

  const {
    searchVisible,
    searchTranslateY,
    searchOpacity,
    pullDownPanResponder,
    pullUpPanResponder,
    closeSearch,
  } = usePullDownSearch();

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskSelect = (task) => {
    Alert.alert('任务详情', `任务名称: ${task.name}\n${task.description || '无描述'}\n标签: ${task.task_tag}`);
  };

  return (
    <TaskProvider>
      <View style={styles.container}>
        {/* 状态栏占位 */}
        <View style={styles.statusBarSpacer} />

        {/* 下拉搜索组件 */}
        <PullDownSearch
          visible={searchVisible}
          onClose={closeSearch}
          tasks={tasks}
          onTaskSelect={handleTaskSelect}
          translateY={searchTranslateY}
          opacity={searchOpacity}
        />

        {/* AI规划模态框 */}
        <AIPlanningModal
          visible={aiModalVisible}
          onClose={() => setAiModalVisible(false)}
          onPlan={aiPlanTasks}
          loading={loading}
          aiJobId={aiJobId}
        />

        {/* 主内容区域 */}
        <View 
          style={styles.mainContent}
          {...pullDownPanResponder.panHandlers}
        >
          {activeTab === 'tasks' ? (
            <TaskListTab
              tasks={tasks}
              onCreateTask={createTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onToggleTaskCompletion={toggleTaskCompletion} // 传递新的切换方法
              onOpenAIModal={() => setAiModalVisible(true)}
              pullUpPanResponder={pullUpPanResponder}
            />
          ) : (
            <CalendarTab
              pullUpPanResponder={pullUpPanResponder}
            />
          )}
        </View>

        {/* 底部导航栏 */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </View>
    </TaskProvider>
  );
};

export default App;