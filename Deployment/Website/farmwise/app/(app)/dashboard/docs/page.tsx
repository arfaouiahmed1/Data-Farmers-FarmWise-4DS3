'use client';

import { useState, useEffect } from 'react';
import { 
  Title, 
  Paper, 
  Text, 
  Stack, 
  Tabs, 
  Anchor, 
  TypographyStylesProvider,
  Box,
  TextInput,
  Group,
  Loader,
  Card,
  Badge
} from '@mantine/core';
import { IconSearch, IconBook, IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { documentationContent } from './documentation-data';

interface SearchResult {
  title: string;
  content: string;
  section: string;
  relevance: number;
}

export default function DocumentationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';
  const initialSection = searchParams.get('section') || 'getting-started';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState(initialSection);

  // Perform search when query changes
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Search logic
  const performSearch = (query: string) => {
    setIsSearching(true);
    
    // Simulate API delay for realism
    setTimeout(() => {
      const results = Object.entries(documentationContent).flatMap(([section, content]) => {
        return content.map(doc => {
          // Search in title and content
          const titleMatch = doc.title.toLowerCase().includes(query.toLowerCase());
          const contentMatch = doc.content.toLowerCase().includes(query.toLowerCase());
          
          if (titleMatch || contentMatch) {
            return {
              ...doc,
              section,
              relevance: titleMatch ? 2 : 1 // Title matches are more relevant
            };
          }
          return null;
        }).filter(Boolean) as SearchResult[]; // Type assertion after filtering nulls
      });
      
      // Sort by relevance with proper type handling
      results.sort((a, b) => {
        if (a && b) {
          return b.relevance - a.relevance;
        }
        return 0;
      });
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  return (
    <Stack gap="lg">
      <Paper p="md" radius="md" withBorder>
        <Group>
          <Link href="/dashboard/help-support" passHref>
            <Anchor component="span" className="anchor-link" style={{ textDecoration: 'none', cursor: 'pointer' }}> 
              <Group gap={8} align="center">
                <IconArrowLeft size={16} />
                <Text component="span" size="sm">Back to Help & Support</Text> 
              </Group>
            </Anchor>
          </Link>
        </Group>
      </Paper>

      <Title order={2}>FarmWise Documentation</Title>
      
      {/* Search Bar */}
      <Paper withBorder shadow="sm" p="md" radius="md">
        <TextInput
          placeholder="Search documentation..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          rightSection={isSearching ? <Loader size="xs" /> : null}
          size="md"
        />
      </Paper>

      {/* Search Results */}
      {searchQuery.trim().length > 2 && (
        <Paper withBorder shadow="sm" p="md" radius="md">
          <Title order={4} mb="md">Search Results</Title>
          {isSearching ? (
            <Stack align="center" my="xl">
              <Loader />
              <Text>Searching documentation...</Text>
            </Stack>
          ) : searchResults.length === 0 ? (
            <Text c="dimmed">No results found for "{searchQuery}"</Text>
          ) : (
            <Stack>
              {searchResults.map((result, index) => (
                <Card key={index} p="md" withBorder radius="md">
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>{result.title}</Text>
                    <Badge>{result.section.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Badge>
                  </Group>
                  <Text lineClamp={2} size="sm" mb="md" c="dimmed">
                    {result.content.substring(0, 150).replace(/<[^>]*>/g, '')}...
                  </Text>
                  <Anchor onClick={() => {
                    setActiveTab(result.section);
                    setSearchQuery('');
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}>
                    View Full Article
                  </Anchor>
                </Card>
              ))}
            </Stack>
          )}
        </Paper>
      )}

      {/* Documentation Content */}
      {(searchQuery.trim().length <= 2 || !isSearching) && (
        <Paper withBorder shadow="sm" p="lg" radius="md">
          <Tabs value={activeTab} onChange={(value: string | null) => setActiveTab(value || 'getting-started')}>
            <Tabs.List mb="xl">
              <Tabs.Tab value="getting-started" leftSection={<IconBook size={16} />}>
                Getting Started
              </Tabs.Tab>
              <Tabs.Tab value="field-mapping" leftSection={<IconBook size={16} />}>
                Field Mapping
              </Tabs.Tab>
              <Tabs.Tab value="crop-health" leftSection={<IconBook size={16} />}>
                Crop Health
              </Tabs.Tab>
              <Tabs.Tab value="weather" leftSection={<IconBook size={16} />}>
                Weather
              </Tabs.Tab>
              <Tabs.Tab value="planning" leftSection={<IconBook size={16} />}>
                Planning
              </Tabs.Tab>
            </Tabs.List>

            {Object.entries(documentationContent).map(([section, docs]) => (
              <Tabs.Panel key={section} value={section}>
                <Stack>
                  {docs.map((doc, i) => (
                    <Box key={i} mb="xl">
                      <Title order={3} mb="md">{doc.title}</Title>
                      <TypographyStylesProvider>
                        <div dangerouslySetInnerHTML={{ __html: doc.content }} />
                      </TypographyStylesProvider>
                    </Box>
                  ))}
                </Stack>
              </Tabs.Panel>
            ))}
          </Tabs>
        </Paper>
      )}
    </Stack>
  );
} 