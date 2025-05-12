'use client';

import React, { useState } from 'react';
import {
  Title,
  Container,
  Paper,
  Group,
  Button,
  Select,
  Stack,
  Text as MantineText,
  SimpleGrid,
  Card,
  ActionIcon,
  Badge,
  Modal,
  TextInput,
  Textarea,
} from '@mantine/core';
import { DatePickerInput, DateValue } from '@mantine/dates';
import { IconFileAnalytics, IconPlus, IconSearch, IconFilter, IconCalendar, IconSettings, IconDownload, IconTrash, IconEye, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Document as PdfDocument, Page as PdfPage, Text as PdfText, View as PdfView, StyleSheet as PdfStyleSheet, Font as PdfFont, pdf } from '@react-pdf/renderer';

interface Report {
  id: string;
  name: string;
  date: string; // ISO date string e.g., "2024-07-15"
  type: string;
  status: string;
  preview: string;
}

// Mock data for reports - replace with actual data fetching
const initialReports: Report[] = [
  { id: '1', name: 'Quarterly Yield Analysis', date: '2024-07-15', type: 'Yield', status: 'Completed', preview: 'Detailed analysis of crop yields for Q2 2024...' },
  { id: '2', name: 'Monthly Pest Control Summary', date: '2024-07-01', type: 'Pest Control', status: 'Completed', preview: 'Overview of pest control activities and effectiveness...' },
  { id: '3', name: 'Annual Financial Overview', date: '2024-01-10', type: 'Finance', status: 'Archived', preview: 'Comprehensive financial report for the year 2023...' },
  { id: '4', name: 'Water Usage Report - June', date: '2024-07-05', type: 'Resource', status: 'Completed', preview: 'Analysis of water consumption and efficiency for June...'},
];

// Register a default font
PdfFont.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxK.woff2', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlvAx0.woff2', fontWeight: 'bold' },
  ]
});

const pdfStyles = PdfStyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 60,
    lineHeight: 1.5,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  section: {
    marginBottom: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 15,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#34495e',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    color: '#34495e',
  },
  text: {
    marginBottom: 5,
    color: '#555',
  },
  previewText: {
    marginTop: 8,
    fontSize: 10,
    color: '#7f8c8d',
    lineHeight: 1.6,
  },
  footer: {
    position: 'absolute',
    fontSize: 9,
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#95a5a6',
  },
  header: {
    position: 'absolute',
    fontSize: 9,
    top: 15,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#95a5a6',
  },
});

