'use client';
import React, { useState } from 'react';
import {
  Title,
  Text,
  Container,
  Paper,
  Button,
  Group,
  Modal,
  TextInput,
  Select,
  SimpleGrid,
  Card,
  Badge,
  ActionIcon,
  Menu,
  Textarea,
  rem,
  SegmentedControl,
  ScrollArea,
  Stack
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconCalendarStats, IconPlus, IconPencil, IconTrash, IconListDetails, IconClock, IconUser, IconUrgent, IconPlayerPlay, IconChecks, IconGripVertical } from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'; 

// Task data structure
interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Done';
  dueDate: Date | null;
  assignedTo?: string;
}

// Sample task data
const sampleTasks: TaskItem[] = [
  { id: 'task-1', title: 'Prepare Field A for Planting', priority: 'High', status: 'To Do', dueDate: new Date(2024, 5, 1), assignedTo: 'Alice' },
  { id: 'task-2', title: 'Order Fertilizer', priority: 'Medium', status: 'To Do', dueDate: new Date(2024, 4, 28), assignedTo: 'Bob' },
  { id: 'task-3', title: 'Service Tractor JD8R', description: 'Check oil, filters, and hydraulics.', priority: 'High', status: 'In Progress', dueDate: new Date(2024, 4, 25), assignedTo: 'Charlie' },
  { id: 'task-4', title: 'Plant Corn in Field B', priority: 'High', status: 'To Do', dueDate: new Date(2024, 5, 5) },
  { id: 'task-5', title: 'Scout Field C for Pests', priority: 'Medium', status: 'Done', dueDate: new Date(2024, 4, 20), assignedTo: 'Alice' },
  { id: 'task-6', title: 'Install Irrigation Lines', priority: 'Medium', status: 'In Progress', dueDate: new Date(2024, 6, 1), assignedTo: 'Bob' },
];

const statusColumns = {
  'To Do': { icon: IconListDetails, color: 'gray', title: 'To Do' },
  'In Progress': { icon: IconPlayerPlay, color: 'blue', title: 'In Progress' },
  'Done': { icon: IconChecks, color: 'green', title: 'Done' },
};

type TaskStatus = keyof typeof statusColumns;

const priorityColors: Record<TaskItem['priority'], string> = {
    High: 'red',
    Medium: 'orange',
    Low: 'yellow'
};

