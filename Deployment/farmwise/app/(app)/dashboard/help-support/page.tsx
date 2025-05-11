'use client';

import { useState, useEffect } from 'react';
import { 
  Title, 
  Paper, 
  Group, 
  Text, 
  Button, 
  Stack, 
  Divider, 
  Accordion, 
  TextInput, 
  Textarea,
  Anchor,
  ThemeIcon,
  Box,
  Card,
  Loader,
  Badge,
  SimpleGrid
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { 
  IconQuestionMark, 
  IconMessageCircle, 
  IconLifebuoy, 
  IconSearch, 
  IconSend, 
  IconBook, 
  IconArrowRight, 
  IconFileText, 
  IconHeadset, 
  IconStar,
  IconVideo
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import classes from './HelpSupportPage.module.css';
import { documentationContent } from '../docs/documentation-data';

// Expanded FAQ data
const faqItems = [
  {
    value: 'getting-started',
    question: 'How do I add my first field?',
    answer: 'Navigate to the Field Mapping section from the main menu. Click the "Add Field" button and either draw the boundaries on the map or upload a shapefile. Enter the field details and save.',
  },
  {
    value: 'crop-health-alerts',
    question: 'What do the crop health alerts mean?',
    answer: 'Crop health alerts indicate potential issues detected through satellite imagery or sensor data, such as low NDVI (vegetation index), water stress, or potential disease outbreaks. Click on an alert for more details and recommended actions.',
  },
  {
    value: 'connecting-equipment',
    question: 'Can I connect my existing farm equipment?',
    answer: 'FarmWise supports integration with various IoT sensors and equipment providers. Visit the Equipment section and check the "Integrations" tab for compatible devices and setup instructions. Contact support if your provider is not listed.',
  },
  {
    value: 'billing-subscription',
    question: 'How is billing handled?',
    answer: 'FarmWise operates on a subscription basis, typically billed monthly or annually based on the acreage managed and features enabled. You can manage your subscription and view invoices in the Billing section under Settings (coming soon).',
  },
  {
    value: 'data-security',
    question: 'Is my farm data secure?',
    answer: 'Yes, FarmWise employs industry-standard encryption and security practices. Your data is stored securely in the cloud and is never shared with third parties without your explicit permission. You retain full ownership of all your farm data.',
  },
  {
    value: 'mobile-app',
    question: 'Is there a mobile app available?',
    answer: 'Yes, FarmWise offers mobile apps for both iOS and Android devices. You can download them from the respective app stores. The mobile app allows you to access most platform features in the field, including crop scouting, task management, and quick data entry.',
  },
  {
    value: 'satellite-frequency',
    question: 'How often is satellite imagery updated?',
    answer: 'Satellite imagery is typically updated every 3-5 days, depending on weather conditions and satellite availability for your region. Premium accounts receive priority processing for the latest imagery.',
  },
  {
    value: 'export-data',
    question: 'Can I export my data from FarmWise?',
    answer: 'Yes, you can export your farm data in various formats including CSV, PDF reports, and GIS-compatible files. Go to the Reports section and select the "Export" option to customize and download your data.',
  },
];

// Popular documentation topics
const popularTopics = [
  { title: 'Creating Field Boundaries', section: 'field-mapping', icon: IconMap },
  { title: 'Understanding Crop Health Indicators', section: 'crop-health', icon: IconPlant },
  { title: 'Weather Dashboard Overview', section: 'weather', icon: IconCloudRain },
  { title: 'Seasonal Planning Tools', section: 'planning', icon: IconCalendar },
];

export default function HelpSupportPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm({
    initialValues: {
      subject: '',
      message: '',
      email: '', // Pre-fill if user is logged in and email is available
    },
    validate: {
      subject: (value) => (value.trim().length < 5 ? 'Subject must be at least 5 characters' : null),
      message: (value) => (value.trim().length < 10 ? 'Message must be at least 10 characters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  // Handle search query changes
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Search through documentation
  const performSearch = (query: string) => {
    setIsSearching(true);
    
    // Search logic
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
        }).filter(Boolean); // Remove nulls
      });
      
      // Sort by relevance with proper type handling
      results.sort((a, b) => {
        if (a && b) {
          return b.relevance - a.relevance;
        }
        return 0;
      });
      setSearchResults(results.slice(0, 5)); // Limit to top 5 results
      setIsSearching(false);
    }, 300);
  };

  // Navigate to documentation with search query
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push(`/dashboard/docs?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSupportSubmit = (values: typeof form.values) => {
    console.log('Submitting support request:', values);
    // Add API call logic here to send support message
    form.reset();
    // Add notification for success
  };

  return (
    <Stack gap="lg">
      <Title order={2}>Help & Support Center</Title>

      {/* Enhanced Search Section */}
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Stack>
          <Title order={4} mb="xs">How can we help you today?</Title>
          <Group align="flex-end">
            <TextInput
              placeholder="Search for help (e.g., 'field mapping', 'crop health')"
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ flexGrow: 1 }}
              rightSection={isSearching ? <Loader size="xs" /> : null}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            />
            <Button onClick={handleSearchSubmit}>Search</Button>
          </Group>

          {/* Dynamic Search Results */}
          {searchResults.length > 0 && (
            <Box mt="md">
              <Text fw={500} mb="xs">Top results for "{searchQuery}":</Text>
              <Stack>
                {searchResults.map((result, index) => (
                  <Card key={index} p="sm" withBorder radius="md">
                    <Group justify="space-between" mb="xs">
                      <Text fw={500}>{result.title}</Text>
                      <Badge>{result.section.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Badge>
                    </Group>
                    <Text lineClamp={1} size="sm" c="dimmed" mb="xs">
                      {result.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </Text>
                    <Anchor component={Link} href={`/dashboard/docs?section=${result.section}&query=`}>
                      <Group gap={4}>
                        <span>Read more</span>
                        <IconArrowRight size={14} />
                      </Group>
                    </Anchor>
                  </Card>
                ))}
                
                <Button variant="subtle" component={Link} href={`/dashboard/docs?query=${encodeURIComponent(searchQuery)}`}>
                  View all results in documentation
                </Button>
              </Stack>
            </Box>
          )}

          {/* Quick Links */}
          <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} mt="md">
            <Link href="#faq" className={classes.linkButton}>
              <Button 
                fullWidth
                variant="light" 
                leftSection={<IconQuestionMark size={16}/>}>
                View FAQs
              </Button>
            </Link>
            <Link href="#contact-support" className={classes.linkButton}>
              <Button 
                fullWidth
                variant="light" 
                leftSection={<IconMessageCircle size={16}/>}>
                Contact Support
              </Button>
            </Link>
            <Link href="/dashboard/docs" className={classes.linkButton}>
              <Button 
                fullWidth
                variant="light" 
                leftSection={<IconBook size={16}/>}>
                Browse Documentation
              </Button>
            </Link>
            <Link href="#video-tutorials" className={classes.linkButton}>
              <Button 
                fullWidth
                variant="light" 
                leftSection={<IconVideo size={16}/>}>
                Video Tutorials
              </Button>
            </Link>
          </SimpleGrid>
        </Stack>
      </Paper>

      {/* Popular Documentation Topics */}
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Title order={4} mb="md">Popular Topics</Title>
        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
          {Object.entries(documentationContent).flatMap(([section, docs]) => 
            docs.slice(0, 1).map((doc, index) => (
              <Card 
                key={`${section}-${index}`} 
                p="md" 
                radius="md" 
                withBorder 
                className={classes.topicCard}
                component={Link}
                href={`/dashboard/docs?section=${section}`}
              >
                <ThemeIcon 
                  size="xl" 
                  radius="md" 
                  variant="light" 
                  color="blue" 
                  mb="md"
                >
                  <IconFileText size={20} />
                </ThemeIcon>
                <Text fw={500} mb="xs">{doc.title}</Text>
                <Text size="sm" c="dimmed" lineClamp={2}>
                  {doc.content.replace(/<[^>]*>/g, '').substring(0, 80)}...
                </Text>
              </Card>
            ))
          )}
        </SimpleGrid>
      </Paper>

      {/* FAQ Section */}
      <Paper withBorder shadow="sm" p="lg" radius="md" id="faq">
        <Title order={4} mb="md">Frequently Asked Questions</Title>
        <Accordion variant="separated">
          {faqItems.map((item) => (
            <Accordion.Item key={item.value} value={item.value}>
              <Accordion.Control icon={<IconLifebuoy size={16} />}>{item.question}</Accordion.Control>
              <Accordion.Panel>{item.answer}</Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
        <Group mt="lg" justify="center">
          <Button variant="subtle" component={Link} href="/dashboard/docs">
            Browse Full Documentation
          </Button>
        </Group>
      </Paper>

      {/* Video Tutorials Section */}
      <Paper withBorder shadow="sm" p="lg" radius="md" id="video-tutorials">
        <Title order={4} mb="md">Video Tutorials</Title>
        <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="md">
          <Card p="md" withBorder>
            <Text fw={500} mb="xs">Getting Started with FarmWise</Text>
            <Box className={classes.videoPlaceholder}>
              <IconVideo size={32} />
            </Box>
            <Text size="sm" mt="xs">A comprehensive overview of the FarmWise platform</Text>
          </Card>
          <Card p="md" withBorder>
            <Text fw={500} mb="xs">Field Mapping Tutorial</Text>
            <Box className={classes.videoPlaceholder}>
              <IconVideo size={32} />
            </Box>
            <Text size="sm" mt="xs">Learn how to create and manage field boundaries</Text>
          </Card>
          <Card p="md" withBorder>
            <Text fw={500} mb="xs">Understanding Crop Health</Text>
            <Box className={classes.videoPlaceholder}>
              <IconVideo size={32} />
            </Box>
            <Text size="sm" mt="xs">Interpreting crop health indicators and maps</Text>
          </Card>
        </SimpleGrid>
      </Paper>

      {/* Contact Support Section */}
      <Paper withBorder shadow="sm" p="lg" radius="md" id="contact-support">
        <Title order={4} mb="md">Contact Support</Title>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Stack>
            <Text size="sm" mb="md">Still need help? Fill out the form and our support team will get back to you as soon as possible.</Text>
            <form onSubmit={form.onSubmit(handleSupportSubmit)}>
              <Stack>
                <TextInput
                  label="Your Email"
                  placeholder="your@email.com"
                  required
                  {...form.getInputProps('email')}
                />
                <TextInput
                  label="Subject"
                  placeholder="e.g., Issue with field mapping"
                  required
                  {...form.getInputProps('subject')}
                />
                <Textarea
                  label="Message"
                  placeholder="Please describe your issue in detail..."
                  required
                  minRows={4}
                  autosize
                  {...form.getInputProps('message')}
                />
                <Group justify="flex-end" mt="md">
                  <Button type="submit" leftSection={<IconSend size={16}/>}>
                    Send Message
                  </Button>
                </Group>
              </Stack>
            </form>
          </Stack>
          
          <Card withBorder p="md">
            <Stack>
              <Title order={5}>Other Ways to Reach Us</Title>
              <Group gap="xs" align="center">
                <ThemeIcon size="md" variant="light" color="blue" radius="xl">
                  <IconHeadset size={16} />
                </ThemeIcon>
                <Text fw={500}>Live Chat</Text>
                <Badge>Available 9am-5pm</Badge>
              </Group>
              <Text size="sm" ml={28}>Connect with a support agent in real-time through our live chat service.</Text>
              
              <Group gap="xs" align="center">
                <ThemeIcon size="md" variant="light" color="blue" radius="xl">
                  <IconStar size={16} />
                </ThemeIcon>
                <Text fw={500}>Priority Support</Text>
              </Group>
              <Text size="sm" ml={28}>Premium accounts receive priority support with dedicated response times.</Text>
              
              <Divider my="sm" />
              
              <Text fw={500}>Support Hours</Text>
              <Text size="sm">Monday-Friday: 8am-8pm EST</Text>
              <Text size="sm">Saturday: 9am-5pm EST</Text>
              <Text size="sm">Sunday: Closed</Text>
              
              <Text size="sm" c="dimmed" mt="xs">Emergency support is available 24/7 for critical issues.</Text>
            </Stack>
          </Card>
        </SimpleGrid>
      </Paper>
    </Stack>
  );
}

// Icons for popular topics
function IconMap(props: any) {
  return <IconFileText {...props} />;
}

function IconPlant(props: any) {
  return <IconFileText {...props} />;
}

function IconCloudRain(props: any) {
  return <IconFileText {...props} />;
}

function IconCalendar(props: any) {
  return <IconFileText {...props} />;
} 