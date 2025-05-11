'use client';

import { 
  SimpleGrid, 
  Card, 
  Text, 
  Stack, 
  Title, 
  Group, 
  RingProgress,
  ThemeIcon,
  Paper,
  Badge,
  Box,
  Accordion,
  List,
  Container
} from '@mantine/core';
import { 
  IconUsers, 
  IconServerBolt, 
  IconDatabase, 
  IconCloudUpload, 
  IconChartBar, 
  IconShieldCheck,
  IconAlertTriangle,
  IconArrowUpRight,
  IconWorldUpload,
  IconDeviceAnalytics
} from '@tabler/icons-react';
import { LineChart, BarChart } from '@mantine/charts';

// Mock data for charts
const usersData = [
  { date: 'Jan', users: 120 },
  { date: 'Feb', users: 145 },
  { date: 'Mar', users: 168 },
  { date: 'Apr', users: 190 },
  { date: 'May', users: 220 },
  { date: 'Jun', users: 250 },
  { date: 'Jul', users: 280 },
];

const resourceUsageData = [
  { resource: 'CPU', usage: 65 },
  { resource: 'Memory', usage: 78 },
  { resource: 'Storage', usage: 42 },
  { resource: 'Bandwidth', usage: 30 },
];

const activityData = [
  { date: 'Mon', logins: 32, actions: 85 },
  { date: 'Tue', logins: 45, actions: 97 },
  { date: 'Wed', logins: 43, actions: 105 },
  { date: 'Thu', logins: 50, actions: 140 },
  { date: 'Fri', logins: 55, actions: 160 },
  { date: 'Sat', logins: 30, actions: 60 },
  { date: 'Sun', logins: 25, actions: 50 },
];

