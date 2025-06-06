import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { TASK_TAGS, TAG_COLORS } from '../context/TaskContext';
import { styles } from '../styles/ComponentStyles';

const TagFilter = ({ tasks, selectedTag, onTagSelect }) => {
  return (
    <View style={styles.tagFilterContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagScrollContainer}
      >
        {Object.keys(TASK_TAGS).map((tag) => {
          const tagCount = tasks.filter(task => task.task_tag === tag).length;
          return (
            <TouchableOpacity
              key={`${tag}-${tagCount}`}
              style={[
                styles.tagFilterItem,
                { backgroundColor: TAG_COLORS[tag] },
                selectedTag === tag && styles.selectedTagFilter
              ]}
              onPress={() => onTagSelect(tag)}
            >
              <Text style={styles.tagFilterText}>{tag}</Text>
              <View style={styles.tagCountBadge}>
                <Text style={styles.tagCountText}>
                  {tagCount}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default TagFilter;