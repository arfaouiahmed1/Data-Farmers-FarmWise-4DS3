'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  SimpleGrid,
  Group,
  ActionIcon,
  Tooltip,
  Loader,
  Alert,
  Skeleton,
  Box,
  TextInput,
  Button,
  ThemeIcon,
  Stack,
  List,
  Grid
} from '@mantine/core';
import {
  IconCloud,
  IconTemperature,
  IconDropletFilled,
  IconWind,
  IconSun,
  IconMoon,
  IconCloudRain,
  IconSnowflake,
  IconMapPin,
  IconAlertCircle,
  IconCurrentLocation,
  IconAlertTriangle,
  IconDroplet,
  IconTemperatureMinus,
  IconTemperaturePlus,
  IconShieldCheck
} from '@tabler/icons-react';
import dayjs from 'dayjs';

interface Coordinates {
  latitude: number;
  longitude: number;
}

// Mock data structures (replace with actual API response structure)
interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  description: string;
  iconCode: string; // Example: '01d' for clear day
  precipChance: number;
}

interface ForecastHour {
  time: number; // timestamp
  temp: number;
  iconCode: string;
  precipChance: number;
}

interface ForecastDay {
  date: number; // timestamp
  maxTemp: number;
  minTemp: number;
  iconCode: string;
  description: string;
  precipChance: number;
}

// --- Mock Data (Replace with API calls) ---
const mockCurrentWeather: CurrentWeather = {
  temp: 22,
  feelsLike: 21,
  humidity: 65,
  windSpeed: 15,
  windDirection: 'NW',
  description: 'Partly Cloudy',
  iconCode: '02d',
  precipChance: 10
};

const mockHourlyForecast: ForecastHour[] = Array.from({ length: 8 }).map((_, i) => ({
  time: dayjs().add(i + 1, 'hour').unix() * 1000,
  temp: 22 + Math.round(Math.sin(i / 2) * 3),
  iconCode: ['01d', '02d', '03d', '04d', '09d', '10d', '11d', '13d', '50d'][i % 9],
  precipChance: Math.max(0, Math.min(100, 10 + Math.round(Math.sin(i) * 20)))
}));

const mockDailyForecast: ForecastDay[] = Array.from({ length: 5 }).map((_, i) => ({
  date: dayjs().add(i + 1, 'day').unix() * 1000,
  maxTemp: 25 + Math.round(Math.random() * 4) - 2,
  minTemp: 15 + Math.round(Math.random() * 3) - 1,
  iconCode: ['01d', '02d', '03d', '04d', '09d', '10d', '11d'][i % 7],
  description: ['Sunny', 'Mostly Sunny', 'Partly Cloudy', 'Cloudy', 'Showers', 'Rain', 'Thunderstorm'][i % 7],
  precipChance: Math.max(0, Math.min(100, 5 + Math.round(Math.random() * 50)))
}));

// Helper to get a weather icon (simplified)
const getWeatherIcon = (iconCode: string, size = 24) => {
  if (iconCode.includes('01')) return <IconSun size={size} color="orange" />;
  if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) return <IconCloud size={size} color="gray" />;
  if (iconCode.includes('09') || iconCode.includes('10')) return <IconCloudRain size={size} color="blue" />;
  if (iconCode.includes('11')) return <IconCloudRain size={size} color="darkblue" />; // Placeholder for Thunderstorm
  if (iconCode.includes('13')) return <IconSnowflake size={size} color="lightblue" />;
  if (iconCode.includes('50')) return <IconCloud size={size} color="lightgray" />; // Placeholder for Mist
  return <IconCloud size={size} color="gray" />;
};

// --- Recommendation Logic ---
interface Recommendation {
  text: string;
  type: 'irrigation' | 'protection' | 'planting' | 'general';
  icon: React.ReactNode;
}

