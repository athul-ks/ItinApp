import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TripInput } from '@itinapp/schemas';

// Hoisted mocks for OpenAI
const { parseMock } = vi.hoisted(() => {
  return { parseMock: vi.fn() };
});

vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(function() {
      return {
        responses: {
          parse: parseMock,
        },
      };
    }),
  };
});

// Mock logger
vi.mock('../../logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock helpers from openai/helpers/zod
vi.mock('openai/helpers/zod', () => ({
  zodTextFormat: vi.fn(),
}));

import { generateItineraryWithAI } from '../../services/ai-itinerary';

describe('generateItineraryWithAI', () => {
  const mockInput: TripInput = {
    destination: 'Paris',
    dateRange: {
      from: '2023-06-01', // ISO Date string
      to: '2023-06-03',
    } as any,
    budget: 'moderate',
    vibe: 'relaxed',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate itinerary for valid input', async () => {
    const mockResponse = {
      output_parsed: {
        trip_options: [
          { id: '1', title: 'Option 1' }
        ]
      }
    };

    parseMock.mockResolvedValue(mockResponse);

    const result = await generateItineraryWithAI(mockInput);

    expect(result).toEqual(mockResponse.output_parsed);

    expect(parseMock).toHaveBeenCalledTimes(1);
    const callArgs = parseMock.mock.calls[0][0];
    const systemMessage = callArgs.input.find((msg: any) => msg.role === 'user').content;

    expect(systemMessage).toContain('DESTINATION: """Paris"""');
    expect(systemMessage).toContain('Duration: 3 Days');
    expect(systemMessage).toContain('Budget: Standard');
    expect(systemMessage).toContain('STYLE: "The Leisure Traveler"');
  });

  it('should cap duration at 10 days', async () => {
     const longTripInput: TripInput = {
      ...mockInput,
      dateRange: {
        from: '2023-06-01',
        to: '2023-06-20',
      } as any,
    };

    parseMock.mockResolvedValue({ output_parsed: {} });

    await generateItineraryWithAI(longTripInput);

    const callArgs = parseMock.mock.calls[0][0];
    const systemMessage = callArgs.input.find((msg: any) => msg.role === 'user').content;

    expect(systemMessage).toContain('Duration: 10 Days');
  });

   it('should propagate errors from OpenAI', async () => {
     const error = new Error('AI Error');
     parseMock.mockRejectedValue(error);

    await expect(generateItineraryWithAI(mockInput)).rejects.toThrow('AI Error');
   });
});
