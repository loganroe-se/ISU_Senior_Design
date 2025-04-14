import { render, screen, waitFor, act } from '@testing-library/react-native';
import RootLayout from '@/app/_layout';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { usePathname } from 'expo-router';
import Navbar from '@/components/Navbar';
import { PaperProvider } from 'react-native-paper';

// Mock all the external dependencies
jest.mock('expo-font', () => ({
  useFonts: jest.fn(),
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  usePathname: jest.fn(),
  Slot: jest.fn(({ children }) => children),
}));

jest.mock('@/components/Navbar', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

// Mock UserContext to avoid actual state updates
jest.mock('@/context/UserContext', () => ({
  UserProvider: ({ children }: { children: React.ReactNode }) => children,
  useUserContext: () => ({
    user: null,
    setUser: jest.fn(),
  }),
}));

describe('RootLayout', () => {
  it('renders PaperProvider and UserProvider', () => {
    (useFonts as jest.Mock).mockReturnValue([true]);
    render(<RootLayout />);

    expect(screen.UNSAFE_getByType(PaperProvider)).toBeTruthy();
  });
});

describe('AppContent', () => {
  const renderAppContent = (pathname = '/') => {
    (usePathname as jest.Mock).mockReturnValue(pathname);
    return render(<RootLayout />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useFonts as jest.Mock).mockReturnValue([true]);
  });

  it('hides splash screen when fonts are loaded', async () => {
    renderAppContent();

    await waitFor(() => {
      expect(SplashScreen.hideAsync).toHaveBeenCalled();
    });
  });

  it('does not render Navbar on specific routes', () => {
    const MockNavbar = Navbar as jest.MockedFunction<typeof Navbar>;

    renderAppContent('/auth/signin');
    expect(MockNavbar).not.toHaveBeenCalled();

    renderAppContent('/auth/signup');
    expect(MockNavbar).not.toHaveBeenCalled();

    renderAppContent('/authenticated/posts');
    expect(MockNavbar).not.toHaveBeenCalled();
  });

  it('renders Navbar on other routes', () => {
    const MockNavbar = Navbar as jest.MockedFunction<typeof Navbar>;
    renderAppContent('/some-other-route');
    expect(MockNavbar).toHaveBeenCalled();
  });

  it('shows nothing while fonts are loading', () => {
    (useFonts as jest.Mock).mockReturnValue([false]);
    const { queryByTestId } = renderAppContent();

    expect(queryByTestId('loading-indicator')).toBeNull();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });
});