import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoInput from '../src/components/VideoInput';
import SummaryDisplay from '../src/components/SummaryDisplay';
import TranscriptDisplay from '../src/components/TranscriptDisplay';

// Mock the useToast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock the useVideoStore hook
jest.mock('../src/store/videoStore', () => ({
  useVideoStore: () => ({
    setVideoUrl: jest.fn(),
    setSummary: jest.fn(),
    setIsTranscribing: jest.fn(),
    setIsSummarizing: jest.fn(),
    setIsLoading: jest.fn(),
  }),
}));

describe('VideoInput Component', () => {
  it('renders correctly with transcriptions left', () => {
    render(
      <VideoInput
        onSuccess={() => {}}
        onStart={() => {}}
        userId="test-user"
        transcriptionsLeft={3}
      />
    );
    expect(screen.getByPlaceholderText('Enter YouTube URL')).toBeInTheDocument();
    expect(screen.getByText('Generate Summary')).toBeEnabled();
    expect(screen.getByText('Transcriptions left: 3')).toBeInTheDocument();
  });

  it('disables submit button when no transcriptions left', () => {
    render(
      <VideoInput
        onSuccess={() => {}}
        onStart={() => {}}
        userId="test-user"
        transcriptionsLeft={0}
      />
    );
    expect(screen.getByText('Generate Summary')).toBeDisabled();
  });
});

describe('SummaryDisplay Component', () => {
  it('renders summary when provided', () => {
    const summary = 'This is a test summary';
    render(<SummaryDisplay summary={summary} isLoading={false} />);
    expect(screen.getByText(summary)).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<SummaryDisplay summary={null} isLoading={true} />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });
});

describe('TranscriptDisplay Component', () => {
  it('renders transcript when provided', () => {
    const transcript = 'This is a test transcript';
    render(<TranscriptDisplay transcript={transcript} isLoading={false} />);
    expect(screen.getByText(transcript)).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<TranscriptDisplay transcript={null} isLoading={true} />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });
});