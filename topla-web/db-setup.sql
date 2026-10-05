/* ===========================================================================
   ARENIO — ROL VƏ İCAZƏ QURAŞDIRMASI
   ---------------------------------------------------------------------------
   Nə üçün lazımdır:
   Backend-də rollar (Admin, Moderator, Owner, Worker, User) və hər rolun
   "Permission" claim-ləri BAZADA saxlanılır. Seeder yalnız "Worker" rolunu
   yaradır, ona görə təzə bazada:
     • Admin/Moderator hesabı ümumiyyətlə olmur → owner sorğusunu təsdiqləyən
       yoxdur → heç kim Owner ola bilmir → /owner paneli açılmır;
     • rol claim-ləri olmadığı üçün [Authorize(Policy = "Stadium.Create")] kimi
       endpoint-lər 403 qaytarır.

   İstifadə:
     1. SSMS-də ArenioDb2 bazasını seç
     2. Aşağıdakı @AdminEmail dəyərini ÖZ e-poçtunla əvəz et
     3. Skripti icra et
     4. Tətbiqdən ÇIXIB yenidən daxil ol (rollar JWT-yə giriş anında yazılır!)

   Skript idempotentdir — dəfələrlə icra etmək təhlükəsizdir.
   =========================================================================== */

DECLARE @AdminEmail NVARCHAR(256) = N'senin@email.com';   -- <<< DƏYİŞ

SET NOCOUNT ON;

/* ---------------------------------------------------------------------------
   1) Rollar
   --------------------------------------------------------------------------- */
DECLARE @Roles TABLE (Name NVARCHAR(64));
INSERT INTO @Roles (Name) VALUES (N'Admin'), (N'Moderator'), (N'Owner'), (N'Worker'), (N'User');

INSERT INTO AspNetRoles (Id, [Name], NormalizedName, ConcurrencyStamp)
SELECT CONVERT(NVARCHAR(450), NEWID()), r.Name, UPPER(r.Name), CONVERT(NVARCHAR(450), NEWID())
FROM @Roles r
WHERE NOT EXISTS (SELECT 1 FROM AspNetRoles a WHERE a.NormalizedName = UPPER(r.Name));

PRINT '1) Rollar hazırdır.';

/* ---------------------------------------------------------------------------
   2) İcazələr (AspNetRoleClaims, ClaimType = 'Permission')
   Permissions.cs faylındakı siyahı ilə eynidir.
   --------------------------------------------------------------------------- */
DECLARE @Perm TABLE (RoleName NVARCHAR(64), Permission NVARCHAR(128));

-- ADMIN: hər şey
INSERT INTO @Perm (RoleName, Permission) VALUES
 (N'Admin', N'Role.Create'), (N'Admin', N'Role.Update'), (N'Admin', N'Role.Delete'),
 (N'Admin', N'Role.GetAllPermissions'), (N'Admin', N'Role.GetAllRoles'),
 (N'Admin', N'User.Create'), (N'Admin', N'User.ResetPassword'), (N'Admin', N'User.GetAll'),
 (N'Admin', N'User.GetById'), (N'Admin', N'User.Block'), (N'Admin', N'User.UnBlock'),
 (N'Admin', N'Stadium.View'), (N'Admin', N'Stadium.ViewDetails'), (N'Admin', N'Stadium.ViewAnalytics'),
 (N'Admin', N'Stadium.Activate'), (N'Admin', N'Stadium.DeActivate'), (N'Admin', N'Stadium.Verify'),
 (N'Admin', N'Stadium.ManageImages'), (N'Admin', N'Stadium.ManagePrices'), (N'Admin', N'Stadium.ManageSchedule'),
 (N'Admin', N'Stadium.Create'), (N'Admin', N'Stadium.Update'), (N'Admin', N'Stadium.Delete'),
 (N'Admin', N'Stadium.GetById'), (N'Admin', N'Stadium.GetByUserId'), (N'Admin', N'Stadium.GetMyStadiums'),
 (N'Admin', N'Booking.Create'), (N'Admin', N'Booking.Update'), (N'Admin', N'Booking.Delete'),
 (N'Admin', N'Booking.GetAll'), (N'Admin', N'Booking.GetById'), (N'Admin', N'Booking.GetUserBookings'),
 (N'Admin', N'Booking.View'), (N'Admin', N'Booking.ViewOwn'), (N'Admin', N'Booking.ViewAll'),
 (N'Admin', N'Booking.ViewDetails'), (N'Admin', N'Booking.Cancel'), (N'Admin', N'Booking.Approve'),
 (N'Admin', N'Booking.Reject'),
 (N'Admin', N'OwnerRequest.Create'), (N'Admin', N'OwnerRequest.GetMyRequest'),
 (N'Admin', N'OwnerRequest.GetPendingRequests'), (N'Admin', N'OwnerRequest.GetById'),
 (N'Admin', N'OwnerRequest.Approve'), (N'Admin', N'OwnerRequest.Reject');

