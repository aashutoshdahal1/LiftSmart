import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi, setToken, clearToken, type User } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: typeof localStorage !== "undefined" ? localStorage.getItem("ls_token") : null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk("auth/login", async ({ email, password }: { email: string; password: string }) => {
  const data = await authApi.login(email, password);
  setToken(data.token);
  return data;
});

export const register = createAsyncThunk("auth/register", async ({ name, email, password }: { name: string; email: string; password: string }) => {
  const data = await authApi.register(name, email, password);
  setToken(data.token);
  return data;
});

export const fetchMe = createAsyncThunk("auth/fetchMe", async () => {
  const data = await authApi.me();
  return data.user;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      clearToken();
    },
    setUser(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Login failed";
      })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Registration failed";
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
