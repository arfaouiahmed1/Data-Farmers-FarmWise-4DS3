// Test script for crop-classification route
import { NextRequest, NextResponse } from 'next/server';
import { API_ROUTES } from '../../../utils/routes';

/**
 * Tests the crop classification route response handling for various scenarios
 */
export async function testErrorHandling() {
  const testCases = [
    {
      name: 'HTML Response Test',
      mockResponse: new Response(
        '<!DOCTYPE html><html><head><title>Django Error</title></head><body><h1>Server Error (500)</h1></body></html>',
        { status: 500, headers: { 'Content-Type': 'text/html' } }
      ),
      expectedStatus: 500,
      expectedErrorContains: 'Backend error'
    },
    {
      name: 'Empty Response Test',
      mockResponse: new Response('', { status: 200 }),
      expectedStatus: 200,
      expectedSuccessContains: 'Operation completed successfully'
    },
    {
      name: 'Authentication Error Test',
      mockResponse: new Response('{"detail": "Invalid token"}', { status: 401, headers: { 'Content-Type': 'application/json' } }),
      expectedStatus: 401,
      expectedErrorContains: 'Authentication failed'
    },
    {
      name: 'Timeout Test',
      mockResponse: new DOMException('The operation was aborted', 'AbortError'),
      expectedStatus: 504,
      expectedErrorContains: 'Request timed out'
    },
    {
      name: 'Valid JSON Response Test',
      mockResponse: new Response('{"recommended_crop":"Wheat","confidence_score":85.0}', 
        { status: 200, headers: { 'Content-Type': 'application/json' } }),
      expectedStatus: 200,
      expectedSuccessProperty: 'recommended_crop'
    }
  ];
  
  console.log('Running crop-classification route error handling tests...');
  
  // For each test case, we'll mock the fetch call and test the response
  for (const test of testCases) {
    try {
      console.log(`\nRunning test: ${test.name}`);
      
      // Mock the fetch function
      const originalFetch = global.fetch;
      if (test.name === 'Timeout Test') {
        // Special case for AbortError test
        global.fetch = () => Promise.reject(test.mockResponse);
      } else {
        global.fetch = () => Promise.resolve(test.mockResponse);
      }
      
      // Create a mock request
      const request = new NextRequest('http://localhost:3000/api/planning/crop-classification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token dummy-token'
        },
        body: JSON.stringify({
          farm: 1,
          soil_n: 50,
          soil_p: 50,
          soil_k: 50,
          temperature: 25
        })
      });
      
      // Import the route handler dynamically to ensure it has the latest code
      const { POST } = await import('./route');
      
      // Call the route handler
      const response = await POST(request);
      const responseData = await response.json();
      
      // Check status code
      console.log(`Status code: ${response.status}, Expected: ${test.expectedStatus}`);
      
      // Check response content
      if (test.expectedErrorContains && typeof responseData.error === 'string') {
        console.log(`Error contains expected text: ${responseData.error.includes(test.expectedErrorContains)}`);
      } else if (test.expectedSuccessContains && typeof responseData.message === 'string') {
        console.log(`Success contains expected text: ${responseData.message.includes(test.expectedSuccessContains)}`);
      } else if (test.expectedSuccessProperty) {
        console.log(`Success has property ${test.expectedSuccessProperty}: ${responseData[test.expectedSuccessProperty] !== undefined}`);
      }
      
      // Restore original fetch
      global.fetch = originalFetch;
      
    } catch (error) {
      console.error(`Test failed: ${test.name}`, error);
    }
  }
  
  console.log('\nAll tests completed.');
}

// Export a function that can be used to run the tests
export function runTests() {
  testErrorHandling().catch(console.error);
}

// If this file is executed directly, run the tests
if (require.main === module) {
  runTests();
}
