'use client';

import { useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Group, 
  SimpleGrid, 
  Card, 
  RingProgress, 
  Progress, 
  Stack, 
  Paper, 
  ThemeIcon,
  Table,
  Badge,
  Button,
  Select,
  SegmentedControl,
  Divider,
  List
} from '@mantine/core';
import { 
  IconServer, 
  IconCpu, 
  IconDeviceDesktop,
  IconDatabase, 
  IconNetwork, 
  IconCloudUpload,
  IconCloudDownload,
  IconArrowUpRight,
  IconArrowDownRight,
  IconRefresh,
  IconDeviceAnalytics,
  IconChartLine,
  IconAlertTriangle,
  IconChartPie,
  IconUsersGroup,
  IconInfoCircle
} from '@tabler/icons-react';
import { LineChart, DonutChart } from '@mantine/charts';

// Mock data for server resources
const cpuData = [
  { date: '08:00', usage: 32 },
  { date: '09:00', usage: 45 },
  { date: '10:00', usage: 78 },
  { date: '11:00', usage: 56 },
  { date: '12:00', usage: 39 },
  { date: '13:00', usage: 42 },
  { date: '14:00', usage: 62 },
  { date: '15:00', usage: 74 },
  { date: '16:00', usage: 89 },
  { date: '17:00', usage: 72 },
  { date: '18:00', usage: 45 },
  { date: '19:00', usage: 35 },
];

const memoryData = [
  { date: '08:00', usage: 45 },
  { date: '09:00', usage: 52 },
  { date: '10:00', usage: 65 },
  { date: '11:00', usage: 72 },
  { date: '12:00', usage: 58 },
  { date: '13:00', usage: 49 },
  { date: '14:00', usage: 55 },
  { date: '15:00', usage: 68 },
  { date: '16:00', usage: 82 },
  { date: '17:00', usage: 75 },
  { date: '18:00', usage: 64 },
  { date: '19:00', usage: 55 },
];

const networkData = [
  { date: '08:00', incoming: 12, outgoing: 8 },
  { date: '09:00', incoming: 18, outgoing: 10 },
  { date: '10:00', incoming: 25, outgoing: 15 },
  { date: '11:00', incoming: 32, outgoing: 20 },
  { date: '12:00', incoming: 20, outgoing: 12 },
  { date: '13:00', incoming: 15, outgoing: 8 },
  { date: '14:00', incoming: 22, outgoing: 14 },
  { date: '15:00', incoming: 30, outgoing: 18 },
  { date: '16:00', incoming: 42, outgoing: 26 },
  { date: '17:00', incoming: 35, outgoing: 22 },
  { date: '18:00', incoming: 25, outgoing: 15 },
  { date: '19:00', incoming: 18, outgoing: 10 },
];

const diskData = [
  { name: 'System', value: 80, color: 'blue' },
  { name: 'User Data', value: 150, color: 'teal' },
  { name: 'Media', value: 350, color: 'violet' },
  { name: 'Backups', value: 220, color: 'orange' },
  { name: 'Logs', value: 50, color: 'grape' },
  { name: 'Other', value: 100, color: 'gray' },
];

const serversList = [
  { 
    name: 'Server 01 (Main)',
    cpu: 65,
    memory: 78,
    disk: 42,
    network: '45 Mbps',
    status: 'Online',
    uptime: '32 days, 5 hours'
  },
  { 
    name: 'Server 02 (Analytics)',
    cpu: 82,
    memory: 65,
    disk: 56,
    network: '28 Mbps',
    status: 'Online',
    uptime: '15 days, 12 hours'
  },
  { 
    name: 'Server 03 (Database)',
    cpu: 45,
    memory: 72,
    disk: 80,
    network: '18 Mbps',
    status: 'Online',
    uptime: '8 days, 3 hours'
  },
  { 
    name: 'Server 04 (Backup)',
    cpu: 12,
    memory: 24,
    disk: 95,
    network: '5 Mbps',
    status: 'Online',
    uptime: '45 days, 9 hours'
  },
  { 
    name: 'Server 05 (Development)',
    cpu: 5,
    memory: 15,
    disk: 30,
    network: '3 Mbps',
    status: 'Maintenance',
    uptime: '0 days, 5 hours'
  }
];

