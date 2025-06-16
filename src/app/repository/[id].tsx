import React from 'react';
import { StyleSheet, View, ScrollView, Linking, Alert } from 'react-native';
import { Text, Card, Avatar, Button, Chip } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { formatLastUpdated } from '@/utils/dateUtils';
import { GithubRepository } from '@/services/github';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export default function RepositoryDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const repository: GithubRepository | null = React.useMemo(() => {
    try {
      if (typeof params.data === 'string') {
        return JSON.parse(params.data) as GithubRepository;
      }
      return null;
    } catch (error) {
      console.error('Failed to parse repository data:', error);
      return null;
    }
  }, [params.data]);

  const handleOpenInBrowser = async () => {
    if (repository?.html_url) {
      try {
        const supported = await Linking.canOpenURL(repository.html_url);
        if (supported) {
          await Linking.openURL(repository.html_url);
        } else {
          Alert.alert('Error', 'Cannot open this URL');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open URL');
      }
    }
  };

  if (!repository) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Repository information not available</Text>
        <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Avatar.Image
              size={60}
              source={{ uri: repository.owner.avatar_url }}
              style={styles.avatar}
            />
            <View style={styles.headerInfo}>
              <Text style={styles.repositoryName}>{repository.name}</Text>
              <Text style={styles.ownerName}>by {repository.owner.login}</Text>
              <Text style={styles.lastUpdated}>{formatLastUpdated(repository.updated_at)}</Text>
              <Text style={styles.rawDate}>
                Last updated: {dayjs(repository.updated_at).utc().format('DD.MM.YYYY. HH:mm:ss')}{' '}
                UTC
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.detailsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {repository.description || 'No description available'}
          </Text>

          <View style={styles.statsRow}>
            <Chip icon="star" style={styles.statChip}>
              {repository.stargazers_count.toLocaleString()} stars
            </Chip>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        icon="open-in-new"
        onPress={handleOpenInBrowser}
        style={styles.fullWidthButton}
      >
        View on GitHub
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  repositoryName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 24,
  },
  ownerName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#888',
  },
  rawDate: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  detailsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statChip: {
    marginRight: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'center',
  },
  fullWidthButton: {
    marginBottom: 8,
    width: '100%',
  },
});
