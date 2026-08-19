import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AiAssistant from './AiAssistant';

const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));

vi.mock('@google/genai', () => ({
  // Must be a real `function`, not an arrow function: this gets invoked via
  // `new GoogleGenAI(...)` in AiAssistant.tsx, and arrow functions can't be
  // constructors — using one here makes `new` throw silently into the
  // component's own catch block, so every test looks like an API failure
  // regardless of what generateContent is mocked to do.
  GoogleGenAI: vi.fn().mockImplementation(function GoogleGenAI() {
    return { models: { generateContent } };
  }),
}));

describe('AiAssistant error handling', () => {
  beforeEach(() => {
    generateContent.mockReset();
  });


  it('shows an actionable error message and a Retry button when the API call rejects', async () => {
    generateContent.mockRejectedValueOnce(new Error('network down'));
    const user = userEvent.setup();
    render(<AiAssistant currentGCode={[]} />);

    await user.click(screen.getByText('Ask AI Assistant'));
    await waitFor(() => expect(screen.getByText(/Couldn't reach Gemini AI/)).toBeInTheDocument());
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('clears the error and re-attempts the request when Retry is clicked', async () => {
    generateContent.mockRejectedValueOnce(new Error('network down'));
    generateContent.mockResolvedValueOnce({ text: 'Looks good.' });
    const user = userEvent.setup();
    render(<AiAssistant currentGCode={[]} />);

    await user.click(screen.getByText('Ask AI Assistant'));
    await waitFor(() => expect(screen.getByText('Retry')).toBeInTheDocument());

    await user.click(screen.getByText('Retry'));
    await waitFor(() => expect(screen.getByText('Looks good.')).toBeInTheDocument());
    expect(screen.queryByText(/Couldn't reach Gemini AI/)).not.toBeInTheDocument();
  });

  it('shows a fallback message when the API resolves with no text', async () => {
    generateContent.mockResolvedValueOnce({ text: undefined });
    const user = userEvent.setup();
    render(<AiAssistant currentGCode={[]} />);

    await user.click(screen.getByText('Ask AI Assistant'));
    await waitFor(() => expect(screen.getByText('No analysis available.')).toBeInTheDocument());
  });
});
