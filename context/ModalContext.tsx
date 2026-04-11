import React, { createContext, PropsWithChildren, useContext, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { styles } from './styles';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ModalConfig = {
  content: React.ReactNode;
};

type ModalContextType = {
  show: (config: ModalConfig) => void;
  hide: () => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext)

  if (!context) {
    throw new Error('useModal must be used within ModalContext');
  }

  return context;
}

export const ModalProvider = ({ children }: PropsWithChildren) => {
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(SCREEN_HEIGHT);

  const value = {
    show: (config: ModalConfig) => {
      setModal(config);
      setIsVisible(true);
      const animationDuration = 300;
      opacity.value = withTiming(0.5, { duration: animationDuration });
      translateY.value = withTiming(0, { duration: animationDuration });
    },
    hide: () => {
      const animationDuration = 250;
      opacity.value = withTiming(0, { duration: animationDuration });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: animationDuration });
      setTimeout(() => setIsVisible(false), animationDuration);
    },
  };

  const backdropStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(0, 0, 0, ${opacity.value})`
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Modal visible={isVisible} transparent animationType={'none'}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <AnimatedPressable
            style={[styles.backdrop, backdropStyle]}
            onPress={() => value.hide()}>
            <Pressable onPress={() => {}}>
              <Animated.ScrollView 
                keyboardDismissMode="on-drag"
                style={[styles.scrollView, contentStyle]}
                contentContainerStyle={styles.scrollViewContent}
              >
                {modal?.content}
              </Animated.ScrollView>
            </Pressable>
          </AnimatedPressable>
        </KeyboardAvoidingView>
      </Modal>
    </ModalContext.Provider>
  );
};
