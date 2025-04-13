import { render, screen, waitFor, act } from "@testing-library/react-native";
import Index from "@/app/index";
import { useUserContext } from "@/context/UserContext";
import { Redirect } from "expo-router";

// Mock the UserContext
jest.mock("@/context/UserContext");

// Mock the Redirect component to track its calls
jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    Redirect: jest.fn((props) => {
      // Render nothing but we'll check the props
      return null;
    }),
  };
});

describe("Index Screen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runAllTimers();
    });
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("displays a loading indicator initially", () => {
    (useUserContext as jest.Mock).mockReturnValue({ user: null });
    render(<Index />);

    expect(screen.getByTestId("loading-indicator")).toBeTruthy();
  });

  it("redirects to /auth/signin when user is not authenticated", async () => {
    (useUserContext as jest.Mock).mockReturnValue({ user: null });
    render(<Index />);

    // Check loading is shown initially
    expect(screen.getByTestId("loading-indicator")).toBeTruthy();

    // Advance timers and wait for updates
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // Check loading is gone
    await waitFor(() => {
      expect(screen.queryByTestId("loading-indicator")).toBeNull();
    });

    // Check Redirect was called with correct props
    expect(Redirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/auth/signin" }),
      expect.anything()
    );
  });

  it("redirects to /authenticated when user is authenticated", async () => {
    (useUserContext as jest.Mock).mockReturnValue({ user: { id: "user-123" } });
    render(<Index />);

    // Check loading is shown initially
    expect(screen.getByTestId("loading-indicator")).toBeTruthy();

    // Advance timers and wait for updates
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // Check loading is gone
    await waitFor(() => {
      expect(screen.queryByTestId("loading-indicator")).toBeNull();
    });

    // Check Redirect was called with correct props
    expect(Redirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/authenticated" }),
      expect.anything()
    );
  });
});