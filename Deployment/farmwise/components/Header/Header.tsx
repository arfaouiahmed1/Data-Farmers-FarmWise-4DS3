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
  ActionIcon,
  Drawer
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import Image from 'next/image'; // Import the Next.js Image component
import { usePathname, useRouter } from 'next/navigation'; // Added usePathname and useRouter hooks
import { IconUser, IconSettings, IconLogout, IconInfoCircle, IconBell, IconDashboard, IconLayoutDashboard } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
// import { IconPlant2 } from '@tabler/icons-react'; // Remove this import
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import authService from '../../app/api/auth';
import classes from './Header.module.css';

// Navigation links for the landing page
const links = [
  { link: '/#features', label: 'Features' },
  { link: '/#analytics', label: 'Analytics' },
  { link: '/#how-it-works', label: 'How It Works' },
  { link: '/#pricing', label: 'Pricing' },
  { link: '/#testimonials', label: 'Testimonials' },
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
  const [activeSection, setActiveSection] = useState<string | null>(null);
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

  // Set up intersection observer to track active section
  useEffect(() => {
    // Only run on homepage
    if (pathname !== '/') return;

    console.log("Setting up intersection observer");

    // Handle initial hash in URL
    if (window.location.hash) {
      const id = window.location.hash.substring(1); // Remove the # character
      console.log("Initial hash detected:", id);

      // Set active section based on hash
      setActiveSection(id);

      // Find the element and scroll to it
      const element = document.getElementById(id);
      if (element) {
        // Use requestAnimationFrame to ensure the DOM is fully loaded and rendered
        requestAnimationFrame(() => {
          // First scroll to the element
          element.scrollIntoView({ behavior: 'auto' });

          // Then adjust for header height
          const headerHeight = 64;
          const additionalOffset = 16;
          const currentScroll = window.scrollY;

          // Apply offset correction
          window.scrollTo({
            top: currentScroll - headerHeight - additionalOffset,
            behavior: 'auto'
          });
        });
      } else {
        console.error(`Element with id "${id}" not found on initial load`);
      }
    }

    // Improved options for the intersection observer
    const options = {
      root: null, // Use the viewport as the root
      rootMargin: '-80px 0px -70% 0px', // Top margin accounts for header height
      threshold: [0.1, 0.2, 0.5], // Multiple thresholds for better detection
    };

    // Improved callback for the intersection observer
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      // Process only if user is not actively scrolling via click
      // This prevents conflicts between manual navigation and auto-detection
      const isUserInitiatedScroll = document.body.classList.contains('user-scrolling');

      if (!isUserInitiatedScroll) {
        // Sort entries by their intersection ratio and position in viewport
        const visibleEntries = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => {
            // First sort by intersection ratio
            const ratioComparison = b.intersectionRatio - a.intersectionRatio;
            if (Math.abs(ratioComparison) > 0.1) return ratioComparison;

            // If ratios are similar, prefer the one closer to the top of viewport
            return a.boundingClientRect.top - b.boundingClientRect.top;
          });

        if (visibleEntries.length > 0) {
          // Get the most visible section
          const mostVisibleSection = visibleEntries[0].target.id;

          // Only update if it's different from current active section
          if (mostVisibleSection !== activeSection) {
            console.log("Setting active section to:", mostVisibleSection);
            setActiveSection(mostVisibleSection);

            // Update URL hash without scrolling (only if not during user-initiated scroll)
            window.history.replaceState(
              null,
              '',
              `/#${mostVisibleSection}`
            );
          }
        }
      }
    };

    // Create the observer
    const observer = new IntersectionObserver(handleIntersect, options);

    // Observe all sections
    const sections = ['features', 'analytics', 'how-it-works', 'pricing', 'testimonials'];
    sections.forEach((section) => {
      const element = document.getElementById(section);
      if (element) {
        observer.observe(element);
      }
    });

    // Cleanup
    return () => {
      observer.disconnect();
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

  // Fixed smooth scroll handler (only for homepage)
  const handleScroll = (event: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    event.preventDefault();
    console.log("Scroll handler triggered for:", link);

    // Extract the section ID from the link
    const id = link.replace('/#', '');
    const element = document.getElementById(id);

    if (element) {
      // Mark that user is actively scrolling to prevent intersection observer conflicts
      document.body.classList.add('user-scrolling');

      // Update active section immediately for better UI feedback
      setActiveSection(id);

      // Update URL hash without scrolling
      window.history.pushState(null, '', link);

      // Use the native scrollIntoView with smooth behavior
      // This is more reliable than manual position calculations
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // Apply offset correction after the default scroll
      // This ensures we account for the fixed header
      setTimeout(() => {
        const headerHeight = 64; // Height of the header
        const additionalOffset = 16; // Additional padding for better visibility
        const currentScroll = window.scrollY;

        // Apply offset correction
        window.scrollTo({
          top: currentScroll - headerHeight - additionalOffset,
          behavior: 'smooth'
        });

        // Remove the user-scrolling class after scrolling is complete
        setTimeout(() => {
          document.body.classList.remove('user-scrolling');
        }, 1000); // Wait for scroll animation to complete
      }, 50);
    } else {
      console.error(`Element with id "${id}" not found`);
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
    const sectionId = link.link.replace('/#', '');
    const isActive = activeSection === sectionId;

    if (isHomepage) {
      // On homepage, use smooth scroll with active state
      return (
        <a
          key={link.label}
          href={link.link}
          className={`${classes.link} ${isActive ? classes.linkActive : ''}`}
          onClick={(event) => handleScroll(event, link.link)}
          aria-current={isActive ? 'page' : undefined}
        >
          {link.label}
        </a>
      );
    } else {
      // On other pages, use standard Link to navigate back to homepage + hash
      return (
        <Link
          key={link.label}
          href={link.link}
          className={classes.link}
        >
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
              {/* Dashboard Button */}
              <Tooltip label="Dashboard" withArrow position="bottom">
                <ActionIcon
                  component={Link}
                  href="/dashboard"
                  variant="outline"
                  radius="md"
                  size="lg"
                  className={`${classes.iconButton} ${classes.dashboardButton}`}
                >
                  <IconLayoutDashboard size={20} />
                </ActionIcon>
              </Tooltip>

              {/* Notifications Menu */}
              <Menu shadow="md" width={320} position="bottom-end" closeOnItemClick={false} opened={notificationsMenuOpened} onChange={notificationsMenuOpened ? closeNotificationsMenu : openNotificationsMenu}>
                <Menu.Target>
                  <Tooltip label="Notifications" withArrow position="bottom">
                    <ActionIcon
                      variant="outline"
                      radius="md"
                      size="lg"
                      className={`${classes.iconButton} ${classes.notificationButton}`}
                    >
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
              <Button
                variant="default"
                component={Link}
                href="/login"
                className={classes.authButton}
                radius="md"
              >
                Log in
              </Button>
              <Button
                component={Link}
                href="/signup"
                variant="filled"
                color="farmGreen"
                className={classes.authButton}
                radius="md"
              >
                Sign up
              </Button>
            </>
          )}
        </Group>

        {/* Mobile Burger Menu */}
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

        {/* Mobile Drawer/Menu */}
        <Drawer
          opened={opened}
          onClose={toggle}
          size="100%"
          padding="md"
          title={
            <Group>
              <Link href="/" passHref legacyBehavior>
                <a className={classes.logoLink} onClick={toggle}>
                  <Image
                    src="/Farmwise Logo.svg"
                    alt="FarmWise Logo"
                    width={140}
                    height={35}
                    priority
                  />
                </a>
              </Link>
            </Group>
          }
          withCloseButton
          zIndex={1000}
        >
          <ScrollArea h={`calc(100vh - 60px)`} mx="-md">
            <Box py="md">
              {links.map((link) => {
                const sectionId = link.link.replace('/#', '');
                const isActive = activeSection === sectionId;

                return (
                  <a
                    key={link.label}
                    href={link.link}
                    className={`${classes.link} ${isActive ? classes.linkActive : ''}`}
                    onClick={(event) => {
                      if (pathname === '/') {
                        // First close the drawer to prevent UI issues
                        toggle();
                        // Then handle the scroll with a slight delay
                        setTimeout(() => {
                          handleScroll(event, link.link);
                        }, 150);
                      } else {
                        toggle();
                      }
                    }}
                    style={{
                      padding: 'var(--mantine-spacing-md)',
                      display: 'block',
                      borderRadius: 0
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                  </a>
                );
              })}

              <Divider my="md" />

              {!isAuthenticated ? (
                <Group grow px="md">
                  <Button
                    variant="default"
                    component={Link}
                    href="/login"
                    onClick={toggle}
                    className={classes.authButton}
                    radius="md"
                  >
                    Log in
                  </Button>
                  <Button
                    component={Link}
                    href="/signup"
                    variant="filled"
                    color="farmGreen"
                    onClick={toggle}
                    className={classes.authButton}
                    radius="md"
                  >
                    Sign up
                  </Button>
                </Group>
              ) : (
                <Box px="md">
                  <Button component={Link} href="/dashboard" fullWidth onClick={toggle}>
                    Dashboard
                  </Button>
                  <Button onClick={openLogoutModal} color="red" variant="light" fullWidth mt="sm">
                    Logout
                  </Button>
                </Box>
              )}
            </Box>
          </ScrollArea>
        </Drawer>
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