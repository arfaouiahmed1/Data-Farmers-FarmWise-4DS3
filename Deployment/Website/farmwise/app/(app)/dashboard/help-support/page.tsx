'use client';

import { 
  Title, 
  Paper, 
  Group, 
  Text, 
  Button, 
  Stack, 
  Divider, 
  Accordion, 
  TextInput, 
  Textarea,
  Anchor,
  ThemeIcon,
  Box
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconQuestionMark, IconMessageCircle, IconLifebuoy, IconSearch, IconSend, IconBook } from '@tabler/icons-react';
import Link from 'next/link';
import classes from './HelpSupportPage.module.css';

// Mock FAQ data
const faqItems = [
  {
    value: 'getting-started',
    question: 'How do I add my first field?',
    answer: 'Navigate to the Field Mapping section from the main menu. Click the "Add Field" button and either draw the boundaries on the map or upload a shapefile. Enter the field details and save.',
  },
  {
    value: 'crop-health-alerts',
    question: 'What do the crop health alerts mean?',
    answer: 'Crop health alerts indicate potential issues detected through satellite imagery or sensor data, such as low NDVI (vegetation index), water stress, or potential disease outbreaks. Click on an alert for more details and recommended actions.',
  },
  {
    value: 'connecting-equipment',
    question: 'Can I connect my existing farm equipment?',
    answer: 'FarmWise supports integration with various IoT sensors and equipment providers. Visit the Equipment section and check the "Integrations" tab for compatible devices and setup instructions. Contact support if your provider is not listed.',
  },
   {
    value: 'billing-subscription',
    question: 'How is billing handled?',
    answer: 'FarmWise operates on a subscription basis, typically billed monthly or annually based on the acreage managed and features enabled. You can manage your subscription and view invoices in the Billing section under Settings (coming soon).',
  },
];

export default function HelpSupportPage() {
  const form = useForm({
    initialValues: {
      subject: '',
      message: '',
      email: '', // Pre-fill if user is logged in and email is available
    },
    validate: {
      subject: (value) => (value.trim().length < 5 ? 'Subject must be at least 5 characters' : null),
      message: (value) => (value.trim().length < 10 ? 'Message must be at least 10 characters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSupportSubmit = (values: typeof form.values) => {
    console.log('Submitting support request:', values);
    // Add API call logic here to send support message
    form.reset();
    // Add notification for success
  };

  return (
    <Stack gap="lg">
      <Title order={2}>Help & Support Center</Title>

      {/* Quick Search/Links */}
       <Paper withBorder shadow="sm" p="lg" radius="md">
         <Stack>
          <TextInput
              placeholder="Search Knowledge Base (e.g., 'irrigation scheduling')"
              leftSection={<IconSearch size={16} />}
              // Add search functionality here if needed
          />
          <Group grow>
              <a href="#faq" className={classes.linkButton}>
               <Button 
                    component="span"
                    fullWidth
                    variant="light" 
                    leftSection={<IconQuestionMark size={16}/>}>
                    View FAQs
                </Button>
              </a>
              <a href="#contact-support" className={classes.linkButton}>
               <Button 
                    component="span"
                    fullWidth
                    variant="light" 
                    leftSection={<IconMessageCircle size={16}/>}>
                    Contact Support
                </Button>
              </a>
              <Link href="/docs" passHref legacyBehavior>
               <a target="_blank" rel="noopener noreferrer" className={classes.linkButton}>
                   <Button 
                        component="span"
                        fullWidth
                        variant="light" 
                        leftSection={<IconBook size={16}/>}>
                        Read Documentation
                    </Button>
                </a>
              </Link>
          </Group>
         </Stack>
       </Paper>

      {/* FAQ Section */}
      <Paper withBorder shadow="sm" p="lg" radius="md" id="faq">
        <Title order={4} mb="md">Frequently Asked Questions</Title>
        <Accordion variant="separated">
          {faqItems.map((item) => (
            <Accordion.Item key={item.value} value={item.value}>
              <Accordion.Control icon={<IconLifebuoy size={16} />}>{item.question}</Accordion.Control>
              <Accordion.Panel>{item.answer}</Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Paper>

      {/* Contact Support Section */}
      <Paper withBorder shadow="sm" p="lg" radius="md" id="contact-support">
        <Title order={4} mb="md">Contact Support</Title>
        <Text size="sm" mb="md">Still need help? Fill out the form below and our support team will get back to you as soon as possible.</Text>
        <form onSubmit={form.onSubmit(handleSupportSubmit)}>
          <Stack>
            <TextInput
              label="Your Email"
              placeholder="your@email.com"
              required
              {...form.getInputProps('email')}
            />
            <TextInput
              label="Subject"
              placeholder="e.g., Issue with field mapping"
              required
              {...form.getInputProps('subject')}
            />
            <Textarea
              label="Message"
              placeholder="Please describe your issue in detail..."
              required
              minRows={4}
              autosize
              {...form.getInputProps('message')}
            />
            <Group justify="flex-end" mt="md">
              <Button type="submit" leftSection={<IconSend size={16}/>}>
                Send Message
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
} 