interface DocItem {
  title: string;
  content: string;
}

interface DocContent {
  [key: string]: DocItem[];
}

export const documentationContent: DocContent = {
  'getting-started': [
    {
      title: 'Welcome to FarmWise',
      content: `
        <p>FarmWise is a comprehensive farm management platform designed to help farmers optimize their operations, 
        monitor crop health, plan seasonal activities, and make data-driven decisions.</p>
        
        <h4>Key Features:</h4>
        <ul>
          <li><strong>Field Mapping</strong> - Create digital representations of your farm using satellite imagery</li>
          <li><strong>Crop Health Monitoring</strong> - Track the health of your crops using satellite imagery and AI analysis</li>
          <li><strong>Weather Forecasting</strong> - Access detailed weather forecasts specific to your farm location</li>
          <li><strong>Planning Tools</strong> - Plan your planting, irrigation, and harvesting schedules</li>
          <li><strong>AI Advisor</strong> - Get personalized recommendations based on your farm data</li>
        </ul>
        
        <p>This documentation will guide you through all aspects of the FarmWise platform.</p>
      `
    },
    {
      title: 'Creating Your Account',
      content: `
        <p>To get started with FarmWise, you need to create an account:</p>
        
        <ol>
          <li>Visit <a href="/signup">the signup page</a></li>
          <li>Enter your email address and create a secure password</li>
          <li>Complete your profile with basic information</li>
          <li>Set up your farm information during the onboarding process</li>
        </ol>
        
        <h4>Account Types</h4>
        <p>FarmWise offers different account types to suit your needs:</p>
        <ul>
          <li><strong>Basic</strong> - For small farms with basic management needs</li>
          <li><strong>Standard</strong> - For medium-sized operations with more advanced features</li>
          <li><strong>Premium</strong> - For large operations requiring all features and priority support</li>
        </ul>
        
        <p>You can upgrade your account at any time from the settings page.</p>
      `
    },
    {
      title: 'Navigating the Dashboard',
      content: `
        <p>The FarmWise dashboard is your control center for all farm management activities.</p>
        
        <h4>Main Sections:</h4>
        <ul>
          <li><strong>Analytics Dashboard</strong> - Overview of your farm's key metrics</li>
          <li><strong>Field Mapping</strong> - View and manage your field boundaries</li>
          <li><strong>Crop Health</strong> - Monitor the health status of your crops</li>
          <li><strong>Weather</strong> - Check weather forecasts and historical data</li>
          <li><strong>Planning</strong> - Plan seasonal activities and crop rotations</li>
          <li><strong>Equipment</strong> - Manage and track farm equipment</li>
          <li><strong>Inventory</strong> - Track seeds, fertilizers, and other supplies</li>
          <li><strong>Reports</strong> - Generate reports on farm performance</li>
        </ul>
        
        <p>The navigation menu on the left provides quick access to all these sections.</p>
        
        <h4>Quick Tips:</h4>
        <ul>
          <li>Use the search function to quickly find specific features</li>
          <li>Customize your dashboard widgets in the settings</li>
          <li>Access your profile and account settings from the top-right menu</li>
        </ul>
      `
    }
  ],
  'field-mapping': [
    {
      title: 'Creating Field Boundaries',
      content: `
        <p>Field mapping is the foundation of your digital farm management. FarmWise allows you to create accurate 
        digital representations of your fields.</p>
        
        <h4>Methods to Create Field Boundaries:</h4>
        <ol>
          <li><strong>Draw on Map</strong> - Manually draw field boundaries using the map editor</li>
          <li><strong>Import from File</strong> - Upload GeoJSON, KML, or Shapefile formats</li>
          <li><strong>Mobile GPS Tracking</strong> - Walk your field perimeter using the mobile app</li>
        </ol>
        
        <h4>Drawing Boundaries:</h4>
        <ol>
          <li>Navigate to the Field Mapping section</li>
          <li>Click "Add New Field"</li>
          <li>Use the drawing tools to outline your field</li>
          <li>Adjust points as needed for accuracy</li>
          <li>Name your field and save</li>
        </ol>
        
        <p><strong>Pro Tip:</strong> For maximum accuracy, zoom in closely when drawing boundaries, especially for irregular field shapes.</p>
      `
    },
    {
      title: 'Managing Field Data',
      content: `
        <p>Each field in FarmWise can store specific information to help with planning and analysis.</p>
        
        <h4>Field Properties:</h4>
        <ul>
          <li><strong>Name</strong> - Identify your field</li>
          <li><strong>Area</strong> - Automatically calculated from boundary</li>
          <li><strong>Soil Type</strong> - Select from common soil classifications</li>
          <li><strong>Crop History</strong> - Track what was planted previously</li>
          <li><strong>Irrigation Status</strong> - Record irrigation capabilities</li>
          <li><strong>Notes</strong> - Add custom information</li>
        </ul>
        
        <h4>To edit field properties:</h4>
        <ol>
          <li>Select the field on the map</li>
          <li>Click "Edit Field Details"</li>
          <li>Update information as needed</li>
          <li>Save changes</li>
        </ol>
        
        <p>Field data syncs with other parts of FarmWise to provide targeted recommendations and analytics.</p>
      `
    },
    {
      title: 'Satellite Imagery & Analysis',
      content: `
        <p>FarmWise integrates satellite imagery to provide visual and analytical insights about your fields.</p>
        
        <h4>Available Imagery:</h4>
        <ul>
          <li><strong>True Color</strong> - Natural view of your fields</li>
          <li><strong>NDVI</strong> - Normalized Difference Vegetation Index for crop health</li>
          <li><strong>Moisture Index</strong> - Indicates soil moisture levels</li>
          <li><strong>Historical Images</strong> - View changes over time</li>
        </ul>
        
        <h4>To view satellite imagery:</h4>
        <ol>
          <li>Select a field on the map</li>
          <li>Choose the "Satellite View" option</li>
          <li>Select the type of imagery from the dropdown</li>
          <li>Use the time slider to view different dates</li>
        </ol>
        
        <p><strong>Note:</strong> New satellite imagery is typically available every 3-5 days, depending on cloud cover and your location.</p>
        
        <h4>Understanding NDVI:</h4>
        <p>NDVI values range from -1 to +1:</p>
        <ul>
          <li>-1 to 0: No vegetation (water, buildings, bare soil)</li>
          <li>0.1 to 0.3: Sparse vegetation</li>
          <li>0.3 to 0.6: Moderate vegetation</li>
          <li>0.6 to 1.0: Dense, healthy vegetation</li>
        </ul>
      `
    }
  ],
  'crop-health': [
    {
      title: 'Understanding Crop Health Indicators',
      content: `
        <p>FarmWise provides several indicators to help you monitor the health of your crops throughout the growing season.</p>
        
        <h4>Key Indicators:</h4>
        <ul>
          <li><strong>NDVI (Normalized Difference Vegetation Index)</strong> - Measures plant vigor and density</li>
          <li><strong>NDMI (Normalized Difference Moisture Index)</strong> - Indicates plant water content</li>
          <li><strong>EVI (Enhanced Vegetation Index)</strong> - Optimized vegetation measurement in areas with dense canopy</li>
          <li><strong>Chlorophyll Content</strong> - Estimates leaf chlorophyll concentration</li>
        </ul>
        
        <h4>Health Maps:</h4>
        <p>Health maps use color coding to visualize crop condition:</p>
        <ul>
          <li><span style="color: #d32f2f;">Red</span> - Poor health, immediate attention needed</li>
          <li><span style="color: #ffa000;">Yellow</span> - Fair health, monitor closely</li>
          <li><span style="color: #388e3c;">Green</span> - Good health</li>
          <li><span style="color: #1976d2;">Blue</span> - Excellent health</li>
        </ul>
        
        <p>These maps help identify problem areas requiring investigation or intervention.</p>
      `
    },
    {
      title: 'Disease Detection',
      content: `
        <p>FarmWise's AI-powered disease detection system helps identify potential crop diseases before they spread.</p>
        
        <h4>How It Works:</h4>
        <ol>
          <li>Upload close-up photos of plant symptoms using the mobile app</li>
          <li>AI analysis compares images against database of known diseases</li>
          <li>System provides potential disease identification with confidence rating</li>
          <li>Recommended treatment options are suggested</li>
        </ol>
        
        <h4>For best results:</h4>
        <ul>
          <li>Take clear, well-lit photos</li>
          <li>Include both healthy and affected parts for comparison</li>
          <li>Take multiple photos from different angles</li>
          <li>Add notes about when symptoms appeared</li>
        </ul>
        
        <p><strong>Note:</strong> While our system is highly accurate, always verify with a professional agronomist for critical decisions.</p>
      `
    },
    {
      title: 'Setting Up Health Alerts',
      content: `
        <p>FarmWise can automatically monitor your fields and alert you when potential health issues are detected.</p>
        
        <h4>To set up alerts:</h4>
        <ol>
          <li>Navigate to Crop Health > Alert Settings</li>
          <li>Select the fields you want to monitor</li>
          <li>Choose alert types (NDVI decline, disease risk, etc.)</li>
          <li>Set thresholds for each alert type</li>
          <li>Configure notification preferences (email, SMS, in-app)</li>
        </ol>
        
        <h4>Available Alert Types:</h4>
        <ul>
          <li><strong>Vegetation Decline</strong> - Alerts when NDVI drops below threshold</li>
          <li><strong>Moisture Stress</strong> - Identifies potential irrigation needs</li>
          <li><strong>Disease Risk</strong> - Based on weather conditions and crop type</li>
          <li><strong>Pest Pressure</strong> - Warnings based on regional pest models</li>
          <li><strong>Weather Impact</strong> - Alerts for conditions that may affect crop health</li>
        </ul>
        
        <p>Regular monitoring combined with alerts helps catch issues early when they're easier to address.</p>
      `
    }
  ],
  'weather': [
    {
      title: 'Weather Dashboard Overview',
      content: `
        <p>The FarmWise Weather Dashboard provides farm-specific weather data to help with daily decision-making and long-term planning.</p>
        
        <h4>Dashboard Components:</h4>
        <ul>
          <li><strong>Current Conditions</strong> - Real-time weather at your farm location</li>
          <li><strong>Hourly Forecast</strong> - Detailed predictions for the next 48 hours</li>
          <li><strong>7-Day Forecast</strong> - Extended outlook for the week ahead</li>
          <li><strong>Precipitation Map</strong> - Interactive radar showing precipitation patterns</li>
          <li><strong>Historical Data</strong> - Compare current conditions to past seasons</li>
        </ul>
        
        <h4>Key Metrics:</h4>
        <ul>
          <li>Temperature (current, high/low, soil temperature)</li>
          <li>Precipitation (amount, probability, intensity)</li>
          <li>Wind (speed, direction, gusts)</li>
          <li>Humidity and dew point</li>
          <li>Solar radiation and UV index</li>
          <li>Growing degree days (GDD)</li>
        </ul>
        
        <p>All data is specific to your registered farm location for maximum relevance.</p>
      `
    },
    {
      title: 'Weather Alerts and Notifications',
      content: `
        <p>Stay informed about significant weather events that could impact your farming operations.</p>
        
        <h4>Alert Types:</h4>
        <ul>
          <li><strong>Severe Weather</strong> - Warnings for thunderstorms, high winds, hail</li>
          <li><strong>Frost/Freeze</strong> - Advance notice of potentially damaging temperatures</li>
          <li><strong>Rainfall</strong> - Alerts for heavy precipitation that may affect fieldwork</li>
          <li><strong>Drought Conditions</strong> - Updates on developing drought situations</li>
          <li><strong>Heat Stress</strong> - Warnings when temperatures may stress crops</li>
        </ul>
        
        <h4>To configure weather alerts:</h4>
        <ol>
          <li>Go to Weather > Alert Settings</li>
          <li>Select alert types you wish to receive</li>
          <li>Set thresholds for each alert type</li>
          <li>Choose notification methods (email, SMS, push notification)</li>
          <li>Save your preferences</li>
        </ol>
        
        <p><strong>Pro Tip:</strong> Set different alert thresholds for different crop types and growth stages based on their specific sensitivities.</p>
      `
    },
    {
      title: 'Weather-Based Recommendations',
      content: `
        <p>FarmWise integrates weather data with your farm activities to provide actionable recommendations.</p>
        
        <h4>Recommendation Categories:</h4>
        <ul>
          <li><strong>Field Operations</strong> - Optimal windows for planting, spraying, harvesting</li>
          <li><strong>Irrigation Planning</strong> - Suggestions based on precipitation and evapotranspiration</li>
          <li><strong>Pest Management</strong> - Disease pressure forecasts based on weather conditions</li>
          <li><strong>Frost Protection</strong> - Advance strategies for freeze events</li>
        </ul>
        
        <h4>Weather Suitability Index:</h4>
        <p>The Weather Suitability Index rates conditions for various farm activities on a scale of 1-10:</p>
        <ul>
          <li><strong>1-3</strong> - Poor conditions, avoid operations</li>
          <li><strong>4-6</strong> - Marginal conditions, proceed with caution</li>
          <li><strong>7-10</strong> - Optimal conditions for operations</li>
        </ul>
        
        <p>These recommendations are customized based on your specific crops, soil types, and equipment.</p>
      `
    }
  ],
  'planning': [
    {
      title: 'Seasonal Planning Tools',
      content: `
        <p>FarmWise's planning tools help you organize your farming activities throughout the growing season.</p>
        
        <h4>Key Planning Features:</h4>
        <ul>
          <li><strong>Crop Calendar</strong> - Visual timeline of planting, management, and harvest dates</li>
          <li><strong>Task Scheduler</strong> - Create and assign farm tasks with deadlines</li>
          <li><strong>Resource Allocation</strong> - Plan equipment and labor needs in advance</li>
          <li><strong>Crop Rotation</strong> - Design multi-year rotation plans for sustainability</li>
        </ul>
        
        <h4>Creating a Seasonal Plan:</h4>
        <ol>
          <li>Navigate to the Planning section</li>
          <li>Select "New Plan" or use a template</li>
          <li>Define the season and crop types</li>
          <li>Add key activities with target date ranges</li>
          <li>Assign resources to each activity</li>
          <li>Save and share with your team</li>
        </ol>
        
        <p>Plans automatically adjust based on weather conditions and can be updated throughout the season.</p>
      `
    },
    {
      title: 'Crop Rotation Planning',
      content: `
        <p>Effective crop rotation is essential for soil health, pest management, and sustainable farming.</p>
        
        <h4>Rotation Planning Features:</h4>
        <ul>
          <li><strong>Multi-year View</strong> - Plan rotations across multiple seasons</li>
          <li><strong>Compatibility Check</strong> - System alerts for poor crop succession choices</li>
          <li><strong>Soil Health Impact</strong> - Predictions of how rotations affect soil nutrients</li>
          <li><strong>Pest and Disease Management</strong> - Break cycles of field-specific issues</li>
        </ul>
        
        <h4>Building a Rotation Plan:</h4>
        <ol>
          <li>Go to Planning > Crop Rotation</li>
          <li>Select fields to include in the rotation</li>
          <li>Define the rotation length (typically 3-7 years)</li>
          <li>Assign crops to each field for each year</li>
          <li>Review compatibility alerts and adjust as needed</li>
          <li>Save and use as reference for seasonal planning</li>
        </ol>
        
        <p><strong>Best Practice:</strong> Include cover crops in your rotation to improve soil health, reduce erosion, and suppress weeds.</p>
      `
    },
    {
      title: 'Input and Resource Planning',
      content: `
        <p>Plan your seed, fertilizer, chemical, and equipment needs in advance to optimize costs and operations.</p>
        
        <h4>Resource Planning Tools:</h4>
        <ul>
          <li><strong>Input Calculator</strong> - Estimate quantities needed based on acreage and application rates</li>
          <li><strong>Cost Projections</strong> - Calculate expected expenses for budgeting</li>
          <li><strong>Inventory Management</strong> - Track current supplies and plan purchases</li>
          <li><strong>Equipment Scheduling</strong> - Optimize equipment use across fields</li>
        </ul>
        
        <h4>Planning Process:</h4>
        <ol>
          <li>Enter crop plans by field</li>
          <li>Specify application rates for inputs</li>
          <li>Review calculated totals needed</li>
          <li>Compare with current inventory</li>
          <li>Generate purchase orders for needed supplies</li>
          <li>Schedule equipment based on operation timing</li>
        </ol>
        
        <p>The system automatically adjusts resource needs if you change acreage or application rates, keeping your plans accurate.</p>
      `
    }
  ]
}; 