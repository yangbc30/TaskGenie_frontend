import { useState, useRef } from 'react';
import { Animated, PanResponder, Dimensions } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

export const usePullDownSearch = () => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const searchTranslateY = useRef(new Animated.Value(-screenHeight)).current;
  const searchOpacity = useRef(new Animated.Value(0)).current;
  const pullDownThreshold = 100;

  // 下拉搜索手势
  const pullDownPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0 && gestureState.dy > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        setPullDistance(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const { dy } = gestureState;
        if (dy > 0) {
          setPullDistance(dy);
          
          if (dy > pullDownThreshold && !searchVisible) {
            setSearchVisible(true);
            Animated.parallel([
              Animated.timing(searchTranslateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(searchOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start();
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setPullDistance(0);
        if (gestureState.dy < pullDownThreshold) {
          setSearchVisible(false);
          Animated.parallel([
            Animated.timing(searchTranslateY, {
              toValue: -screenHeight,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(searchOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  // 上拉关闭搜索手势
  const pullUpPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy < -10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < -50) {
          closeSearch();
        }
      },
    })
  ).current;

  // 关闭搜索
  const closeSearch = () => {
    Animated.parallel([
      Animated.timing(searchTranslateY, {
        toValue: -screenHeight,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(searchOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSearchVisible(false);
    });
  };

  return {
    searchVisible,
    pullDistance,
    searchTranslateY,
    searchOpacity,
    pullDownPanResponder,
    pullUpPanResponder,
    closeSearch,
  };
};