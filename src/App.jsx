import { BrowserRouter, Routes, Route  } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
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
import AddNewUser from "./pages/CRM/AddNewUser";
import AllUsersList from "./pages/CRM/AllUsersList";
import CRMOrderListPage from "./pages/CRM/CRMOrderListPage";
import UserSchemesPage from "./pages/UserSchemesPage";
import CRMVerifiedHistoryPage from "./pages/CRM/CRMVerifiedHistoryPage";
import CRMVerifiedDetailsPage from "./pages/CRM/CRMVerifiedDetailsPage";
import InactiveProductsPage from "./pages/InactiveProductsPage";
import SubCategoryPage from "./pages/SubCategoryPage";
import CRMDashboard from "./pages/CRMDashboard";
import TemperedPage from "./pages/TemperedPage";
import BatteryPage from "./pages/BatteryPage";
import CRMCreateOrderPage from "./pages/CRM/CRMCreateOrderPage";
import SSPendingOrders from "./pages/ADMIN/SSPendingOrders";
import SSPendingOrderItems from "./pages/ADMIN/SSPendingOrderItems";
import OrderTrackPage from "./pages/CRM/OrderTrackPage";
import OrderListPage from "./pages/SS/OrderListPage";
import DistributorMeetForm from "./components/form/DistributorMeetForm";
import ProductUsageReportPage from "./pages/ProductUsageReportPage";
import DealerFormPage from "./components/form/DealerFormPage";
import ConfirmOrderPageDS from "./pages/DS/ConfirmOrderPageDS";
import DSOrdersPage from "./pages/DS/DSOrdersPage";
import SamplingSheetPage from "./pages/CRM/SamplingSheetPage";
import DispatchOrderDeletePage from "./pages/DispatchOrderDeletePage";
import OrderGoogleSheet from "./pages/CRM/OrderGoogleSheet";
import NotInStockReportPage from "./pages/CRM/NotInStockReportPage";
import TrackingOrdersPage from "./pages/CRM/TrackingOrdersPage";
import MAHOTSAV from "./pages/MAHOTSAV";
import SimpleOrderCreatePage from "./components/orderSheet/SimpleOrderCreatePage";

export default function App() {
  useEffect(() => {
    // Pinch zoom रोकने के लिए
    const handleTouchMove = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Double-tap zoom रोकने के लिए
    let lastTouchEnd = 0;
    const handleTouchEnd = (e) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
       <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/form" element={<DistributorMeetForm />} />
          <Route path="/dealer" element={<DealerFormPage />} />
          <Route path="/product-usage" element={<ProductUsageReportPage />} />
            <Route path="" element={<HomeRedirector />} />
            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>

            <Route path="/home" element={<ProtectedRoute ><HomePage /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute ><SearchBarPage /></ProtectedRoute>} />
            <Route path="/category/:categoryKeyword" element={<CategorySearchPage />} />
             <Route path="/all-categories" element={<AllCategoriesPage />} /> 
             <Route path="/category/:category/subcategories" element={<SubCategoryPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/more" element={<MoreOptionsPage />} />
            <Route path="/CRMDashboard" element={ <CRMDashboard/> } />
            <Route path="/tempered/:categoryKeyword" element={ <TemperedPage/> } />
            <Route path="/batteries/:categoryKeyword" element={ <BatteryPage/> } />
           
            <Route path="/all/orders-history" element={<CRMVerifiedHistoryPage />} />
            <Route path="/crm/verified/:id" element={<CRMVerifiedDetailsPage />} />
            <Route path="/orders-tracking" element={<TrackingOrdersPage />} />
            <Route path="/orders-tracking/:orderId" element={<OrderTrackPage />} />
            <Route path="/s" element={<SimpleOrderCreatePage />} />
            
            <Route path="/user-schemes" element={<ProtectedRoute ><UserSchemesPage /></ProtectedRoute>} />
            <Route path="/mahotsav-schemes" element={<ProtectedRoute ><MAHOTSAV /></ProtectedRoute>} />
            <Route path="/inactive" element={<ProtectedRoute ><InactiveProductsPage /></ProtectedRoute>} />
            <Route path="/dispatch-orders/delete-all" element={<ProtectedRoute ><DispatchOrderDeletePage /></ProtectedRoute>} />
            <Route path="/google-sheet" element={<ProtectedRoute ><OrderGoogleSheet /></ProtectedRoute>} />
            <Route path="/not-in-stock-reports" element={<ProtectedRoute><NotInStockReportPage /></ProtectedRoute>} />

            <Route path="/users-all" element={<ProtectedRoute ><UserHierarchy /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute allowedRoles={['ADMIN']}><ProductPage /></ProtectedRoute>} />
            <Route path="/sale-name" element={<ProtectedRoute allowedRoles={['ADMIN']}><SaleNamePage /></ProtectedRoute>} />
            <Route path="/schemes" element={<ProtectedRoute allowedRoles={['ADMIN']}><SchemePage /></ProtectedRoute>} />
            <Route path="/schemes/new" element={<ProtectedRoute allowedRoles={['ADMIN']}><SchemeForm /></ProtectedRoute>} />
            <Route path="/schemes/edit/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><SchemeForm/></ProtectedRoute>} />
            <Route path="/admin/pending-orders" element={<ProtectedRoute allowedRoles={['ADMIN']}><SSPendingOrders /></ProtectedRoute>} />
            <Route path="/admin/pending-orders/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><SSPendingOrderItems /></ProtectedRoute>} />
            <Route path="/sampling-sheet" element={<ProtectedRoute allowedRoles={['ADMIN']}><SamplingSheetPage /></ProtectedRoute>} />
            <Route path="/add-new-user" element={<ProtectedRoute ><AddNewUser /></ProtectedRoute>} />
            <Route path="/all-users/list" element={<ProtectedRoute ><AllUsersList /></ProtectedRoute>} />
            <Route path="/crm/create-order" element={<ProtectedRoute allowedRoles={['CRM']}><CRMCreateOrderPage /></ProtectedRoute>} />
            <Route path="/crm/orders" element={<ProtectedRoute allowedRoles={['CRM']}><CRMOrderListPage /></ProtectedRoute>} />
            <Route path="/crm/orders/:orderId" element={<ProtectedRoute allowedRoles={['CRM']}><CRMOrderDetailPage /></ProtectedRoute>} />
             
           
            <Route path="/ss-page" element={<ProtectedRoute allowedRoles={['SS']}><HomePage /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/confirm-order" element={<ProtectedRoute allowedRoles={['SS']}><ConfirmOrderPage /></ProtectedRoute>} />
            <Route path="/ss/history" element={<ProtectedRoute allowedRoles={['SS']}><OrderListPage /></ProtectedRoute>} />
             <Route path="/confirm-order-ds" element={<ProtectedRoute allowedRoles={['DS']}><ConfirmOrderPageDS /></ProtectedRoute>} />
             <Route path="/ds/my-orders" element={<ProtectedRoute allowedRoles={['DS']}><DSOrdersPage /></ProtectedRoute>} />
          </Route>

          <Route path="/no-permission" element={<NoPermission />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
