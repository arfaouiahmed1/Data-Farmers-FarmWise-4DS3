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
  Modal
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
  IconArrowsMinimize
} from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import { AiChatInterface } from '../AiChat/AiChatInterface';

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
  
  // Set mounted to true once component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, [pathname]);

  // Default text color to use for server-side rendering
  const textColor = "green.7"; // Default for server render
  
  // Only use conditional colors when mounted (client-side)
  const logoTextColor = mounted ? (colorScheme === 'dark' ? 'white' : 'green.7') : textColor;

  // Main navigation items
  const mainNavItems: NavItemProps[] = [
    { 
      icon: IconDashboard, 
      color: 'blue', 
      label: 'Dashboard', 
      path: '/dashboard',
    },
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
      icon: IconChartInfographic, 
      color: 'teal', 
      label: 'Analytics', 
      path: '/dashboard/analytics'
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
      icon: IconMap2,
      color: 'orange',
      label: 'Field Mapping',
      path: '/dashboard/mapping',
    },
    {
      icon: IconFileAnalytics,
      color: 'indigo',
      label: 'Reports',
      path: '/dashboard/reports',
    }
  ];

  // Farm management items
  const managementNavItems: NavItemProps[] = [
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
    }
  ];

  // Tools navigation items
  const toolsNavItems: NavItemProps[] = [
    // {
    //   icon: IconBrandHipchat,
    //   color: 'violet',
    //   label: 'AI Advisor',
    //   path: '/dashboard/ai-advisor',
    // },
    // {
    //   icon: IconBug,
    //   color: 'red',
    //   label: 'Disease Detection',
    //   path: '/dashboard/disease-detection',
    // }
  ];

  // Generate all navigation links
  const renderNavLinks = (items: NavItemProps[]) => {
    return items.map((item) => {
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

  const handleLogoutConfirm = () => {
    closeLogoutModal();
    // Add actual logout logic here (e.g., clear tokens, API calls)
    console.log("Logging out...");
    router.push('/login'); // Redirect to login page
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
      styles={{
        main: {
          // Remove this line:
          // backgroundColor: mounted ? (colorScheme === 'dark' ? '#1f1f1f' : '#f8f9fa') : '#f8f9fa',
        },
      }}
      suppressHydrationWarning={true}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={mobileNavOpened} onClick={toggleMobileNav} hiddenFrom="sm" size="sm" />
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <Group gap={8}>
                <Image src="/favicon.svg" alt="FarmWise Logo" width={32} height={32} />
                <Text fw={700} size="lg" c={logoTextColor}>
                  FarmWise
                </Text>
              </Group>
            </Link>
          </Group>

          <Group>
            <Badge color="red" variant="filled" radius="xl" size="lg">
              <Group gap={6}>
                <IconDroplet size={14} />
                <Text size="xs">Irrigation Alert: 2 Days</Text>
              </Group>
            </Badge>

            <Menu shadow="md" width={260} position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle" radius="xl" size="lg" color="gray">
                  <IconBell style={{ width: rem(20), height: rem(20) }} />
                  <Box 
                    pos="absolute" 
                    top={3} 
                    right={3} 
                    w={10} 
                    h={10} 
                    bg="red" 
                    style={{ borderRadius: '50%' }} 
                  />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Notifications</Menu.Label>
                <Menu.Item>
                  <Text size="sm" fw={500}>Soil moisture below threshold</Text>
                  <Text size="xs" c="dimmed">Field B requires irrigation soon</Text>
                </Menu.Item>
                <Menu.Item>
                  <Text size="sm" fw={500}>Disease risk increased</Text>
                  <Text size="xs" c="dimmed">High humidity levels detected in Field A</Text>
                </Menu.Item>
                <Divider />
                <Menu.Item>View all notifications</Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <ColorSchemeToggle />

            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap={8}>
                    <Avatar color="green" radius="xl">JD</Avatar>
                    <Box style={{ flex: 1 }} visibleFrom="sm">
                      <Text size="sm" fw={500}>John Doe</Text>
                      <Text c="dimmed" size="xs">Farm Manager</Text>
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
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <ScrollArea style={{ flex: 1 }} mx="-md">
          <Stack gap="xs">
            {renderNavLinks(mainNavItems)}
            <Divider label="Management" labelPosition="center" my="sm" />
            {renderNavLinks(managementNavItems)}
            {toolsNavItems.length > 0 && (
              <>
                <Divider label="Tools" labelPosition="center" my="sm" />
            {renderNavLinks(toolsNavItems)}
              </>
            )}
          </Stack>
        </ScrollArea>
        <AppShell.Section>
          <Divider my="sm" />
          <Group justify="space-between" px="md">
            <Text size="xs" c="dimmed">
              FarmWise v2.0
            </Text>
            <Tooltip label="AI Assistance" withArrow position="top">
              <ActionIcon variant="subtle" color="green" component={Link} href="/dashboard/help">
                <IconMessageChatbot style={{ width: rem(18), height: rem(18) }} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
        
        {showAiButton && (
            <Affix position={{ bottom: rem(20), right: rem(20) }}>
              <Tooltip label="Ask AI Advisor" position="left" withArrow>
                 <Button
                    onClick={openAiModal}
                    leftSection={<IconBrain size={18} />}
                    radius="xl"
                    size="md"
                    variant="gradient"
                    gradient={{ from: 'violet', to: 'grape' }}
                  >
                    Ask AI
                  </Button>
              </Tooltip>
            </Affix>
        )}
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