-- MODERATOR: moderasiya + oxuma
INSERT INTO @Perm (RoleName, Permission) VALUES
 (N'Moderator', N'Stadium.View'), (N'Moderator', N'Stadium.ViewDetails'), (N'Moderator', N'Stadium.GetById'),
 (N'Moderator', N'Stadium.Verify'), (N'Moderator', N'Stadium.Activate'), (N'Moderator', N'Stadium.DeActivate'),
 (N'Moderator', N'Booking.GetAll'), (N'Moderator', N'Booking.GetById'), (N'Moderator', N'Booking.View'),
 (N'Moderator', N'User.GetAll'), (N'Moderator', N'User.GetById'),
 (N'Moderator', N'OwnerRequest.GetPendingRequests'), (N'Moderator', N'OwnerRequest.GetById'),
 (N'Moderator', N'OwnerRequest.Approve'), (N'Moderator', N'OwnerRequest.Reject');

-- OWNER: öz biznesini idarə edir
INSERT INTO @Perm (RoleName, Permission) VALUES
 (N'Owner', N'Stadium.Create'), (N'Owner', N'Stadium.Update'), (N'Owner', N'Stadium.Delete'),
 (N'Owner', N'Stadium.GetById'), (N'Owner', N'Stadium.GetByUserId'), (N'Owner', N'Stadium.GetMyStadiums'),
 (N'Owner', N'Stadium.View'), (N'Owner', N'Stadium.ViewDetails'), (N'Owner', N'Stadium.ViewAnalytics'),
 (N'Owner', N'Stadium.Activate'), (N'Owner', N'Stadium.DeActivate'),
 (N'Owner', N'Stadium.ManageImages'), (N'Owner', N'Stadium.ManagePrices'), (N'Owner', N'Stadium.ManageSchedule'),
 (N'Owner', N'Booking.GetById'), (N'Owner', N'Booking.View'), (N'Owner', N'Booking.ViewDetails'),
 (N'Owner', N'Booking.ViewOwn'), (N'Owner', N'Booking.Approve'), (N'Owner', N'Booking.Reject'),
 (N'Owner', N'Booking.Cancel'), (N'Owner', N'Booking.Create'),
 (N'Owner', N'OwnerRequest.Create'), (N'Owner', N'OwnerRequest.GetMyRequest');

-- WORKER: owner ilə eyni əməliyyat icazələri (işçi idarəetməsi istisna)
INSERT INTO @Perm (RoleName, Permission)
SELECT N'Worker', Permission FROM @Perm WHERE RoleName = N'Owner';

-- USER: adi istifadəçi
INSERT INTO @Perm (RoleName, Permission) VALUES
 (N'User', N'Stadium.View'), (N'User', N'Stadium.ViewDetails'), (N'User', N'Stadium.GetById'),
 (N'User', N'Booking.Create'), (N'User', N'Booking.GetById'), (N'User', N'Booking.ViewOwn'),
 (N'User', N'Booking.Cancel'),
 (N'User', N'OwnerRequest.Create'), (N'User', N'OwnerRequest.GetMyRequest');

INSERT INTO AspNetRoleClaims (RoleId, ClaimType, ClaimValue)
SELECT r.Id, N'Permission', p.Permission
FROM @Perm p
JOIN AspNetRoles r ON r.NormalizedName = UPPER(p.RoleName)
WHERE NOT EXISTS (
    SELECT 1 FROM AspNetRoleClaims c
    WHERE c.RoleId = r.Id AND c.ClaimType = N'Permission' AND c.ClaimValue = p.Permission);

PRINT '2) İcazələr hazırdır.';

/* ---------------------------------------------------------------------------
   3) Seçilmiş hesabı Admin et
   --------------------------------------------------------------------------- */
DECLARE @UserId NVARCHAR(450) =
    (SELECT TOP 1 Id FROM AspNetUsers WHERE NormalizedEmail = UPPER(@AdminEmail));

IF @UserId IS NULL
BEGIN
    PRINT '!!! XƏTA: bu e-poçtla istifadəçi tapılmadı: ' + @AdminEmail;
    PRINT '    Əvvəlcə saytdan qeydiyyatdan keç və e-poçtu OTP ilə təsdiqlə.';
END
ELSE
BEGIN
    -- E-poçt təsdiqi (OTP gəlmirsə əl ilə açmaq üçün)
    UPDATE AspNetUsers SET EmailConfirmed = 1 WHERE Id = @UserId;

    INSERT INTO AspNetUserRoles (UserId, RoleId)
    SELECT @UserId, r.Id
    FROM AspNetRoles r
    WHERE r.NormalizedName = N'ADMIN'
      AND NOT EXISTS (SELECT 1 FROM AspNetUserRoles ur WHERE ur.UserId = @UserId AND ur.RoleId = r.Id);

    PRINT '3) ' + @AdminEmail + ' artıq Admin-dir.';
END

/* ===========================================================================
   NÖVBƏTİ ADDIM — /owner panelini açmaq
   ---------------------------------------------------------------------------
   DÜZGÜN YOL (tövsiyə olunur, StadiumOwnerProfile-i də yaradır):
     1. Admin hesabı ilə daxil ol
     2. Adi istifadəçi hesabı ilə /dashboard/become-owner → sorğu göndər
     3. Admin hesabı ilə /admin/owner-requests → Təsdiqlə
     4. Həmin istifadəçi ÇIXIB yenidən daxil olsun → /owner açılır

   Bir hesabla sürətli test etmək istəsən: eyni hesabla sorğu göndər, sonra
   Admin kimi özünü təsdiqlə. Diqqət: təsdiq zamanı "User" rolu silinir və
   "Owner" verilir — yeni rol yalnız YENİDƏN LOGIN-dən sonra JWT-yə düşür.
   =========================================================================== */
