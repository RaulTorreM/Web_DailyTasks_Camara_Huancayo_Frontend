import { Box } from '@mui/material';
import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDailyTasksHub } from '../../hooks/useDailyTasksHub';
import { layout } from '../../theme/tokens';
import PageLoader from '../common/PageLoader';
import AppSidebar from './AppSidebar';
import AppTopBar from './AppTopBar';
import MobileMenu from './MobileMenu';
import MobileNav from './MobileNav';
import { getPageMeta } from './navItems';

/**
 * Armazón de la aplicación.
 *
 * Escritorio: sidebar fija + barra superior.
 * Móvil: barra superior compacta + navegación inferior con acción de crear al centro.
 */
export default function AppLayout() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const meta = getPageMeta(pathname);
  useDailyTasksHub();

  useEffect(() => {
    document.title = `${meta.documentTitle ?? meta.title} · DailyTasks CCH`;
  }, [meta.title, meta.documentTitle]);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Box className="layout-root" sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppSidebar />

      <Box
        className="layout-content"
        sx={{
          ml: { md: `${layout.sidebar}px` },
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AppTopBar onOpenMenu={() => setMenuOpen(true)} />

        <Box
          component="main"
          className="layout-container layout-main"
          sx={{
            width: '100%',
            maxWidth: layout.contentMax,
            mx: 'auto',
            flex: 1,
            px: { xs: 2, sm: 2.5, lg: 4 },
            pt: { xs: 2.25, md: 3 },
            pb: { xs: 'calc(96px + env(safe-area-inset-bottom))', md: 5 },
          }}
        >
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>

      <MobileNav onOpenMore={() => setMenuOpen(true)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </Box>
  );
}
