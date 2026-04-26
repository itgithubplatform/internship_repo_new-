import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Bell, Info, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react-native';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    // Mock data for now
    setTimeout(() => {
      setNotifications([
        {
          id: '1',
          type: 'ASSIGNMENT',
          subject: 'New Form Assigned',
          body: 'You have been assigned a new Safety Audit form for Site Alpha.',
          time: '2 hours ago',
          status: 'UNREAD'
        },
        {
          id: '2',
          type: 'APPROVAL',
          subject: 'KYC Approved',
          body: 'Your identity verification has been approved. You now have full access.',
          time: '5 hours ago',
          status: 'READ'
        },
        {
          id: '3',
          type: 'ALERT',
          subject: 'Urgent: Submission Rejected',
          body: 'Your submission for Form #1234 was rejected. Please review the comments.',
          time: '1 day ago',
          status: 'READ'
        }
      ]);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT': return <Info size={20} color="#3B82F6" />;
      case 'APPROVAL': return <CheckCircle size={20} color="#10B981" />;
      case 'ALERT': return <AlertTriangle size={20} color="#EF4444" />;
      default: return <Bell size={20} color="#94A3B8" />;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.notificationItem, item.status === 'UNREAD' && styles.unreadItem]}>
      <View style={styles.iconContainer}>
        {getIcon(item.type)}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.subject}>{item.subject}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
      </View>
      <ChevronRight size={16} color="#475569" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#7C3AED" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell size={48} color="#1E293B" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090E1A',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#090E1A',
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  unreadItem: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subject: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  time: {
    fontSize: 11,
    color: '#64748B',
  },
  body: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 16,
  },
});

export default NotificationsScreen;
