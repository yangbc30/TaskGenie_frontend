import { StyleSheet, Platform, Dimensions } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // 标签筛选器样式
  tagFilterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  tagScrollContainer: {
    paddingHorizontal: 15,
  },
  tagFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    opacity: 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedTagFilter: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tagFilterText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
  },
  tagCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 16,
    alignItems: 'center',
  },
  tagCountText: {
    color: '#fff',
    fontSize: 11,
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
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
  },
  quickAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
  },
  detailButtonText: {
    color: '#3498db',
    fontSize: 13,
    fontWeight: '600',
  },
  aiButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
    backgroundColor: '#9b59b6',
    borderRadius: 16,
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  taskList: {
    flex: 1,
    paddingTop: 8,
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
    marginBottom: 5,
  },

  // 滑动任务样式
  swipeContainer: {
    marginHorizontal: 15,
    marginBottom: 6,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  // 操作按钮容器
  actionButtonsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    width: 150,
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  editButton: {
    backgroundColor: '#3498db', // 蓝色编辑按钮
  },
  deleteButton: {
    backgroundColor: '#e74c3c', // 红色删除按钮
  },
  actionButtonIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskItemContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  taskCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckboxCompleted: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  taskName: {
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  taskDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
    lineHeight: 16,
  },
  taskDueDate: {
    fontSize: 11,
    color: '#95a5a6',
    marginTop: 3,
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
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#95a5a6',
  },
  taskOverdue: {
    color: '#e74c3c',
  },
  textOverdue: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  taskTagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  taskTagText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },

  // 搜索相关样式
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(240, 242, 245, 0.98)',
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 30,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 15,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#95a5a6',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#2c3e50',
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#95a5a6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  pullIndicator: {
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  pullBar: {
    width: 40,
    height: 4,
    backgroundColor: '#bdc3c7',
    borderRadius: 2,
    marginBottom: 5,
  },
  pullHint: {
    fontSize: 12,
    color: '#95a5a6',
  },
  searchContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  historySection: {
    marginTop: 15,
  },
  historySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  clearHistoryText: {
    color: '#e74c3c',
    fontSize: 14,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  historyIcon: {
    fontSize: 14,
    marginRight: 12,
    color: '#95a5a6',
  },
  historyText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  statsSection: {
    marginTop: 25,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  searchResultHeader: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 20,
    marginBottom: 15,
    fontWeight: '500',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  taskResultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  taskResultCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskResultCheckboxCompleted: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  taskResultContent: {
    flex: 1,
  },
  taskResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskResultName: {
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '600',
    flex: 1,
  },
  taskResultDescription: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 4,
    lineHeight: 18,
  },
  taskResultDueDate: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 6,
  },
  taskResultRight: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  taskResultArrow: {
    fontSize: 18,
    color: '#95a5a6',
  },
  noResultContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  noResultIcon: {
    fontSize: 48,
    marginBottom: 15,
    opacity: 0.5,
  },
  noResultText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  noResultHint: {
    fontSize: 14,
    color: '#bdc3c7',
  },

  // 底部导航样式
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  bottomNavButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  activeBottomNavButton: {
    backgroundColor: '#e3f2fd',
  },
  bottomNavIcon: {
    fontSize: 20,
    marginBottom: 4,
    color: '#7f8c8d',
  },
  activeBottomNavIcon: {
    color: '#3498db',
  },
  bottomNavText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeBottomNavText: {
    color: '#3498db',
    fontWeight: 'bold',
  },


    tagFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    // 确保有默认的边框样式
    borderWidth: 2,
    borderColor: 'transparent',
  },

  // 选中状态样式 - 保持原有效果，不添加灰色边框
  selectedTagFilter: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    // 关键修复：不设置边框颜色，保持透明或移除边框相关属性
    borderColor: 'transparent', // 或者完全不设置 borderColor
  },

  // 未选中状态样式
  unselectedTagFilter: {
    opacity: 0.5,
    // 修复：只设置透明度，不设置边框颜色
    // 移除了 borderWidth 和 borderColor 的设置
  },

  // 其他样式保持不变
  tagFilterText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
  },

  unselectedTagText: {
    opacity: 0.7,
  },

  tagCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 16,
    alignItems: 'center',
  },

  unselectedTagCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  tagCountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  unselectedTagCountText: {
    opacity: 0.7,
  },

  selectedIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#fff',
    color: '#27ae60',
    fontSize: 10,
    fontWeight: 'bold',
    width: 16,
    height: 16,
    borderRadius: 8,
    textAlign: 'center',
    lineHeight: 16,
    // 确保对勾标识也不会带来边框问题
    borderWidth: 0,
  },

  // 容器样式
  tagFilterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },

  tagScrollContainer: {
    paddingHorizontal: 15,
  },
});