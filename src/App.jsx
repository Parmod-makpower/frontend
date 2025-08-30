import { BrowserRouter, Routes, Route  } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AdminCRMPage from "./pages/AdminCRMPage";
import SSDSPage from "./pages/SS/SSDSPage";
import NotFound from "./pages/NotFound";
import NoPermission from "./pages/NoPermission";
import DashboardLayout from "./Layout/DashboardLayout";
import UserHierarchy from "./pages/UserHierarchy";
import ProductPage from "./pages/ProductPage";
import SchemePage from "./pages/SchemePage";
import SchemeForm from "./pages/SchemeForm";
import CartPage from "./pages/CartPage";
import MoreOptionsPage from "./Layout/MoreOptionPage";
import CRMOrderDetailPage from "./pages/CRM/CRMOrderDetailPage";
import HomePage from "./pages/HomePage";
import HomeRedirector from "./routes/HomeRedirector";
import SaleNamePage from "./pages/SaleNamePage";
import SearchBarPage from "./pages/SearchBarPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CategorySearchPage from "./pages/CategorySearchPage";
import AllCategoriesPage from "./pages/AllCategoriesPage";
import ConfirmOrderPage from "./pages/SS/ConfirmOrderPage";
import SSHistoryPage from "./pages/SS/SSHistoryPage";
import SSOrderTrackingPage from "./pages/SS/SSOrderTrackingPage";
import CRMSSFormPage from "./pages/CRM/CRMSSFormPage";
import CRMSSListPage from "./pages/CRM/CRMSSListPage";

import CRMOrderListPage from "./pages/CRM/CRMOrderListPage";
import UserSchemesPage from "./pages/UserSchemesPage";
import CRMVerifiedHistoryPage from "./pages/CRM/CRMVerifiedHistoryPage";
import CRMVerifiedDetailsPage from "./pages/CRM/CRMVerifiedDetailsPage";
import InactiveProductsPage from "./pages/InactiveProductsPage";
import SubCategoryPage from "./pages/SubCategoryPage";



export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
       <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
            <Route path="" element={<HomeRedirector />} />
            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>

            <Route path="/home" element={<ProtectedRoute ><HomePage /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute ><SearchBarPage /></ProtectedRoute>} />
            <Route path="/category/:categoryKeyword" element={<CategorySearchPage />} />
             <Route path="/all-categories" element={<AllCategoriesPage />} /> 
             <Route path="/category/:category/subcategories" element={<SubCategoryPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/more" element={<MoreOptionsPage />} />
           
            <Route path="/all/orders-history" element={<CRMVerifiedHistoryPage />} />
            <Route path="/crm/verified/:id" element={<CRMVerifiedDetailsPage />} />

            <Route path="/user-schemes" element={<ProtectedRoute ><UserSchemesPage /></ProtectedRoute>} />
            <Route path="/inactive" element={<ProtectedRoute ><InactiveProductsPage /></ProtectedRoute>} />


            <Route path="/ad" element={<CRMOrderDetailPage />} />
            <Route path="/users-all" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserHierarchy /></ProtectedRoute>} />
            <Route path="/admin/crm" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminCRMPage /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute allowedRoles={['ADMIN']}><ProductPage /></ProtectedRoute>} />
            <Route path="/sale-name" element={<ProtectedRoute allowedRoles={['ADMIN']}><SaleNamePage /></ProtectedRoute>} />
            <Route path="/schemes" element={<ProtectedRoute allowedRoles={['ADMIN']}><SchemePage /></ProtectedRoute>} />
            <Route path="/schemes/new" element={<ProtectedRoute allowedRoles={['ADMIN']}><SchemeForm /></ProtectedRoute>} />
            <Route path="/schemes/edit/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><SchemeForm/></ProtectedRoute>} />
           

            <Route path="/crm-ss/add" element={<ProtectedRoute allowedRoles={['CRM']}><CRMSSFormPage /></ProtectedRoute>} />
            <Route path="/crm-ss/list" element={<ProtectedRoute allowedRoles={['CRM']}><CRMSSListPage /></ProtectedRoute>} />
            <Route path="/crm/orders" element={<ProtectedRoute allowedRoles={['CRM']}><CRMOrderListPage /></ProtectedRoute>} />
            <Route path="/crm/orders/:orderId" element={<ProtectedRoute allowedRoles={['CRM']}><CRMOrderDetailPage /></ProtectedRoute>} />
           

            <Route path="/ss/ds" element={<ProtectedRoute allowedRoles={['SS']}><SSDSPage /></ProtectedRoute>} />
            <Route path="/ss-page" element={<ProtectedRoute allowedRoles={['SS']}><HomePage /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute allowedRoles={['SS']}><CartPage /></ProtectedRoute>} />
            <Route path="/confirm-order" element={<ProtectedRoute allowedRoles={['SS']}><ConfirmOrderPage /></ProtectedRoute>} />
            <Route path="/ss/history" element={<ProtectedRoute allowedRoles={['SS']}><SSHistoryPage /></ProtectedRoute>} />
            <Route path="/orders/:orderId/track" element={<ProtectedRoute allowedRoles={['SS']}><SSOrderTrackingPage /></ProtectedRoute>} />
          </Route>

          <Route path="/no-permission" element={<NoPermission />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
