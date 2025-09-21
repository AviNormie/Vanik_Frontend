import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { profileStorageService } from '../services/profileStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000';

export default function TestContextPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState('');

  const buildContext = async () => {
    try {
      // Get user profile from AsyncStorage
      const profileData = await profileStorageService.loadProfile();
      
      // Get last 3 messages from AsyncStorage
      const messagesJson = await AsyncStorage.getItem('chatMessages');
      const messages = messagesJson ? JSON.parse(messagesJson) : [];
      const lastThreeMessages = messages.slice(-6); // Last 3 exchanges (user + assistant)
      
      let contextString = '';
      
      // Add profile context
      if (profileData) {
        contextString += `User Profile:\n`;
        contextString += `Phone: ${profileData.phoneNumber || 'N/A'}\n`;
        contextString += `Role: ${profileData.role || 'N/A'}\n`;
        if (profileData.role === 'FARMER' && profileData.farmerProfile) {
          const farmer = profileData.farmerProfile;
          contextString += `Name: ${farmer.name || 'N/A'}\n`;
          contextString += `Village: ${farmer.village || 'N/A'}\n`;
          contextString += `District: ${farmer.district || 'N/A'}\n`;
          contextString += `State: ${farmer.state || 'N/A'}\n`;
          contextString += `Farm Size: ${farmer.farmSize || 'N/A'}\n`;
          contextString += `Crop Types: ${farmer.cropTypes || 'N/A'}\n`;
        } else if (profileData.role === 'RETAILER' && profileData.retailerProfile) {
          const retailer = profileData.retailerProfile;
          contextString += `Business Name: ${retailer.businessName || 'N/A'}\n`;
          contextString += `Owner Name: ${retailer.ownerName || 'N/A'}\n`;
          contextString += `Business Type: ${retailer.businessType || 'N/A'}\n`;
          contextString += `City: ${retailer.city || 'N/A'}\n`;
        }
        contextString += '\n';
      }
      
      // Add conversation context
      if (lastThreeMessages.length > 0) {
        contextString += `Recent Conversation (Last 3 exchanges):\n`;
        lastThreeMessages.forEach((msg: any, index: number) => {
          contextString += `${msg.role}: ${msg.content}\n`;
        });
      }
      
      return contextString;
    } catch (error) {
      console.error('Error building context:', error);
      return '';
    }
  };

  const testQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Build context
      const contextData = await buildContext();
      setContext(contextData);
      
      console.log('🧪 Test Context: Sending query with context');
      console.log('Context length:', contextData.length);
      
      const response = await axios.post(`${API_BASE_URL}/orchestrator/text`, {
        text: query,
        userId: user?.id || 'test-user',
        returnAudio: false,
        language: 'en',
        context: contextData
      });
      
      setResponse(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      console.error('Error sending query:', error);
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Test Context Functionality</Text>
      
      <Text style={styles.label}>Test Query:</Text>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Enter your test query here..."
        multiline
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={testQuery}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Sending...' : 'Send Query with Context'}
        </Text>
      </TouchableOpacity>
      
      {context && (
        <View style={styles.section}>
          <Text style={styles.label}>Context Sent:</Text>
          <Text style={styles.contextText}>{context}</Text>
        </View>
      )}
      
      {response && (
        <View style={styles.section}>
          <Text style={styles.label}>Response:</Text>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 20,
  },
  contextText: {
    backgroundColor: '#e8f4fd',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  responseText: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
    fontSize: 12,
  },
});