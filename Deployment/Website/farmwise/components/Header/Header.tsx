'use client';

import {
  Container,
  Group,
  Button,
  Burger,
  Text,
  Box,
  useMantineTheme,
  Avatar,
  Menu,
  UnstyledButton,
  Divider,
  Modal,
  CloseButton,
  ScrollArea,
  Stack,
  Badge,
  Center,
  Tooltip,
  ActionIcon
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import Image from 'next/image'; // Import the Next.js Image component
import { usePathname, useRouter } from 'next/navigation'; // Added usePathname and useRouter hooks
import { IconUser, IconSettings, IconLogout, IconInfoCircle, IconBell } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
// import { IconPlant2 } from '@tabler/icons-react'; // Remove this import
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import authService from '../../app/api/auth';
import classes from './Header.module.css';

const links = [
  { link: '/#features', label: 'Features' }, // Link to features section on the same page
  { link: '/#analytics', label: 'Analytics' }, // Added Analytics link
  { link: '/#how-it-works', label: 'How It Works' },
  { link: '/#pricing', label: 'Pricing' }, // Link to pricing section on the same page
  { link: '/#testimonials', label: 'Testimonials' }, // Added Testimonials link
];

export function AppHeader() {
  const [opened, { toggle }] = useDisclosure(false);
  const theme = useMantineTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [logoutModalOpened, { open: openLogoutModal, close: closeLogoutModal }] = useDisclosure(false);
  // Add state for notifications
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Welcome to FarmWise', message: 'Get started by exploring our features', color: 'green', date: new Date() },
    { id: '2', title: 'New feature available', message: 'Try our AI Advisor for personalized farming recommendations', color: 'blue', date: new Date(Date.now() - 86400000) }, // 1 day ago
  ]);
  const [notificationsMenuOpened, { open: openNotificationsMenu, close: closeNotificationsMenu }] = useDisclosure(false);

  // Check authentication status
  useEffect(() => {
    // Don't run on the server
    if (typeof window === 'undefined') return;
    
    const checkAuth = async () => {
      setIsLoadingUser(true);
      const isUserAuthenticated = authService.isAuthenticated();
      setIsAuthenticated(isUserAuthenticated);
      
      if (isUserAuthenticated) {
        try {
          // Always try to get fresh data from the API first
          const user = await authService.getProfile();
          setUserData(user);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to cached user data if API call fails
          const cachedUser = authService.getCurrentUser();
          setUserData(cachedUser);
        }
      } else {
        setUserData(null);
      }
      setIsLoadingUser(false);
    };
    
    checkAuth();

    // Listen for storage events (in case user data is updated in another tab)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'user' || event.key === 'token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData) return 'U';
    
    // Check if first_name exists and is not empty
    const first = userData.first_name ? userData.first_name.charAt(0) : '';
    const last = userData.last_name ? userData.last_name.charAt(0) : '';
    
    // If we have neither first nor last name, try username or email
    if (!first && !last) {
      if (userData.username) {
        return userData.username.charAt(0).toUpperCase();
      }
      if (userData.email) {
        return userData.email.charAt(0).toUpperCase();
      }
      return 'U'; // Default fallback
    }
    
    return (first + last).toUpperCase();
  };

  // Smooth scroll handler (only for homepage)
  const handleScroll = (event: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    event.preventDefault();
    const id = link.replace('/#', '');
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 65; // Height of the header + a little extra padding
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleLogoutConfirm = () => {
    closeLogoutModal();
    authService.logout();
    // The redirect is done in the authService.logout(), no need to do it here
  };

  // Generate items based on current path
  const items = links.map((link) => {
    const isHomepage = pathname === '/';
    if (isHomepage) {
      // On homepage, use smooth scroll
      return (
        <a
          key={link.label}
          href={link.link}
          className={classes.link}
          onClick={(event) => handleScroll(event, link.link)}
        >
          {link.label}
        </a>
      );
    } else {
      // On other pages, use standard Link to navigate back to homepage + hash
      return (
        <Link key={link.label} href={link.link} className={classes.link}>
          {link.label}
        </Link>
      );
    }
  });

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
    <Box component="header" className={classes.header}>
      <Container size="lg" className={classes.inner}>
        {/* Logo/Brand */}
        <Link href="/" passHref legacyBehavior>
           <a className={classes.logoLink}> {/* Added a link wrapper for the logo */}
            <Image
                src="/Farmwise Logo.svg" // Path relative to the public directory
                alt="FarmWise Logo"
                width={150} // Set desired width
                height={40} // Set desired height based on aspect ratio or design
                priority // Add priority if it's LCP (Largest Contentful Paint)
             />
          </a>
        </Link>
        {/* <Group gap="xs">
          <IconPlant2 size={28} color={theme.colors.farmGreen[6]} />
          <Text size="xl" fw={700} variant="gradient" gradient={{ from: 'farmGreen', to: 'cyan' }}>
            FarmWise
          </Text>
        </Group> */}

        {/* Desktop Links */}
        <Group gap={5} visibleFrom="sm">
          {items}
        </Group>

        {/* Right Section: Auth Buttons + Toggle */}
        <Group visibleFrom="sm">
          <ColorSchemeToggle />
          
          {isAuthenticated ? (
            <>
              <Menu shadow="md" width={320} position="bottom-end" closeOnItemClick={false} opened={notificationsMenuOpened} onChange={notificationsMenuOpened ? closeNotificationsMenu : openNotificationsMenu}>
                <Menu.Target>
                  <Tooltip label="Notifications" withArrow position="bottom">
                    <ActionIcon variant="subtle" radius="xl" size="lg" color="gray">
                      <IconBell size={20} />
                      {notifications.length > 0 && (
                        <Box 
                          pos="absolute" 
                          top={3} 
                          right={3} 
                          w={14} 
                          h={14} 
                          bg="red" 
                          style={{ 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        >
                          {notifications.length}
                        </Box>
                      )}
                    </ActionIcon>
                  </Tooltip>
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
            
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <UnstyledButton>
                    <Group gap={8}>
                      {isLoadingUser ? (
                        <Avatar color="gray" radius="xl">...</Avatar>
                      ) : (
                        <Avatar color="green" radius="xl">{getUserInitials()}</Avatar>
                      )}
                      <Box style={{ flex: 1 }}>
                        {isLoadingUser ? (
                          <Text size="sm" fw={500}>Loading...</Text>
                        ) : (
                          <>
                            <Text size="sm" fw={500}>{userData?.first_name || ''} {userData?.last_name || ''}</Text>
                            <Text c="dimmed" size="xs">{userData?.profile?.user_type || 'User'}</Text>
                          </>
                        )}
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
            </>
          ) : (
            <>
              <Button variant="default" component={Link} href="/login">
                Log in
              </Button>
              <Button component={Link} href="/signup" variant="gradient" gradient={{ from: 'farmGreen', to: 'cyan' }}>
                Sign up
              </Button>
            </>
          )}
        </Group>

        {/* Mobile Burger Menu */}
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

        {/* TODO: Add Mobile Drawer/Menu based on 'opened' state */}
      </Container>

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
    </Box>
  );
} 