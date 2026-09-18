import { Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout.jsx'
import MainLayout from '../layouts/MainLayout.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import PublicRoute from './PublicRoute.jsx'

import LoginPage from '../pages/auth/LoginPage.jsx'
import RegisterPage from '../pages/auth/RegisterPage.jsx'
import DashboardPage from '../pages/dashboard/DashboardPage.jsx'
import UsersListPage from '../pages/users/UsersListPage.jsx'
import RolesListPage from '../pages/roles/RolesListPage.jsx'
import CategoriesListPage from '../pages/categories/CategoriesListPage.jsx'
import SuppliersListPage from '../pages/suppliers/SuppliersListPage.jsx'
import CustomersListPage from '../pages/customers/CustomersListPage.jsx'
import ProductsListPage from '../pages/products/ProductsListPage.jsx'
import PurchasesListPage from '../pages/purchases/PurchasesListPage.jsx'
import PurchaseReturnsListPage from '../pages/purchase-returns/PurchaseReturnsListPage.jsx'
import PurchaseItemsListPage from '../pages/purchase-items/PurchaseItemsListPage.jsx'
import SalesListPage from '../pages/sales/SalesListPage.jsx'
import SalesReturnsListPage from '../pages/sales-returns/SalesReturnsListPage.jsx'
import SalesReturnItemsListPage from '../pages/sales-return-items/SalesReturnItemsListPage.jsx'
import SalesItemsListPage from '../pages/sales-items/SalesItemsListPage.jsx'
import PurchaseReturnItemsListPage from '../pages/purchase-return-items/PurchaseReturnItemsListPage.jsx'
import StockMovementsListPage from '../pages/stock-movements/StockMovementsListPage.jsx'
import SettingsPage from '../pages/settings/SettingsPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersListPage />} />
          <Route path="/roles" element={<RolesListPage />} />
          <Route path="/categories" element={<CategoriesListPage />} />
          <Route path="/suppliers" element={<SuppliersListPage />} />
          <Route path="/customers" element={<CustomersListPage />} />
          <Route path="/products" element={<ProductsListPage />} />
          <Route path="/purchases" element={<PurchasesListPage />} />
          <Route path="/purchase-returns" element={<PurchaseReturnsListPage />} />
          <Route path="/purchase-return-items" element={<PurchaseReturnItemsListPage />} />
          <Route path="/purchase-items" element={<PurchaseItemsListPage />} />
          <Route path="/stock-movements" element={<StockMovementsListPage />} />
          <Route path="/sales" element={<SalesListPage />} />
          <Route path="/sales-returns" element={<SalesReturnsListPage />} />
          <Route path="/sales-return-items" element={<SalesReturnItemsListPage />} />
          <Route path="/sales-items" element={<SalesItemsListPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
