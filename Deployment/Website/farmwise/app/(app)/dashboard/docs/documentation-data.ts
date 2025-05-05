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
          <li><strong>Equipment & Inventory Tracking</strong> - Manage your farm assets and supplies</li>
          <li><strong>Disease Detection</strong> - Identify potential crop diseases early</li>
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
          <li>Set up your farm information during the onboarding process (including initial field mapping)</li>
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
          <li><strong>Disease Detection</strong> - Upload images and analyze potential diseases</li>
          <li><strong>Weather</strong> - Check weather forecasts and historical data</li>
          <li><strong>Planning</strong> - Plan seasonal activities and crop rotations</li>
          <li><strong>Equipment</strong> - Manage and track farm equipment</li>
          <li><strong>Inventory</strong> - Track seeds, fertilizers, and other supplies</li>
          <li><strong>AI Advisor</strong> - Access personalized recommendations</li>
          <li><strong>Reports</strong> - Generate reports on farm performance</li>
          <li><strong>Profile & Settings</strong> - Manage your account and farm details</li>
          <li><strong>Help & Support</strong> - Access documentation, FAQs, and contact support</li>
        </ul>
        
        <p>The navigation menu on the left provides quick access to all these sections.</p>
        
        <h4>Quick Tips:</h4>
        <ul>
          <li>Use the search function in the Help & Support section to quickly find specific topics</li>
          <li>Customize your dashboard widgets in the settings (coming soon)</li>
          <li>Access your profile and account settings from the Profile page or Settings</li>
        </ul>
      `
    }
  ],
  'profile-management': [
    {
      title: 'Editing Your Profile',
      content: `
        <p>Keep your personal and farm information up-to-date in the Profile section.</p>
        
        <h4>Editable Information:</h4>
        <ul>
          <li><strong>Personal Details:</strong> Name, Profile Picture, Phone Number, Bio</li>
          <li><strong>Farm Details:</strong> Farm Name, Location (view-only map), Soil Type</li>
          <li><strong>Infrastructure:</strong> Water Access, Road Access, Electricity Access, Storage Capacity</li>
        </ul>
        
        <h4>How to Edit:</h4>
        <ol>
          <li>Navigate to the <strong>Profile</strong> section from the sidebar</li>
          <li>Click the <strong>"Edit Profile"</strong> button</li>
          <li>Make your desired changes in the form fields</li>
          <li>Upload a new profile picture if needed (Max 5MB, JPG/PNG)</li>
          <li>Update switches for infrastructure access</li>
          <li>Modify storage capacity and select soil type</li>
          <li>Click <strong>"Save Changes"</strong></li>
        </ol>
        
        <p><strong>Note:</strong> Your email address and role are typically managed by administrators or through account settings, not directly on the profile edit form. The farm boundary map is view-only here; boundary editing is done in the Mapping section.</p>
      `
    },
    {
      title: 'Understanding Profile Sections',
      content: `
        <p>The profile page provides a comprehensive overview of your information and farm setup.</p>
        
        <h4>Key Sections on Profile Page:</h4>
        <ul>
          <li><strong>Profile Header:</strong> Displays your avatar, name, and role</li>
          <li><strong>Farm Location & Boundary:</strong> Shows an interactive map of your farm boundary (if set)</li>
          <li><strong>Contact & Farm Details:</strong> Your email, phone, farm name, and bio</li>
          <li><strong>Farm Infrastructure:</strong> Detailed breakdown of water, road, power access, storage, and soil type</li>
          <li><strong>Recent Activities:</strong> A log of recent actions performed in FarmWise (e.g., planting, irrigation)</li>
          <li><strong>Farm Equipment Summary:</strong> Quick overview of major equipment counts</li>
          <li><strong>Field Notes Snippet:</strong> Displays the most recent field note</li>
        </ul>
        
        <p>This page acts as a central hub for your farm's basic information and recent activities. Detailed management for equipment, fields, and notes are handled in their respective sections.</p>
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
          <li><strong>Draw on Map</strong> - Manually draw field boundaries using the interactive map editor in the Mapping section</li>
          <li><strong>Import from File</strong> - Upload GeoJSON, KML, or Shapefile formats containing boundary data</li>
          <li><strong>Mobile GPS Tracking</strong> - (Coming Soon) Walk your field perimeter using the mobile app</li>
        </ol>
        
        <h4>Drawing Boundaries:</h4>
        <ol>
          <li>Navigate to the <strong>Field Mapping</strong> section</li>
          <li>Click <strong>"Add New Field"</strong> or <strong>"Edit Boundary"</strong> for an existing field</li>
          <li>Use the drawing tools (polygon, rectangle) to outline your field on the satellite map</li>
          <li>Click points to define the boundary, click the first point again to close the shape</li>
          <li>Adjust points by dragging them as needed for accuracy</li>
          <li>Save the boundary and fill in field details (name, crop, etc.)</li>
        </ol>
        
        <p><strong>Pro Tip:</strong> For maximum accuracy, zoom in closely when drawing boundaries, especially for irregular field shapes. Use satellite imagery as a guide.</p>
      `
    },
    {
      title: 'Managing Field Data',
      content: `
        <p>Each field in FarmWise can store specific information to help with planning and analysis.</p>
        
        <h4>Field Properties (Managed in Mapping Section):</h4>
        <ul>
          <li><strong>Name:</strong> Identify your field (e.g., "North Pasture", "Field 3B")</li>
          <li><strong>Area:</strong> Automatically calculated from the boundary you create</li>
          <li><strong>Current Crop:</strong> Select the crop currently planted in the field</li>
          <li><strong>Soil Type:</strong> Select from common soil classifications (can also be set in Profile)</li>
          <li><strong>Irrigation Type:</strong> Specify the irrigation method used (e.g., Drip, Sprinkler, None)</li>
          <li><strong>Planting Date:</strong> Record when the current crop was planted</li>
          <li><strong>Notes:</strong> Add custom information or observations about the field</li>
        </ul>
        
        <h4>To edit field properties:</h4>
        <ol>
          <li>Go to the <strong>Field Mapping</strong> section</li>
          <li>Click on a field on the map or select it from the list</li>
          <li>In the field details panel, click <strong>"Edit Details"</strong></li>
          <li>Update information as needed</li>
          <li>Save changes</li>
        </ol>
        
        <p>Accurate field data is crucial for features like crop health monitoring, planning, and AI recommendations.</p>
      `
    },
    {
      title: 'Using Map Layers & Tools',
      content: `
        <p>The Field Mapping section provides various map layers and tools for better visualization and analysis.</p>
        
        <h4>Map Layers:</h4>
        <ul>
          <li><strong>Satellite View:</strong> High-resolution satellite imagery</li>
          <li><strong>Street Map View:</strong> Standard map view with roads and labels</li>
          <li><strong>Field Boundaries:</strong> Toggle the display of your field outlines</li>
          <li><strong>Crop Health Layers:</strong> Overlay NDVI, Moisture Index, etc. (See Crop Health docs)</li>
          <li><strong>Weather Layers:</strong> (Future) Overlay radar, temperature maps</li>
        </ul>
        
        <h4>Map Tools:</h4>
        <ul>
          <li><strong>Zoom In/Out:</strong> Adjust the map magnification</li>
          <li><strong>Pan:</strong> Move the map view</li>
          <li><strong>Measure Distance/Area:</strong> Tools to measure specific distances or areas on the map</li>
          <li><strong>Drawing Tools:</strong> Polygon, rectangle, circle for creating/editing boundaries</li>
          <li><strong>Search:</strong> Find locations by address or coordinates</li>
        </ul>
        
        <p>Experiment with different layers and tools to gain deeper insights into your farm's layout and conditions.</p>
      `
    }
  ],
  'crop-health': [
    {
      title: 'Understanding Crop Health Indicators',
      content: `
        <p>FarmWise provides several indicators derived from satellite imagery to help you monitor the health of your crops.</p>
        
        <h4>Key Indicators (Satellite-Based):</h4>
        <ul>
          <li><strong>NDVI (Normalized Difference Vegetation Index):</strong> Measures plant vigor and density. Higher values generally indicate healthier, denser vegetation. Useful for identifying stressed areas.</li>
          <li><strong>NDMI (Normalized Difference Moisture Index):</strong> Indicates plant water content. Helps detect water stress before visual symptoms appear.</li>
          <li><strong>EVI (Enhanced Vegetation Index):</strong> Optimized vegetation measurement, particularly useful in areas with dense canopy. Less sensitive to atmospheric interference than NDVI.</li>
          <li><strong>Chlorophyll Index:</strong> Estimates relative leaf chlorophyll concentration, which can be related to nutrient status (especially Nitrogen).</li>
        </ul>
        
        <h4>Health Maps:</h4>
        <p>Health maps in the Crop Health section use color coding to visualize variations within a field:</p>
        <ul>
          <li><span style="color: #d32f2f;">Red/Orange:</span> Lower values (potential stress, lower vigor/moisture)</li>
          <li><span style="color: #ffff00;">Yellow:</span> Medium values</li>
          <li><span style="color: #388e3c;">Green/Blue:</span> Higher values (healthier, denser vegetation/higher moisture)</li>
        </ul>
        
        <p>Use these maps to pinpoint areas needing scouting or management intervention. Compare maps over time to track changes.</p>
      `
    },
    {
      title: 'Using the Crop Health Dashboard',
      content: `
        <p>The Crop Health dashboard provides an overview and detailed analysis of your fields' health status.</p>
        
        <h4>Dashboard Features:</h4>
        <ul>
          <li><strong>Field Overview:</strong> List of your fields with average health scores (e.g., average NDVI)</li>
          <li><strong>Time Series Analysis:</strong> Graphs showing how health indicators (NDVI, NDMI) have changed over time for selected fields</li>
          <li><strong>Comparison Tools:</strong> Compare health maps from different dates side-by-side</li>
          <li><strong>Zonal Analysis:</strong> Divide fields into management zones based on health data (Advanced Feature)</li>
          <li><strong>Scouting Integration:</strong> Link health map anomalies to scouting reports</li>
        </ul>
        
        <h4>How to Analyze:</h4>
        <ol>
          <li>Select a field from the list or map</li>
          <li>Choose a health indicator (NDVI, NDMI, etc.)</li>
          <li>Select a date for the health map</li>
          <li>Analyze the color variations within the field map. Identify areas of consistently low or high performance.</li>
          <li>Use the time-series graph to see trends. Are conditions improving or declining?</li>
          <li>Compare recent maps to historical ones to understand the impact of weather or management actions.</li>
        </ol>
        
        <p>Regularly checking the Crop Health dashboard helps you make timely decisions about irrigation, fertilization, and pest management.</p>
      `
    },
    {
      title: 'Setting Up Health Alerts',
      content: `
        <p>FarmWise can automatically monitor your fields and alert you when potential health issues are detected based on satellite data changes.</p>
        
        <h4>To set up alerts (Typically in Settings or Crop Health section):</h4>
        <ol>
          <li>Navigate to Alert Settings (location may vary)</li>
          <li>Select the fields you want to monitor</li>
          <li>Choose alert types: e.g., "Significant NDVI Drop", "Low Moisture Detected"</li>
          <li>Set thresholds: Define what constitutes a significant change (e.g., NDVI drops by 0.2 within a week)</li>
          <li>Configure notification preferences: How you want to receive alerts (email, in-app notification)</li>
          <li>Save your alert configurations</li>
        </ol>
        
        <h4>Example Alert Scenarios:</h4>
        <ul>
          <li><strong>Vegetation Decline Alert:</strong> Get notified if a field's average NDVI drops significantly, possibly indicating stress, disease, or pest issues.</li>
          <li><strong>Moisture Stress Alert:</strong> Receive an alert if the NDMI falls below a critical threshold, suggesting potential irrigation needs.</li>
        </ul>
        
        <p>Alerts provide proactive notifications, allowing you to investigate potential problems early before they escalate.</p>
      `
    }
  ],
  'disease-detection': [
    {
      title: 'Using the Disease Detection Tool',
      content: `
        <p>FarmWise's AI-powered disease detection tool helps identify potential crop diseases from images.</p>
        
        <h4>How It Works:</h4>
        <ol>
          <li>Navigate to the <strong>Disease Detection</strong> section</li>
          <li>Click <strong>"Upload Image"</strong> or <strong>"Analyze New Image"</strong></li>
          <li>Select or take a clear, close-up photo of the affected plant part (leaf, stem, fruit)</li>
          <li>Ensure the image is well-lit and focused on the symptoms</li>
          <li>Provide context if possible (e.g., crop type, field location)</li>
          <li>Submit the image for analysis</li>
          <li>The AI model compares the image patterns against a database of known diseases and pests</li>
          <li>Results are displayed, showing potential matches with confidence scores</li>
          <li>Suggested information and management practices for identified issues may be provided</li>
        </ol>
        
        <h4>Tips for Best Results:</h4>
        <ul>
          <li>Use high-resolution images</li>
          <li>Capture the primary symptoms clearly</li>
          <li>Include a reference object (like a coin) for scale if helpful</li>
          <li>Avoid blurry or poorly lit photos</li>
          <li>Take multiple photos from different angles if symptoms vary</li>
        </ul>
        
        <p><strong>Disclaimer:</strong> The Disease Detection tool provides suggestions and should be used as a guide. Always confirm diagnoses with field scouting and consult with a professional agronomist or plant pathologist for critical treatment decisions.</p>
      `
    },
    {
      title: 'Interpreting Detection Results',
      content: `
        <p>Understanding the results provided by the Disease Detection tool is key to taking appropriate action.</p>
        
        <h4>Result Components:</h4>
        <ul>
          <li><strong>Uploaded Image:</strong> The photo you submitted for analysis</li>
          <li><strong>Potential Matches:</strong> A list of possible diseases or pests identified by the AI</li>
          <li><strong>Confidence Score:</strong> A percentage indicating the AI's confidence in each match (e.g., "Powdery Mildew - 85% Confidence")</li>
          <li><strong>Disease/Pest Information:</strong> Links or summaries describing the identified issue, its symptoms, and typical lifecycle</li>
          <li><strong>Management Recommendations:</strong> General advice on how to manage the potential problem (e.g., cultural practices, potential treatments - consult local regulations)</li>
        </ul>
        
        <h4>How to Use the Results:</h4>
        <ul>
          <li>Review the top matches with the highest confidence scores</li>
          <li>Read the provided information about the potential diseases/pests</li>
          <li>Compare the described symptoms with what you observe in the field</li>
          <li>Use the information to guide further scouting efforts in the affected area</li>
          <li>Consult the AI Advisor or external resources for more specific management advice tailored to your farm</li>
        </ul>
        
        <p>If the system provides low confidence scores or multiple potential matches, further investigation and expert consultation are recommended.</p>
      `
    }
  ],
  'weather': [
    {
      title: 'Weather Dashboard Overview',
      content: `
        <p>The FarmWise Weather Dashboard provides farm-specific weather data essential for planning and operations.</p>
        
        <h4>Dashboard Components:</h4>
        <ul>
          <li><strong>Current Conditions:</strong> Real-time temperature, humidity, wind speed/direction, precipitation at your farm location</li>
          <li><strong>Hourly Forecast:</strong> Detailed predictions for the next 24-48 hours, including temperature, precipitation probability/amount, wind, and cloud cover</li>
          <li><strong>Daily Forecast:</strong> Extended 7-10 day outlook showing daily high/low temperatures, precipitation chances, and general conditions</li>
          <li><strong>Precipitation Radar:</strong> Interactive map showing recent and upcoming precipitation patterns (if available for your region)</li>
          <li><strong>Key Agricultural Metrics:</strong> Growing Degree Days (GDD), Evapotranspiration (ET) estimates, soil temperature/moisture (if sensors integrated)</li>
          <li><strong>Historical Data:</strong> Access past weather records for comparison (e.g., rainfall accumulation this season vs. last season)</li>
        </ul>
        
        <p>Ensure your farm location is set accurately in Settings for the most relevant forecasts. Data is sourced from reputable meteorological services.</p>
      `
    },
    {
      title: 'Using Weather Data for Decisions',
      content: `
        <p>Leverage the weather data in FarmWise to make informed operational decisions.</p>
        
        <h4>Decision Examples:</h4>
        <ul>
          <li><strong>Planting:</strong> Check soil temperature forecasts and short-term rain predictions to choose optimal planting windows.</li>
          <li><strong>Spraying:</strong> Consult wind speed/direction forecasts to ensure safe and effective pesticide/herbicide application, avoiding drift. Check rain probability to ensure product efficacy.</li>
          <li><strong>Irrigation:</strong> Use rainfall forecasts and evapotranspiration (ET) data to schedule irrigation efficiently, avoiding over or under-watering.</li>
          <li><strong>Harvesting:</strong> Monitor short-term forecasts for dry periods suitable for harvesting operations. Avoid harvesting during or immediately after rain if it affects crop quality.</li>
          <li><strong>Fertilizing:</strong> Plan fertilizer applications before expected rainfall (for incorporation) or avoid application during heavy rain (to prevent runoff).</li>
          <li><strong>Frost Protection:</strong> Use low-temperature warnings in the forecast to prepare frost protection measures (e.g., covers, irrigation).</li>
        </ul>
        
        <p>Combine weather forecasts with field conditions and crop stage information for the best results.</p>
      `
    },
    {
      title: 'Weather Alerts and Notifications',
      content: `
        <p>Set up custom weather alerts to stay informed about critical conditions without constantly checking the forecast.</p>
        
        <h4>Configuring Alerts (Typically in Settings):</h4>
        <ol>
          <li>Navigate to Alert Settings</li>
          <li>Select the "Weather" category</li>
          <li>Choose specific alert types you want to enable</li>
          <li>Set thresholds for each alert (e.g., Temperature below 2°C, Wind speed above 30 km/h, Rainfall probability above 80%)</li>
          <li>Specify the forecast window (e.g., alert me if frost is predicted within the next 48 hours)</li>
          <li>Choose how you want to be notified (email, in-app)</li>
        </ol>
        
        <h4>Common Weather Alert Types:</h4>
        <ul>
          <li><strong>Frost/Freeze Warning:</strong> Temperatures predicted near or below freezing</li>
          <li><strong>High Wind Alert:</strong> Wind speeds exceeding a set threshold</li>
          <li><strong>Heavy Precipitation Alert:</strong> Significant rainfall amount predicted</li>
          <li><strong>Heat Stress Alert:</strong> High temperatures potentially stressful for crops or livestock</li>
          <li><strong>Optimal Spraying Window Alert:</strong> (Advanced) Notifies when conditions (wind, temp, rain) are ideal for spraying</li>
        </ul>
        
        <p>Tailor alerts to your specific crops and operational sensitivities.</p>
      `
    }
  ],
  'planning': [
    {
      title: 'Seasonal Planning Tools',
      content: `
        <p>FarmWise's planning tools help you organize your farming activities, from planting to harvest.</p>
        
        <h4>Key Planning Features:</h4>
        <ul>
          <li><strong>Crop Calendar/Task Scheduler:</strong> Create, view, and manage tasks associated with specific fields or general farm operations. Assign dates, priority, and team members (if applicable).</li>
          <li><strong>Activity Templates:</strong> Use predefined templates for common activities (e.g., "Corn Planting", "Wheat Harvest") to quickly schedule tasks.</li>
          <li><strong>Resource Allocation:</strong> Link tasks to required resources like equipment (tractors, planters) and inputs (seeds, fertilizer) from your inventory.</li>
          <li><strong>Gantt Chart View:</strong> Visualize your planned activities over time on a Gantt chart for a better overview of the season's workflow.</li>
          <li><strong>Progress Tracking:</strong> Mark tasks as scheduled, in-progress, or completed.</li>
        </ul>
        
        <h4>Creating a Task:</h4>
        <ol>
          <li>Navigate to the <strong>Planning</strong> section</li>
          <li>Click <strong>"Add Task"</strong> or <strong>"New Activity"</strong></li>
          <li>Enter task details: Name, Description, Target Field(s), Planned Start/End Dates, Priority</li>
          <li>Assign team members (optional)</li>
          <li>Link necessary Equipment and Inventory items</li>
          <li>Save the task</li>
        </ol>
        
        <p>Effective planning helps optimize resource use, manage workload, and ensure timely operations.</p>
      `
    },
    {
      title: 'Crop Rotation Planning',
      content: `
        <p>While FarmWise might not have a dedicated multi-year visual rotation planner *yet*, you can use the planning and field data tools to manage rotations effectively.</p>
        
        <h4>Managing Rotation using Existing Tools:</h4>
        <ul>
          <li><strong>Field Crop History:</strong> Maintain accurate records of the "Current Crop" and potentially use the "Notes" section in Field Management to log previous years' crops.</li>
          <li><strong>Seasonal Plans:</strong> When creating a new seasonal plan in the Planning section, refer to the previous season's crop data for each field to decide on the next crop.</li>
          <li><strong>Task Naming Conventions:</strong> Use clear task names in the Planning section, e.g., "Plant Cover Crop - Field 5", "Rotate Field 7 to Soybeans".</li>
          <li><strong>Reporting:</strong> (Future) Generate reports showing crop history per field over selected periods.</li>
        </ul>
        
        <h4>Benefits of Tracking Rotation:</h4>
        <ul>
          <li>Improve soil health by alternating crop types (e.g., legumes and grains)</li>
          <li>Break pest and disease cycles specific to certain crops</li>
          <li>Manage nutrient levels more effectively</li>
          <li>Comply with sustainable agriculture program requirements</li>
        </ul>
        
        <p>Consistently updating field data with the current crop is the most crucial step for tracking rotations within the current system.</p>
      `
    },
    {
      title: 'Input and Resource Planning',
      content: `
        <p>Integrate your Inventory and Equipment management with the Planning section to ensure you have the necessary resources for scheduled tasks.</p>
        
        <h4>Linking Resources to Tasks:</h4>
        <ul>
          <li>When creating or editing a task in the <strong>Planning</strong> section, look for options to link <strong>Equipment</strong> and <strong>Inventory</strong> items.</li>
          <li><strong>Equipment:</strong> Select the specific tractor, planter, sprayer, etc., required for the task. This helps in scheduling equipment usage and tracking maintenance needs based on usage hours.</li>
          <li><strong>Inventory:</strong> Select the specific seeds, fertilizers, pesticides, or other inputs needed. Specify the planned quantity.</li>
        </ul>
        
        <h4>Benefits:</h4>
        <ul>
          <li><strong>Inventory Depletion:</strong> When a task linked to inventory items is marked as complete, the system can automatically deduct the used quantity from your inventory (feature may vary).</li>
          <li><strong>Resource Conflict Avoidance:</strong> Helps prevent scheduling the same piece of equipment for multiple tasks at the same time.</li>
          <li><strong>Cost Estimation:</strong> By linking inputs, the system can potentially estimate the cost associated with specific tasks or the entire seasonal plan.</li>
          <li><strong>Purchase Planning:</strong> Generate reports showing total planned input usage to inform purchasing decisions.</li>
        </ul>
        
        <p>Accurate linking of resources in the planning phase streamlines operations and improves financial tracking.</p>
      `
    }
  ],
  'equipment-management': [
    {
      title: 'Adding and Tracking Equipment',
      content: `
        <p>Keep a detailed record of your farm machinery and tools in the Equipment section.</p>
        
        <h4>Adding New Equipment:</h4>
        <ol>
          <li>Navigate to the <strong>Equipment</strong> section</li>
          <li>Click <strong>"Add Equipment"</strong></li>
          <li>Enter essential details: Name (e.g., "John Deere 8R Tractor"), Type (Tractor, Harvester, Sprayer, etc.), Make, Model, Serial Number, Purchase Date, Initial Value</li>
          <li>Optionally, add details like fuel type, capacity, initial operating hours</li>
          <li>Upload photos of the equipment</li>
          <li>Save the new equipment record</li>
        </ol>
        
        <h4>Key Tracking Features:</h4>
        <ul>
          <li><strong>Usage Logs:</strong> Manually log usage hours or link equipment to completed tasks in the Planning section to automatically track usage.</li>
          <li><strong>Maintenance Scheduling:</strong> Set up reminders for routine maintenance based on hours used or calendar dates (e.g., oil change every 200 hours).</li>
          <li><strong>Repair History:</strong> Log repairs performed, including dates, costs, and descriptions.</li>
          <li><strong>Status Tracking:</strong> Mark equipment as Operational, In Repair, or Out of Service.</li>
          <li><strong>Location Tracking:</strong> (Future/Integration) Integrate with GPS trackers to see equipment location on the map.</li>
        </ul>
        
        <p>Maintaining accurate equipment records helps optimize maintenance, track costs, and plan for replacements.</p>
      `
    },
    {
      title: 'Maintenance Logs and Scheduling',
      content: `
        <p>Proactive maintenance is crucial for equipment longevity and operational reliability. FarmWise helps schedule and track maintenance tasks.</p>
        
        <h4>Scheduling Maintenance:</h4>
        <ol>
          <li>Select a piece of equipment from your list</li>
          <li>Go to the <strong>"Maintenance"</strong> tab or section</li>
          <li>Click <strong>"Schedule Maintenance"</strong></li>
          <li>Define the task (e.g., "Oil Change", "Filter Replacement", "Annual Inspection")</li>
          <li>Set the trigger: either a specific date or an operating hour interval (e.g., every 150 hours)</li>
          <li>Optionally, add estimated cost and parts needed</li>
          <li>Save the schedule. The system will generate reminders when maintenance is due.</li>
        </ol>
        
        <h4>Logging Completed Maintenance:</h4>
        <ul>
          <li>When scheduled maintenance is performed, find the task in the equipment's maintenance log</li>
          <li>Mark it as <strong>"Complete"</strong></li>
          <li>Enter the actual date, cost, parts used, and any relevant notes</li>
          <li>Optionally, update the equipment's current operating hours</li>
        </ul>
        
        <h4>Repair Logs:</h4>
        <p>For unscheduled repairs, use the <strong>"Log Repair"</strong> function. Record the issue, date, cost, parts, and resolution.</p>
        
        <p>Consistent logging provides a valuable history for troubleshooting and assessing the total cost of ownership.</p>
      `
    }
  ],
  'inventory-management': [
    {
      title: 'Managing Inventory Items',
      content: `
        <p>Track your farm inputs like seeds, fertilizers, pesticides, fuel, and other supplies in the Inventory section.</p>
        
        <h4>Adding Inventory Items:</h4>
        <ol>
          <li>Navigate to the <strong>Inventory</strong> section</li>
          <li>Click <strong>"Add Item"</strong></li>
          <li>Select the item category (Seed, Fertilizer, Pesticide, Fuel, Other)</li>
          <li>Enter item details: Name (e.g., "DKC60-87 Corn Seed"), Unit (bags, kg, liters, gallons), Supplier (optional)</li>
          <li>Specify the initial quantity on hand and the storage location (e.g., "Main Shed", "Chemical Store")</li>
          <li>Set a low-level threshold to trigger reorder alerts (optional)</li>
          <li>Enter purchase price per unit (optional, for cost tracking)</li>
          <li>Save the item</li>
        </ol>
        
        <h4>Updating Inventory Levels:</h4>
        <ul>
          <li><strong>Manual Adjustment:</strong> Select an item and click "Adjust Quantity". Enter the new quantity and reason (e.g., "Received Shipment", "Stock Count Correction", "Used for Task X").</li>
          <li><strong>Task Integration:</strong> (If enabled) When tasks linked to inventory items are completed in Planning, the used quantity might be automatically deducted.</li>
        </ul>
        
        <p>Accurate inventory helps prevent shortages, manage expiration dates, and track input costs.</p>
      `
    },
    {
      title: 'Tracking Usage and Costs',
      content: `
        <p>Monitor how your inventory is used and associate costs with farm activities.</p>
        
        <h4>Usage Tracking Methods:</h4>
        <ul>
          <li><strong>Linking to Tasks:</strong> The primary method. When creating tasks in the Planning section, link the specific inventory items and quantities planned for use. Completing the task updates usage.</li>
          <li><strong>Manual Logging:</strong> If not using task integration, manually adjust inventory levels after usage, noting the associated field or activity in the adjustment reason.</li>
        </ul>
        
        <h4>Cost Tracking:</h4>
        <ul>
          <li>Enter the <strong>purchase price per unit</strong> when adding or adjusting inventory items.</li>
          <li>The system can use this price to calculate the value of inventory on hand.</li>
          <li>When items are linked to tasks, the cost of inputs for that task or field can be estimated.</li>
          <li>Generate reports (in the Reports section) summarizing input usage and costs per field, crop, or time period.</li>
        </ul>
        
        <h4>Low Stock Alerts:</h4>
        <p>Set a <strong>"Low Level Threshold"</strong> for each item. When the quantity on hand drops below this level, the system can generate a notification (in-app or email), reminding you to reorder.</p>
        
        <p>Tracking usage and costs provides valuable data for budgeting and profitability analysis.</p>
      `
    }
  ],
  'ai-advisor': [
    {
      title: 'Understanding the AI Advisor',
      content: `
        <p>The AI Advisor is your digital agronomy assistant, providing personalized recommendations based on your farm data.</p>
        
        <h4>How it Works:</h4>
        <p>The AI Advisor analyzes data from various FarmWise modules:</p>
        <ul>
          <li><strong>Field Data:</strong> Crop type, soil type, planting dates</li>
          <li><strong>Crop Health:</strong> NDVI, NDMI trends, detected anomalies</li>
          <li><strong>Weather Data:</strong> Forecasts, historical patterns, GDD, ET</li>
          <li><strong>Planning Data:</strong> Scheduled tasks and activities</li>
          <li><strong>Disease Detection Results:</strong> Identified potential issues</li>
        </ul>
        <p>Based on this integrated data, it generates insights and actionable recommendations.</p>
        
        <h4>Types of Recommendations:</h4>
        <ul>
          <li><strong>Irrigation Timing/Amount:</strong> Suggests when and how much to irrigate based on weather and crop needs.</li>
          <li><strong>Fertilization Needs:</strong> Recommends nutrient application based on crop stage, soil type, and health indicators.</li>
          <li><strong>Pest/Disease Alerts:</strong> Proactively warns about potential risks based on weather patterns and crop susceptibility.</li>
          <li><strong>Optimal Planting/Harvest Windows:</strong> Suggests ideal timing based on weather forecasts and crop models.</li>
          <li><strong>Scouting Priorities:</strong> Highlights specific fields or areas within fields that require immediate attention based on health data.</li>
        </ul>
        
        <p>The quality of recommendations depends heavily on the accuracy and completeness of the data you provide in other modules.</p>
      `
    },
    {
      title: 'Using AI Recommendations',
      content: `
        <p>Effectively utilize the insights provided by the AI Advisor to optimize your farm management.</p>
        
        <h4>Accessing Recommendations:</h4>
        <ul>
          <li>Navigate to the <strong>AI Advisor</strong> section from the sidebar.</li>
          <li>Recommendations may also appear as notifications or directly on relevant dashboards (e.g., a watering suggestion on the Crop Health page).</li>
        </ul>
        
        <h4>Reviewing Recommendations:</h4>
        <ul>
          <li>Each recommendation typically includes:</li>
          <li>  - The suggested action (e.g., "Irrigate Field 3", "Scout North Field for Powdery Mildew")</li>
          <li>  - The reason/data points supporting the recommendation (e.g., "Low NDMI detected", "Weather conditions favorable for disease development")</li>
          <li>  - The priority or urgency level</li>
          <li>  - Links to relevant data (e.g., the specific health map or weather forecast)</li>
        </ul>
        
        <h4>Acting on Recommendations:</h4>
        <ul>
          <li>Evaluate the recommendation based on your own knowledge and field observations.</li>
          <li>If you agree, you might be able to directly:</li>
          <li>  - Create a corresponding task in the Planning module</li>
          <li>  - Adjust settings (e.g., update irrigation schedule)</li>
          <li>Dismiss recommendations that are not applicable or have already been addressed.</li>
          <li>Provide feedback on recommendations (if available) to help improve the AI model over time.</li>
        </ul>
        
        <p>Treat the AI Advisor as a powerful tool to augment your expertise, not replace it. Always combine AI insights with practical field experience.</p>
      `
    }
  ]
}; 