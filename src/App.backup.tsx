
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import routes from './router/config';
import './i18n';

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
        <BrowserRouter basename={__BASE_PATH__}>
          <div className="min-h-screen bg-neuro-50 dark:bg-gray-900 transition-colors duration-200">
            <Routes>
              {renderRoutes(routes)}
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
