import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { API_URL } from '../context/TaskContext';

export const useTaskOperations = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiJobId, setAiJobId] = useState(null);

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

  // 创建任务
  const createTask = async (taskData) => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        await fetchTasks();
        return true;
      }
      return false;
    } catch (error) {
      Alert.alert('错误', '创建任务失败');
      console.error(error);
      return false;
    }
  };

  // 更新任务
  const updateTask = async (taskId, updateData) => {
    try {
      let payload = updateData;
      
      if (updateData.hasOwnProperty('completed')) {
        payload = {
          completed: updateData.completed,
        };
      }

      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchTasks();
        return true;
      }
      return false;
    } catch (error) {
      Alert.alert('错误', '更新任务失败');
      console.error(error);
      return false;
    }
  };

  // 切换任务完成状态
  const toggleTaskCompletion = async (taskId, currentCompleted) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !currentCompleted,
        }),
      });

      if (response.ok) {
        // 立即更新本地状态
        setTasks(prevTasks => prevTasks.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              completed: !currentCompleted,
            };
          }
          return task;
        }));
        
        // 然后同步后端状态
        await fetchTasks();
        return true;
      }
      return false;
    } catch (error) {
      Alert.alert('错误', '切换任务状态失败');
      console.error(error);
      await fetchTasks();
      return false;
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
                await fetchTasks();
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

  // AI 规划任务 - 修复版本，正确传递 maxTasks 参数
  const aiPlanTasks = async (prompt, maxTasks = 5) => {
    setLoading(true);
    console.log('🚀 发送AI规划请求', { prompt, max_tasks: maxTasks }); // 添加调试日志
    
    try {
      const response = await fetch(`${API_URL}/ai/plan-tasks/async`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          max_tasks: maxTasks, // 修复：确保正确传递参数
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ AI规划响应', data); // 添加调试日志
        setAiJobId(data.job_id);
        Alert.alert('处理中', `AI 正在为您规划 ${maxTasks} 个任务，请稍候...`);
      } else {
        const error = await response.json();
        Alert.alert('错误', error.detail || 'AI 处理失败');
      }
    } catch (error) {
      Alert.alert('错误', 'AI 规划失败，请检查网络连接');
      console.error('AI规划请求失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 检查 AI 任务状态 - 移除完成提示
  useEffect(() => {
    if (aiJobId) {
      const checkJobStatus = setInterval(async () => {
        try {
          const response = await fetch(`${API_URL}/ai/jobs/${aiJobId}`);
          const job = await response.json();
          
          console.log('📊 AI作业状态检查:', job.status); // 添加调试日志
          
          if (job.status === 'completed') {
            setAiJobId(null);
            await fetchTasks(); // 静默刷新任务列表
            console.log('✅ AI规划完成，任务数量:', job.result?.length || 0);
            // 移除了 Alert.alert('成功', 'AI 已为您规划任务');
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

  return {
    tasks,
    loading,
    aiJobId,
    fetchTasks,
    createTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask,
    aiPlanTasks,
  };
};