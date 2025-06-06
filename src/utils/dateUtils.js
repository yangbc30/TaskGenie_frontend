// 格式化日期时间
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 格式化日期用于输入显示
export const formatDateForInput = (dateString) => {
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
export const parseDateInput = (input) => {
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