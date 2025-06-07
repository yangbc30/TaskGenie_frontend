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

  // 更新任务 - 优化完成状态切换逻辑
  const updateTask = async (taskId, updateData) => {
    try {
      // 如果是切换完成状态，确保只发送必要的字段
      let payload = updateData;
      
      // 如果是切换完成状态，专门处理
      if (updateData.hasOwnProperty('completed')) {
        payload = {
          completed: updateData.completed,
          // 不发送 task_tag，让后端自动处理标签逻辑
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
        await fetchTasks(); // 重新获取任务列表以确保状态同步
        return true;
      }
      return false;
    } catch (error) {
      Alert.alert('错误', '更新任务失败');
      console.error(error);
      return false;
    }
  };

  // 切换任务完成状态 - 专门的方法
  const toggleTaskCompletion = async (taskId, currentCompleted) => {
    try {
      // 发送切换完成状态的请求
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
        // 立即更新本地状态，提供更好的用户体验
        setTasks(prevTasks => prevTasks.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              completed: !currentCompleted,
              // 注意：不在这里更新task_tag，让后端处理后再同步
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
      // 如果失败，重新获取任务以恢复正确状态
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

  // AI 规划任务 - 添加maxTasks参数
  const aiPlanTasks = async (prompt, maxTasks = 5) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/ai/plan-tasks/async`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          max_tasks: maxTasks,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiJobId(data.job_id);
        
        // 只在开始时显示一次提示，不再显示完成弹窗
        Alert.alert(
          '开始规划', 
          `AI 正在为您规划 ${maxTasks} 个任务，完成后任务会自动出现在列表中`,
          [{ text: '好的', style: 'default' }]
        );
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
    let checkJobStatus;
    
    if (aiJobId) {
      console.log(`开始检查AI作业状态: ${aiJobId}`);
      
      checkJobStatus = setInterval(async () => {
        try {
          const response = await fetch(`${API_URL}/ai/jobs/${aiJobId}`);
          const job = await response.json();
          
          console.log(`AI作业状态: ${job.status}`);
          
          if (job.status === 'completed') {
            // 清理状态
            clearInterval(checkJobStatus);
            setAiJobId(null);
            
            console.log('AI规划完成，刷新任务列表');
            
            // 静默刷新任务列表，用户会看到新任务出现
            await fetchTasks();
            
            // 不再显示弹窗，用户可以直接在任务列表中看到新生成的任务
            console.log(`✅ AI规划完成：生成了 ${job.result ? job.result.length : 0} 个任务`);
            
          } else if (job.status === 'failed') {
            // 清理状态
            clearInterval(checkJobStatus);
            setAiJobId(null);
            
            // 失败时仍显示错误信息，因为用户需要知道失败原因
            Alert.alert(
              '规划失败', 
              job.error || 'AI 处理失败，请稍后重试'
            );
          }
        } catch (error) {
          console.error('检查任务状态失败', error);
          // 网络错误时清理状态
          clearInterval(checkJobStatus);
          setAiJobId(null);
        }
      }, 2000);
    }

    // 清理函数
    return () => {
      if (checkJobStatus) {
        console.log('清理AI状态检查定时器');
        clearInterval(checkJobStatus);
      }
    };
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
    aiPlanTasks, // 现在接受prompt和maxTasks两个参数
  };
};