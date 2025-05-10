'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Paper,
  SimpleGrid,
  Group,
  ActionIcon,
  Tooltip,
  Loader,
  Alert,
  Box,
  Button,
  ThemeIcon,
  Stack,
  Text,
  Card,
  Badge,
  Tabs,
  Grid,
  rem,
  Progress,
  Divider,
  Skeleton,
  List
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
  IconShieldCheck,
  IconChevronRight,
  IconThermometer,
  IconUmbrella,
  IconPlant,
  IconPlant2,
  IconSunHigh,
  IconRefresh
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';

// Improved fetch backend utility with proper error handling and authentication
const fetchBackend = async (url: string, options: RequestInit = {}) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  // Keep the URL as is - Next.js handles the rewrites in next.config.mjs
  const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  
  // Get token from localStorage if available
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token'); // Changed from 'authToken' to 'token' to match auth.ts
  }
  
  // Include credentials and set default headers
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Token ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };
  
  try {
    const response = await fetch(fullUrl, defaultOptions);
    
    // Handle unauthorized errors - might need to redirect to login
    if (response.status === 401) {
      console.error('Authentication required. Please log in.');
      // You can add redirect logic here if needed
    }
    
    return response;
  } catch (error) {
    console.error('Error calling API:', error);
    throw error;
  }
};

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface WeatherCondition {
  temperature: number;
  humidity: number;
  precipitation: number;
  weather_code: number;
  wind_speed: number;
  wind_direction: number;
  weather_description: string;
  icon_code: string;
}

interface HourlyForecast {
  time: string;
  temperature: number;
  precipitation_probability: number;
  weather_code: number;
  wind_speed: number;
  weather_description: string;
  icon_code: string;
}

interface DailyForecast {
  date: string;
  max_temp: number;
  min_temp: number;
  precipitation_sum: number;
  precipitation_probability: number;
  weather_code: number;
  weather_description: string;
  icon_code: string;
}

interface WeatherData {
  current: WeatherCondition;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

interface Recommendation {
  type: string;
  details: {
    title: string;
    description: string;
    urgency: string;
    [key: string]: any;
  };
}

interface WeatherResponse {
  farm_id: number;
  farm_name: string;
  coordinates: Coordinates;
  weather_data: WeatherData;
  recommendations: Recommendation[];
}

// Helper to get a weather icon based on icon_code from API
const getWeatherIcon = (iconCode: string, size = 24) => {
  if (iconCode.includes('01')) return <IconSun size={size} stroke={1.5} color="orange" />;
  if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) return <IconCloud size={size} stroke={1.5} color="#6b7280" />;
  if (iconCode.includes('09') || iconCode.includes('10')) return <IconCloudRain size={size} stroke={1.5} color="#3b82f6" />;
  if (iconCode.includes('11')) return <IconCloudRain size={size} stroke={1.5} color="#1e40af" />; // Thunderstorm
  if (iconCode.includes('13')) return <IconSnowflake size={size} stroke={1.5} color="#93c5fd" />;
  if (iconCode.includes('50')) return <IconCloud size={size} stroke={1.5} color="#9ca3af" />; // Mist
  return <IconCloud size={size} stroke={1.5} color="#6b7280" />;
};

// Get background gradient based on weather and time
const getWeatherGradient = (iconCode: string) => {
  if (iconCode.includes('01')) return 'linear-gradient(135deg, #64B5F6 0%, #1E88E5 100%)'; // Clear sky
  if (iconCode.includes('02')) return 'linear-gradient(135deg, #90CAF9 0%, #42A5F5 100%)'; // Few clouds
  if (iconCode.includes('03') || iconCode.includes('04')) return 'linear-gradient(135deg, #BBDEFB 0%, #64B5F6 100%)'; // Cloudy
  if (iconCode.includes('09') || iconCode.includes('10')) return 'linear-gradient(135deg, #78909C 0%, #546E7A 100%)'; // Rain
  if (iconCode.includes('11')) return 'linear-gradient(135deg, #455A64 0%, #263238 100%)'; // Thunderstorm
  if (iconCode.includes('13')) return 'linear-gradient(135deg, #CFD8DC 0%, #B0BEC5 100%)'; // Snow
  if (iconCode.includes('50')) return 'linear-gradient(135deg, #B0BEC5 0%, #78909C 100%)'; // Mist
  return 'linear-gradient(135deg, #64B5F6 0%, #1976D2 100%)'; // Default blue
};

