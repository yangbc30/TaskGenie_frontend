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
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
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

  // AI 规划任务
  const aiPlanTasks = async (prompt) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/ai/plan-tasks/async`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
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

  // 检查 AI 任务状态
  useEffect(() => {
    if (aiJobId) {
      const checkJobStatus = setInterval(async () => {
        try {
          const response = await fetch(`${API_URL}/ai/jobs/${aiJobId}`);
          const job = await response.json();
          
          if (job.status === 'completed') {
            setAiJobId(null);
            await fetchTasks();
            Alert.alert('成功', 'AI 已为您规划任务');
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
    deleteTask,
    aiPlanTasks,
  };
};