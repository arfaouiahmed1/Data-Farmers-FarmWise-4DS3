'use client';

import {
  Container,
  Group,
  Button,
  Burger,
  Text,
  Box,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import the Next.js Image component
import { usePathname } from 'next/navigation'; // Added usePathname hook
// import { IconPlant2 } from '@tabler/icons-react'; // Remove this import
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
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
  const [scrolled, setScrolled] = useState(false);
  const theme = useMantineTheme();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Generate items based on current path
  const items = links.map((link) => {
    const isHomepage = pathname === '/';
    const commonProps = {
      key: link.label,
      className: classes.link,
    };

    if (isHomepage && link.link.startsWith('/#')) {
      // On homepage and it's a hash link, use smooth scroll
      return (
        <a
          {...commonProps}
          href={link.link}
          onClick={(event) => handleScroll(event, link.link)}
        >
          {link.label}
        </a>
      );
    } else {
      // On other pages, or if it's not a hash link, use standard Next.js Link
      // This will navigate to the homepage section if needed, or just follow the link
      return (
        <Link {...commonProps} href={link.link}>
          {link.label}
        </Link>
      );
    }
  });

  return (
    <Box
      component="header"
      className={`${classes.header} ${scrolled ? classes.headerBlurred : ''}`}
    >
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
          <Button variant="default" component={Link} href="/login">
            Log in
          </Button>
          <Button component={Link} href="/signup" variant="gradient" gradient={{ from: 'farmGreen', to: 'cyan' }}>
            Sign up
          </Button>
        </Group>

        {/* Mobile Burger Menu */}
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

        {/* TODO: Add Mobile Drawer/Menu based on 'opened' state */}
      </Container>
    </Box>
  );
} 