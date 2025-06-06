import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // 状态栏占位
  statusBarSpacer: {
    height: Platform.OS === 'ios' ? 44 : 24,
    backgroundColor: '#f8f9fa',
  },

  // 主内容区域
  mainContent: {
    flex: 1,
  },
});