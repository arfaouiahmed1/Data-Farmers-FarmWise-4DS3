'use client';

import { useState } from 'react';
import { 
  Title, 
  Paper, 
  Group, 
  Text, 
  Button, 
  Stack, 
  Divider, 
  Switch, 
  SegmentedControl, 
  Modal,
  useMantineColorScheme,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSun, IconMoon, IconBell, IconRuler, IconDatabaseExport, IconTrash, IconAlertTriangle } from '@tabler/icons-react';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle'; // Reuse toggle

export default function SettingsPage() {
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const { colorScheme } = useMantineColorScheme();

  // Mock settings state - replace with actual state management/fetching
  const [settings, setSettings] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    units: 'metric', // 'metric' or 'imperial'
  });

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    console.log(`Setting ${key} changed to:`, value);
    // Add API call logic here to update settings
    setSettings((prev) => ({ ...prev, [key]: value }));
    // Add notification for success/failure
  };

  const handleExportData = () => {
    console.log('Exporting user data...');
    // Add logic to trigger data export API
    // Provide feedback to the user (e.g., notification)
  };

  const handleDeleteAccount = () => {
    console.log('Deleting account...');
    // Add logic to trigger account deletion API
    closeDeleteModal();
    // Redirect user after deletion (e.g., to signup or login)
    // Provide feedback (e.g., final confirmation message)
  };

  return (
    <Stack gap="lg">
      <Title order={2}>Application Settings</Title>

      {/* Appearance Settings */}
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Title order={4} mb="md">Appearance</Title>
        <Stack>
          <Group justify="space-between">
            <Text>Color Scheme</Text>
            <ColorSchemeToggle />
          </Group>
          {/* Add other appearance settings if needed */}
        </Stack>
      </Paper>

      {/* Notification Settings */}
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Title order={4} mb="md">Notifications</Title>
        <Stack>
          <Switch
            checked={settings.emailNotifications}
            onChange={(event) => handleSettingChange('emailNotifications', event.currentTarget.checked)}
            label="Receive Email Notifications"
            description="Alerts and summaries sent to your inbox."
            thumbIcon={<IconBell size={12} />}
          />
          <Switch
            checked={settings.inAppNotifications}
            onChange={(event) => handleSettingChange('inAppNotifications', event.currentTarget.checked)}
            label="Enable In-App Notifications"
            description="Show alerts within the FarmWise application."
            thumbIcon={<IconBell size={12} />}
          />
        </Stack>
      </Paper>

      {/* Preferences Settings */}
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Title order={4} mb="md">Preferences</Title>
        <Stack>
          <Group justify="space-between" align="center">
            <Stack gap={0}>
                <Text>Measurement Units</Text>
                <Text size="xs" c="dimmed">Used for weather, field size, etc.</Text>
            </Stack>
            <SegmentedControl
              value={settings.units}
              onChange={(value) => handleSettingChange('units', value)}
              data={[
                { label: 'Metric (kg, ha, °C)', value: 'metric' },
                { label: 'Imperial (lbs, ac, °F)', value: 'imperial' },
              ]}
            />
          </Group>
        </Stack>
      </Paper>

      {/* Data Management Settings */}
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Title order={4} mb="md">Data Management</Title>
        <Stack>
          <Group justify="space-between">
            <Text>Export My Data</Text>
            <Button 
              variant="outline" 
              leftSection={<IconDatabaseExport size={16}/>}
              onClick={handleExportData}
            >
              Request Data Export
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* Account Actions Settings */}
      <Paper withBorder shadow="sm" p="lg" radius="md" mt="xl" style={{ borderColor: 'var(--mantine-color-red-4)' }}>
        <Title order={4} mb="md" c="red">Account Actions</Title>
        <Stack>
          <Group justify="space-between">
            <Stack gap={0}>
              <Text c="red">Delete Account</Text>
              <Text size="xs" c="dimmed">Permanently remove your account and all associated data. This action cannot be undone.</Text>
            </Stack>
            <Button 
              color="red" 
              variant="filled" 
              leftSection={<IconTrash size={16}/>}
              onClick={openDeleteModal}
            >
              Delete My Account
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* Delete Account Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={
          <Group gap="xs">
            <IconAlertTriangle color='var(--mantine-color-red-6)'/> 
            <Text fw={500}>Confirm Account Deletion</Text>
          </Group>
        }
        centered
        size="md"
      >
        <Text size="sm">Are you absolutely sure you want to delete your account?</Text>
        <Text size="sm" fw={500} c="red" mt="xs">All your farm data, settings, and user information will be permanently lost.</Text>
        <Text size="sm" mt="sm">This action cannot be reversed.</Text>
        
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteAccount} leftSection={<IconTrash size={16}/>}>
            Yes, Delete My Account
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
} 