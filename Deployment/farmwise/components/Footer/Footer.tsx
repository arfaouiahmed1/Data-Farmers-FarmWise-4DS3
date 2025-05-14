'use client';

import React from 'react';
import {
  Container,
  Group,
  ActionIcon,
  Text,
  Divider,
  SimpleGrid,
  Stack,
  Box,
  Anchor,
  Title,
  rem,
} from '@mantine/core';
import Link from 'next/link';
import Image from 'next/image';
import {
  IconBrandTwitter,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandFacebook,
  IconBrandYoutube,
} from '@tabler/icons-react';
import classes from './Footer.module.css';

// Footer data
const footerData = {
  links: [
    {
      title: 'Product',
      links: [
        { label: 'Features', link: '/#features' },
        { label: 'Analytics', link: '/#analytics' },
        { label: 'How It Works', link: '/#how-it-works' },
        { label: 'Pricing', link: '/#pricing' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', link: '/about' },
        { label: 'Careers', link: '/careers' },
        { label: 'Contact', link: '/contact' },
        { label: 'Blog', link: '/blog' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', link: '/docs' },
        { label: 'Help Center', link: '/help' },
        { label: 'Community', link: '/community' },
        { label: 'Webinars', link: '/webinars' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Service', link: '/terms' },
        { label: 'Privacy Policy', link: '/privacy' },
        { label: 'Cookie Policy', link: '/cookies' },
        { label: 'Data Processing', link: '/data-processing' },
      ],
    },
  ],
  socialLinks: [
    { icon: IconBrandTwitter, link: 'https://twitter.com' },
    { icon: IconBrandFacebook, link: 'https://facebook.com' },
    { icon: IconBrandInstagram, link: 'https://instagram.com' },
    { icon: IconBrandLinkedin, link: 'https://linkedin.com' },
    { icon: IconBrandYoutube, link: 'https://youtube.com' },
  ],
};

export function Footer() {
  // Get current year for copyright
  const currentYear = new Date().getFullYear();

  // Handle smooth scroll for homepage links
  const handleScroll = (event: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    // Only apply smooth scroll on homepage
    if (window.location.pathname !== '/') {
      return;
    }

    event.preventDefault();

    // Extract the section ID from the link
    const id = link.replace('/#', '');
    const element = document.getElementById(id);

    if (element) {
      // Mark that user is actively scrolling to prevent intersection observer conflicts
      document.body.classList.add('user-scrolling');

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
    }
  };

  // Generate groups of links
  const groups = footerData.links.map((group) => {
    const links = group.links.map((link) => (
      <Anchor
        key={link.label}
        component={Link}
        href={link.link}
        className={classes.link}
        onClick={(event) => link.link.startsWith('/#') && handleScroll(event as any, link.link)}
      >
        {link.label}
      </Anchor>
    ));

    return (
      <div key={group.title} className={classes.wrapper}>
        <Text className={classes.title}>{group.title}</Text>
        <Stack gap={8}>{links}</Stack>
      </div>
    );
  });

  return (
    <footer className={classes.footer}>
      <Container size="lg">
        <div className={classes.inner}>
          <div className={classes.logoSection}>
            <Link href="/" className={classes.logoLink}>
              <Image
                src="/Farmwise Logo.svg"
                alt="FarmWise Logo"
                width={150}
                height={40}
                priority
              />
            </Link>
            <Text size="sm" c="dimmed" mt="md" className={classes.description}>
              Empowering farmers with AI-driven insights for modern agriculture.
            </Text>
            <Group gap="xs" mt="md" className={classes.social}>
              {footerData.socialLinks.map((link, index) => (
                <ActionIcon
                  key={index}
                  size="lg"
                  variant="subtle"
                  color="gray"
                  component="a"
                  href={link.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classes.socialIcon}
                >
                  <link.icon size={22} stroke={1.5} />
                </ActionIcon>
              ))}
            </Group>
          </div>
          <div className={classes.groups}>{groups}</div>
        </div>
        <Divider my="sm" />
        <div className={classes.afterFooter}>
          <Text c="dimmed" size="sm">
            © {currentYear} FarmWise. All rights reserved.
          </Text>
          <Group gap={8} className={classes.afterFooterLinks}>
            <Anchor component={Link} href="/terms" className={classes.afterFooterLink}>
              Terms
            </Anchor>
            <Text size="xs" c="dimmed">•</Text>
            <Anchor component={Link} href="/privacy" className={classes.afterFooterLink}>
              Privacy
            </Anchor>
            <Text size="xs" c="dimmed">•</Text>
            <Anchor component={Link} href="/cookies" className={classes.afterFooterLink}>
              Cookies
            </Anchor>
          </Group>
        </div>
      </Container>
    </footer>
  );
}
