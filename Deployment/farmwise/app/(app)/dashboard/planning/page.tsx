'use client';
import React, { useEffect, useState } from 'react';
import {
  Title,
  Text,
  Container,
  Button,
  Group,
  SimpleGrid,
  Card,
  Stack,
  Badge,
  ThemeIcon,
  rem,
  Box,
  Paper,
  Divider,
  useMantineTheme,
  List,
  ActionIcon,
  Flex,
  RingProgress,
  Center
} from '@mantine/core';
import { 
  IconCalendarStats, 
  IconSun, 
  IconMicroscope, 
  IconChartLine,
  IconArrowRight,
  IconCheck,
  IconTargetArrow,
  IconSettings,
  IconInfoCircle,
  IconExternalLink
} from '@tabler/icons-react';
import Link from 'next/link';
import classes from './planning.module.css';

// Define types
interface PlanningTool {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  benefits: string[];
  link: string;
}

interface Activity {
  date: string;
  activity: string;
  priority: 'High' | 'Medium' | 'Low';
}

export default function PlanningPage() {
  const theme = useMantineTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Season overview data - this will be replaced with backend data later
  const seasonData = {
    progress: 45,
    nextMilestone: 'Harvest Phase',
    estimatedCompletion: 'Nov 15, 2023'
  };

  // Upcoming activities - This will be from the backend later
  const upcomingActivities: Activity[] = [
    { date: '2023-09-15', activity: 'Corn Harvest', priority: 'High' },
    { date: '2023-09-18', activity: 'Soil Testing', priority: 'Medium' },
    { date: '2023-09-25', activity: 'Irrigation Maintenance', priority: 'Low' }
  ];

  useEffect(() => {
    // Client-side check for dark mode. This is more reliable for dynamic theme changes.
    // It checks the data-mantine-color-scheme attribute on the html element.
    const observer = new MutationObserver(() => {
      const colorScheme = document.documentElement.getAttribute('data-mantine-color-scheme');
      setIsDarkMode(colorScheme === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mantine-color-scheme'] });
    // Initial check
    setIsDarkMode(document.documentElement.getAttribute('data-mantine-color-scheme') === 'dark');
    return () => observer.disconnect();
  }, []);

  const planningTools: PlanningTool[] = [
    {
      id: 'classification',
      title: 'Crop Classification',
      description: 'Identify optimal crops for your land with AI-driven soil and climate analysis.',
      icon: IconMicroscope,
      color: 'indigo',
      benefits: ['Precise soil matching', 'Climate suitability reports', 'Rotation recommendations'],
      link: '/dashboard/planning/classification'
    },
    {
      id: 'season',
      title: 'Season Planning',
      description: 'Plan your planting and harvesting schedules using localized climate intelligence.',
      icon: IconSun,
      color: 'orange',
      benefits: ['Optimized event timing', 'Frost risk assessment', 'Growth stage tracking'],
      link: '/dashboard/planning/season'
    },
    {
      id: 'yield-forecast',
      title: 'Yield Forecast',
      description: 'Predict harvest outcomes with advanced analytics and historical data.',
      icon: IconChartLine,
      color: 'blue',
      benefits: ['Accurate yield predictions', 'Resource planning insights', 'Market timing advantage'],
      link: '/dashboard/planning/yield-forecast'
    },
    {
      id: 'crop-calendar',
      title: 'Crop Calendar',
      description: 'Manage all farm activities with an interactive, AI-enhanced calendar.',
      icon: IconCalendarStats,
      color: 'green',
      benefits: ['Centralized task management', 'Automated reminders', 'Seasonal activity overview'],
      link: '/dashboard/planning/crop-calendar'
    }
  ];

  // Define colors and styles based on isDarkMode state
  const pageHeaderBg = isDarkMode ? theme.colors.dark[7] : theme.colors.gray[0];
  const pageHeaderTitleColor = isDarkMode ? theme.white : theme.black;

  const cardStyles = (toolColor: string) => ({
    bg: isDarkMode ? theme.colors.dark[6] : theme.white,
    textColor: isDarkMode ? theme.colors.dark[0] : theme.black,
    headerBg: isDarkMode ? theme.colors[toolColor][8] : theme.colors[toolColor][0],
    headerTitleColor: isDarkMode ? theme.white : theme.colors[toolColor][9],
    badgeVariant: isDarkMode ? 'filled' : 'light',
    benefitIconColor: theme.colors[toolColor][isDarkMode ? 4 : 6],
    buttonVariant: isDarkMode ? 'outline' : 'light',
  });

  // Helper function to determine badge color based on priority
  const getPriorityColor = (priority: 'High' | 'Medium' | 'Low'): string => {
    switch (priority) {
      case 'High': return 'red';
      case 'Medium': return 'orange';
      case 'Low': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <Container fluid>
      <Paper p="xl" radius="md" mb={rem(30)} bg={pageHeaderBg} shadow="sm">
        <Title order={2} mb={rem(5)} style={{ color: pageHeaderTitleColor }}>
          Farm Planning Center
        </Title>
        <Text size="md" c="dimmed">
          Leverage AI-powered tools to enhance your farm's productivity and decision-making.
        </Text>
      </Paper>

      {/* Two-column layout for planning tools and sidebar */}
      <Flex gap="xl" direction={{ base: 'column', md: 'row' }}>
        {/* Main content - Planning Tools */}
        <Box style={{ flex: 2 }}>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
            {planningTools.map((tool) => {
              const styles = cardStyles(tool.color);
              const ToolIcon = tool.icon;

              return (
                <Card
                  key={tool.id}
                  shadow="md"
                  radius="md"
                  padding={0}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    backgroundColor: styles.bg,
                    color: styles.textColor,
                  }}
                >
                  <Card.Section 
                    p="lg" 
                    style={{ backgroundColor: styles.headerBg }}
                    withBorder={!isDarkMode}
                  >
                    <Group>
                      <ThemeIcon color={tool.color} size={48} radius="md" variant={isDarkMode? 'filled':'outline'}>
                        <ToolIcon size={26} />
                      </ThemeIcon>
                      <Stack gap={0}>
                        <Title order={3} style={{ color: styles.headerTitleColor }}>
                          {tool.title}
                        </Title>
                        <Badge color={tool.color} variant={styles.badgeVariant} size="sm" mt={4}>
                          AI-Powered Insight
                        </Badge>
                      </Stack>
                    </Group>
                  </Card.Section>

                  <Box p="lg" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Text size="sm" c="dimmed" mb="md" style={{ minHeight: rem(50) }}>
                      {tool.description}
                    </Text>

                    <Divider my="sm" />

                    <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="xs">
                      Key Features
                    </Text>
                    <List
                      spacing="xs"
                      size="sm"
                      mb="lg"
                      icon={
                        <ThemeIcon color={tool.color} size={20} radius="xl" variant='light'>
                          <IconCheck size={rem(12)} style={{color: styles.benefitIconColor}}/>
                        </ThemeIcon>
                      }
                      style={{ flexGrow: 1 }}
                    >
                      {tool.benefits.map((benefit) => (
                        <List.Item key={benefit}>{benefit}</List.Item>
                      ))}
                    </List>

                    <Button
                      component={Link}
                      href={tool.link}
                      variant={styles.buttonVariant}
                      color={tool.color}
                      fullWidth
                      mt="auto"
                      rightSection={<IconArrowRight size={16} />}
                      radius="md"
                    >
                      Go to {tool.title}
                    </Button>
                  </Box>
                </Card>
              );
            })}
          </SimpleGrid>
        </Box>

        {/* Sidebar content */}
        <Stack gap="md" style={{ flex: 1 }}>
          {/* Season Overview Card */}
          <Paper p="md" radius="md" shadow="sm" style={{ backgroundColor: isDarkMode ? theme.colors.dark[6] : theme.white }}>
            <Title order={4} mb={rem(16)}>Season Overview</Title>
            <Flex direction="column" align="center" justify="center">
              <RingProgress
                size={180}
                thickness={16}
                roundCaps
                sections={[
                  { value: seasonData.progress, color: 'green' }
                ]}
                label={
                  <Center>
                    <Stack gap={0} align="center">
                      <Text fw={700} size="xl">{seasonData.progress}%</Text>
                      <Text size="xs" c="dimmed">Complete</Text>
                    </Stack>
                  </Center>
                }
              />
              <Group mt="md" justify="space-between" style={{ width: '100%' }}>
                <Box>
                  <Text size="sm" c="dimmed">Next Milestone</Text>
                  <Text fw={600}>{seasonData.nextMilestone}</Text>
                </Box>
                <Box>
                  <Text size="sm" c="dimmed" ta="right">Est. Completion</Text>
                  <Text fw={600} ta="right">{seasonData.estimatedCompletion}</Text>
                </Box>
              </Group>
            </Flex>
          </Paper>

          {/* Upcoming Activities Card */}
          <Paper p="md" radius="md" shadow="sm" style={{ backgroundColor: isDarkMode ? theme.colors.dark[6] : theme.white }}>
            <Title order={4} mb={rem(16)}>Upcoming Activities</Title>
            <Stack gap="md">
              {upcomingActivities.map((activity, index) => (
                <Paper key={index} p="md" radius="md" withBorder>
                  <Group justify="space-between" mb={4}>
                    <Text fw={600}>{activity.activity}</Text>
                    <Badge color={getPriorityColor(activity.priority)} size="sm">
                      {activity.priority}
                    </Badge>
                  </Group>
                  <Text size="sm" c="dimmed">{new Date(activity.date).toLocaleDateString()}</Text>
                </Paper>
              ))}
            </Stack>
            <Button 
              variant="subtle" 
              color="gray" 
              fullWidth 
              mt="md"
              component={Link}
              href="/dashboard/planning/crop-calendar"
              rightSection={<IconExternalLink size={16} />}
            >
              View Full Calendar
            </Button>
          </Paper>

          {/* Planning Tip Card */}
          <Paper p="md" radius="md" shadow="sm" 
            style={{ 
              backgroundColor: isDarkMode ? theme.colors.dark[6] : theme.white,
              borderLeft: `4px solid ${theme.colors.blue[6]}`
            }}
          >
            <Group mb={10} justify="flex-start">
              <ThemeIcon color="blue" variant="light" size="lg" radius="xl">
                <IconInfoCircle size={20} />
              </ThemeIcon>
              <Text fw={600}>Planning Tip</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Consider crop rotation for next season to improve soil health and reduce pest pressure.
            </Text>
          </Paper>
        </Stack>
      </Flex>
    </Container>
  );
}
