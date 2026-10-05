/**
 * Bütün backend yolları TƏK yerdə. Controller sinif adına görə bəzi route-lar
 * tək haldadır (BookingController → /api/Booking) — bunlar qəsdən belədir.
 */
export const endpoints = {
  auth: {
    register: '/api/Accounts/create',
    login: '/api/Accounts/login',
    // Backend-də route hərfi olaraq "refresh token"dir (boşluqlu).
    refresh: '/api/Accounts/refresh%20token',
    confirmOtp: '/api/Accounts/register/confirm-otp',
    logout: '/api/Accounts/logout',
    forgotPassword: '/api/Accounts/forgot-password',
    resetPassword: '/api/Accounts/reset-password',
    // OTP kodunu yenidən göndərir (yalnız aktiv pending qeydiyyat üçün)
    resendOtp: '/api/Accounts/resend-otp',
  },
  stadiums: {
    view: '/api/Stadiums/View',
    create: '/api/Stadiums/create',
    update: '/api/Stadiums/update',
    remove: '/api/Stadiums/delete',
    activate: '/api/Stadiums/activate',
    deactivate: '/api/Stadiums/deactivate',
    verify: '/api/Stadiums/verify',
    // Moderator/Admin: təsdiq gözləyən stadionların növbəsi
    pending: '/api/Stadiums/pending',
    byId: (id: string) => `/api/Stadiums/${id}`,
    // Publik detal — icazə tələb etmir, backend tərəfdə Redis cache-lidir
    viewDetail: (id: string) => `/api/Stadiums/view-detail/${id}`,
    byUser: (userId: string) => `/api/Stadiums/user/${userId}`,
    mine: '/api/Stadiums/my',
    myBookings: '/api/Stadiums/my-stadiums-bookings',
    blockedSlots: (stadiumId: string) => `/api/Stadiums/stadiums/${stadiumId}/blocked-slots`,
    unblock: (blockedSlotId: string) => `/api/Stadiums/blocked-slots/${blockedSlotId}`,
  },
  bookings: {
    create: '/api/Booking',
    cancel: (id: string) => `/api/Booking/cancel/${id}`,
    reject: (id: string) => `/api/Booking/${id}/reject`,
    byId: (id: string) => `/api/Booking/${id}`,
    byUser: (userId: string) => `/api/Booking/user/${userId}`,
    mine: '/api/Booking/my-bookings',
    all: '/api/Booking',
    remove: (id: string) => `/api/Booking/${id}`,
    availableSlots: '/api/Booking/available-slots',
    preview: '/api/Booking/preview',
  },
  reviews: {
    create: '/api/Review',
    update: (id: string) => `/api/Review/${id}`,
    remove: (id: string) => `/api/Review/${id}`,
    removeMine: (id: string) => `/api/Review/my-review/${id}`,
    byStadium: (stadiumId: string) => `/api/Review/stadium/${stadiumId}`,
    byUser: (userId: string) => `/api/Review/user/${userId}`,
  },
  images: {
    upload: (stadiumId: string) => `/api/StadiumImage/${stadiumId}`,
    byStadium: (stadiumId: string) => `/api/StadiumImage/${stadiumId}`,
    remove: (imageId: string) => `/api/StadiumImage/${imageId}`,
    setMain: (imageId: string) => `/api/StadiumImage/${imageId}/set-main`,
    reorder: '/api/StadiumImage/reorder',
  },
  ownerRequests: {
    create: '/api/OwnerRequests',
    mine: '/api/OwnerRequests/my-request',
  },
  moderation: {
    ownerRequests: '/api/Moderators/owner-requests',
    ownerRequestById: (id: string) => `/api/Moderators/owner-requests/${id}`,
    approveOwnerRequest: (id: string) => `/api/Moderators/owner-requests/${id}/approve`,
    rejectOwnerRequest: (id: string) => `/api/Moderators/owner-requests/${id}/reject`,
    blockUser: (userId: string) => `/api/Moderators/users/${userId}/block`,
    unblockUser: (userId: string) => `/api/Moderators/users/${userId}/unblock`,
    // Yalnız Admin: e-poçta görə istifadəçiyə Moderator rolu verir
    assignModerator: '/api/Moderators/users/assign-moderator',
  },
  workers: {
    assign: '/api/Workers/assign',
    remove: (workerUserId: string) => `/api/Workers/${workerUserId}`,
    mine: '/api/Workers',
    myBusiness: '/api/Workers/my-business',
  },
  roles: {
    all: '/api/Roles',
    permissions: '/api/Roles/permissions',
  },
  search: '/api/Search/search',
  analytics: {
    /** Owner/Worker: biznes analitikası (fromDate/toDate — Bakı təqvim günləri). */
    owner: '/api/Analytics/owner',
    /** Admin/Moderator: platforma analitikası. */
    platform: '/api/Analytics/platform',
  },
} as const