// PDF Document Component
const ReportPDFDocument = ({ report }: { report: Report }) => {
  const PdfDocumentComponent = PdfDocument as any;
  const PdfPageComponent = PdfPage as any;
  const PdfTextComponent = PdfText as any;
  const PdfViewComponent = PdfView as any;

  return (
    <PdfDocumentComponent title={report.name} author="FarmWise Reports">
      <PdfPageComponent size="A4" style={pdfStyles.page}>
        <PdfTextComponent style={pdfStyles.header} fixed>
          FarmWise Confidential Report
        </PdfTextComponent>

        <PdfTextComponent style={pdfStyles.title}>{report.name}</PdfTextComponent>

        <PdfViewComponent style={pdfStyles.section}>
          <PdfTextComponent style={pdfStyles.sectionTitle}>Report Overview</PdfTextComponent>
          <PdfTextComponent style={pdfStyles.text}><PdfTextComponent style={pdfStyles.label}>Report ID: </PdfTextComponent>{report.id}</PdfTextComponent>
          <PdfTextComponent style={pdfStyles.text}><PdfTextComponent style={pdfStyles.label}>Type: </PdfTextComponent>{report.type}</PdfTextComponent>
          <PdfTextComponent style={pdfStyles.text}><PdfTextComponent style={pdfStyles.label}>Date Generated: </PdfTextComponent>{new Date(report.date).toLocaleDateString()}</PdfTextComponent>
          <PdfTextComponent style={pdfStyles.text}><PdfTextComponent style={pdfStyles.label}>Status: </PdfTextComponent>{report.status}</PdfTextComponent>
        </PdfViewComponent>

        <PdfViewComponent style={pdfStyles.section}>
          <PdfTextComponent style={pdfStyles.sectionTitle}>Details & Summary</PdfTextComponent>
          <PdfTextComponent style={pdfStyles.previewText}>{report.preview}</PdfTextComponent>
        </PdfViewComponent>

        <PdfTextComponent style={pdfStyles.footer} fixed>
          Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()} - Page {' '}
          <PdfTextComponent render={({ pageNumber, totalPages }: { pageNumber: number, totalPages: number }) => `${pageNumber} / ${totalPages}`} fixed />
        </PdfTextComponent>
      </PdfPageComponent>
    </PdfDocumentComponent>
  );
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[DateValue, DateValue]>([null, null]);
  const [newReportModalOpen, setNewReportModalOpen] = useState<boolean>(false);
  const [newReportName, setNewReportName] = useState<string>('');
  const [newReportType, setNewReportType] = useState<string | null>(null);
  const [newReportDate, setNewReportDate] = useState<DateValue>(new Date());
  const [newReportDescription, setNewReportDescription] = useState<string>('');

  // State for viewing a report
  const [viewReportModalOpen, setViewReportModalOpen] = useState<boolean>(false);
  const [reportToView, setReportToView] = useState<Report | null>(null);

  const reportTypes: string[] = Array.from(new Set(initialReports.map((r: Report) => r.type)));

  const filteredReports: Report[] = reports
    .filter((report: Report) => report.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((report: Report) => (filterType ? report.type === filterType : true))
    .filter((report: Report) => {
      if (!dateRange[0] && !dateRange[1]) return true;
      const reportDate = new Date(report.date);
      if (dateRange[0] && reportDate < dateRange[0]) return false;
      if (dateRange[1] && reportDate > dateRange[1]) return false;
      return true;
    });

  const handleCreateReport = () => {
    if (!newReportName || !newReportType || !newReportDate) {
        alert("Please fill in all required fields for the new report.");
        return;
    }
    const reportDateString = newReportDate instanceof Date ? newReportDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    const newReport: Report = {
      id: String(Date.now()),
      name: newReportName,
      type: newReportType,
      date: reportDateString,
      status: 'Pending',
      preview: newReportDescription || 'New report, pending generation.',
    };
    setReports((prevReports: Report[]) => [newReport, ...prevReports]);
    setNewReportModalOpen(false);
    setNewReportName('');
    setNewReportType(null);
    setNewReportDate(new Date());
    setNewReportDescription('');
  };

  const handleDeleteReport = (id: string) => {
    setReports((prevReports: Report[]) => prevReports.filter((report: Report) => report.id !== id));
  };

  const handleViewReport = (report: Report) => {
    setReportToView(report);
    setViewReportModalOpen(true);
  };

  const handleDownloadReport = async (report: Report) => {
    const pdfBlob = await pdf(<ReportPDFDocument report={report} />).toBlob();
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.name.replace(/\s+/g, '_').toLowerCase()}_report.pdf`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Container fluid p="lg">
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={1}><IconFileAnalytics size={32} style={{ marginRight: 8 }} />Reports Dashboard</Title>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setNewReportModalOpen(true)}>
            Create New Report
          </Button>
        </Group>

        <Paper shadow="sm" p="lg" withBorder>
          <Title order={3} mb="md">Filter & Search Reports</Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            <TextInput
              placeholder="Search by name..."
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.currentTarget.value)}
            />
            <Select
              placeholder="Filter by type"
              leftSection={<IconFilter size={16} />}
              data={reportTypes.map(type => ({ value: type, label: type }))}
              value={filterType}
              onChange={setFilterType}
              clearable
            />
            <DatePickerInput
              type="range"
              placeholder="Filter by date range"
              leftSection={<IconCalendar size={16} />}
              value={dateRange}
              onChange={setDateRange}
              clearable
              previousIcon={<IconChevronLeft size={20} />}
              nextIcon={<IconChevronRight size={20} />}
            />
            <Button leftSection={<IconSettings size={16} />}>
              Advanced Filters
            </Button>
          </SimpleGrid>
        </Paper>

        {filteredReports.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {filteredReports.map((report: Report) => (
              <Card key={report.id} shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Title order={4}>{report.name}</Title>
                    <Badge color={report.status === 'Completed' ? 'green' : report.status === 'Pending' ? 'yellow' : 'gray'} variant="light">
                      {report.status}
                    </Badge>
                  </Group>
                  <MantineText size="sm" c="dimmed">Type: {report.type}</MantineText>
                  <MantineText size="sm" c="dimmed">Date: {new Date(report.date).toLocaleDateString()}</MantineText>
                  <MantineText size="xs" lineClamp={3}>{report.preview}</MantineText>
                </Stack>
                <Group justify="flex-end" mt="md">
                    <ActionIcon variant="light" color="blue" onClick={() => handleViewReport(report)}>
                        <IconEye size={18} />
                    </ActionIcon>
                    <ActionIcon variant="light" color="teal" onClick={() => handleDownloadReport(report)}>
                        <IconDownload size={18} />
                    </ActionIcon>
                    <ActionIcon variant="light" color="red" onClick={() => handleDeleteReport(report.id)}>
                        <IconTrash size={18} />
                    </ActionIcon>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Paper p="xl" withBorder style={{ textAlign: 'center' }}>
            <MantineText size="lg" c="dimmed">No reports found matching your criteria.</MantineText>
            <MantineText c="dimmed">Try adjusting your search or filters, or create a new report.</MantineText>
          </Paper>
        )}
      </Stack>

      <Modal
        opened={newReportModalOpen}
        onClose={() => setNewReportModalOpen(false)}
        title={<Title order={3}>Create New Report</Title>}
        centered
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Report Name"
            placeholder="e.g., Monthly Sales Summary"
            value={newReportName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewReportName(e.currentTarget.value)}
            required
          />
          <Select
            label="Report Type"
            placeholder="Select report type"
            data={['Sales', 'Inventory', 'Yield', 'Pest Control', 'Finance', 'Resource', 'Custom']}
            value={newReportType}
            onChange={setNewReportType}
            required
          />
          <DatePickerInput
            label="Report Date"
            placeholder="Select date"
            value={newReportDate}
            onChange={setNewReportDate}
            required
            previousIcon={<IconChevronLeft size={20} />}
            nextIcon={<IconChevronRight size={20} />}
          />
          <Textarea
            label="Description (Optional)"
            placeholder="Briefly describe the report..."
            value={newReportDescription}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewReportDescription(e.currentTarget.value)}
            minRows={3}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setNewReportModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateReport}>Create Report</Button>
          </Group>
        </Stack>
      </Modal>

      {/* View Report Modal */}
      {reportToView && (
        <Modal
          opened={viewReportModalOpen}
          onClose={() => {
            setViewReportModalOpen(false);
            setReportToView(null);
          }}
          title={reportToView ? `Report Details: ${reportToView.name}` : 'Report Details'}
          centered
          size="lg"
        >
          <Stack gap="md">
            <Title order={4} mb="sm">{reportToView.name}</Title>

            <Paper p="md" withBorder radius="md">
              <Title order={5}>Report Name (from data)</Title>
              <MantineText>{reportToView.name}</MantineText>
            </Paper>
            <SimpleGrid cols={2} spacing="md">
                <Paper p="md" withBorder radius="md">
                    <Title order={5}>Type</Title>
                    <MantineText>{reportToView.type}</MantineText>
                </Paper>
                <Paper p="md" withBorder radius="md">
                    <Title order={5}>Date</Title>
                    <MantineText>{new Date(reportToView.date).toLocaleDateString()}</MantineText>
                </Paper>
            </SimpleGrid>
            <Paper p="md" withBorder radius="md">
                <Title order={5}>Status</Title>
                <Badge color={reportToView.status === 'Completed' ? 'green' : reportToView.status === 'Pending' ? 'yellow' : 'gray'} variant="outline" size="lg">
                    {reportToView.status}
                </Badge>
            </Paper>
            <Paper p="md" withBorder radius="md">
                <Title order={5}>Preview / Summary</Title>
                <Textarea
                    value={reportToView.preview}
                    readOnly
                    autosize
                    minRows={4}
                    variant="filled"
                />
            </Paper>
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => handleDownloadReport(reportToView)}>Download Report</Button>
              <Button variant="default" onClick={() => {
                setViewReportModalOpen(false);
                setReportToView(null);
              }}>Close</Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </Container>
  );
}
