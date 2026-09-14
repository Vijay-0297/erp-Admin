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
import PurchaseItemsListPage from '../pages/purchase-items/PurchaseItemsListPage.jsx'
import SalesListPage from '../pages/sales/SalesListPage.jsx'
import SalesReturnsListPage from '../pages/sales-returns/SalesReturnsListPage.jsx'
import SalesItemsListPage from '../pages/sales-items/SalesItemsListPage.jsx'
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
          <Route path="/purchase-items" element={<PurchaseItemsListPage />} />
          <Route path="/sales" element={<SalesListPage />} />
          <Route path="/sales-returns" element={<SalesReturnsListPage />} />
          <Route path="/sales-items" element={<SalesItemsListPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
