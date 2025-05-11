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
  Modal,
  CloseButton,
  Paper,
  Center,
  List,
  Flex,
  Title,
  Indicator,
  Collapse,
  MantineTheme
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconLeaf,
  IconDashboard,
  IconPlant2, 
  IconChartInfographic,
  IconCloud, 
  IconUser, 
  IconSettings, 
  IconLogout,
  IconBell,
  IconCalendarStats,
  IconFileAnalytics,
  IconDroplet,
  IconTractor,
  IconDeviceAnalytics,
  IconSun,
  IconMoon,
  IconInfoCircle,
  IconBuildingWarehouse,
  IconListDetails,
  IconShoppingCart,
  IconChevronRight,
  IconSearch,
  IconHome
} from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import authService from '../../app/api/auth';
import classes from './Shell.module.css';

interface NavItem {
  icon: any;
  color: string;
  label: string;
  path: string;
  badge?: {
    text: string;
    color: string;
  };
  children?: Array<{
    title: string;
    path: string;
  }>;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpened, { toggle: toggleMobileNav }] = useDisclosure(false);
  const [logoutModalOpened, { open: openLogoutModal, close: closeLogoutModal }] = useDisclosure(false);
  const pathname = usePathname();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  // Add state for notifications
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Soil moisture below threshold', message: 'Field B requires irrigation soon', color: 'blue', date: new Date() },
    { id: '2', title: 'Disease risk increased', message: 'High humidity levels detected in Field A', color: 'red', date: new Date(Date.now() - 86400000) }, // 1 day ago
    { id: '3', title: 'Equipment maintenance due', message: 'Tractor #2 is due for regular maintenance', color: 'yellow', date: new Date(Date.now() - 172800000) }, // 2 days ago
  ]);
  const [notificationsMenuOpened, { open: openNotificationsMenu, close: closeNotificationsMenu }] = useDisclosure(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Set mounted to true once component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Force a re-render when colorScheme changes to ensure consistent styling
  useEffect(() => {
    if (mounted) {
      // Apply any client-side-only style adjustments here if needed
      const htmlElement = document.documentElement;
      if (colorScheme === 'dark') {
        htmlElement.setAttribute('data-mantine-color-scheme', 'dark');
      } else {
        htmlElement.setAttribute('data-mantine-color-scheme', 'light');
      }
    }
  }, [colorScheme, mounted]);

  // Default text color to use for server-side rendering
  const textColor = "green.7"; // Default for server render
  
  // Only use conditional colors when mounted (client-side)
  const logoTextColor = mounted ? (colorScheme === 'dark' ? 'white' : 'green.7') : textColor;

  // Core navigation items
  const mainNavItems: NavItem[] = [
    { 
      icon: IconHome, 
      color: 'blue', 
      label: 'Dashboard', 
      path: '/dashboard'
    },
    { 
      icon: IconCalendarStats, 
      color: 'grape', 
      label: 'Planning', 
      path: '/dashboard/planning',
      children: [
        { title: 'Crop Calendar', path: '/dashboard/planning/calendar' },
        { title: 'Seasonal Planning', path: '/dashboard/planning/season' },
        { title: 'Crop Health', path: '/dashboard/crop-health' }
      ]
    },
    { 
      icon: IconCloud, 
      color: 'cyan', 
      label: 'Weather', 
      path: '/dashboard/weather',
      badge: {
        text: 'Updated',
        color: 'blue'
      }
    },
    { 
      icon: IconFileAnalytics,
      color: 'indigo',
      label: 'Reports',
      path: '/dashboard/reports',
    }
  ];

  // Farm management items
  const managementNavItems: NavItem[] = [
    {
      icon: IconTractor,
      color: 'yellow',
      label: 'Equipment',
      path: '/dashboard/equipment',
    },
    {
      icon: IconDroplet,
      color: 'blue',
      label: 'Irrigation',
      path: '/dashboard/irrigation',
    },
    {
      icon: IconBuildingWarehouse,
      color: 'brown',
      label: 'Inventory',
      path: '/dashboard/inventory',
    },
    {
      icon: IconListDetails,
      color: 'lime',
      label: 'Farm Log / Tracker',
      path: '/dashboard/tracker',
    },
    {
      icon: IconShoppingCart,
      color: 'violet',
      label: 'Marketplace',
      path: '/dashboard/marketplace',
    }
  ];

  // Load user data
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const fetchUserData = () => {
      const user = authService.getCurrentUser();
      if (user) {
        setUserData(user);
      }
    };
    
    fetchUserData();
  }, []);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData || !userData.first_name) return 'U';
    
    const first = userData.first_name.charAt(0);
    const last = userData.last_name ? userData.last_name.charAt(0) : '';
    return (first + last).toUpperCase();
  };

  // Get user type/role
  const getUserRole = () => {
    if (!userData || !userData.profile) return 'User';
    
    switch (userData.profile.user_type) {
      case 'FARMER':
        return 'Farmer';
      case 'AGRONOMIST':
        return 'Agronomist';
      case 'ADMIN':
        return 'Administrator';
      default:
        return userData.profile.user_type || 'User';
    }
  };

  const handleLogoutConfirm = () => {
    closeLogoutModal();
    authService.logout();
    // The redirect is handled in the authService
  };

  // Handle clearing a notification
  const handleClearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Handle clearing all notifications
  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Format date for notifications
  const formatNotificationDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ 
        width: 250, 
        breakpoint: "sm",
        collapsed: { mobile: !mobileNavOpened }
      }}
      padding="xs"
      classNames={{
        navbar: classes.navbar,
        header: classes.header
      }}
      styles={{
        main: {
          backgroundColor: 'var(--mantine-color-body)',
          height: '100vh',
          overflow: 'auto'
        }
      }}
      suppressHydrationWarning={true}
    >
      <AppShell.Header>
        <Flex h="100%" px="md" align="center" justify="space-between">
          <Group>
            <Burger opened={mobileNavOpened} onClick={toggleMobileNav} hiddenFrom="sm" size="sm" />
            <Link href="/dashboard" className={classes.logoContainer}>
              <Image src="/favicon.svg" alt="FarmWise Logo" width={32} height={32} />
              <Text className={classes.logoText} c={logoTextColor}>
                FarmWise
              </Text>
            </Link>
          </Group>

          <Group>
            <ActionIcon className={classes.searchButton} variant="subtle" radius="xl" size="md" color="gray">
              <IconSearch style={{ width: rem(18), height: rem(18) }} />
            </ActionIcon>
            
            <Menu shadow="md" width={320} position="bottom-end" closeOnItemClick={false} opened={notificationsMenuOpened} onChange={notificationsMenuOpened ? closeNotificationsMenu : openNotificationsMenu}>
              <Menu.Target>
                <Indicator disabled={notifications.length === 0} color="red" size={8} offset={4}>
                  <ActionIcon className={classes.searchButton} variant="subtle" radius="xl" size="md" color="gray">
                    <IconBell style={{ width: rem(18), height: rem(18) }} />
                  </ActionIcon>
                </Indicator>
              </Menu.Target>
              <Menu.Dropdown>
                <Box p="xs">
                  <Group justify="space-between" mb="xs">
                    <Text fw={600}>Notifications</Text>
                    {notifications.length > 0 && (
                      <CloseButton 
                        size="xs" 
                        onClick={handleClearAllNotifications}
                        title="Clear all notifications"
                      />
                    )}
                  </Group>
                </Box>
                
                <Divider />
                
                <ScrollArea h={notifications.length > 0 ? 320 : 'auto'} scrollbarSize={6}>
                  {notifications.length > 0 ? (
                    <Stack gap={0}>
                      {notifications.map((notification) => (
                        <Box key={notification.id} p="xs" style={{ position: 'relative' }}>
                          <Group justify="space-between" mb={4}>
                            <Group>
                              <Badge color={notification.color} size="sm" variant="filled" />
                              <Text size="sm" fw={600}>{notification.title}</Text>
                            </Group>
                            <CloseButton 
                              size="xs" 
                              onClick={() => handleClearNotification(notification.id)}
                              title="Clear notification"
                              aria-label="Clear notification"
                            />
                          </Group>
                          <Text size="xs" color="dimmed" ml={28}>{notification.message}</Text>
                          <Text size="xs" color="dimmed" ta="right" mt={5} style={{ fontStyle: 'italic' }}>
                            {formatNotificationDate(notification.date)}
                          </Text>
                          <Divider mt={8} />
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Center p="xl">
                      <Box ta="center" py={20}>
                        <IconBell size={40} opacity={0.3} />
                        <Text c="dimmed" size="sm" mt={10}>No notifications</Text>
                      </Box>
                    </Center>
                  )}
                </ScrollArea>
              </Menu.Dropdown>
            </Menu>

            <ColorSchemeToggle />

            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton className={classes.userMenu}>
                  <Group gap={8}>
                    <Avatar className={classes.avatar} color="green" radius="xl">{getUserInitials()}</Avatar>
                    <Box style={{ flex: 1 }} visibleFrom="sm">
                      <Text size="sm" fw={500}>{userData?.first_name} {userData?.last_name || 'User'}</Text>
                      <Text c="dimmed" size="xs">{getUserRole()}</Text>
                    </Box>
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item leftSection={<IconUser size={14} />} component={Link} href="/dashboard/profile">
                  Profile
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={14} />} component={Link} href="/dashboard/settings">
                  Settings
                </Menu.Item>
                <Menu.Item leftSection={<IconInfoCircle size={14} />} component={Link} href="/dashboard/help-support">
                  Help & Support
                </Menu.Item>
                <Divider />
                <Menu.Item
                  leftSection={<IconLogout size={14} />}
                  color="red"
                  onClick={openLogoutModal}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <AppShell.Section grow component={ScrollArea} mx="-xs" px="xs">
          <Box mb="md" mt="md">
            <Text className={classes.sectionTitle}>MAIN</Text>
            {mainNavItems.map((item) => {
              // Special case for the root dashboard link
              const isRootDashboard = item.path === '/dashboard';
              const isActive = isRootDashboard 
                ? pathname === item.path // Only match exactly for root dashboard
                : (pathname === item.path || pathname?.startsWith(item.path + '/'));
              
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedSection === item.label;
              
              return (
                <Box key={item.path}>
                  <NavLink
                    className={isActive ? `${classes.navLink} ${classes.navLinkActive}` : classes.navLink}
                    active={isActive}
                    label={
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="sm">
                          <ThemeIcon color={item.color} variant={isActive ? 'filled' : 'light'} size={28} radius="md">
                            <item.icon style={{ width: rem(16), height: rem(16) }} />
                          </ThemeIcon>
                          <Text size="sm">{item.label}</Text>
                        </Group>
                        {item.badge && (
                          <Badge size="xs" color={item.badge.color} variant="filled">
                            {item.badge.text}
                          </Badge>
                        )}
                      </Group>
                    }
                    rightSection={hasChildren ? (
                      <IconChevronRight 
                        size={14} 
                        style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 200ms ease' }} 
                      />
                    ) : null}
                    onClick={hasChildren ? () => toggleSection(item.label) : undefined}
                    component={hasChildren ? 'div' : Link as any}
                    href={hasChildren ? undefined : item.path}
                  />
                  
                  {hasChildren && (
                    <Collapse in={isExpanded}>
                      <Box pl={44}>
                        {item.children?.map((child) => (
                          <NavLink
                            key={child.path}
                            className={classes.navLink}
                            label={<Text size="xs">{child.title}</Text>}
                            component={Link as any}
                            href={child.path}
                            active={pathname === child.path}
                            pl="xs"
                          />
                        ))}
                      </Box>
                    </Collapse>
                  )}
                </Box>
              );
            })}
          </Box>
          
          <Box mb="md">
            <Text className={classes.sectionTitle}>MANAGEMENT</Text>
            {managementNavItems.map((item) => {
              const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
              
              return (
                <NavLink
                  key={item.path}
                  className={isActive ? `${classes.navLink} ${classes.navLinkActive}` : classes.navLink}
                  active={isActive}
                  label={
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="sm">
                        <ThemeIcon color={item.color} variant={isActive ? 'filled' : 'light'} size={28} radius="md">
                          <item.icon style={{ width: rem(16), height: rem(16) }} />
                        </ThemeIcon>
                        <Text size="sm">{item.label}</Text>
                      </Group>
                      {item.badge && (
                        <Badge size="xs" color={item.badge.color} variant="filled">
                          {item.badge.text}
                        </Badge>
                      )}
                    </Group>
                  }
                  component={Link as any}
                  href={item.path}
                />
              );
            })}
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>

      {/* Logout Confirmation Modal */}
      <Modal
        opened={logoutModalOpened}
        onClose={closeLogoutModal}
        title="Confirm Logout"
        centered
        size="sm"
      >
        <Text size="sm">Are you sure you want to log out?</Text>
        <Group justify="flex-end" mt="md">
          <CloseButton onClick={closeLogoutModal}>
            Cancel
          </CloseButton>
          <ActionIcon variant="filled" color="red" onClick={handleLogoutConfirm} radius="xl" size="lg">
            <IconLogout size={18} />
          </ActionIcon>
        </Group>
      </Modal>
    </AppShell>
  );
}