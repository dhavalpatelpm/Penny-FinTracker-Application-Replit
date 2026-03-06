import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  Animated,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { fetch } from 'expo/fetch';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme, useApp } from '@/context/AppContext';
import { getApiUrl } from '@/lib/query-client';
import GradientBackground from '@/components/GradientBackground';

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

const SUGGESTION_SETS: Record<string, string[]> = {
  spending: [
    'How can I cut back on spending?',
    'Which category costs the most?',
    'Show my daily spending average',
    'Compare to last month',
  ],
  income: [
    'What percentage should I save?',
    'Am I spending within my means?',
    'How can I grow my income?',
    'What is a good savings rate?',
  ],
  budget: [
    'Which categories went over budget?',
    'How can I stick to my budget?',
    'Set a budget for a category',
    'What should I cut first?',
  ],
  savings: [
    'How much more can I save?',
    'What is the 50/30/20 rule?',
    'Best ways to build an emergency fund',
    'How to automate savings?',
  ],
  general: [
    'What are my top expenses?',
    'How healthy is my budget?',
    'Where can I save more?',
    'Compare income vs expenses',
  ],
};

function getSuggestions(aiResponse: string): string[] {
  const lower = aiResponse.toLowerCase();
  if (lower.includes('budget')) return SUGGESTION_SETS.budget;
  if (lower.includes('sav')) return SUGGESTION_SETS.savings;
  if (lower.includes('spend') || lower.includes('expens')) return SUGGESTION_SETS.spending;
  if (lower.includes('income') || lower.includes('salary') || lower.includes('earn')) return SUGGESTION_SETS.income;
  return SUGGESTION_SETS.general;
}

function MarkdownText({ text, style }: { text: string; style: object }) {
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text style={style}>
      {segments.map((seg, i) => {
        if (seg.startsWith('**') && seg.endsWith('**')) {
          return (
            <Text key={i} style={[style, { fontFamily: 'Inter_700Bold' }]}>
              {seg.slice(2, -2)}
            </Text>
          );
        }
        return <Text key={i}>{seg}</Text>;
      })}
    </Text>
  );
}

function TypingDots({ color }: { color: string }) {
  const dots = [
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
  ];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 320, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, []);

  return (
    <View style={styles.typingDots}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[styles.dot, { backgroundColor: color, opacity: dot }]}
        />
      ))}
    </View>
  );
}

export default function AIScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { transactions, profile } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const now = new Date();
  const period = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const trimmedText = text.trim();
    setSuggestions([]);

    const currentTxs = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedText,
    };
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '' };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsLoading(true);

    let finalContent = '';

    try {
      const baseUrl = getApiUrl();
      const url = new URL('/api/ai/insights', baseUrl);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: currentTxs,
          period,
          question: trimmedText,
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
                finalContent += data.content;
                setMessages(prev =>
                  prev.map(m => m.id === assistantId ? { ...m, content: m.content + data.content } : m)
                );
              }
            } catch {}
          }
        }
      }

      setSuggestions(getSuggestions(finalContent));
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === assistantId
          ? { ...m, content: 'Sorry, I had trouble analyzing your data. Please try again.' }
          : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, transactions, period, profile]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;
  const tabBarHeight = 64 + bottomPad;

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    const isEmpty = item.content === '' && !isUser;
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
            : [styles.aiBubble, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }],
        ]}>
          {isEmpty ? (
            <TypingDots color={theme.textTertiary} />
          ) : isUser ? (
            <Text style={[styles.bubbleText, { color: '#fff' }]}>
              {item.content}
            </Text>
          ) : (
            <MarkdownText
              text={item.content}
              style={[styles.bubbleText, { color: theme.textPrimary }]}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <GradientBackground style={styles.container}>
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <LinearGradient colors={['#FF8C69', '#FF6B6B']} style={styles.headerIcon}>
          <Ionicons name="sparkles" size={20} color="#fff" />
        </LinearGradient>
        <View>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Penny AI</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Your finance assistant</Text>
        </View>
      </View>

      {messages.length === 0 ? (
        <ScrollView
          contentContainerStyle={[styles.emptyScroll, { paddingBottom: tabBarHeight + 16 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
                    { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
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
          data={[...messages].reverse()}
          inverted
          keyExtractor={m => m.id}
          renderItem={renderMessage}
          contentContainerStyle={[styles.messagesList, { paddingBottom: tabBarHeight + 8 }]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        />
      )}

      {suggestions.length > 0 && !isLoading && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.suggestionsRow}
          style={[styles.suggestionsScroll, { borderTopColor: theme.separator }]}
        >
          {suggestions.map(s => (
            <Pressable
              key={s}
              onPress={() => sendMessage(s)}
              style={({ pressed }) => [
                styles.suggestionChip,
                {
                  backgroundColor: theme.isDark ? 'rgba(255,107,107,0.12)' : theme.surface,
                  borderColor: theme.isDark ? 'rgba(255,107,107,0.3)' : theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Ionicons name="arrow-forward-circle-outline" size={14} color={theme.primary} />
              <Text style={[styles.suggestionText, { color: theme.textPrimary }]} numberOfLines={1}>
                {s}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={[styles.inputBar, { paddingBottom: tabBarHeight + 8, borderTopColor: theme.separator }]}>
        <View style={[styles.inputRow, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.textPrimary }]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your finances..."
            placeholderTextColor={theme.textTertiary}
            multiline
            maxLength={300}
            returnKeyType="send"
            onSubmitEditing={() => { if (!isLoading) sendMessage(input); }}
            testID="ai-input"
          />
          <Pressable
            onPress={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            style={({ pressed }) => [
              styles.sendBtn,
              { opacity: pressed || isLoading || !input.trim() ? 0.4 : 1 },
            ]}
            testID="ai-send-btn"
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
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
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
  emptyScroll: {
    flexGrow: 1,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 32,
    gap: 12,
    minHeight: 300,
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
    paddingTop: 16,
    gap: 12,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 4,
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
    gap: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  suggestionsScroll: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    paddingBottom: 12,
    flexGrow: 0,
  },
  suggestionsRow: {
    paddingHorizontal: 16,
    paddingVertical: 2,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    marginVertical: 2,
  },
  suggestionText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    maxWidth: 180,
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
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
