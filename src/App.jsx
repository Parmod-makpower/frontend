import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AdminCRMPage from "./pages/AdminCRMPage";
import CRMSSPage from "./pages/CRMSSPage";
import SSDSPage from "./pages/SSDSPage";
import NotFound from "./pages/NotFound";
import NoPermission from "./pages/NoPermission";
import DashboardLayout from "./Layout/DashboardLayout";
import UserHierarchy from "./pages/UserHierarchy";
import ProductPage from "./pages/ProductPage";
import SchemePage from "./pages/SchemePage";
import CartPage from "./pages/CartPage";
import MoreOptionsPage from "./Layout/MoreOptionsPage";
import CategoryPage from "./pages/CategoryPage";
import CRMOrderVerifyPage from "./pages/CRMOrderVerifyPage";
import CRMOrderHistoryPage from "./pages/CRMOrderHistoryPage";
import CRMOrderDetailPage from "./pages/CRMOrderDetailPage";
import AdminOrderHistoryPage from "./pages/AdminOrderHistoryPage";


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="" element={<ProtectedRoute ><UserHierarchy /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute ><ProductPage /></ProtectedRoute>} />
            <Route path="/categories" element={<CategoryPage />} />
            <Route path="/admin/orders/:id/detail" element={<CRMOrderDetailPage />} />

          
            <Route path="/cart" element={<ProtectedRoute ><CartPage /></ProtectedRoute>} />
            <Route path="/more" element={<MoreOptionsPage />} />
            <Route path="/schemes" element={<ProtectedRoute ><SchemePage /></ProtectedRoute>} />

            <Route path="/admin/crm" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminCRMPage /></ProtectedRoute>} />
            <Route path="/admin/order-audit" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminOrderHistoryPage /></ProtectedRoute>} />
           

            <Route path="/crm/ss" element={<ProtectedRoute allowedRoles={['CRM']}><CRMSSPage /></ProtectedRoute>} />
            <Route path="/crm/orders/verify" element={<ProtectedRoute allowedRoles={['CRM']}><CRMOrderVerifyPage /></ProtectedRoute>} />
            <Route path="/crm/orders/history" element={<ProtectedRoute allowedRoles={['CRM']}><CRMOrderHistoryPage /></ProtectedRoute>} />
            <Route path="/crm-orders/:id/detail" element={<ProtectedRoute allowedRoles={['CRM']}><CRMOrderDetailPage /></ProtectedRoute>} />
            <Route path="/ss/ds" element={<ProtectedRoute allowedRoles={['SS']}><SSDSPage /></ProtectedRoute>} />
          </Route>

          <Route path="/no-permission" element={<NoPermission />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