export default function PlanningPage() {
  const [tasks, setTasks] = useState<TaskItem[]>(sampleTasks);
  const [opened, setOpened] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [viewType, setViewType] = useState<'kanban' | 'list'>('kanban'); // View toggle state

  const form = useForm<Omit<TaskItem, 'id' | 'status'>>({
    initialValues: {
      title: '',
      description: '',
      priority: 'Medium',
      dueDate: null,
      assignedTo: '',
    },
    validate: {
      title: (value) => (value.trim().length > 0 ? null : 'Task title is required'),
      priority: (value) => (value ? null : 'Priority is required'),
    },
  });

  const handleAddTask = () => {
    setEditingTask(null);
    form.reset();
    setOpened(true);
  };

  const handleEditTask = (task: TaskItem) => {
    setEditingTask(task);
    form.setValues({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      assignedTo: task.assignedTo || '',
    });
    setOpened(true);
  };

  const handleDeleteTask = (id: string) => {
    // Add confirmation
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  const handleSubmit = form.onSubmit((values) => {
    if (editingTask) {
      setTasks((current) =>
        current.map((task) =>
          task.id === editingTask.id
            ? { ...task, ...values, id: task.id, status: task.status } // Keep original status on edit
            : task
        )
      );
    } else {
      setTasks((current) => [
        ...current,
        { ...values, id: Math.random().toString(36).substring(7), status: 'To Do' }, // Add as 'To Do'
      ]);
    }
    setOpened(false);
  });

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId as TaskStatus;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  // Prepare data for Kanban view
  const columns = Object.keys(statusColumns).reduce((acc, statusKey) => {
    const status = statusKey as TaskStatus;
    acc[status] = tasks.filter((task) => task.status === status);
    return acc;
  }, {} as Record<TaskStatus, TaskItem[]>);

  // Kanban Column Component
  const KanbanColumn = ({ status, tasksInColumn }: { status: TaskStatus, tasksInColumn: TaskItem[] }) => {
    const { icon: Icon, color, title } = statusColumns[status];
    return (
      <Paper withBorder radius="md" p="md" style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column'}}>
        <Group justify="space-between" mb="md">
          <Group gap="xs">
             <Icon size={18} color={color ? `var(--mantine-color-${color}-6)` : undefined} />
            <Text fw={500}>{title}</Text>
          </Group>
          <Badge color={color} variant="light" size="sm">{tasksInColumn.length}</Badge>
        </Group>
        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <ScrollArea 
                style={{ flexGrow: 1, background: snapshot.isDraggingOver ? 'var(--mantine-color-gray-0)' : 'transparent', borderRadius: 'var(--mantine-radius-sm)', minHeight: 100 }}
                type="auto"
             >
              <Stack
                ref={provided.innerRef}
                {...provided.droppableProps}
                gap="sm"
                p={4}
              >
                {tasksInColumn.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(providedDraggable, snapshotDraggable) => (
                      <Card
                        shadow="sm"
                        padding="sm"
                        radius="sm"
                        withBorder
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        {...providedDraggable.dragHandleProps}
                        style={{
                          ...providedDraggable.draggableProps.style,
                           opacity: snapshotDraggable.isDragging ? 0.8 : 1,
                           borderColor: snapshotDraggable.isDragging ? 'var(--mantine-color-blue-5)' : undefined,
                        }}
                      >
                        <Group justify="space-between" wrap="nowrap">
                          <Text size="sm" fw={500} lineClamp={2}>{task.title}</Text>
                          <Menu shadow="md" width={150} position="bottom-end">
                             <Menu.Target>
                               <ActionIcon variant="subtle" size="xs" color="gray">
                                   <IconGripVertical size={16} />
                               </ActionIcon>
                             </Menu.Target>
                             <Menu.Dropdown>
                               <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => handleEditTask(task)}>
                                 Edit
                               </Menu.Item>
                               <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => handleDeleteTask(task.id)}>
                                 Delete
                               </Menu.Item>
                             </Menu.Dropdown>
                           </Menu>
                         </Group>
                        {task.description && <Text size="xs" c="dimmed" mt={4} lineClamp={3}>{task.description}</Text>}
                        <Group justify="space-between" mt="sm">
                            <Badge 
                                color={priorityColors[task.priority]}
                                variant="light"
                                size="xs"
                                leftSection={<IconUrgent size={12}/>}
                            >
                                {task.priority}
                            </Badge>
                            {task.dueDate && 
                                <Group gap={4} align="center">
                                    <IconClock size={14} style={{ opacity: 0.7 }}/>
                                    <Text size="xs" c="dimmed">{task.dueDate.toLocaleDateString()}</Text>
                                </Group>
                            }
                            {task.assignedTo && 
                                <Group gap={4} align="center">
                                    <IconUser size={14} style={{ opacity: 0.7 }}/>
                                    <Text size="xs" c="dimmed">{task.assignedTo}</Text>
                                </Group>
                            }
                        </Group>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Stack>
            </ScrollArea>
          )}
        </Droppable>
      </Paper>
    );
  };

  return (
    <Container fluid>
      <Group justify="space-between" mb="lg">
        <Title order={2}>
          <IconCalendarStats size={28} style={{ marginRight: '8px', verticalAlign: 'bottom' }} />
          Task Management
        </Title>
         <Group>
            <Button leftSection={<IconPlus size={16} />} onClick={handleAddTask}>
                Add Task
            </Button>
         </Group>
      </Group>
      <Text c="dimmed" mb="xl">
        Organize and track your farm tasks. Drag and drop tasks between columns.
      </Text>

      <DragDropContext onDragEnd={onDragEnd}>
         <Group grow align="stretch" gap="lg" wrap="nowrap" style={{ overflowX: 'auto', minHeight: '500px' }}>
             {Object.keys(columns).map((status) => (
                 <KanbanColumn key={status} status={status as TaskStatus} tasksInColumn={columns[status as TaskStatus]} />
             ))}
         </Group>
      </DragDropContext>

      {tasks.length === 0 && (
         <Paper withBorder p="xl" radius="md" shadow="sm" mt="lg">
            <Text c="dimmed" ta="center" p="lg">No tasks found. Click "Add Task" to get started.</Text>
         </Paper>
      )}

      {/* Add/Edit Task Modal */}
      <Modal opened={opened} onClose={() => setOpened(false)} title={editingTask ? 'Edit Task' : 'Add New Task'} centered size="lg">
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Task Title"
            placeholder="e.g., Repair fence section 3"
            required
            {...form.getInputProps('title')}
            mb="md"
          />
          <Textarea
            label="Description (Optional)"
            placeholder="Add more details about the task..."
            {...form.getInputProps('description')}
            mb="md"
            autosize
            minRows={2}
          />
          <Group grow mb="md">
             <Select
                label="Priority"
                placeholder="Select priority"
                data={['Low', 'Medium', 'High']}
                required
                {...form.getInputProps('priority')}
             />
             <DatePickerInput
                label="Due Date (Optional)"
                placeholder="Select date"
                valueFormat="YYYY-MM-DD"
                {...form.getInputProps('dueDate')}
             />
           </Group>
          <TextInput
            label="Assigned To (Optional)"
            placeholder="e.g., John Doe"
            {...form.getInputProps('assignedTo')}
            mb="xl"
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingTask ? 'Save Changes' : 'Add Task'}</Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}
