import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_AI_API_BASE_URL || 'https://agro-ai-service-647646574109.asia-south1.run.app';
const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function FloatingAIAssistant() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('AI is thinking...');
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const loadingIntervalRef = useRef<number | null>(null);

  // Engaging loading messages
  const loadingMessages = [
    '🤖 AI is doing its magic...',
    '🌱 Analyzing agricultural data...',
    '🔍 Searching through farming wisdom...',
    '💡 Crafting the perfect response...',
    '🌾 Consulting crop experts...',
    '📊 Processing weather patterns...',
    '🚀 Almost ready with insights...'
  ];

  // Add message to chat
  const addMessage = (type: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Auto scroll to bottom with improved timing
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  // Enhanced scroll to bottom function
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Auto-scroll when loading state changes
  useEffect(() => {
    if (isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  // Scroll to bottom when modal opens
  useEffect(() => {
    if (isVisible && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    }
  }, [isVisible]);

  // Start cycling loading messages
  const startLoadingMessages = () => {
    let messageIndex = 0;
    setLoadingMessage(loadingMessages[0]);
    
    loadingIntervalRef.current = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 2000); // Change message every 2 seconds
  };

  // Stop cycling loading messages
  const stopLoadingMessages = () => {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
    setLoadingMessage('AI is thinking...');
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, []);

  // Open modal with animation
  const openModal = () => {
    setIsVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Close modal with animation
  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
    });
  };

  // Send text query to API
  const sendTextQuery = async () => {
    if (!inputText.trim()) {
      console.log('🤖 AI Assistant: Empty input text, skipping query');
      return;
    }

    const userMessage = inputText.trim();
    console.log('🤖 AI Assistant: Starting text query process');
    console.log('🤖 AI Assistant: User message:', userMessage);
    console.log('🤖 AI Assistant: API Base URL:', API_BASE_URL);
    
    setInputText('');
    addMessage('user', userMessage);
    setIsLoading(true);
    startLoadingMessages();

    try {
      console.log('🤖 AI Assistant: Preparing axios request for text query');
      console.log('🤖 AI Assistant: Request URL:', `${API_BASE_URL}/orchestrator/text`);
      console.log('🤖 AI Assistant: Request payload:', { text: userMessage });
      
      const response = await axios.post(`${API_BASE_URL}/orchestrator/text`, {
          text: userMessage,
          userId: user?.id || 'anonymous-user',
          returnAudio: true,
          language: 'ml', // Always use Malayalam for TTS
        }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });

      console.log('🤖 AI Assistant: Text API response status:', response.status);
      console.log('🤖 AI Assistant: Text API response headers:', response.headers);
      console.log('🤖 AI Assistant: Text API response data:', response.data);
      
      const responseText = response.data?.text || response.data?.message || 'Sorry, I could not process your request.';
      console.log('🤖 AI Assistant: Extracted response text:', responseText);
      
      addMessage('assistant', responseText);
      
      // Handle audio response if available
      if (response.data?.audio) {
        console.log('🤖 AI Assistant: Audio data received in text response');
        try {
          const audioData = response.data.audio;
          
          if (audioData && audioData.length > 0) {
            console.log('🤖 AI Assistant: Creating audio object from base64 data');
            
            // Create audio object directly from base64 data
            const { sound } = await Audio.Sound.createAsync(
              { uri: `data:audio/mp3;base64,${audioData}` },
              { 
                shouldPlay: true,
                isLooping: false,
                volume: 1.0,
                progressUpdateIntervalMillis: 100,
              },
              (status) => {
                console.log('🤖 AI Assistant: Playback status:', status);
              }
            );
            
            // Handle playback completion
            sound.setOnPlaybackStatusUpdate(async (status) => {
              if (status.isLoaded) {
                if (status.didJustFinish) {
                  console.log('🤖 AI Assistant: Audio playback completed');
                  await sound.unloadAsync();
                }
              } else if (status.error) {
                console.error('🤖 AI Assistant: Playback error:', status.error);
              }
            });
            
            addMessage('assistant', '🔊 Audio response playing...');
          } else {
            console.log('🤖 AI Assistant: Empty audio data received');
          }
        } catch (audioError: any) {
          console.error('🤖 AI Assistant: Error handling audio:', audioError);
          console.error('🤖 AI Assistant: Error details:', {
            name: audioError.name,
            message: audioError.message,
            code: audioError.code,
          });
          addMessage('assistant', 'Audio response received but could not be played.');
        }
      }
      
      console.log('🤖 AI Assistant: Text query completed successfully');
    } catch (error) {
      console.error('🤖 AI Assistant: Text query error occurred:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('🤖 AI Assistant: Axios error details:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        
        if (error.response?.status === 404) {
           addMessage('assistant', 'The AI service endpoint was not found. Please check the server configuration.');
         } else if (error.response?.status === 403) {
           addMessage('assistant', 'Access denied. Please ensure the AI service is running and properly configured.');
         } else if (error.response?.status && error.response.status >= 500) {
           addMessage('assistant', 'The AI service is currently unavailable. Please try again later.');
         } else if (error.code === 'ECONNABORTED') {
          addMessage('assistant', 'Request timed out. Please check your internet connection and try again.');
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          addMessage('assistant', 'Cannot connect to AI service. Please check your internet connection and try again.');
        } else {
          addMessage('assistant', `Error: ${error.response?.data?.message || error.message || 'Unknown error occurred'}`);
        }
      } else {
        console.error('🤖 AI Assistant: Non-axios error:', error);
        addMessage('assistant', 'Sorry, there was an unexpected error. Please try again.');
      }
    } finally {
      setIsLoading(false);
      stopLoadingMessages();
      console.log('🤖 AI Assistant: Text query process finished');
    }
  };

  // Start audio recording
  const startRecording = async () => {
    try {
      console.log('🎤 AI Assistant: Starting audio recording process');
      console.log('🎤 AI Assistant: Requesting audio permissions...');
      const permission = await Audio.requestPermissionsAsync();
      
      console.log('🎤 AI Assistant: Permission status:', permission.status);
      if (permission.status !== 'granted') {
        console.log('🎤 AI Assistant: Audio permission denied');
        Alert.alert('Permission required', 'Please grant microphone permission to use voice queries.');
        return;
      }

      console.log('🎤 AI Assistant: Setting audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('🎤 AI Assistant: Creating audio recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      console.log('🎤 AI Assistant: Recording started successfully');
    } catch (error) {
      console.error('🎤 AI Assistant: Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  // Stop recording and send audio
  const stopRecording = async () => {
    if (!recording) {
      console.log('🎤 AI Assistant: No recording to stop');
      return;
    }

    try {
      console.log('🎤 AI Assistant: Stopping recording...');
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      console.log('🎤 AI Assistant: Recording saved to:', uri);
      
      if (uri) {
        console.log('🎤 AI Assistant: Sending audio query with URI:', uri);
        await sendAudioQuery(uri);
      } else {
        console.error('🎤 AI Assistant: No URI received from recording');
        Alert.alert('Error', 'Failed to get recording file. Please try again.');
      }
      
      setRecording(null);
      console.log('🎤 AI Assistant: Recording cleanup completed');
    } catch (error) {
      console.error('🎤 AI Assistant: Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };

  // Send audio query to API
  const sendAudioQuery = async (audioUri: string) => {
    console.log('🎤 AI Assistant: Starting audio query process');
    console.log('🎤 AI Assistant: Audio URI:', audioUri);
    console.log('🎤 AI Assistant: API Base URL:', API_BASE_URL);
    
    setIsLoading(true);
    startLoadingMessages();
    addMessage('user', '🎤 Voice message');

    try {
      console.log('🎤 AI Assistant: Preparing FormData for audio upload');
      
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'audio.m4a',
      } as any);
      formData.append('userId', user?.id || 'anonymous-user');
      formData.append('language', 'ml'); // Always use Malayalam for TTS

      console.log('🎤 AI Assistant: FormData prepared, sending to API...');
      console.log('🎤 AI Assistant: Request URL:', `${API_BASE_URL}/orchestrator/process`);
      
      const response = await axios.post(`${API_BASE_URL}/orchestrator/process?returnAudio=true`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'arraybuffer', // Handle binary audio data
        timeout: 60000, // 60 second timeout for audio processing
      });

      console.log('🎤 AI Assistant: Audio API response status:', response.status);
      console.log('🎤 AI Assistant: Audio API response headers:', response.headers);
      console.log('🎤 AI Assistant: Received binary audio data, size:', response.data.byteLength);
      
      // Convert ArrayBuffer to base64
      console.log('🎤 AI Assistant: Converting audio data to base64');
      
      const uint8Array = new Uint8Array(response.data);
      let base64String = '';
      for (let i = 0; i < uint8Array.length; i++) {
        base64String += String.fromCharCode(uint8Array[i]);
      }
      const audioData = btoa(base64String);
      
      console.log('🎤 AI Assistant: Creating audio object from base64 data');
      
      // Create audio object directly from base64 data
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${audioData}` },
        { 
          shouldPlay: true,
          isLooping: false,
          volume: 1.0,
          progressUpdateIntervalMillis: 100,
        },
        (status) => {
          console.log('🎤 AI Assistant: Playback status:', status);
        }
      );
      
      // Handle playback completion
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            console.log('🎤 AI Assistant: Audio playback completed');
            await sound.unloadAsync();
          }
        } else if (status.error) {
          console.error('🎤 AI Assistant: Playback error:', status.error);
        }
      });
      
      addMessage('assistant', '🔊 Audio response playing...');
      console.log('🎤 AI Assistant: Audio query completed successfully');
    } catch (error) {
      console.error('🎤 AI Assistant: Audio query error occurred:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('🎤 AI Assistant: Axios error details:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        
        if (error.response?.status === 404) {
          addMessage('assistant', 'The audio processing endpoint was not found. Please check the server configuration.');
        } else if (error.response?.status === 403) {
          addMessage('assistant', 'Access denied for audio processing. Please ensure the AI service is running and properly configured.');
        } else if (error.response?.status && error.response.status >= 500) {
          addMessage('assistant', 'The audio processing service is currently unavailable. Please try again later.');
        } else if (error.code === 'ECONNABORTED') {
          addMessage('assistant', 'Audio processing timed out. Please try with a shorter recording.');
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          addMessage('assistant', 'Cannot connect to audio processing service. Please check your internet connection and try again.');
        } else {
          addMessage('assistant', `Audio Error: ${error.response?.data?.message || error.message || 'Unknown error occurred'}`);
        }
      } else {
        console.error('🎤 AI Assistant: Non-axios error:', error);
        addMessage('assistant', 'Sorry, there was an unexpected error processing your audio. Please try again.');
      }
    } finally {
      setIsLoading(false);
      stopLoadingMessages();
      console.log('🎤 AI Assistant: Audio query process finished');
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={openModal}
        style={styles.floatingButton}
      >
        <Ionicons name="chatbubble-ellipses" size={28} color="white" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <Animated.View 
          className="flex-1"
          style={{ opacity: fadeAnim }}
        >
          <BlurView intensity={20} className="flex-1">
            <TouchableOpacity 
              className="flex-1" 
              activeOpacity={1} 
              onPress={closeModal}
            >
              <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 justify-end"
              >
                <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                  <Animated.View
                    style={[
                      styles.modalContainer,
                      {
                        height: height * 0.8,
                        transform: [{ translateY: slideAnim }],
                      },
                    ]}
                  >
                    {/* Header */}
                    <View style={styles.header}>
                      <View style={styles.headerLeft}>
                        <View style={styles.headerIcon}>
                          <Ionicons name="chatbubble-ellipses" size={20} color="white" />
                        </View>
                        <View>
                          <Text style={styles.headerTitle}>AI Assistant</Text>
                          <Text style={styles.headerSubtitle}>Ask anything about farming</Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#6b7280" />
                      </TouchableOpacity>
                    </View>

                    {/* Messages */}
                    <ScrollView 
                      ref={scrollViewRef}
                      style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 8 }}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
                      keyboardShouldPersistTaps="handled"
                      scrollEventThrottle={16}
                      bounces={true}
                      alwaysBounceVertical={false}
                    >
                      {messages.length === 0 && (
                        <View style={styles.emptyState}>
                          <View style={styles.emptyStateIcon}>
                            <Ionicons name="chatbubbles-outline" size={48} color="#16a34a" />
                          </View>
                          <Text style={styles.emptyStateTitle}>
                            Welcome to AI Farm Assistant! 🌾
                          </Text>
                          <Text style={styles.emptyStateSubtitle}>
                            Ask me anything about farming, crops, weather, market prices, or get personalized agricultural advice in your language.
                          </Text>
                          <View style={styles.emptyStateFeatures}>
                            <View style={styles.featureItem}>
                              <Ionicons name="mic" size={20} color="#16a34a" />
                              <Text style={styles.featureText}>Voice queries in Malayalam</Text>
                            </View>
                            <View style={styles.featureItem}>
                              <Ionicons name="trending-up" size={20} color="#16a34a" />
                              <Text style={styles.featureText}>Real-time market data</Text>
                            </View>
                            <View style={styles.featureItem}>
                              <Ionicons name="leaf" size={20} color="#16a34a" />
                              <Text style={styles.featureText}>Crop recommendations</Text>
                            </View>
                          </View>
                        </View>
                      )}
                      
                      {messages.map((message) => (
                        <View
                          key={message.id}
                          style={[
                            styles.messageContainer,
                            message.type === 'user' ? styles.userMessageContainer : styles.assistantMessageContainer
                          ]}
                        >
                          <View
                            style={[
                              styles.messageBubble,
                              message.type === 'user' ? styles.userMessageBubble : styles.assistantMessageBubble
                            ]}
                          >
                            <Text
                              style={[
                                styles.messageText,
                                message.type === 'user' ? styles.userMessageText : styles.assistantMessageText
                              ]}
                            >
                              {message.content}
                            </Text>
                          </View>
                          <Text style={styles.messageTimestamp}>
                            {message.timestamp.toLocaleTimeString()}
                          </Text>
                        </View>
                      ))}
                      
                      {isLoading && (
                        <View style={styles.assistantMessageContainer}>
                          <View style={[styles.messageBubble, styles.assistantMessageBubble, styles.loadingBubble]}>
                            <ActivityIndicator size="small" color="#16a34a" style={styles.loadingSpinner} />
                            <Text style={[styles.messageText, styles.assistantMessageText]}>{loadingMessage}</Text>
                          </View>
                        </View>
                      )}
                    </ScrollView>

                    {/* Input Area */}
                    <View style={styles.inputContainer}>
                      <View style={styles.inputRow}>
                        {/* Text Input Container */}
                        <View style={styles.textInputContainer}>
                          <TextInput
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Ask about crops, weather, farming tips..."
                            placeholderTextColor="#9ca3af"
                            style={styles.textInput}
                            multiline
                            maxLength={500}
                            editable={!isLoading}
                          />
                          
                          {/* Send Button - Inside text input */}
                          {inputText.trim() && (
                            <TouchableOpacity
                              onPress={sendTextQuery}
                              disabled={isLoading}
                              style={[
                                styles.sendButton,
                                isLoading && styles.disabledButton
                              ]}
                            >
                              <Ionicons 
                                name="send" 
                                size={18} 
                                color="white" 
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                        
                        {/* Voice Button */}
                        <TouchableOpacity
                          onPress={isRecording ? stopRecording : startRecording}
                          disabled={isLoading}
                          style={[
                            styles.voiceButton,
                            isRecording ? styles.recordingButton : styles.micButton,
                            isLoading && styles.disabledButton
                          ]}
                        >
                          <Ionicons 
                            name={isRecording ? 'stop' : 'mic'} 
                            size={22} 
                            color="white" 
                          />
                        </TouchableOpacity>
                      </View>
                      
                      {/* Recording Indicator */}
                      {isRecording && (
                        <View style={styles.recordingIndicator}>
                          <View style={styles.recordingDot} />
                          <Text style={styles.recordingText}>Recording... Tap stop when done</Text>
                        </View>
                      )}
                      
                      {/* Quick Actions */}
                      <View style={styles.quickActions}>
                        <TouchableOpacity 
                          style={styles.quickActionButton}
                          onPress={() => setInputText('What crops should I plant this season?')}
                        >
                          <Text style={styles.quickActionText}>🌱 Crop advice</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.quickActionButton}
                          onPress={() => setInputText('What is the weather forecast?')}
                        >
                          <Text style={styles.quickActionText}>🌤️ Weather</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.quickActionButton}
                          onPress={() => setInputText('Market prices for my crops?')}
                        >
                          <Text style={styles.quickActionText}>💰 Prices</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    backgroundColor: '#16a34a',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
     elevation: 8,
   },
   modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.25)',
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#16a34a',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  closeButton: {
    padding: 8,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#16a34a',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  micButton: {
    backgroundColor: '#3b82f6',
  },
  recordingButton: {
    backgroundColor: '#dc2626',
  },
  disabledButton: {
    opacity: 0.5,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  recordingDot: {
    width: 8,
    height: 8,
    backgroundColor: '#dc2626',
    borderRadius: 4,
    marginRight: 8,
  },
  recordingText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  userMessageBubble: {
    backgroundColor: '#16a34a',
    borderBottomRightRadius: 6,
  },
  assistantMessageBubble: {
    backgroundColor: '#f3f4f6',
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  assistantMessageText: {
    color: '#1f2937',
  },
  messageTimestamp: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    paddingHorizontal: 8,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingSpinner: {
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#f0fdf4',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyStateFeatures: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500',
  },
});