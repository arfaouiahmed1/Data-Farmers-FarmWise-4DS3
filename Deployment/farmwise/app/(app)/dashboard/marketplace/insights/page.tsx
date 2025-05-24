'use client';

import {
  Container,
  Title,
  Group,
  Paper,
  Text,
  Card,
  SimpleGrid,
  ThemeIcon,
  Stack,
  Button,
  Badge,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconTrendingUp,
  IconTrendingDown,
  IconChartBar,
  IconMapPin,
  IconTractor,
  IconInfoCircle,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import classes from '../Marketplace.module.css';

// Basic marketplace statistics

const marketStatistics = [
  {
    title: 'Total Listings',
    value: 3842,
    diff: 12.4,
    icon: IconChartBar,
    color: 'blue'
  },
  {
    title: 'Active Transactions',
    value: 245,
    diff: 8.2,
    icon: IconTrendingUp,
    color: 'green'
  },
  {
    title: 'Land Prices',
    value: '19,500 TND/ha',
    diff: 6.5,
    icon: IconMapPin,
    color: 'teal'
  },
  {
    title: 'Equipment Rentals',
    value: 578,
    diff: -3.2,
    icon: IconTractor,
    color: 'orange'
  },
];

export default function MarketInsightsPage() {
  const router = useRouter();

  return (
    <Container fluid px="md">
      <Group mb="xl">
        <Button variant="subtle" leftSection={<IconArrowLeft size={18} />} component={Link} href="/dashboard/marketplace">
          Back to Marketplace
        </Button>
        <Title className={classes.pageTitle}>Market Insights</Title>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} mb="md">
        {marketStatistics.map((stat) => (
          <Card key={stat.title} withBorder p="md" radius="md">
            <Group justify="space-between">
              <Text size="lg" fw={500}>{stat.title}</Text>
              <ThemeIcon
                color="green"
                variant="light"
                size="lg"
                radius="md"
                style={{ backgroundColor: 'var(--farmGreen)', color: 'white' }}
              >
                <stat.icon size={20} />
              </ThemeIcon>
            </Group>

            <Group mt="md" align="baseline">
              <Text size="xl" fw={700} style={{ color: 'var(--farmGreen)' }}>{stat.value}</Text>
              <Badge
                color={stat.diff > 0 ? 'green' : 'red'}
                leftSection={stat.diff > 0 ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />}
                style={{ backgroundColor: stat.diff > 0 ? 'var(--farmGreen)' : 'var(--mantine-color-red-6)' }}
              >
                {stat.diff > 0 ? '+' : ''}{stat.diff}%
              </Badge>
            </Group>

            <Text size="xs" c="dimmed" mt={5}>Compared to previous month</Text>
          </Card>
        ))}
      </SimpleGrid>

      <Card withBorder p="md" radius="md">
        <Group gap="xs" mb="md">
          <ThemeIcon radius="xl" size="sm" color="blue" variant="light">
            <IconInfoCircle size={14} />
          </ThemeIcon>
          <Title order={3}>Market Overview</Title>
        </Group>
        <Text>
          The FarmWise marketplace continues to grow with active participation from farmers and agricultural businesses across Tunisia.
          Our platform facilitates connections between buyers and sellers for land, equipment, and agricultural resources.
        </Text>
      </Card>
    </Container>
  );
}