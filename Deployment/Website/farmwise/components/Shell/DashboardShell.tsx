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
  Button,
  Modal,
  CloseButton,
  Paper,
  Transition,
  Notification,
  Center,
  List,
  Indicator,
  Flex,
  Image as MantineImage,
  Title,
  Card
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
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
  IconMap2,
  IconDroplet,
  IconTractor,
  IconDeviceAnalytics,
  IconSun,
  IconMoon,
  IconInfoCircle,
  IconMessageChatbot,
  IconBrandHipchat,
  IconBug,
  IconLayoutDashboard,
  IconBuildingWarehouse,
  IconListDetails,
  IconBrain,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconShoppingCart,
  IconChevronRight,
  IconMenu2,
  IconSearch,
  IconHelp,
  IconHome
} from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import { AiChatInterface } from '../AiChat/AiChatInterface';
import authService from '../../app/api/auth';
import classes from './Shell.module.css';

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

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpened, { toggle: toggleMobileNav }] = useDisclosure(false);
  const [aiModalOpened, { open: openAiModal, close: closeAiModal }] = useDisclosure(false);
  const [logoutModalOpened, { open: openLogoutModal, close: closeLogoutModal }] = useDisclosure(false);
  const [isAiFullScreen, setIsAiFullScreen] = useState(false);
  const pathname = usePathname();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [searchActive, setSearchActive] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Add state for notifications
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Soil moisture below threshold', message: 'Field B requires irrigation soon', color: 'blue', date: new Date() },
    { id: '2', title: 'Disease risk increased', message: 'High humidity levels detected in Field A', color: 'red', date: new Date(Date.now() - 86400000) }, // 1 day ago
    { id: '3', title: 'Equipment maintenance due', message: 'Tractor #2 is due for regular maintenance', color: 'yellow', date: new Date(Date.now() - 172800000) }, // 2 days ago
  ]);
  
  const [notificationsMenuOpened, { open: openNotificationsMenu, close: closeNotificationsMenu }] = useDisclosure(false);
  
  // Set mounted to true once component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use consistent color handling that works with SSR and client-side rendering
  const logoTextColor = mounted ? (colorScheme === 'dark' ? 'white' : 'dark.8') : 'inherit';

  // Dashboard related
  const dashboardItems: NavItemProps[] = [
    { 
      icon: IconHome, 
      color: 'blue', 
      label: 'Dashboard', 
      path: '/dashboard',
    },
    { 
      icon: IconChartInfographic, 
      color: 'teal', 
      label: 'Analytics', 
      path: '/dashboard/analytics'
    },
    { 
      icon: IconFileAnalytics,
      color: 'indigo',
      label: 'Reports',
      path: '/dashboard/reports',
    }
  ];

  // Crop management
  const cropItems: NavItemProps[] = [
    { 
      icon: IconPlant2, 
      color: 'green', 
      label: 'Crop Health', 
      path: '/dashboard/crop-health',
      badge: {
        text: '3',
        color: 'red'
      }
    },
    { 
      icon: IconCalendarStats, 
      color: 'grape', 
      label: 'Planning', 
      path: '/dashboard/planning',
      children: [
        { title: 'Crop Calendar', path: '/dashboard/planning/calendar' },
        { title: 'Rotation Schedule', path: '/dashboard/planning/rotation' },
        { title: 'Resource Planning', path: '/dashboard/planning/resources' },
      ]
    },
    {
      icon: IconBug,
      color: 'red',
      label: 'Weed Detection',
      path: '/dashboard/weed-detection',
    }
  ];

  // Farm operations
  const farmOpsItems: NavItemProps[] = [
    {
      icon: IconMap2,
      color: 'orange',
      label: 'Field Mapping',
      path: '/dashboard/mapping',
    },
    {
      icon: IconDroplet,
      color: 'blue',
      label: 'Irrigation',
      path: '/dashboard/irrigation',
    },
    {
      icon: IconListDetails,
      color: 'lime',
      label: 'Farm Tracker',
      path: '/dashboard/tracker',
    }
  ];

  // Resources
  const resourceItems: NavItemProps[] = [
    {
      icon: IconTractor,
      color: 'yellow',
      label: 'Equipment',
      path: '/dashboard/equipment',
    },
    {
      icon: IconBuildingWarehouse,
      color: 'brown',
      label: 'Inventory',
      path: '/dashboard/inventory',
    },
    {
      icon: IconShoppingCart,
      color: 'violet',
      label: 'Marketplace',
      path: '/dashboard/marketplace',
    }
  ];

  // Tools & Utilities
  const utilityItems: NavItemProps[] = [
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
      icon: IconBrain,
      color: 'grape',
      label: 'AI Advisor',
      path: '/dashboard/ai-advisor',
    },
    {
      icon: IconInfoCircle,
      color: 'blue',
      label: 'Help & Support',
      path: '/dashboard/help-support',
    }
  ];

  // Generate navigation links with collapsible sections
  const renderNavSection = (title: string, items: NavItemProps[]) => {
    return (
      <Box className={classes.navSection}>
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" className={classes.sectionTitle}>{title}</Text>
        {items.map((item) => {
          // Special case for the root dashboard link
          const isRootDashboard = item.path === '/dashboard';
          const isActive = isRootDashboard 
            ? pathname === item.path // Only match exactly for root dashboard
            : (pathname === item.path || pathname?.startsWith(item.path + '/')); // Existing logic for others
          
          return (
            <NavLink
              key={item.path}
              active={isActive}
              label={item.label}
              classNames={{
                root: classes.navLink,
                label: classes.navLinkLabel,
                body: classes.navLinkBody,
              }}
              leftSection={
                <ThemeIcon color={item.color} variant={isActive ? 'filled' : 'light'} size={32} className={classes.navIcon}>
                  <item.icon style={{ width: rem(18), height: rem(18) }} />
                </ThemeIcon>
              }
              rightSection={
                item.badge ? (
                  <Badge size="sm" color={item.badge.color} variant="filled">
                    {item.badge.text}
                  </Badge>
                ) : item.children ? (
                  <IconChevronRight 
                    style={{ width: rem(14), height: rem(14) }} 
                    className={classes.navChevron}
                  />
                ) : null
              }
              component={Link}
              href={item.path}
              childrenOffset={24}
            >
              {item.children?.map((child) => (
                <NavLink
                  key={child.path}
                  label={child.title}
                  component={Link}
                  href={child.path}
                  active={pathname === child.path}
                  classNames={{
                    root: classes.navLinkChild,
                    label: classes.navLinkChildLabel,
                  }}
                />
              ))}
            </NavLink>
          );
        })}
      </Box>
    );
  };

  // Determine if the AI button should be visible
  const showAiButton = pathname !== '/dashboard/ai-advisor';

  // Custom title for the modal including the fullscreen toggle
  const modalTitle = (
    <Group justify="space-between" style={{ width: '100%' }}>
      <Text fw={500}>AI Advisor</Text>
      <Tooltip label={isAiFullScreen ? "Exit full screen" : "Enter full screen"} position="left" withArrow>
        <ActionIcon variant="subtle" onClick={() => setIsAiFullScreen((p) => !p)}>
          {isAiFullScreen ? <IconArrowsMinimize size={18} /> : <IconArrowsMaximize size={18} />}
        </ActionIcon>
      </Tooltip>
    </Group>
  );

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

  return (
    <AppShell
      header={{ height: { base: 60, md: 70 } }}
      navbar={{ 
        width: { base: 280, lg: 300 }, 
        breakpoint: 'sm',
        collapsed: { mobile: !mobileNavOpened }
      }}
      padding="md"
      classNames={{
        main: classes.mainContent,
      }}
      suppressHydrationWarning={true}
    >
      <AppShell.Header className={classes.header}>
        <Group h="100%" px="md" className={classes.headerInner}>
          <Group>
            <Burger opened={mobileNavOpened} onClick={toggleMobileNav} hiddenFrom="sm" size="sm" />
            <Link href="/dashboard" style={{ textDecoration: 'none' }} className={classes.logoContainer}>
              <Group gap={8}>
                <Image src="/favicon.svg" alt="FarmWise Logo" width={36} height={36} className={classes.logo} />
                <Title order={3} className={classes.logoText} c={logoTextColor}>
                  FarmWise
                </Title>
              </Group>
            </Link>
          </Group>

          <Group gap={isMobile ? "xs" : "sm"} className={classes.headerControls}>
            {!isMobile && (
              <ActionIcon
                variant="light"
                radius="xl"
                size="lg"
                aria-label="Search"
                className={classes.searchButton}
                onClick={() => setSearchActive(true)}
              >
                <IconSearch style={{ width: rem(18), height: rem(18) }} />
              </ActionIcon>
            )}

            <Indicator 
              disabled={notifications.length === 0} 
              color="red" 
              size={16} 
              offset={4}
              position="top-end"
              withBorder
            >
              <Menu shadow="md" width={320} position="bottom-end" closeOnItemClick={false} opened={notificationsMenuOpened} onChange={notificationsMenuOpened ? closeNotificationsMenu : openNotificationsMenu}>
                <Menu.Target>
                  <ActionIcon variant="subtle" radius="xl" size="lg" color="gray" className={classes.actionIcon}>
                    <IconBell style={{ width: rem(20), height: rem(20) }} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Box p="xs">
                    <Group justify="space-between" mb="xs">
                      <Text fw={600}>Notifications</Text>
                      {notifications.length > 0 && (
                        <Button 
                          variant="subtle" 
                          color="gray" 
                          size="xs"
                          onClick={handleClearAllNotifications}
                        >
                          Clear All
                        </Button>
                      )}
                    </Group>
                  </Box>
                  
                  <Divider />
                  
                  <ScrollArea h={notifications.length > 0 ? 320 : 'auto'} scrollbarSize={6}>
                    {notifications.length > 0 ? (
                      <Stack gap={0}>
                        {notifications.map((notification) => (
                          <Box key={notification.id} p="xs" className={classes.notification}>
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
            </Indicator>

            <ColorSchemeToggle />

            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton className={classes.userButton}>
                  <Group gap={isMobile ? 4 : 8}>
                    <Avatar color="green" radius="xl" className={classes.avatar}>{getUserInitials()}</Avatar>
                    <Box style={{ flex: 1 }} visibleFrom="sm" className={classes.userInfo}>
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
                <Menu.Item leftSection={<IconHelp size={14} />} component={Link} href="/dashboard/help-support">
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
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className={classes.navbar}>
        <ScrollArea type="hover" scrollbarSize={6} className={classes.navScrollArea}>
          <Stack gap="md" className={classes.navStack}>
            {renderNavSection('Dashboard', dashboardItems)}
            {renderNavSection('Crop Management', cropItems)}
            {renderNavSection('Farm Operations', farmOpsItems)}
            {renderNavSection('Resources', resourceItems)}
            {renderNavSection('Tools & Utilities', utilityItems)}
          </Stack>
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>

      {/* AI Chat Modal */}
      <Modal 
        opened={aiModalOpened} 
        onClose={() => {
            closeAiModal();
            setIsAiFullScreen(false);
        }} 
        title={modalTitle}
        fullScreen={isAiFullScreen}
        transitionProps={{ transition: 'fade', duration: 200 }}
        overlayProps={{
           backgroundOpacity: 0.55,
           blur: 3,
         }}
        radius={isAiFullScreen ? 0 : "md" }
      >
        <AiChatInterface isFullScreen={isAiFullScreen} />
      </Modal>

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
          <Button variant="default" onClick={closeLogoutModal}>
            Cancel
          </Button>
          <Button color="red" onClick={handleLogoutConfirm}>
            Logout
          </Button>
        </Group>
      </Modal>
    </AppShell>
  );
}