export default function AdminDashboard() {
  // Recent events data
  const systemEvents = [
    { 
      title: 'Database Backup Completed', 
      description: 'Daily database backup completed successfully.', 
      time: '2 hours ago', 
      type: 'success'
    },
    { 
      title: 'API Rate Limit Alert', 
      description: 'Rate limit threshold reached for user API.', 
      time: '5 hours ago', 
      type: 'warning' 
    },
    { 
      title: 'New Admin User Created', 
      description: 'New admin user "jsmith" was created by superadmin.', 
      time: '1 day ago', 
      type: 'info' 
    },
    { 
      title: 'Server Resources Warning', 
      description: 'Server FARM-02 reached 90% memory usage.', 
      time: '1 day ago', 
      type: 'warning' 
    },
  ];

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        <Title order={2}>Admin Dashboard</Title>
        
        {/* Stats cards row */}
        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
          <StatsCard 
            title="Total Users" 
            value="2,543" 
            increase="+16%" 
            icon={<IconUsers size="1.5rem" />} 
            color="blue" 
          />
          <StatsCard 
            title="Server Uptime" 
            value="99.9%" 
            increase="Stable" 
            icon={<IconServerBolt size="1.5rem" />} 
            color="teal" 
          />
          <StatsCard 
            title="Storage Used" 
            value="4.2 TB" 
            increase="68%" 
            icon={<IconDatabase size="1.5rem" />} 
            color="orange" 
          />
          <StatsCard 
            title="API Requests" 
            value="8.4M" 
            increase="+24%" 
            icon={<IconWorldUpload size="1.5rem" />} 
            color="grape" 
          />
        </SimpleGrid>

        {/* Charts row */}
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Card withBorder padding="lg" radius="md">
            <Text fw={500} mb="md">User Growth</Text>
            <LineChart
              h={250}
              data={usersData}
              dataKey="date"
              series={[
                { name: 'users', color: 'blue.6' },
              ]}
              curveType="linear"
              withLegend
              withTooltip
              tooltipAnimationDuration={200}
            />
          </Card>

          <Card withBorder padding="lg" radius="md">
            <Text fw={500} mb="md">Weekly User Activity</Text>
            <BarChart
              h={250}
              data={activityData}
              dataKey="date"
              series={[
                { name: 'logins', color: 'indigo.6' },
                { name: 'actions', color: 'blue.4' },
              ]}
              withLegend
              withTooltip
            />
          </Card>
        </SimpleGrid>

        {/* Resource usage and events */}
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {/* Resource usage */}
          <Card withBorder padding="lg" radius="md">
            <Text fw={500} mb="lg">Resource Usage</Text>
            <SimpleGrid cols={{ base: 2, sm: 4 }}>
              {resourceUsageData.map((resource) => (
                <Stack key={resource.resource} align="center" gap="xs">
                  <RingProgress
                    size={80}
                    thickness={8}
                    roundCaps
                    sections={[{ value: resource.usage, color: getResourceColor(resource.usage) }]}
                    label={
                      <Text ta="center" size="xs" fw={700}>
                        {resource.usage}%
                      </Text>
                    }
                  />
                  <Text size="sm">{resource.resource}</Text>
                </Stack>
              ))}
            </SimpleGrid>
          </Card>

          {/* System events */}
          <Card withBorder padding="lg" radius="md">
            <Text fw={500} mb="md">Recent System Events</Text>
            <Stack gap="xs">
              {systemEvents.map((event, index) => (
                <Paper key={index} withBorder p="sm" radius="md">
                  <Group wrap="nowrap" justify="space-between" mb={5}>
                    <Group>
                      <ThemeIcon 
                        color={event.type === 'success' ? 'green' : event.type === 'warning' ? 'orange' : 'blue'} 
                        variant="light"
                      >
                        {event.type === 'success' ? (
                          <IconShieldCheck size="1rem" />
                        ) : event.type === 'warning' ? (
                          <IconAlertTriangle size="1rem" />
                        ) : (
                          <IconDeviceAnalytics size="1rem" />
                        )}
                      </ThemeIcon>
                      <Text fw={500} size="sm">{event.title}</Text>
                    </Group>
                    <Badge size="sm" variant="light">{event.time}</Badge>
                  </Group>
                  <Text size="xs" c="dimmed">{event.description}</Text>
                </Paper>
              ))}
            </Stack>
          </Card>
        </SimpleGrid>

        {/* Quick actions and info */}
        <Card withBorder padding="lg" radius="md">
          <Text fw={500} mb="md">System Information</Text>
          <Accordion variant="separated">
            <Accordion.Item value="performance">
              <Accordion.Control>
                <Group>
                  <IconChartBar size="1rem" />
                  <Text>Performance Metrics</Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <List size="sm">
                  <List.Item>Average response time: 120ms</List.Item>
                  <List.Item>CPU Utilization: 42% (4 cores/8 threads)</List.Item>
                  <List.Item>Memory Usage: 8GB / 16GB (50%)</List.Item>
                  <List.Item>Database connections: 28 active / 100 maximum</List.Item>
                </List>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="storage">
              <Accordion.Control>
                <Group>
                  <IconCloudUpload size="1rem" />
                  <Text>Storage Information</Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <List size="sm">
                  <List.Item>Total storage: 6TB / 10TB used</List.Item>
                  <List.Item>User uploads: 2.8TB</List.Item>
                  <List.Item>System files: 1.2TB</List.Item>
                  <List.Item>Database size: 850GB</List.Item>
                  <List.Item>Last backup: 4 hours ago (2.3TB)</List.Item>
                </List>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="security">
              <Accordion.Control>
                <Group>
                  <IconShieldCheck size="1rem" />
                  <Text>Security Status</Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <List size="sm">
                  <List.Item>Security level: High</List.Item>
                  <List.Item>Last security scan: 1 day ago (no issues)</List.Item>
                  <List.Item>Failed login attempts: 12 in the last 24 hours</List.Item>
                  <List.Item>2FA enabled admins: 8/10</List.Item>
                </List>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Card>
      </Stack>
    </Container>
  );
}

// Helper components
interface StatsCardProps {
  title: string;
  value: string;
  increase: string;
  icon: React.ReactNode;
  color: string;
}

function StatsCard({ title, value, increase, icon, color }: StatsCardProps) {
  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between" mb={5} align="flex-start">
        <div>
          <Text c="dimmed" tt="uppercase" fw={500} size="xs">
            {title}
          </Text>
          <Text fw={700} size="xl" mb={5}>
            {value}
          </Text>
        </div>
        <ThemeIcon size="lg" radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
      </Group>
      <Group gap={5} c={increase.includes('+') ? 'teal' : increase === 'Stable' ? 'blue' : 'dimmed'}>
        <Text size="xs" fw={500} span>
          {increase}
        </Text>
        {increase.includes('+') && <IconArrowUpRight size="0.8rem" stroke={3} />}
      </Group>
    </Card>
  );
}

// Helper function to get color based on resource usage
function getResourceColor(usage: number) {
  if (usage > 80) return 'red';
  if (usage > 60) return 'orange';
  if (usage > 40) return 'yellow';
  return 'green';
} 