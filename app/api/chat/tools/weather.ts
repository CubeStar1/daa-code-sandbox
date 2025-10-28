import { tool } from 'ai';
import { z } from 'zod';

export const getWeather = tool({
  description: 'Get the weather for a location',
  inputSchema: z.object({
    location: z.string().describe('The location to get the weather for'),
    units: z.enum(['celsius', 'fahrenheit']).describe('The units for temperature'),
  }),
  execute: async ({ location, units }) => {
    // Simulate API call
    const temperature = units === 'celsius' ? '22°C' : '72°F';
    return {
      location,
      temperature,
      conditions: 'Sunny',
      humidity: '60%',
      windSpeed: '10 km/h',
      lastUpdated: new Date().toISOString(),
    };
  },
});
