// Mock SpeechSynthesis
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'speechSynthesis', {
    value: {
      speak: vi.fn(),
      cancel: vi.fn(),
      pending: false,
      speaking: false,
      paused: false,
      getVoices: vi.fn(() => []),
    },
    writable: true,
  });

  // Mock SpeechSynthesisUtterance
  (window as any).SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({
    text,
    lang: '',
    pitch: 1,
    rate: 1,
    voice: null,
    volume: 1,
    onend: null,
    onerror: null,
  }));

  // Mock SpeechRecognition
  (window as any).webkitSpeechRecognition = vi.fn().mockImplementation(() => ({
    continuous: false,
    interimResults: false,
    lang: '',
    start: vi.fn(),
    stop: vi.fn(),
    onstart: null,
    onresult: null,
    onerror: null,
    onend: null,
  }));
}
