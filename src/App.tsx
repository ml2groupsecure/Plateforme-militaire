
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CsvDataProvider } from './context/CsvDataContext';
import routes from './router/config';
import './i18n';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const renderRoutes = (routes: any[]) => {
    return routes.map((route, index) => {
      if (route.children) {
        return (
          <Route key={index} path={route.path} element={route.element}>
            {renderRoutes(route.children)}
          </Route>
        );
      }
      return (
        <Route 
          key={index} 
          path={route.path} 
          element={route.element}
          index={route.index}
        />
      );
    });
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <CsvDataProvider>
          <BrowserRouter basename={__BASE_PATH__}>
            <ErrorBoundary>
              <div className="min-h-screen bg-neuro-50 dark:bg-gray-900 transition-colors duration-200">
                <Routes>
                  {renderRoutes(routes)}
                </Routes>
              </div>
            </ErrorBoundary>
          </BrowserRouter>
        </CsvDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
