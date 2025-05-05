'use client';

import { useState } from 'react';
import { 
  Title, 
  Paper, 
  Group, 
  Avatar, 
  Text, 
  TextInput, 
  Button, 
  Stack, 
  PasswordInput, 
  Divider 
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUser, IconMail, IconBuildingWarehouse, IconLock } from '@tabler/icons-react';

// Mock user data - replace with actual data fetching
const initialUserData = {
  name: 'John Doe',
  email: 'john.doe@farmwise.com',
  role: 'Farm Manager',
  farmName: 'Green Acres Farm',
  avatarInitial: 'JD',
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(initialUserData);

  const form = useForm({
    initialValues: {
      name: userData.name,
      farmName: userData.farmName,
    },

    validate: {
      name: (value) => (value.trim().length < 2 ? 'Name must have at least 2 letters' : null),
      farmName: (value) => (value.trim().length < 3 ? 'Farm name must have at least 3 letters' : null),
    },
  });

  const passwordForm = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      newPassword: (value) => (value.length < 8 ? 'Password must be at least 8 characters long' : null),
      confirmPassword: (value, values) =>
        value !== values.newPassword ? 'Passwords did not match' : null,
    },
  });

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form if canceling edit
      form.reset();
    }
    setIsEditing(!isEditing);
  };

  const handleProfileSubmit = (values: typeof form.values) => {
    console.log('Updating profile:', values);
    // Add API call logic here to update user profile
    setUserData((prev) => ({ ...prev, ...values }));
    setIsEditing(false);
  };

  const handlePasswordSubmit = (values: typeof passwordForm.values) => {
    console.log('Changing password:', values.newPassword);
    // Add API call logic here to change password
    // Make sure to verify currentPassword on the backend
    passwordForm.reset();
    // Add notification for success/failure
  };

  return (
    <Stack gap="lg">
      <Title order={2}>My Profile</Title>

      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Group wrap="nowrap" align="flex-start">
          <Avatar color="green" radius="xl" size="xl">{userData.avatarInitial}</Avatar>
          <Stack gap="xs" style={{ flexGrow: 1 }}>
            {!isEditing ? (
              <>
                <Title order={3}>{userData.name}</Title>
                <Text c="dimmed">{userData.role}</Text>
                <Group gap="xs">
                  <IconMail size={16} />
                  <Text size="sm">{userData.email}</Text>
                </Group>
                <Group gap="xs">
                  <IconBuildingWarehouse size={16} />
                  <Text size="sm">{userData.farmName}</Text>
                </Group>
              </>
            ) : (
              <form onSubmit={form.onSubmit(handleProfileSubmit)}>
                <Stack>
                  <TextInput
                    label="Full Name"
                    placeholder="Your full name"
                    leftSection={<IconUser size={16} />}
                    required
                    {...form.getInputProps('name')}
                  />
                  <TextInput
                    label="Farm Name"
                    placeholder="Your farm's name"
                    leftSection={<IconBuildingWarehouse size={16} />}
                    required
                    {...form.getInputProps('farmName')}
                  />
                  <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={handleEditToggle}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                  </Group>
                </Stack>
              </form>
            )}
          </Stack>
          {!isEditing && (
             <Button variant="outline" onClick={handleEditToggle}>Edit Profile</Button>
          )}
        </Group>
      </Paper>

      <Divider label="Security" labelPosition="center" my="md" />

      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Title order={4} mb="md">Change Password</Title>
        <form onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}>
          <Stack>
            <PasswordInput
              label="Current Password"
              placeholder="Your current password"
              leftSection={<IconLock size={16} />}
              required
              {...passwordForm.getInputProps('currentPassword')}
            />
            <PasswordInput
              label="New Password"
              placeholder="Enter new password (min. 8 characters)"
              leftSection={<IconLock size={16} />}
              required
              {...passwordForm.getInputProps('newPassword')}
            />
            <PasswordInput
              label="Confirm New Password"
              placeholder="Confirm your new password"
              leftSection={<IconLock size={16} />}
              required
              {...passwordForm.getInputProps('confirmPassword')}
            />
            <Group justify="flex-end" mt="md">
              <Button type="submit">Update Password</Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
} 