const generateRecommendations = (forecast: ForecastDay[]): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  if (!forecast || forecast.length === 0) return recommendations;

  // Simple checks for demo purposes
  const nextRainyDay = forecast.find(day => day.precipChance > 50);
  const hotDays = forecast.filter(day => day.maxTemp > 30); // Example threshold
  const coldDays = forecast.filter(day => day.minTemp < 5); // Example threshold

  if (nextRainyDay) {
    const daysUntilRain = dayjs(nextRainyDay.date).diff(dayjs(), 'day');
    if (daysUntilRain <= 2) {
        recommendations.push({
            text: `Rain expected in ${daysUntilRain === 0 ? 'less than a day' : daysUntilRain + ' day' + (daysUntilRain > 1 ? 's' : '')} (${nextRainyDay.precipChance}% chance). Consider adjusting irrigation schedules.`,
            type: 'irrigation',
            icon: <IconDroplet size={16} />
        });
    }
  }

  if (hotDays.length >= 2) {
     recommendations.push({
        text: `Upcoming hot weather (${hotDays.length} days > 30°C). Ensure vulnerable crops have adequate water and consider shade.`,
        type: 'protection',
        icon: <IconTemperaturePlus size={16} />
    });
  }
  
  if (coldDays.length > 0) {
     const nextColdDay = coldDays[0];
      recommendations.push({
        text: `Potential for low temperatures (${nextColdDay.minTemp}°C on ${dayjs(nextColdDay.date).format('ddd')}). Protect sensitive plants if necessary.`,
        type: 'protection',
        icon: <IconTemperatureMinus size={16} />
    });
  }

  // Add a generic tip
  if (recommendations.length === 0) {
     recommendations.push({
        text: `Weather conditions look stable. Continue standard monitoring.`,
        type: 'general',
        icon: <IconShieldCheck size={16} />
    });
  }

  return recommendations;
};

