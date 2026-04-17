import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "../context/AuthContext";
import Login from "./Login";
import Signup from "./Signup";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  Link: ({ children }) => <span>{children}</span>,
  useNavigate: () => mockNavigate,
}));

function renderWithProviders(ui) {
  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
});

test("login form has required fields and shows backend error", async () => {
  global.fetch.mockResolvedValue({
    ok: false,
    json: async () => ({ error: "Invalid email or password" }),
  });

  renderWithProviders(<Login />);

  const email = screen.getByLabelText(/minerva email/i);
  const password = screen.getByLabelText(/password/i);
  expect(email).toBeRequired();
  expect(password).toBeRequired();

  await userEvent.type(email, "test@uni.minerva.edu");
  await userEvent.type(password, "badpass");
  await userEvent.click(screen.getByRole("button", { name: /log in/i }));

  await waitFor(() =>
    expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
  );
});

test("signup form validates required fields and shows backend error", async () => {
  global.fetch.mockResolvedValue({
    ok: false,
    json: async () => ({ error: "Email already registered" }),
  });

  renderWithProviders(<Signup />);

  const firstName = screen.getByLabelText(/first name/i);
  const city = screen.getByLabelText(/current city/i);
  expect(firstName).toBeRequired();
  expect(city).toBeRequired();

  await userEvent.type(firstName, "Ada");
  await userEvent.type(screen.getByLabelText(/last name/i), "Lovelace");
  await userEvent.type(screen.getByLabelText(/minerva email/i), "ada@uni.minerva.edu");
  await userEvent.type(screen.getByLabelText(/^password$/i), "strongpassword");
  await userEvent.selectOptions(city, "Berlin");
  await userEvent.type(screen.getByLabelText(/cohort/i), "M27");

  await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

  await waitFor(() =>
    expect(screen.getByText(/email already registered/i)).toBeInTheDocument()
  );
});
