import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { OwnerLayout } from '@/layouts/OwnerLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { GuestOnlyRoute, ProtectedRoute } from '@/components/common/ProtectedRoute'
import { PageLoader } from '@/components/ui'

// Public
const HomePage = lazy(() => import('@/pages/public/HomePage'))
const StadiumsPage = lazy(() => import('@/pages/public/StadiumsPage'))
const StadiumDetailPage = lazy(() => import('@/pages/public/StadiumDetailPage'))
const HowItWorksPage = lazy(() => import('@/pages/public/HowItWorksPage'))
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'))
const ForbiddenPage = lazy(() => import('@/pages/public/ForbiddenPage'))

// Auth
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const VerifyOtpPage = lazy(() => import('@/pages/auth/VerifyOtpPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))

// Booking
const BookingReviewPage = lazy(() => import('@/pages/booking/BookingReviewPage'))
const BookingSuccessPage = lazy(() => import('@/pages/booking/BookingSuccessPage'))

// User dashboard
const DashboardOverviewPage = lazy(() => import('@/pages/dashboard/DashboardOverviewPage'))
const MyBookingsPage = lazy(() => import('@/pages/dashboard/MyBookingsPage'))
const MyReviewsPage = lazy(() => import('@/pages/dashboard/MyReviewsPage'))
const BecomeOwnerPage = lazy(() => import('@/pages/dashboard/BecomeOwnerPage'))
const ProfilePage = lazy(() => import('@/pages/dashboard/ProfilePage'))

// Owner
const OwnerOverviewPage = lazy(() => import('@/pages/owner/OwnerOverviewPage'))
const OwnerBookingsPage = lazy(() => import('@/pages/owner/OwnerBookingsPage'))
const OwnerCalendarPage = lazy(() => import('@/pages/owner/OwnerCalendarPage'))
const OwnerStadiumsPage = lazy(() => import('@/pages/owner/OwnerStadiumsPage'))
const OwnerStadiumFormPage = lazy(() => import('@/pages/owner/OwnerStadiumFormPage'))
const OwnerBlockedSlotsPage = lazy(() => import('@/pages/owner/OwnerBlockedSlotsPage'))
const OwnerStaffPage = lazy(() => import('@/pages/owner/OwnerStaffPage'))
const OwnerRevenuePage = lazy(() => import('@/pages/owner/OwnerRevenuePage'))
const OwnerReviewsPage = lazy(() => import('@/pages/owner/OwnerReviewsPage'))

// Admin
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage'))
const AdminOwnerRequestsPage = lazy(() => import('@/pages/admin/AdminOwnerRequestsPage'))
const AdminStadiumsPage = lazy(() => import('@/pages/admin/AdminStadiumsPage'))
const AdminBookingsPage = lazy(() => import('@/pages/admin/AdminBookingsPage'))
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'))
const AdminReviewsPage = lazy(() => import('@/pages/admin/AdminReviewsPage'))
const AdminStatsPage = lazy(() => import('@/pages/admin/AdminStatsPage'))

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="stadiums" element={<StadiumsPage />} />
          <Route path="stadiums/:stadiumId" element={<StadiumDetailPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="forbidden" element={<ForbiddenPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="booking/review" element={<BookingReviewPage />} />
            <Route path="booking/success/:bookingId" element={<BookingSuccessPage />} />
          </Route>
        </Route>

        <Route element={<GuestOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="verify-otp" element={<VerifyOtpPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
          </Route>
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverviewPage />} />
            <Route path="bookings" element={<MyBookingsPage />} />
            <Route path="reviews" element={<MyReviewsPage />} />
            <Route path="become-owner" element={<BecomeOwnerPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['Owner', 'Worker']} />}>
          <Route path="owner" element={<OwnerLayout />}>
            <Route index element={<OwnerOverviewPage />} />
            <Route path="bookings" element={<OwnerBookingsPage />} />
            <Route path="calendar" element={<OwnerCalendarPage />} />
            <Route path="stadiums" element={<OwnerStadiumsPage />} />
            <Route path="stadiums/new" element={<OwnerStadiumFormPage />} />
            <Route path="stadiums/:stadiumId/edit" element={<OwnerStadiumFormPage />} />
            <Route path="blocked-slots" element={<OwnerBlockedSlotsPage />} />
            <Route path="staff" element={<OwnerStaffPage />} />
            <Route path="revenue" element={<OwnerRevenuePage />} />
            <Route path="reviews" element={<OwnerReviewsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['Admin', 'Moderator']} />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="owner-requests" element={<AdminOwnerRequestsPage />} />
            <Route path="stadiums" element={<AdminStadiumsPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="stats" element={<AdminStatsPage />} />
          </Route>
        </Route>

        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  )
}