export default function WeatherPage() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [manualLocation, setManualLocation] = useState('');
  const [isWindyMapLoaded, setIsWindyMapLoaded] = useState(false);
  const windyMapRef = useRef<HTMLIFrameElement>(null);

  // --- Fetch Location --- 
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
          setIsLoadingLocation(false);
        },
        (error) => {
          setLocationError(`Error getting location: ${error.message}. Please allow location access or enter manually.`);
          setIsLoadingLocation(false);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser. Please enter location manually.');
      setIsLoadingLocation(false);
    }
  }, []);

  // --- Fetch Weather Data (Placeholder) ---
  // In a real app, fetch data based on `coords` or `manualLocation` here
  const currentWeatherData = coords || manualLocation ? mockCurrentWeather : null;
  const hourlyData = coords || manualLocation ? mockHourlyForecast : [];
  const dailyData = coords || manualLocation ? mockDailyForecast : [];

  // Generate recommendations based on daily data
  const recommendations = generateRecommendations(dailyData);

  // --- Windy Map Integration Point ---
  const windyApiKey = "YOUR_WINDY_API_KEY"; // <-- IMPORTANT: Replace with your actual key
  const windyMapUrl = coords
    ? `https://embed.windy.com/embed2.html?lat=${coords.latitude}&lon=${coords.longitude}&detailLat=${coords.latitude}&detailLon=${coords.longitude}&width=100%&height=450&zoom=8&level=surface&overlay=wind&product=ecmwf&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`
    : "https://embed.windy.com/embed2.html?lat=47.166&lon=19.502&zoom=5&width=100%&height=450"; // Default location if coords unavailable

  const handleManualLocationSubmit = () => {
    // Basic validation - a real app would use geocoding API
    if (manualLocation.trim()) {
      console.log("Fetching weather for manual location:", manualLocation);
      setCoords(null); // Clear coords if manual location is used
      setLocationError(null); // Clear error
      // Trigger data fetching based on manualLocation here
    } else {
      setLocationError("Please enter a valid location (e.g., City, Country).");
    }
  };

  const handleRetryLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    setCoords(null);
    setManualLocation('');
    // Re-trigger useEffect logic
     if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
          setIsLoadingLocation(false);
        },
        (error) => {
          setLocationError(`Error getting location: ${error.message}. Please allow location access or enter manually.`);
          setIsLoadingLocation(false);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser. Please enter location manually.');
      setIsLoadingLocation(false);
    }
  }

  return (
    <Container fluid>
      <Group justify="space-between" mb="lg">
         <Title order={2}>
             <IconCloud size={28} style={{ marginRight: '8px', verticalAlign: 'bottom' }} />
            Weather Center
         </Title>
         {isLoadingLocation ? (
            <Loader size="sm" />
         ) : coords ? (
            <Group gap="xs">
                <IconMapPin size={16} />
                <Text size="sm">{coords.latitude.toFixed(3)}, {coords.longitude.toFixed(3)}</Text>
                <Tooltip label="Get Current Location Again">
                    <ActionIcon variant="subtle" onClick={handleRetryLocation}><IconCurrentLocation size={18} /></ActionIcon>
                </Tooltip>
            </Group>
         ) : null}
      </Group>

      {locationError && (
        <Alert title="Location Access Issue" color="orange" icon={<IconAlertCircle />} mb="lg" withCloseButton onClose={() => setLocationError(null)}>
          <Text size="sm">{locationError}</Text>
          <Group grow mt="sm">
            <TextInput
              placeholder="Enter City, Country or Zip Code"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.currentTarget.value)}
              rightSection={ <ActionIcon variant="filled" size="sm" onClick={handleManualLocationSubmit}><IconMapPin size={14}/></ActionIcon>}
            />
            <Button onClick={handleRetryLocation} variant='outline' size="sm">Retry Geolocation</Button>
          </Group>
        </Alert>
      )}

      {/* --- Current Weather & Recommendations Grid --- */} 
      <Grid gutter="xl" mb="xl">
           <Grid.Col span={{ base: 12, md: 7 }}>
                <Paper withBorder p="lg" radius="md" shadow="sm" h="100%">
                    <Title order={4} mb="md">Current Conditions</Title>
                     {isLoadingLocation && !currentWeatherData && <Skeleton height={80} />}
                     {!isLoadingLocation && !currentWeatherData && !locationError && <Text c="dimmed">Enter location above to view weather.</Text>}
                     {currentWeatherData && (
                         <SimpleGrid cols={{ base: 1, xs: 2, md: 2 }}>
                             <Group wrap="nowrap">
                                {getWeatherIcon(currentWeatherData.iconCode, 40)}
                                <Box>
                                    <Text size="xl" fw={600}>{currentWeatherData.temp}°C</Text>
                                    <Text size="sm" c="dimmed">{currentWeatherData.description}</Text>
                                </Box>
                            </Group>
                             <StatItem icon={<IconTemperature size={24} />} label="Feels Like" value={`${currentWeatherData.feelsLike}°C`} />
                             <StatItem icon={<IconDropletFilled size={24} />} label="Humidity" value={`${currentWeatherData.humidity}%`} />
                             <StatItem icon={<IconWind size={24} />} label="Wind" value={`${currentWeatherData.windSpeed} km/h ${currentWeatherData.windDirection}`} />
                         </SimpleGrid>
                    )}
                </Paper>
           </Grid.Col>
           <Grid.Col span={{ base: 12, md: 5 }}>
                <Paper withBorder p="lg" radius="md" shadow="sm" h="100%">
                    <Title order={4} mb="md">Recommendations</Title>
                     {isLoadingLocation && !recommendations.length && <Skeleton height={80} />}
                     {!isLoadingLocation && !recommendations.length && !locationError && <Text c="dimmed">Enter location above.</Text>}
                     {!isLoadingLocation && recommendations.length > 0 && (
                        <List
                            spacing="sm"
                            size="sm"
                            center
                            icon={
                                <ThemeIcon color="blue" size={20} radius="xl">
                                <IconAlertTriangle size={12} />
                                </ThemeIcon>
                            }
                        >
                            {recommendations.map((rec, index) => (
                                <List.Item key={index} 
                                     icon={
                                        <ThemeIcon 
                                            color={rec.type === 'irrigation' ? 'blue' : rec.type === 'protection' ? 'orange' : 'gray'} 
                                            size={20} 
                                            radius="xl"
                                        >
                                            {rec.icon}
                                        </ThemeIcon>
                                    }
                                >
                                    {rec.text}
                                </List.Item>
                            ))}
                        </List>
                     )}
                 </Paper>
            </Grid.Col>
      </Grid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} mb="xl">
        {/* --- Hourly Forecast --- */}
        <Paper withBorder p="lg" radius="md" shadow="sm">
            <Title order={4} mb="md">Hourly Forecast (Next 8 hours)</Title>
             {isLoadingLocation && !hourlyData.length && <Skeleton height={100} />}
             {!isLoadingLocation && !hourlyData.length && !locationError && <Text c="dimmed" ta="center">Enter location above.</Text>}
            <Group wrap="nowrap" gap="xs" style={{ overflowX: 'auto' }}>
            {hourlyData.map((hour) => (
                <Paper key={hour.time} p="xs" radius="sm" style={{ textAlign: 'center', minWidth: '70px' }}>
                <Text size="xs" c="dimmed">{dayjs(hour.time).format('ha')}</Text>
                 {getWeatherIcon(hour.iconCode, 24)}
                <Text size="sm" fw={500}>{hour.temp}°C</Text>
                {hour.precipChance > 5 && <Text size="xs" c="blue">{hour.precipChance}%</Text>} 
                </Paper>
            ))}
            </Group>
        </Paper>

        {/* --- Daily Forecast --- */}
        <Paper withBorder p="lg" radius="md" shadow="sm">
            <Title order={4} mb="md">Daily Forecast (Next 5 Days)</Title>
             {isLoadingLocation && !dailyData.length && <Skeleton height={100} />}
             {!isLoadingLocation && !dailyData.length && !locationError && <Text c="dimmed" ta="center">Enter location above.</Text>}
            <Stack gap="xs">
            {dailyData.map((day) => (
                <Group key={day.date} justify="space-between" wrap="nowrap">
                <Group gap="sm">
                    {getWeatherIcon(day.iconCode, 24)}
                     <Text size="sm" fw={500} miw={70}>{dayjs(day.date).format('ddd, MMM D')}</Text>
                </Group>
                <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>{day.description}</Text>
                 <Group gap="sm" justify="flex-end" miw={80}>
                     <Text size="sm" fw={500}>{day.maxTemp}°</Text>
                    <Text size="sm" c="dimmed">/ {day.minTemp}°</Text>
                    {day.precipChance > 10 && <Text size="xs" c="blue">{day.precipChance}%</Text>} 
                </Group>
                </Group>
            ))}
            </Stack>
        </Paper>
      </SimpleGrid>

      {/* --- Windy Map Integration --- */}
      <Paper withBorder p="lg" radius="md" shadow="sm" mb="xl">
         <Title order={4} mb="md">Weather Map</Title>
          <Alert color="blue" title="Integration Note" icon={<IconAlertCircle/>} mb="md">
              This section uses an embedded map from Windy.com. For full functionality and customization (like removing branding or using advanced layers), 
              you may need a <strong>Windy API key ({windyApiKey ? 'Key Found (Placeholder)' : 'Replace Placeholder Key'})</strong> and potentially use their API library instead of a simple embed. 
              Refer to <a href="https://api.windy.com/" target="_blank" rel="noopener noreferrer">Windy API Documentation</a> for more details.
            </Alert>
         <Box style={{ position: 'relative', minHeight: '450px' }}>
           {!isWindyMapLoaded && (
             <Group justify="center" align="center" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
               <Loader />
               <Text>Loading Windy Map...</Text>
             </Group>
           )}
           <iframe
             ref={windyMapRef}
             width="100%"
             height="450"
             src={windyMapUrl}
             onLoad={() => setIsWindyMapLoaded(true)}
             style={{ border: 0, display: isWindyMapLoaded ? 'block' : 'none' }} 
             allowFullScreen
           ></iframe>
         </Box>
      </Paper>

    </Container>
  );
}

// Helper component for stats
const StatItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <Group wrap="nowrap">
    <ThemeIcon variant="light" size="lg" radius="md">
      {icon}
    </ThemeIcon>
    <Box>
      <Text size="xs" c="dimmed">{label}</Text>
      <Text fw={500}>{value}</Text>
    </Box>
  </Group>
);
