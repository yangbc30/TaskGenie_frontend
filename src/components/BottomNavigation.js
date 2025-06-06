import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/ComponentStyles';

const BottomNavigation = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.bottomNavigation}>
      <TouchableOpacity
        style={[styles.bottomNavButton, activeTab === 'tasks' && styles.activeBottomNavButton]}
        onPress={() => onTabChange('tasks')}
      >
        <Text style={[styles.bottomNavIcon, activeTab === 'tasks' && styles.activeBottomNavIcon]}>
          📝
        </Text>
        <Text style={[styles.bottomNavText, activeTab === 'tasks' && styles.activeBottomNavText]}>
          任务列表
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.bottomNavButton, activeTab === 'calendar' && styles.activeBottomNavButton]}
        onPress={() => onTabChange('calendar')}
      >
        <Text style={[styles.bottomNavIcon, activeTab === 'calendar' && styles.activeBottomNavIcon]}>
          📅
        </Text>
        <Text style={[styles.bottomNavText, activeTab === 'calendar' && styles.activeBottomNavText]}>
          日历视图
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomNavigation;