'use client';

import React, { useState, useEffect } from 'react';
import { 
  AppShell, 
  Burger, 
  Group, 
  NavLink, 
  Text, 
  Avatar, 
  Menu, 
  Divider,
  UnstyledButton,
  Box,
  ThemeIcon,
  rem,
  ScrollArea,
  Stack,
  Tooltip,
  Badge,
  useMantineColorScheme,
  ActionIcon,
  Affix,
  Button
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconUsersGroup,
  IconDashboard,
  IconServer, 
  IconFileAnalytics,
  IconSettings,
  IconLogout,
  IconBell,
  IconUser,
  IconSun,
  IconMoon,
  IconKey,
  IconShieldLock,
  IconDatabase,
  IconActivity,
  IconAlertTriangle,
  IconChartBar,
  IconDeviceAnalytics,
  IconMessage,
  IconBroadcast,
  IconWorldUpload,
  IconAdjustments,
  IconBuildingBank
} from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';

interface NavItemProps {
  icon: React.ElementType;
  color: string;
  label: string;
  path: string;
  badge?: {
    text: string;
    color: string;
  };
  children?: {
    title: string;
    path: string;
  }[];
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpened, { toggle: toggleMobileNav }] = useDisclosure(false);
  const [logoutModalOpened, { open: openLogoutModal, close: closeLogoutModal }] = useDisclosure(false);
  const pathname = usePathname();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  // Set mounted to true once component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, [pathname]);

  // Default text color to use for server-side rendering
  const textColor = "green.7"; 
  
  // Only use conditional colors when mounted (client-side)
  const logoTextColor = mounted ? (colorScheme === 'dark' ? 'white' : 'green.7') : textColor;

  // Main admin navigation items
  const mainNavItems: NavItemProps[] = [
    { 
      icon: IconDashboard, 
      color: 'indigo', 
      label: 'Admin Dashboard', 
      path: '/admin',
    },
    { 
      icon: IconUsersGroup, 
      color: 'blue', 
      label: 'User Management', 
      path: '/admin/users',
      children: [
        { title: 'All Users', path: '/admin/users' },
        { title: 'Roles & Permissions', path: '/admin/users/roles' },
        { title: 'User Activity', path: '/admin/users/activity' },
      ]
    },
    { 
      icon: IconServer, 
      color: 'cyan', 
      label: 'Resources', 
      path: '/admin/resources',
      badge: {
        text: 'Monitoring',
        color: 'green'
      },
      children: [
        { title: 'Server Status', path: '/admin/resources/server' },
        { title: 'Storage', path: '/admin/resources/storage' },
        { title: 'Performance', path: '/admin/resources/performance' },
      ]
    },
    { 
      icon: IconFileAnalytics, 
      color: 'grape', 
      label: 'Analytics', 
      path: '/admin/analytics',
      children: [
        { title: 'Usage Metrics', path: '/admin/analytics/usage' },
        { title: 'Traffic', path: '/admin/analytics/traffic' },
        { title: 'Business Insights', path: '/admin/analytics/insights' },
      ]
    }
  ];

  // System management items
  const systemNavItems: NavItemProps[] = [
    {
      icon: IconDatabase,
      color: 'orange',
      label: 'Database',
      path: '/admin/database',
      children: [
        { title: 'Backups', path: '/admin/database/backups' },
        { title: 'Maintenance', path: '/admin/database/maintenance' },
      ]
    },
    {
      icon: IconShieldLock,
      color: 'red',
      label: 'Security',
      path: '/admin/security',
      children: [
        { title: 'Logs', path: '/admin/security/logs' },
        { title: 'Threats', path: '/admin/security/threats' },
        { title: 'Settings', path: '/admin/security/settings' },
      ]
    },
    {
      icon: IconWorldUpload,
      color: 'teal',
      label: 'API Management',
      path: '/admin/api',
    },
    {
      icon: IconBroadcast,
      color: 'yellow',
      label: 'Notifications',
      path: '/admin/notifications',
      badge: {
        text: 'New',
        color: 'blue'
      }
    }
  ];

  // Settings navigation items
  const settingsNavItems: NavItemProps[] = [
    {
      icon: IconAdjustments,
      color: 'violet',
      label: 'System Settings',
      path: '/admin/settings/system',
    },
    {
      icon: IconBuildingBank,
      color: 'lime',
      label: 'Billing & Subscriptions',
      path: '/admin/settings/billing',
    }
  ];

  // Generate all navigation links
  const renderNavLinks = (items: NavItemProps[]) => {
    return items.map((item) => {
      const isRootAdmin = item.path === '/admin';
      const isActive = isRootAdmin 
        ? pathname === item.path 
        : (pathname === item.path || pathname?.startsWith(item.path + '/'));
      
      return (
        <NavLink
          key={item.path}
          active={isActive}
          label={item.label}
          leftSection={
            <ThemeIcon color={item.color} variant={isActive ? 'filled' : 'light'} size={30}>
              <item.icon style={{ width: rem(18), height: rem(18) }} />
            </ThemeIcon>
          }
          rightSection={
            item.badge && (
              <Badge size="sm" color={item.badge.color} variant="filled">
                {item.badge.text}
              </Badge>
            )
          }
          component={Link}
          href={item.path}
          childrenOffset={28}
        >
          {item.children?.map((child) => (
            <NavLink
              key={child.path}
              label={child.title}
              component={Link}
              href={child.path}
              active={pathname === child.path}
            />
          ))}
        </NavLink>
      );
    });
  };

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ 
        width: 280, 
        breakpoint: 'sm', 
        collapsed: { mobile: !mobileNavOpened } 
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={mobileNavOpened}
              onClick={toggleMobileNav}
              hiddenFrom="sm"
              size="sm"
            />
            <Group>
              <Image src="/logo.svg" alt="FarmWise Logo" width={36} height={36} />
              <Text fw={700} size="lg" c={logoTextColor}>
                FarmWise<Text span c="blue.6" inherit>Admin</Text>
              </Text>
            </Group>
          </Group>

          <Group>
            {/* Notifications */}
            <Menu shadow="md" width={320} position="bottom-end">
              <Menu.Target>
                <Tooltip label="Notifications">
                  <ActionIcon variant="subtle" size="lg" radius="md" color="gray">
                    <IconBell size="1.3rem" />
                    <Box
                      style={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'red',
                      }}
                    />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>System Notifications</Menu.Label>
                <Menu.Item leftSection={<IconAlertTriangle size="1rem" color="red" />}>
                  Server load at 85% - 12 min ago
                </Menu.Item>
                <Menu.Item leftSection={<IconActivity size="1rem" color="orange" />}>
                  Unusual login activity detected - 45 min ago
                </Menu.Item>
                <Menu.Item leftSection={<IconMessage size="1rem" color="blue" />}>
                  3 new support tickets - 2 hours ago
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item fw={500} color="blue">
                  View all notifications
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            {/* Color scheme toggle */}
            <ColorSchemeToggle />

            {/* Admin profile menu */}
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap={10}>
                    <Avatar color="indigo" radius="xl">
                      <IconUser size="1.2rem" />
                    </Avatar>
                    <div>
                      <Text size="sm" fw={500}>
                        Admin User
                      </Text>
                      <Text size="xs" c="dimmed">
                        admin@farmwise.com
                      </Text>
                    </div>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Admin Panel</Menu.Label>
                <Menu.Item leftSection={<IconUser size="1rem" />}>
                  Profile
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size="1rem" />}>
                  Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<IconKey size="1rem" />}>
                  API Keys
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item 
                  leftSection={<IconLogout size="1rem" />} 
                  color="red"
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <ScrollArea type="scroll">
          <Stack gap="xs">
            {/* Main navigation */}
            <Box>
              {renderNavLinks(mainNavItems)}
            </Box>

            <Divider />
            <Text size="xs" fw={500} c="dimmed" px="sm">SYSTEM</Text>
            <Box>
              {renderNavLinks(systemNavItems)}
            </Box>

            <Divider />
            <Text size="xs" fw={500} c="dimmed" px="sm">SETTINGS</Text>
            <Box>
              {renderNavLinks(settingsNavItems)}
            </Box>

            <Divider my="sm" />
            <Box px="sm">
              <Button 
                fullWidth 
                variant="subtle" 
                color="gray" 
                leftSection={<IconLogout size="1rem" />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          </Stack>
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
} 