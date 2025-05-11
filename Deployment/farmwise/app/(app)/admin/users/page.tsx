'use client';

import { useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Group, 
  ActionIcon, 
  TextInput, 
  Button, 
  Table, 
  Menu, 
  UnstyledButton, 
  Tooltip, 
  Badge, 
  Modal, 
  Stack, 
  Select, 
  Checkbox,
  Pagination,
  Paper,
  Divider,
  Tabs
} from '@mantine/core';
import { 
  IconSearch, 
  IconDotsVertical, 
  IconPencil, 
  IconTrash, 
  IconUserPlus, 
  IconFilter, 
  IconSortAscending, 
  IconSortDescending,
  IconUserEdit,
  IconLock,
  IconMail,
  IconShield,
  IconCheck,
  IconX,
  IconReportAnalytics,
  IconEye,
  IconDownload,
  IconIdBadge2
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

// Define type for a user
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  joined: string;
  farm: string;
  [key: string]: string | number; // Index signature to allow indexing with string keys
}

// Mock data for users
const mockUsers: User[] = [
  { 
    id: 1, 
    name: 'John Smith', 
    email: 'john.smith@example.com', 
    role: 'Admin', 
    status: 'Active', 
    lastLogin: '2 hours ago', 
    joined: '12/05/2023',
    farm: 'Smith Family Farm'
  },
  { 
    id: 2, 
    name: 'Emily Johnson', 
    email: 'emily.j@example.com', 
    role: 'Manager', 
    status: 'Active', 
    lastLogin: '1 day ago', 
    joined: '03/15/2023',
    farm: 'Johnson Agriculture'
  },
  { 
    id: 3, 
    name: 'Michael Davis', 
    email: 'michael.d@example.com', 
    role: 'User', 
    status: 'Inactive', 
    lastLogin: '2 weeks ago', 
    joined: '05/20/2022',
    farm: 'Davis Farms Inc.'
  },
  { 
    id: 4, 
    name: 'Sarah Wilson', 
    email: 'sarah.w@example.com', 
    role: 'User', 
    status: 'Active', 
    lastLogin: '5 hours ago', 
    joined: '01/30/2023',
    farm: 'Wilson Organic'
  },
  { 
    id: 5, 
    name: 'Robert Taylor', 
    email: 'robert.t@example.com', 
    role: 'Manager', 
    status: 'Active', 
    lastLogin: '3 days ago', 
    joined: '09/10/2022',
    farm: 'Taylor Crops LLC'
  },
  { 
    id: 6, 
    name: 'Jennifer Brown', 
    email: 'jennifer.b@example.com', 
    role: 'User', 
    status: 'Pending', 
    lastLogin: 'Never', 
    joined: '06/02/2023',
    farm: 'Brown Family Farms'
  }
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Modals
  const [addUserOpened, { open: openAddUser, close: closeAddUser }] = useDisclosure(false);
  const [editUserOpened, { open: openEditUser, close: closeEditUser }] = useDisclosure(false);
  const [deleteUserOpened, { open: openDeleteUser, close: closeDeleteUser }] = useDisclosure(false);
  const [viewUserOpened, { open: openViewUser, close: closeViewUser }] = useDisclosure(false);

  // Filter users based on search term
  const filteredUsers = users.filter(
    user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.farm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    // For numeric values
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    }
    
    // Fallback for mixed types
    return 0;
  });

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = sortedUsers.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  // Handle sort changes
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // User form operations
  const handleAddUser = () => {
    // In a real app, this would make an API call to create the user
    const newUser = {
      id: users.length + 1,
      name: 'New User',
      email: 'newuser@example.com',
      role: 'User',
      status: 'Pending',
      lastLogin: 'Never',
      joined: new Date().toLocaleDateString(),
      farm: 'New Farm'
    };
    
    setUsers([...users, newUser]);
    notifications.show({
      title: 'Success',
      message: 'User has been added successfully',
      color: 'green',
    });
    closeAddUser();
  };

  const handleEditUser = () => {
    // In a real app, this would make an API call to update the user
    const updatedUsers = users.map(user => 
      user.id === selectedUser?.id ? { ...selectedUser } : user
    );
    
    setUsers(updatedUsers);
    notifications.show({
      title: 'Success',
      message: 'User has been updated successfully',
      color: 'blue',
    });
    closeEditUser();
  };

  const handleDeleteUser = () => {
    // In a real app, this would make an API call to delete the user
    const updatedUsers = users.filter(user => user.id !== selectedUser?.id);
    
    setUsers(updatedUsers);
    notifications.show({
      title: 'Success',
      message: 'User has been deleted successfully',
      color: 'red',
    });
    closeDeleteUser();
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let color;
    switch (status) {
      case 'Active':
        color = 'green';
        break;
      case 'Inactive':
        color = 'gray';
        break;
      case 'Pending':
        color = 'yellow';
        break;
      default:
        color = 'blue';
    }
    
    return <Badge color={color}>{status}</Badge>;
  };

  // Render role badge with appropriate color
  const renderRoleBadge = (role: string) => {
    let color;
    switch (role) {
      case 'Admin':
        color = 'red';
        break;
      case 'Manager':
        color = 'blue';
        break;
      case 'User':
        color = 'green';
        break;
      default:
        color = 'gray';
    }
    
    return <Badge color={color} variant="light">{role}</Badge>;
  };

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>User Management</Title>
          <Button 
            leftSection={<IconUserPlus size="1rem" />} 
            onClick={openAddUser}
          >
            Add User
          </Button>
        </Group>

        <Tabs defaultValue="users">
          <Tabs.List>
            <Tabs.Tab value="users" leftSection={<IconIdBadge2 size="0.8rem" />}>
              Users
            </Tabs.Tab>
            <Tabs.Tab value="roles" leftSection={<IconShield size="0.8rem" />}>
              Roles & Permissions
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="users" pt="md">
            <Paper withBorder p="md">
              <Group justify="space-between" mb="md">
                <TextInput
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftSection={<IconSearch size="1rem" />}
                  style={{ flexGrow: 1, maxWidth: 400 }}
                />
                
                <Group>
                  <Menu shadow="md" width={200}>
                    <Menu.Target>
                      <Button variant="light" leftSection={<IconFilter size="1rem" />}>
                        Filter
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>Filter by Status</Menu.Label>
                      <Menu.Item closeMenuOnClick={false}>
                        <Checkbox label="Active" defaultChecked />
                      </Menu.Item>
                      <Menu.Item closeMenuOnClick={false}>
                        <Checkbox label="Inactive" defaultChecked />
                      </Menu.Item>
                      <Menu.Item closeMenuOnClick={false}>
                        <Checkbox label="Pending" defaultChecked />
                      </Menu.Item>
                      <Divider />
                      <Menu.Label>Filter by Role</Menu.Label>
                      <Menu.Item closeMenuOnClick={false}>
                        <Checkbox label="Admin" defaultChecked />
                      </Menu.Item>
                      <Menu.Item closeMenuOnClick={false}>
                        <Checkbox label="Manager" defaultChecked />
                      </Menu.Item>
                      <Menu.Item closeMenuOnClick={false}>
                        <Checkbox label="User" defaultChecked />
                      </Menu.Item>
                      <Divider />
                      <Menu.Item color="blue">Apply Filters</Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                  
                  <Menu shadow="md" width={200}>
                    <Menu.Target>
                      <Button 
                        variant="light" 
                        leftSection={
                          sortDirection === 'asc' 
                            ? <IconSortAscending size="1rem" /> 
                            : <IconSortDescending size="1rem" />
                        }
                      >
                        Sort
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item 
                        onClick={() => handleSort('name')}
                        rightSection={sortBy === 'name' ? (
                          sortDirection === 'asc' 
                            ? <IconSortAscending size="1rem" />
                            : <IconSortDescending size="1rem" />
                        ) : null}
                      >
                        By Name
                      </Menu.Item>
                      <Menu.Item 
                        onClick={() => handleSort('role')}
                        rightSection={sortBy === 'role' ? (
                          sortDirection === 'asc' 
                            ? <IconSortAscending size="1rem" />
                            : <IconSortDescending size="1rem" />
                        ) : null}
                      >
                        By Role
                      </Menu.Item>
                      <Menu.Item 
                        onClick={() => handleSort('status')}
                        rightSection={sortBy === 'status' ? (
                          sortDirection === 'asc' 
                            ? <IconSortAscending size="1rem" />
                            : <IconSortDescending size="1rem" />
                        ) : null}
                      >
                        By Status
                      </Menu.Item>
                      <Menu.Item 
                        onClick={() => handleSort('joined')}
                        rightSection={sortBy === 'joined' ? (
                          sortDirection === 'asc' 
                            ? <IconSortAscending size="1rem" />
                            : <IconSortDescending size="1rem" />
                        ) : null}
                      >
                        By Join Date
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                  
                  <Tooltip label="Export Users">
                    <ActionIcon variant="light" color="gray">
                      <IconDownload size="1.1rem" />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>

              <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Farm</Table.Th>
                    <Table.Th>Role</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Last Login</Table.Th>
                    <Table.Th>Joined</Table.Th>
                    <Table.Th style={{ width: 80 }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedUsers.map((user) => (
                    <Table.Tr key={user.id}>
                      <Table.Td>{user.name}</Table.Td>
                      <Table.Td>{user.email}</Table.Td>
                      <Table.Td>{user.farm}</Table.Td>
                      <Table.Td>{renderRoleBadge(user.role)}</Table.Td>
                      <Table.Td>{renderStatusBadge(user.status)}</Table.Td>
                      <Table.Td>{user.lastLogin}</Table.Td>
                      <Table.Td>{user.joined}</Table.Td>
                      <Table.Td>
                        <Menu shadow="md" position="bottom-end">
                          <Menu.Target>
                            <ActionIcon variant="subtle">
                              <IconDotsVertical size="1rem" />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item 
                              leftSection={<IconEye size="1rem" />}
                              onClick={() => {
                                setSelectedUser(user);
                                openViewUser();
                              }}
                            >
                              View Details
                            </Menu.Item>
                            <Menu.Item 
                              leftSection={<IconPencil size="1rem" />}
                              onClick={() => {
                                setSelectedUser(user);
                                openEditUser();
                              }}
                            >
                              Edit User
                            </Menu.Item>
                            <Menu.Item 
                              leftSection={<IconLock size="1rem" />}
                            >
                              Reset Password
                            </Menu.Item>
                            <Menu.Item 
                              leftSection={<IconReportAnalytics size="1rem" />}
                            >
                              View Activity
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item 
                              color="red" 
                              leftSection={<IconTrash size="1rem" />}
                              onClick={() => {
                                setSelectedUser(user);
                                openDeleteUser();
                              }}
                            >
                              Delete User
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  
                  {paginatedUsers.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={8}>
                        <Text ta="center" fz="sm" c="dimmed" py="md">
                          No users found matching your search criteria
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
              
              {totalPages > 1 && (
                <Group justify="center" mt="md">
                  <Pagination 
                    value={activePage} 
                    onChange={setActivePage} 
                    total={totalPages} 
                    withEdges
                  />
                </Group>
              )}
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="roles" pt="md">
            <Paper withBorder p="xl">
              <Text ta="center" fz="lg">Roles & Permissions Management</Text>
              <Text c="dimmed" ta="center" mb="xl">This feature is coming soon.</Text>

              <Table withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Role</Table.Th>
                    <Table.Th>Description</Table.Th>
                    <Table.Th>Users</Table.Th>
                    <Table.Th>View Data</Table.Th>
                    <Table.Th>Edit Data</Table.Th>
                    <Table.Th>Admin Access</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td>Admin</Table.Td>
                    <Table.Td>Full system access</Table.Td>
                    <Table.Td>1</Table.Td>
                    <Table.Td><IconCheck color="green" /></Table.Td>
                    <Table.Td><IconCheck color="green" /></Table.Td>
                    <Table.Td><IconCheck color="green" /></Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>Manager</Table.Td>
                    <Table.Td>Manage users and farm data</Table.Td>
                    <Table.Td>2</Table.Td>
                    <Table.Td><IconCheck color="green" /></Table.Td>
                    <Table.Td><IconCheck color="green" /></Table.Td>
                    <Table.Td><IconX color="red" /></Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>User</Table.Td>
                    <Table.Td>Basic access to farm data</Table.Td>
                    <Table.Td>3</Table.Td>
                    <Table.Td><IconCheck color="green" /></Table.Td>
                    <Table.Td><IconX color="red" /></Table.Td>
                    <Table.Td><IconX color="red" /></Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Add User Modal */}
      <Modal
        opened={addUserOpened}
        onClose={closeAddUser}
        title="Add New User"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Full Name"
            placeholder="Enter user's full name"
            required
          />
          <TextInput
            label="Email"
            placeholder="Enter user's email address"
            required
            type="email"
            leftSection={<IconMail size="1rem" />}
          />
          <TextInput
            label="Farm Name"
            placeholder="Enter farm name"
            required
          />
          <Select
            label="Role"
            placeholder="Select user role"
            required
            data={[
              { value: 'Admin', label: 'Admin' },
              { value: 'Manager', label: 'Manager' },
              { value: 'User', label: 'User' },
            ]}
            defaultValue="User"
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeAddUser}>Cancel</Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        opened={editUserOpened}
        onClose={closeEditUser}
        title="Edit User"
        size="md"
      >
        {selectedUser && (
          <Stack gap="md">
            <TextInput
              label="Full Name"
              defaultValue={selectedUser.name}
              onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
            />
            <TextInput
              label="Email"
              defaultValue={selectedUser.email}
              type="email"
              leftSection={<IconMail size="1rem" />}
              onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
            />
            <TextInput
              label="Farm Name"
              defaultValue={selectedUser.farm}
              onChange={(e) => setSelectedUser({...selectedUser, farm: e.target.value})}
            />
            <Select
              label="Role"
              data={[
                { value: 'Admin', label: 'Admin' },
                { value: 'Manager', label: 'Manager' },
                { value: 'User', label: 'User' },
              ]}
              defaultValue={selectedUser.role}
              onChange={(value) => value && setSelectedUser({...selectedUser, role: value})}
            />
            <Select
              label="Status"
              data={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
                { value: 'Pending', label: 'Pending' },
              ]}
              defaultValue={selectedUser.status}
              onChange={(value) => value && setSelectedUser({...selectedUser, status: value})}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeEditUser}>Cancel</Button>
              <Button onClick={handleEditUser}>Save Changes</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        opened={deleteUserOpened}
        onClose={closeDeleteUser}
        title="Delete User"
        size="sm"
        centered
      >
        {selectedUser && (
          <Stack gap="md">
            <Text>
              Are you sure you want to delete the user <b>{selectedUser.name}</b>? This action cannot be undone.
            </Text>
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeDeleteUser}>Cancel</Button>
              <Button color="red" onClick={handleDeleteUser}>Delete User</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* View User Details Modal */}
      <Modal
        opened={viewUserOpened}
        onClose={closeViewUser}
        title="User Details"
        size="md"
      >
        {selectedUser && (
          <Stack gap="md">
            <Group align="flex-start">
              <Text fw={500} w={120}>Name:</Text>
              <Text>{selectedUser.name}</Text>
            </Group>
            <Group align="flex-start">
              <Text fw={500} w={120}>Email:</Text>
              <Text>{selectedUser.email}</Text>
            </Group>
            <Group align="flex-start">
              <Text fw={500} w={120}>Farm:</Text>
              <Text>{selectedUser.farm}</Text>
            </Group>
            <Group align="flex-start">
              <Text fw={500} w={120}>Role:</Text>
              <Text>{renderRoleBadge(selectedUser.role)}</Text>
            </Group>
            <Group align="flex-start">
              <Text fw={500} w={120}>Status:</Text>
              <Text>{renderStatusBadge(selectedUser.status)}</Text>
            </Group>
            <Group align="flex-start">
              <Text fw={500} w={120}>Joined:</Text>
              <Text>{selectedUser.joined}</Text>
            </Group>
            <Group align="flex-start">
              <Text fw={500} w={120}>Last Login:</Text>
              <Text>{selectedUser.lastLogin}</Text>
            </Group>
            <Divider my="sm" />
            <Group justify="space-between">
              <Button 
                variant="light" 
                leftSection={<IconPencil size="1rem" />}
                onClick={() => {
                  closeViewUser();
                  openEditUser();
                }}
              >
                Edit User
              </Button>
              <Button 
                variant="light" 
                color="red" 
                leftSection={<IconTrash size="1rem" />}
                onClick={() => {
                  closeViewUser();
                  openDeleteUser();
                }}
              >
                Delete User
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
} 