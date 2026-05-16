import { Route, Switch } from 'wouter';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './components/Theme';
import { Toaster } from './components/Toaster';
import { ToastProvider } from './lib/hooks/useToast';
import AdminPrompts from './pages/AdminPrompts';
import Chat from './pages/Chat';
import ForgotPassword from './pages/ForgotPassword';
import History from './pages/History';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import Signup from './pages/Signup';
import Welcome from './pages/Welcome';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/">
            <ProtectedRoute>
              <Welcome />
            </ProtectedRoute>
          </Route>
          <Route path="/chat/:chatId?">
            {(params) => (
              <ProtectedRoute>
                <Chat key={params.chatId ?? 'new'} />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/profile">
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Route>
          <Route path="/settings">
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Route>
          <Route path="/history">
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/prompts">
            <ProtectedRoute requirePlatformAdmin>
              <AdminPrompts />
            </ProtectedRoute>
          </Route>
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </ToastProvider>
    </ThemeProvider>
  );
}