const formatTime = (timeString: string) => {
  return dayjs(timeString).format('h A'); // Format as "3 PM"
};

const formatDay = (dateString: string) => {
  return dayjs(dateString).format('ddd, MMM D'); // Format as "Mon, Jul 24"
};

// Get icon for recommendation type
const getRecommendationIcon = (type: string) => {
  switch (type) {
    case 'WATER':
      return IconDroplet;
    case 'WEATHER':
      return IconCloud;
    case 'CROP':
      return IconPlant;
    default:
      return IconShieldCheck;
  }
};

// Get color for recommendation urgency
const getUrgencyColor = (urgency: string) => {
  switch (urgency.toLowerCase()) {
    case 'high':
      return 'red';
    case 'medium':
      return 'orange';
    case 'low':
      return 'green';
    default:
      return 'blue';
  }
};

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [farmBoundary, setFarmBoundary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('today');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [updatingBoundary, setUpdatingBoundary] = useState<boolean>(false);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching weather data from backend...');
      // Get auth token from localStorage
      const token = localStorage.getItem('token'); // Changed from 'authToken' to 'token'
      if (!token) {
        console.error('No authentication token found');
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      // First, try to get weather data from the API
      const response = await fetchBackend('/api/weather/data/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      if (response.ok) {
        // Successfully fetched data
        const data = await response.json();
        console.log('Weather data fetched successfully:', data);
        setWeatherData(data);
        setFarmBoundary(data.boundary || null);
        
        // Update localStorage cache to improve performance on future loads
        try {
          localStorage.setItem('weather_data_cache', JSON.stringify({
            timestamp: new Date().getTime(),
            data: data
          }));
        } catch (cacheError) {
          console.warn('Failed to cache weather data:', cacheError);
        }
    } else {
        // Handle error response from backend
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `HTTP Error: ${response.status}` };
        }
        
        console.error('Failed to fetch weather data:', errorData);
        setError(errorData.error || `Failed to fetch weather data. Status: ${response.status}`);
        
        // Check if we have cached data that's less than 6 hours old
        try {
          const cachedData = localStorage.getItem('weather_data_cache');
          if (cachedData) {
            const { timestamp, data } = JSON.parse(cachedData);
            const age = new Date().getTime() - timestamp;
            const sixHoursInMs = 6 * 60 * 60 * 1000;
            
            if (age < sixHoursInMs) {
              console.log('Using cached weather data from', new Date(timestamp));
              setWeatherData(data);
              setFarmBoundary(data.boundary || null);
              setError('Using cached data - ' + errorData.error);
              return;
            }
          }
        } catch (cacheError) {
          console.warn('Failed to retrieve cached weather data:', cacheError);
        }
      }
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch farm boundary
  const fetchFarmBoundary = async (farmId: number) => {
    if (!farmId || farmId === 0) return;
    
    try {
      const response = await fetchBackend(`/api/farm/boundary/${farmId}/`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Farm boundary data fetched successfully:', data);
        setFarmBoundary(data.boundary);
    } else {
        console.error('Failed to fetch farm boundary:', response.status);
      }
    } catch (err) {
      console.error('Error fetching farm boundary:', err);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  // Fetch farm boundary when weather data is loaded
  useEffect(() => {
    if (weatherData && weatherData.farm_id) {
      fetchFarmBoundary(weatherData.farm_id);
    }
  }, [weatherData?.farm_id]);

  const handleRefresh = () => {
    fetchWeatherData();
    notifications.show({
      title: 'Refreshing Weather Data',
      message: 'Getting the latest weather information for your farm',
      color: 'blue',
      icon: <IconRefresh />,
    });
  };

  const updateFarmBoundary = async () => {
    setUpdatingBoundary(true);
    try {
      // Use the sample boundary provided
      const sampleBoundary = {
        "type": "Feature", 
        "geometry": {
          "type": "Polygon", 
          "coordinates": [[[10.135041265430566, 36.9078367244124], [10.135041265430566, 36.907592160582176], [10.138616113605615, 36.90583471352312], [10.139037103710063, 36.907012032426756], [10.1387302804136, 36.907751411448366], [10.138280748607158, 36.90817228873759], [10.137417362121766, 36.90857041590307], [10.136496892232383, 36.90857041590307], [10.135041265430566, 36.9078367244124]]]
        }, 
        "properties": {
          "id": 3, 
          "area_hectares": 6.13, 
          "size_category": "Standard Cultivation (1-10 Ha)", 
          "message": "Detected a Standard Cultivation."
        }
      };
      
      console.log("Updating farm boundary with sample data...");
      const token = localStorage.getItem('token'); // Changed from 'authToken' to 'token'
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      // Call our Next.js API route to update the farm boundary
      const response = await fetch('/api/update-farm-boundary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          boundary: sampleBoundary
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log("Farm boundary updated successfully:", data);
        // Now fetch the weather data again
        await fetchWeatherData();
        notifications.show({
          title: 'Farm Boundary Updated',
          message: 'Successfully updated farm boundary. Weather data has been refreshed.',
          color: 'green',
          autoClose: 3000,
        });
    } else {
        console.error("Error updating farm boundary:", data);
        setError(`Failed to update farm boundary: ${data.error || data.detail || 'Unknown error'}`);
        notifications.show({
          title: 'Error',
          message: `Failed to update farm boundary: ${data.error || data.detail || 'Unknown error'}`,
          color: 'red',
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error('Error in updateFarmBoundary:', err);
      setError('Failed to update farm boundary. Please try again later.');
      notifications.show({
        title: 'Error',
        message: 'Failed to update farm boundary. Please try again later.',
        color: 'red',
        autoClose: 3000,
      });
    } finally {
      setUpdatingBoundary(false);
    }
  };

  if (loading) {
    return (
      <Container size="xl" px={isMobile ? 'xs' : 'md'} py="md">
        <Paper shadow="sm" radius="md" p="md" mb="md">
          <Skeleton height={50} width="50%" mb="md" />
          <Skeleton height={200} mb="xl" />
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
            <Skeleton height={100} />
            <Skeleton height={100} />
            <Skeleton height={100} />
            <Skeleton height={100} />
          </SimpleGrid>
        </Paper>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <Skeleton height={300} />
          <Skeleton height={300} />
        </SimpleGrid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" px={isMobile ? 'xs' : 'md'} py="md">
        <Alert
          variant="filled"
          color="red"
          title="Error loading weather data"
          icon={<IconAlertCircle />}
        >
          <Stack gap="md">
            <Text size="sm">{error}</Text>
            
            {error.includes("coordinates unavailable") && (
              <>
                <Box my="md">
                  <Text size="sm" fw={500}>Your farm needs location information for weather data.</Text>
                  <Text size="xs">Weather forecasts require your farm's location. You can add this in two ways:</Text>
                  
                  <List size="sm" mt="sm">
                    <List.Item>Go to the mapping page to draw your farm boundary</List.Item>
                    <List.Item>Use the button below to set your farm boundary using the sample data</List.Item>
                  </List>
                </Box>
                
                <Group>
                  <Button 
                    component="a" 
                    href="/dashboard/mapping" 
                    variant="white" 
                    color="red"
                    leftSection={<IconMapPin size={16} />}
                  >
                    Go to Mapping
                  </Button>
                  
                  <Button
                    variant="outline"
                    color="red"
                    leftSection={<IconRefresh size={16} />}
                    onClick={updateFarmBoundary}
                    loading={updatingBoundary}
                  >
                    Set Sample Boundary
                  </Button>
                </Group>
              </>
            )}
            
            {(!error.includes("coordinates unavailable")) && (
              <Button 
                variant="white" 
                color="red"
                leftSection={<IconRefresh size={16} />}
                onClick={fetchWeatherData}
                mt="sm"
              >
                Try Again
              </Button>
            )}
          </Stack>
        </Alert>
      </Container>
    );
  }

  if (!weatherData) {
    return (
      <Container size="xl" px={isMobile ? 'xs' : 'md'} py="md">
        <Alert
          variant="filled"
          color="blue"
          title="No weather data available"
          icon={<IconAlertCircle />}
        >
          <Text size="sm" mb="md">Please refresh to fetch the latest weather data.</Text>
          <Button variant="white" color="blue" onClick={fetchWeatherData}>
            Refresh Data
          </Button>
        </Alert>
      </Container>
    );
    }

  const { current, hourly, daily } = weatherData.weather_data;

  return (
    <Container size="xl" px={isMobile ? 'xs' : 'md'} py="md">
      <Paper
        shadow="sm"
        radius="md"
        p="md"
        mb="lg"
        style={{
          background: getWeatherGradient(current.icon_code),
          color: 'white',
        }}
      >
      <Group justify="space-between" mb="lg">
          <div>
            <Group gap="xs">
              <IconMapPin size={20} stroke={1.5} />
              <Text fw={500}>{weatherData.farm_name}</Text>
            </Group>
            <Title order={2} mt="xs">{current.weather_description}</Title>
          </div>
          <Button 
            variant="white" 
            leftSection={<IconRefresh size={16} />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
      </Group>

        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Group align="flex-start" gap="xl">
              <div style={{ textAlign: 'center' }}>
                {getWeatherIcon(current.icon_code, 60)}
              </div>
              <div>
                <Text size="3.5rem" fw={600} lh={1}>
                  {Math.round(current.temperature)}°C
                </Text>
                <Text size="md" c="white" opacity={0.9}>
                  Feels like {Math.round(current.temperature)}°C
                </Text>
              </div>
            </Group>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <SimpleGrid cols={{ base: 2, md: 2 }} spacing="xs">
              <div>
                <Group gap="xs">
                  <IconDropletFilled size={18} />
                  <Text size="sm">Humidity</Text>
                </Group>
                <Text fw={500}>{current.humidity}%</Text>
              </div>
              <div>
                <Group gap="xs">
                  <IconWind size={18} />
                  <Text size="sm">Wind</Text>
                </Group>
                <Text fw={500}>{current.wind_speed} km/h</Text>
              </div>
              <div>
                <Group gap="xs">
                  <IconCloudRain size={18} />
                  <Text size="sm">Precipitation</Text>
          </Group>
                <Text fw={500}>{current.precipitation} mm</Text>
              </div>
              <div>
                <Group gap="xs">
                  <IconUmbrella size={18} />
                  <Text size="sm">Chance of Rain</Text>
                            </Group>
                <Text fw={500}>
                  {hourly && hourly.length > 0 ? hourly[0].precipitation_probability : 0}%
                </Text>
              </div>
                         </SimpleGrid>
            </Grid.Col>
      </Grid>
                </Paper>

      <Tabs 
        value={activeTab} 
        onChange={setActiveTab}
        mb="lg"
        radius="md"
      >
        <Tabs.List>
          <Tabs.Tab value="today" leftSection={<IconSun size={16} />}>
            Today
          </Tabs.Tab>
          <Tabs.Tab value="week" leftSection={<IconCalendarTime size={16} />}>
            7-Day Forecast
          </Tabs.Tab>
          <Tabs.Tab value="recommendations" leftSection={<IconPlant2 size={16} />}>
            Recommendations
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="today" pt="md">
          <Text fw={500} size="lg" mb="md">Today's Hourly Forecast</Text>
          <Paper 
            shadow="xs" 
            radius="md" 
            p="md" 
            style={{ overflowX: 'auto' }} 
            mb="lg"
          >
            <Group wrap="nowrap" gap="xl" style={{ minWidth: isMobile ? 800 : 'auto' }}>
              {hourly.slice(0, 12).map((hour, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Stack align="center" gap="xs">
                    <Text size="sm" c="dimmed">
                      {formatTime(hour.time)}
                    </Text>
                    {getWeatherIcon(hour.icon_code, 30)}
                    <Text fw={500}>{Math.round(hour.temperature)}°C</Text>
                    <Group gap={4}>
                      <IconDroplet size={12} color="#3b82f6" />
                      <Text size="xs">{hour.precipitation_probability}%</Text>
                    </Group>
                  </Stack>
                </motion.div>
            ))}
            </Group>
        </Paper>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <Paper shadow="xs" radius="md" p="md" withBorder>
              <Title order={4} mb="md">Weather Summary</Title>
              <Box mb="lg">
                <Grid>
                  <Grid.Col span={6}>
                    <Group gap="xs">
                      <IconTemperaturePlus size={18} />
                      <Text>High</Text>
                </Group>
                    <Text fw={500}>{Math.round(daily[0].max_temp)}°C</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group gap="xs">
                      <IconTemperatureMinus size={18} />
                      <Text>Low</Text>
                </Group>
                    <Text fw={500}>{Math.round(daily[0].min_temp)}°C</Text>
                  </Grid.Col>
                </Grid>
              </Box>
              <Divider mb="md" />
              <Text size="sm">{daily[0].weather_description}. Precipitation probability is {daily[0].precipitation_probability}%.</Text>
            </Paper>

            <Paper shadow="xs" radius="md" p="md" withBorder>
              <Title order={4} mb="md">Precipitation Chance</Title>
              <Stack gap="md">
                {hourly.slice(0, 6).map((hour, index) => (
                  <Box key={index}>
                    <Group justify="space-between" mb={4}>
                      <Text size="sm">{formatTime(hour.time)}</Text>
                      <Text size="sm" fw={500}>{hour.precipitation_probability}%</Text>
                </Group>
                    <Progress 
                      value={hour.precipitation_probability} 
                      color={hour.precipitation_probability > 50 ? "blue" : "cyan"}
                      size="sm"
                    />
                  </Box>
            ))}
            </Stack>
        </Paper>
      </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="week" pt="md">
          <Text fw={500} size="lg" mb="md">7-Day Forecast</Text>
          <Stack gap="md">
            {daily.map((day, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Paper shadow="xs" p="md" radius="md" withBorder>
                  <Grid align="center">
                    <Grid.Col span={{ base: 3, md: 2 }}>
                      <Text fw={500}>{formatDay(day.date)}</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 2, md: 1 }}>
                      {getWeatherIcon(day.icon_code, 30)}
                    </Grid.Col>
                    <Grid.Col span={{ base: 7, md: 3 }}>
                      <Text>{day.weather_description}</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 2 }} style={{ textAlign: isMobile ? 'left' : 'center' }}>
                      <Group gap={4}>
                        <IconDroplet size={16} color="#3b82f6" />
                        <Text size="sm">{day.precipitation_probability}%</Text>
                      </Group>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <Group gap="md" justify={isMobile ? "flex-start" : "flex-end"}>
                        <Group gap={4}>
                          <IconTemperatureMinus size={16} />
                          <Text fw={500}>{Math.round(day.min_temp)}°C</Text>
                        </Group>
                        <Group gap={4}>
                          <IconTemperaturePlus size={16} />
                          <Text fw={500}>{Math.round(day.max_temp)}°C</Text>
                        </Group>
                      </Group>
                    </Grid.Col>
                  </Grid>
                </Paper>
              </motion.div>
            ))}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="recommendations" pt="md">
          <Text fw={500} size="lg" mb="md">Agricultural Recommendations</Text>
          {weatherData.recommendations.length > 0 ? (
            <Stack gap="md">
              {weatherData.recommendations.map((recommendation, index) => {
                const IconComponent = getRecommendationIcon(recommendation.type);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card shadow="sm" p="lg" radius="md" withBorder>
                      <Group mb="xs">
                        <ThemeIcon color={getUrgencyColor(recommendation.details.urgency)} size="lg" radius="md">
                          <IconComponent size={18} />
                        </ThemeIcon>
                        <div>
                          <Group mb={4}>
                            <Text fw={700}>{recommendation.details.title}</Text>
                            <Badge 
                              color={getUrgencyColor(recommendation.details.urgency)}
                              size="sm"
                              radius="sm"
                            >
                              {recommendation.details.urgency}
                            </Badge>
                          </Group>
                          <Text size="sm" c="dimmed">
                            {recommendation.type.charAt(0) + recommendation.type.slice(1).toLowerCase()} Recommendation
                          </Text>
                        </div>
                      </Group>
                      <Text size="sm">{recommendation.details.description}</Text>
                      
                      {recommendation.details.affected_days && (
                        <Box mt="md">
                          <Text size="sm" fw={500}>Affected Days:</Text>
                          <Group gap="xs" mt={4}>
                            {recommendation.details.affected_days.map((day: string, i: number) => (
                              <Badge key={i} size="sm" variant="light">
                                {formatDay(day)}
                              </Badge>
                            ))}
                          </Group>
                        </Box>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </Stack>
          ) : (
            <Alert
              color="cyan"
              title="No recommendations available"
              icon={<IconShieldCheck />}
            >
              Weather conditions look stable. Continue standard monitoring.
            </Alert>
          )}
        </Tabs.Panel>
      </Tabs>

      <Paper shadow="xs" radius="md" p="md" withBorder>
        <Group justify="space-between" mb="sm">
          <Text fw={500} size="lg">Live Weather Map</Text>
          {farmBoundary ? (
            <Badge color="green" variant="light">Farm Boundary Available</Badge>
          ) : (
            <Badge color="gray" variant="light">No Farm Boundary</Badge>
          )}
             </Group>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '0.5rem' }}>
          {weatherData && weatherData.coordinates ? (
           <iframe
              src={getWindyMapUrl(weatherData.coordinates, weatherData.farm_id, farmBoundary)}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
             allowFullScreen
            />
          ) : (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5', borderRadius: '0.5rem' }}>
              <Stack align="center" gap="md">
                <IconCloud size={40} color="#666" />
                <Text c="dimmed">Map data unavailable</Text>
              </Stack>
            </div>
          )}
        </div>
      </Paper>
    </Container>
  );
}

// Missing component definition for IconCalendarTime
const IconCalendarTime = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={props.stroke || 2}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M11.795 21h-6.795a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v4" />
      <path d="M18 18m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
      <path d="M15 3v4" />
      <path d="M7 3v4" />
      <path d="M3 11h16" />
      <path d="M18 16.496v1.504l1 1" />
    </svg>
  );
};

// Generate mock weather data for development
const getMockWeatherData = (): WeatherResponse => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  return {
    farm_id: 0,
    farm_name: 'Development Farm',
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    weather_data: {
      current: {
        temperature: 22,
        humidity: 65,
        precipitation: 0,
        weather_code: 1,
        wind_speed: 15,
        wind_direction: 180,
        weather_description: 'Mainly clear',
        icon_code: '02d'
      },
      hourly: Array.from({ length: 24 }).map((_, i) => ({
        time: new Date(now.getTime() + i * 60 * 60 * 1000).toISOString(),
        temperature: 22 + Math.round(Math.sin(i / 2) * 3),
        precipitation_probability: Math.max(0, Math.min(100, 10 + Math.round(Math.sin(i) * 20))),
        weather_code: i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 3,
        wind_speed: 15 + Math.round(Math.sin(i) * 5),
        weather_description: i % 3 === 0 ? 'Mainly clear' : i % 3 === 1 ? 'Partly cloudy' : 'Overcast',
        icon_code: i % 3 === 0 ? '01d' : i % 3 === 1 ? '02d' : '03d'
      })),
      daily: Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
        return {
          date: date.toISOString().split('T')[0],
          max_temp: 25 + Math.round(Math.random() * 4) - 2,
          min_temp: 15 + Math.round(Math.random() * 3) - 1,
          precipitation_sum: Math.round(Math.random() * 5),
          precipitation_probability: Math.round(Math.random() * 100),
          weather_code: i % 4,
          weather_description: ['Clear sky', 'Mainly clear', 'Partly cloudy', 'Overcast'][i % 4],
          icon_code: ['01d', '02d', '03d', '04d'][i % 4]
        };
      })
    },
    recommendations: [
      {
        type: 'WATER',
        details: {
          title: 'Adjust Irrigation Schedule',
          description: 'Consider reducing irrigation for the next 2 days due to forecasted rainfall.',
          urgency: 'medium',
          days_until_rain: 2,
          precipitation_probability: 75
        }
      },
      {
        type: 'WEATHER',
        details: {
          title: 'Heat Protection Reminder',
          description: 'Temperatures will remain above 25°C for the next few days. Ensure your sensitive crops have adequate water.',
          urgency: 'low',
          affected_days: [today, new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]]
        }
      }
    ]
  };
};