export default function ServerMonitoring() {
  const [timeRange, setTimeRange] = useState('12h');
  const [selectedServer, setSelectedServer] = useState('1');
  const [viewType, setViewType] = useState('resources');

  // Helper function to get appropriate color based on resource usage
  const getResourceColor = (usage: number): string => {
    if (usage > 90) return 'red';
    if (usage > 75) return 'orange';
    if (usage > 50) return 'yellow';
    return 'green';
  };

  // Calculate current resource usage
  const currentCPU = cpuData[cpuData.length - 1].usage;
  const currentMemory = memoryData[memoryData.length - 1].usage;
  const totalDiskSpace = diskData.reduce((sum, item) => sum + item.value, 0);
  const currentDiskUsage = Math.round((totalDiskSpace / 1000) * 100); // Assuming 1TB total capacity
  const currentNetworkUsage = networkData[networkData.length - 1].incoming + 
                             networkData[networkData.length - 1].outgoing;

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>Server Resources Monitoring</Title>
          <Group>
            <Select
              label="Server"
              value={selectedServer}
              onChange={(value) => value && setSelectedServer(value)}
              data={[
                { value: '1', label: 'Server 01 (Main)' },
                { value: '2', label: 'Server 02 (Analytics)' },
                { value: '3', label: 'Server 03 (Database)' },
                { value: '4', label: 'Server 04 (Backup)' },
                { value: '5', label: 'Server 05 (Development)' },
              ]}
              style={{ width: 200 }}
            />
            <Select
              label="Time Range"
              value={timeRange}
              onChange={(value) => value && setTimeRange(value)}
              data={[
                { value: '1h', label: 'Last Hour' },
                { value: '6h', label: 'Last 6 Hours' },
                { value: '12h', label: 'Last 12 Hours' },
                { value: '24h', label: 'Last 24 Hours' },
                { value: '7d', label: 'Last 7 Days' },
              ]}
              style={{ width: 150 }}
            />
            <Button 
              leftSection={<IconRefresh size="1rem" />} 
              variant="light"
            >
              Refresh
            </Button>
          </Group>
        </Group>

        <SegmentedControl
          value={viewType}
          onChange={setViewType}
          data={[
            { 
              label: (
                <Group gap={5}>
                  <IconDeviceAnalytics size="1rem" />
                  <span>Resources</span>
                </Group>
              ), 
              value: 'resources' 
            },
            { 
              label: (
                <Group gap={5}>
                  <IconServer size="1rem" />
                  <span>Servers Overview</span>
                </Group>
              ), 
              value: 'servers' 
            },
            { 
              label: (
                <Group gap={5}>
                  <IconChartPie size="1rem" />
                  <span>Disk Usage</span>
                </Group>
              ), 
              value: 'disk' 
            }
          ]}
        />

        {viewType === 'resources' && (
          <>
            {/* Resource Overview Cards */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
              <ResourceCard 
                title="CPU Usage" 
                value={`${currentCPU}%`} 
                usage={currentCPU} 
                icon={<IconCpu size="1.5rem" />} 
                color={getResourceColor(currentCPU)}
              />
              <ResourceCard 
                title="Memory Usage" 
                value={`${currentMemory}%`} 
                usage={currentMemory} 
                icon={<IconDeviceDesktop size="1.5rem" />} 
                color={getResourceColor(currentMemory)}
              />
              <ResourceCard 
                title="Disk Usage" 
                value={`${currentDiskUsage}%`}
                usage={currentDiskUsage} 
                icon={<IconDatabase size="1.5rem" />} 
                color={getResourceColor(currentDiskUsage)}
              />
              <ResourceCard 
                title="Network" 
                value={`${currentNetworkUsage} Mbps`} 
                usage={Math.min(currentNetworkUsage, 100)} 
                icon={<IconNetwork size="1.5rem" />} 
                color="blue"
              />
            </SimpleGrid>

            {/* CPU Usage Chart */}
            <Card withBorder padding="lg" radius="md">
              <Group justify="space-between" mb="xs">
                <Group>
                  <ThemeIcon size="lg" radius="md" variant="light" color={getResourceColor(currentCPU)}>
                    <IconCpu size="1.2rem" />
                  </ThemeIcon>
                  <Text fw={500}>CPU Usage Over Time</Text>
                </Group>
                <Group gap={5}>
                  <Badge color={getResourceColor(currentCPU)} variant="light" size="lg">
                    {`Current: ${currentCPU}%`}
                  </Badge>
                  <Badge color="blue" variant="light" size="lg">
                    {`Avg: ${Math.round(cpuData.reduce((sum, item) => sum + item.usage, 0) / cpuData.length)}%`}
                  </Badge>
                </Group>
              </Group>
              <LineChart
                h={250}
                data={cpuData}
                dataKey="date"
                series={[
                  { name: 'usage', color: 'blue.6' },
                ]}
                curveType="linear"
                withLegend
                withTooltip
                tooltipAnimationDuration={200}
                unit="%"
                yAxisProps={{ domain: [0, 100] }}
              />
            </Card>

            {/* Memory and Network Charts */}
            <SimpleGrid cols={{ base: 1, md: 2 }}>
              <Card withBorder padding="lg" radius="md">
                <Group justify="space-between" mb="xs">
                  <Group>
                    <ThemeIcon size="lg" radius="md" variant="light" color={getResourceColor(currentMemory)}>
                      <IconDeviceDesktop size="1.2rem" />
                    </ThemeIcon>
                    <Text fw={500}>Memory Usage</Text>
                  </Group>
                  <Badge color={getResourceColor(currentMemory)} variant="light" size="lg">
                    {`Current: ${currentMemory}%`}
                  </Badge>
                </Group>
                <LineChart
                  h={250}
                  data={memoryData}
                  dataKey="date"
                  series={[
                    { name: 'usage', color: 'teal.6' },
                  ]}
                  curveType="linear"
                  withTooltip
                  unit="%"
                  yAxisProps={{ domain: [0, 100] }}
                />
              </Card>

              <Card withBorder padding="lg" radius="md">
                <Group justify="space-between" mb="xs">
                  <Group>
                    <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                      <IconNetwork size="1.2rem" />
                    </ThemeIcon>
                    <Text fw={500}>Network Traffic</Text>
                  </Group>
                  <Group>
                    <Badge color="blue" variant="light" size="lg">
                      <Group gap={5}>
                        <IconCloudDownload size="0.8rem" />
                        <span>Incoming</span>
                      </Group>
                    </Badge>
                    <Badge color="violet" variant="light" size="lg">
                      <Group gap={5}>
                        <IconCloudUpload size="0.8rem" />
                        <span>Outgoing</span>
                      </Group>
                    </Badge>
                  </Group>
                </Group>
                <LineChart
                  h={250}
                  data={networkData}
                  dataKey="date"
                  series={[
                    { name: 'incoming', color: 'blue.6' },
                    { name: 'outgoing', color: 'violet.6' },
                  ]}
                  curveType="linear"
                  withLegend
                  withTooltip
                  unit=" Mbps"
                />
              </Card>
            </SimpleGrid>

            {/* Server Info Card */}
            <Card withBorder padding="lg" radius="md">
              <Group justify="space-between" mb="md">
                <Group>
                  <ThemeIcon size="lg" radius="md" variant="light" color="indigo">
                    <IconServer size="1.2rem" />
                  </ThemeIcon>
                  <Text fw={500}>Server Information</Text>
                </Group>
                <Badge color="green" size="lg">Online</Badge>
              </Group>
              
              <SimpleGrid cols={{ base: 1, md: 3 }}>
                <Stack gap="xs">
                  <Text fw={500} size="sm">Hardware</Text>
                  <List size="sm" spacing="xs">
                    <List.Item>CPU: Intel Xeon E5-2680 v4 (14 cores)</List.Item>
                    <List.Item>Memory: 64GB DDR4</List.Item>
                    <List.Item>Storage: 4TB SSD RAID-5</List.Item>
                    <List.Item>Network: 10 Gbps</List.Item>
                  </List>
                </Stack>

                <Stack gap="xs">
                  <Text fw={500} size="sm">Software</Text>
                  <List size="sm" spacing="xs">
                    <List.Item>OS: Ubuntu 22.04 LTS</List.Item>
                    <List.Item>Kernel: 5.15.0-91-generic</List.Item>
                    <List.Item>Database: PostgreSQL 15.3</List.Item>
                    <List.Item>Web Server: Nginx 1.24.0</List.Item>
                  </List>
                </Stack>

                <Stack gap="xs">
                  <Text fw={500} size="sm">Status</Text>
                  <List size="sm" spacing="xs">
                    <List.Item>Uptime: 32 days, 5 hours</List.Item>
                    <List.Item>Load Average: 4.2, 3.8, 3.5</List.Item>
                    <List.Item>Temperature: 42°C</List.Item>
                    <List.Item>Last Reboot: Jun 15, 2023 08:45 AM</List.Item>
                  </List>
                </Stack>
              </SimpleGrid>
            </Card>
          </>
        )}

        {viewType === 'servers' && (
          <>
            <Paper withBorder p="md">
              <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Server</Table.Th>
                    <Table.Th>CPU</Table.Th>
                    <Table.Th>Memory</Table.Th>
                    <Table.Th>Disk</Table.Th>
                    <Table.Th>Network</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Uptime</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {serversList.map((server, index) => (
                    <Table.Tr key={index}>
                      <Table.Td fw={500}>{server.name}</Table.Td>
                      <Table.Td>
                        <Group gap={10}>
                          <Progress 
                            value={server.cpu} 
                            color={getResourceColor(server.cpu)} 
                            size="sm" 
                            w={100} 
                          />
                          <Text size="sm">{server.cpu}%</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={10}>
                          <Progress 
                            value={server.memory} 
                            color={getResourceColor(server.memory)} 
                            size="sm" 
                            w={100} 
                          />
                          <Text size="sm">{server.memory}%</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={10}>
                          <Progress 
                            value={server.disk} 
                            color={getResourceColor(server.disk)} 
                            size="sm" 
                            w={100} 
                          />
                          <Text size="sm">{server.disk}%</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>{server.network}</Table.Td>
                      <Table.Td>
                        <Badge 
                          color={server.status === 'Online' ? 'green' : 'orange'} 
                          variant="light"
                        >
                          {server.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{server.uptime}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>

            <SimpleGrid cols={{ base: 1, md: 2 }}>
              <Card withBorder padding="lg" radius="md">
                <Text fw={500} mb="sm">Resource Alerts</Text>
                <Stack gap="xs">
                  <Paper withBorder p="sm" radius="md">
                    <Group mb={5}>
                      <ThemeIcon color="red" variant="light">
                        <IconAlertTriangle size="1rem" />
                      </ThemeIcon>
                      <Text fw={500} size="sm">High CPU Usage - Server 02</Text>
                      <Badge size="sm" variant="light" color="red">Critical</Badge>
                    </Group>
                    <Text size="xs" c="dimmed">CPU usage above 80% for more than 15 minutes</Text>
                  </Paper>
                  
                  <Paper withBorder p="sm" radius="md">
                    <Group mb={5}>
                      <ThemeIcon color="orange" variant="light">
                        <IconAlertTriangle size="1rem" />
                      </ThemeIcon>
                      <Text fw={500} size="sm">High Disk Usage - Server 04</Text>
                      <Badge size="sm" variant="light" color="orange">Warning</Badge>
                    </Group>
                    <Text size="xs" c="dimmed">Disk usage over 90% - consider cleanup</Text>
                  </Paper>
                  
                  <Paper withBorder p="sm" radius="md">
                    <Group mb={5}>
                      <ThemeIcon color="yellow" variant="light">
                        <IconInfoCircle size="1rem" />
                      </ThemeIcon>
                      <Text fw={500} size="sm">Memory Usage Increasing - Server 03</Text>
                      <Badge size="sm" variant="light" color="yellow">Notice</Badge>
                    </Group>
                    <Text size="xs" c="dimmed">Memory usage increased by 15% in the last hour</Text>
                  </Paper>
                </Stack>
              </Card>

              <Card withBorder padding="lg" radius="md">
                <Text fw={500} mb="sm">User Activity by Server</Text>
                <Group gap="xl" justify="center" py="md">
                  {[
                    { server: 'Server 01', users: 158, color: 'blue' },
                    { server: 'Server 02', users: 86, color: 'green' },
                    { server: 'Server 03', users: 42, color: 'grape' },
                    { server: 'Server 04', users: 12, color: 'orange' },
                    { server: 'Server 05', users: 5, color: 'gray' },
                  ].map((item) => (
                    <Stack key={item.server} align="center" gap={5}>
                      <ThemeIcon size="md" radius="md" color={item.color}>
                        <IconUsersGroup size="1rem" />
                      </ThemeIcon>
                      <Text fw={500}>{item.users}</Text>
                      <Text size="xs" c="dimmed">{item.server}</Text>
                    </Stack>
                  ))}
                </Group>
                <Divider my="md" />
                <Group justify="space-between">
                  <Text size="sm">Total Active Users</Text>
                  <Text fw={700}>303</Text>
                </Group>
              </Card>
            </SimpleGrid>
          </>
        )}

        {viewType === 'disk' && (
          <>
            <SimpleGrid cols={{ base: 1, md: 2 }}>
              <Card withBorder padding="lg" radius="md">
                <Text fw={500} mb="md">Disk Space Allocation</Text>
                <DonutChart
                  data={diskData}
                  h={300}
                  withLabels
                  withTooltip
                  chartLabel="950 GB Used"
                />
              </Card>

              <Stack gap="md">
                <Card withBorder padding="lg" radius="md">
                  <Text fw={500} mb="md">Disk Usage Details</Text>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Type</Table.Th>
                        <Table.Th>Used</Table.Th>
                        <Table.Th>Total</Table.Th>
                        <Table.Th>Usage</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {diskData.map((item) => (
                        <Table.Tr key={item.name}>
                          <Table.Td>
                            <Group gap={10}>
                              <ThemeIcon size="sm" radius="xl" color={item.color}>
                                <IconDatabase size="0.75rem" />
                              </ThemeIcon>
                              <Text>{item.name}</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>{item.value} GB</Table.Td>
                          <Table.Td>
                            {item.name === 'System' ? '100 GB' : 
                             item.name === 'User Data' ? '250 GB' :
                             item.name === 'Media' ? '400 GB' : 
                             item.name === 'Backups' ? '300 GB' : 
                             item.name === 'Logs' ? '100 GB' : '150 GB'}
                          </Table.Td>
                          <Table.Td>
                            <Group gap={10}>
                              <Progress 
                                value={
                                  item.name === 'System' ? item.value / 1 : 
                                  item.name === 'User Data' ? item.value / 2.5 :
                                  item.name === 'Media' ? item.value / 4 : 
                                  item.name === 'Backups' ? item.value / 3 : 
                                  item.name === 'Logs' ? item.value / 1 : item.value / 1.5
                                } 
                                color={item.color} 
                                size="sm" 
                                w={80} 
                              />
                              <Text size="xs">
                                {Math.round(
                                  item.name === 'System' ? item.value / 1 : 
                                  item.name === 'User Data' ? item.value / 2.5 :
                                  item.name === 'Media' ? item.value / 4 : 
                                  item.name === 'Backups' ? item.value / 3 : 
                                  item.name === 'Logs' ? item.value / 1 : item.value / 1.5
                                )}%
                              </Text>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Card>

                <Card withBorder padding="lg" radius="md">
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>Disk I/O Performance</Text>
                    <Badge color="green" variant="light">Normal</Badge>
                  </Group>
                  <SimpleGrid cols={2}>
                    <Stack align="center" gap="xs">
                      <RingProgress
                        size={80}
                        thickness={8}
                        roundCaps
                        sections={[{ value: 42, color: 'blue' }]}
                        label={
                          <Group gap={0}>
                            <IconCloudDownload size="1.2rem" color="blue" />
                          </Group>
                        }
                      />
                      <Text size="sm" ta="center">Read</Text>
                      <Text size="xs" c="dimmed" ta="center">85 MB/s</Text>
                    </Stack>
                    <Stack align="center" gap="xs">
                      <RingProgress
                        size={80}
                        thickness={8}
                        roundCaps
                        sections={[{ value: 28, color: 'violet' }]}
                        label={
                          <Group gap={0}>
                            <IconCloudUpload size="1.2rem" color="violet" />
                          </Group>
                        }
                      />
                      <Text size="sm" ta="center">Write</Text>
                      <Text size="xs" c="dimmed" ta="center">56 MB/s</Text>
                    </Stack>
                  </SimpleGrid>
                </Card>
              </Stack>
            </SimpleGrid>
          </>
        )}
      </Stack>
    </Container>
  );
}

// Helper components
interface ResourceCardProps {
  title: string;
  value: string;
  usage: number;
  icon: React.ReactNode;
  color: string;
}

function ResourceCard({ title, value, usage, icon, color }: ResourceCardProps) {
  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between" mb={5} align="flex-start">
        <div>
          <Text c="dimmed" tt="uppercase" fw={500} size="xs">
            {title}
          </Text>
          <Text fw={700} size="xl" mb={10}>
            {value}
          </Text>
        </div>
        <ThemeIcon size="lg" radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
      </Group>
      <Progress value={usage} color={color} size="md" />
    </Card>
  );
} 