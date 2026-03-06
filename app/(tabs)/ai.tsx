import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { fetch } from 'expo/fetch';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme, useApp } from '@/context/AppContext';
import GlassCard from '@/components/GlassCard';
import { getApiUrl } from '@/lib/query-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  { label: 'Top expenses', icon: 'trending-up' as const, prompt: 'What are my top spending categories this month?' },
  { label: 'Save money', icon: 'sparkles' as const, prompt: 'Where can I reduce spending to save more?' },
  { label: 'Income vs spending', icon: 'bar-chart' as const, prompt: 'How does my income compare to my expenses?' },
  { label: 'Healthy budget', icon: 'heart' as const, prompt: 'Am I spending within healthy limits based on my income?' },
];

export default function AIScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { transactions, profile } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const now = new Date();
  const period = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const recentTxs = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    };
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '' };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const baseUrl = getApiUrl();
      const url = new URL('/api/ai/insights', baseUrl);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: recentTxs,
          period,
          question: text.trim(),
          profile: { currency: profile.currency, name: profile.name },
        }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                setMessages(prev =>
                  prev.map(m => m.id === assistantId ? { ...m, content: m.content + data.content } : m)
                );
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setMessages(prev =>
        prev.map(m => m.id === assistantId ? { ...m, content: 'Sorry, I had trouble analyzing your data. Please try again.' } : m)
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, recentTxs, period, profile]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAI]}>
        {!isUser && (
          <LinearGradient colors={['#FF8C69', '#FF6B6B']} style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={14} color="#fff" />
          </LinearGradient>
        )}
        <View style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: theme.primary }]
            : [styles.aiBubble, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]
        ]}>
          {!isUser && item.content === '' && isLoading ? (
            <View style={styles.typingDots}>
              <View style={[styles.dot, { backgroundColor: theme.textTertiary }]} />
              <View style={[styles.dot, { backgroundColor: theme.textTertiary, marginLeft: 4 }]} />
              <View style={[styles.dot, { backgroundColor: theme.textTertiary, marginLeft: 4 }]} />
            </View>
          ) : (
            <Text style={[styles.bubbleText, { color: isUser ? '#fff' : theme.textPrimary }]}>
              {item.content}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <LinearGradient colors={['#FF8C69', '#FF6B6B']} style={styles.headerIcon}>
          <Ionicons name="sparkles" size={20} color="#fff" />
        </LinearGradient>
        <View>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Penny AI</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Your finance assistant</Text>
        </View>
      </View>

      {/* Messages */}
      {messages.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.emptyContent}>
            <LinearGradient colors={['#FF8C69', '#FF6B6B']} style={styles.emptyIcon}>
              <Ionicons name="sparkles" size={28} color="#fff" />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Ask me anything</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              I analyze your spending and give personalized financial insights
            </Text>

            <View style={styles.quickGrid}>
              {QUICK_PROMPTS.map(q => (
                <Pressable
                  key={q.label}
                  onPress={() => sendMessage(q.prompt)}
                  style={({ pressed }) => [
                    styles.quickBtn,
                    { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 }
                  ]}
                >
                  <Ionicons name={q.icon} size={20} color={theme.primary} />
                  <Text style={[styles.quickLabel, { color: theme.textPrimary }]}>{q.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Input Bar */}
      <View style={[styles.inputBar, { paddingBottom: bottomPad + 90, borderTopColor: theme.separator }]}>
        <View style={[styles.inputRow, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.textPrimary }]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your finances..."
            placeholderTextColor={theme.textTertiary}
            multiline
            maxLength={300}
            onSubmitEditing={() => sendMessage(input)}
          />
          <Pressable
            onPress={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            style={({ pressed }) => [
              styles.sendBtn,
              { opacity: pressed || isLoading || !input.trim() ? 0.5 : 1 },
            ]}
          >
            <LinearGradient colors={['#FF8C69', '#FF6B6B']} style={styles.sendGradient}>
              {isLoading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="arrow-up" size={18} color="#fff" />
              }
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  headerSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  emptyScroll: { flexGrow: 1 },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 100,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 8,
  },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAI: { justifyContent: 'flex-start' },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    maxHeight: 100,
    paddingTop: 6,
    paddingBottom: 6,
  },
  sendBtn: {
    alignSelf: 'flex-end',
  },
  sendGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