function getWindyMapUrl(coordinates: Coordinates, farmId: number, farmBoundary: any = null) {
  // Validate coordinates to prevent map errors
  const lat = isValidCoordinate(coordinates.latitude) ? coordinates.latitude : 40.7128;
  const lon = isValidCoordinate(coordinates.longitude) ? coordinates.longitude : -74.0060;
  
  // Set appropriate zoom level
  const zoom = farmBoundary ? 12 : 10;
  
  // Add custom markers parameter if farm boundary is available
  let markerParam = 'marker=true';
  
  if (farmBoundary && farmBoundary.features && farmBoundary.features.length > 0) {
    try {
      // For security, only include the first feature to avoid oversized URLs
      const feature = farmBoundary.features[0];
      if (feature.geometry && feature.geometry.type === 'Polygon' && feature.geometry.coordinates && feature.geometry.coordinates.length > 0) {
        // Get the first ring of coordinates
        const firstRing = feature.geometry.coordinates[0];
        
        // Sample up to 5 points to keep URL manageable
        const sampledPoints = samplePoints(firstRing, 5);
        
        // Create marker string for Windy.com
        // Format is: marker=latlon1|name1|desc1|icon1|latlon2|name2|desc2|icon2...
        markerParam = sampledPoints.map((point, index) => 
          index === 0 
            ? `marker=${point[1]},${point[0]}|Farm Boundary|${farmBoundary.features[0].properties?.name || 'Your Farm'}|farm` 
            : `${point[1]},${point[0]}||`
        ).join('|');
      }
    } catch (e) {
      console.error('Error processing farm boundary for map:', e);
      markerParam = 'marker=true';
    }
  }
  
  // Generate URL with validated coordinates
  return `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&width=650&height=450&zoom=${zoom}&level=surface&overlay=rain&product=ecmwf&menu=&message=&${markerParam}&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;
}

function isValidCoordinate(coord: any): boolean {
  return coord !== null && 
         coord !== undefined && 
         !isNaN(Number(coord)) && 
         Math.abs(Number(coord)) <= 180;
}

// Helper function to sample points from array for a simpler map marker path
function samplePoints(points: any[], maxPoints: number): any[] {
  if (!points || points.length <= maxPoints) return points;
  
  const result = [];
  const step = Math.floor(points.length / maxPoints);
  
  for (let i = 0; i < points.length; i += step) {
    result.push(points[i]);
    if (result.length >= maxPoints) break;
  }
  
  return result;
}
