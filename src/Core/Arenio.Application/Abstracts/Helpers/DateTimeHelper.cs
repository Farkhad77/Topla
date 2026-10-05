using System;

namespace Arenio.Application.Abstracts.Helpers
{
    /// <summary>
    /// Arenio-nun mərkəzi saat qurşağı köməkçisi.
    ///
    /// Qaydalar:
    ///  - İstifadəçiyə görünən bütün stadion/booking vaxtları Bakı (Asia/Baku, UTC+4) vaxtıdır.
    ///  - PostgreSQL-də saxlanan bütün timestamp-lar UTC-dir (timestamp with time zone).
    ///  - Heç vaxt əl ilə +4/-4 saat əlavə edilmir — çevirmə yalnız TimeZoneInfo ilə aparılır.
    /// </summary>
    public static class DateTimeHelper
    {
        private static readonly TimeZoneInfo AzerbaijanTimeZone = ResolveAzerbaijanTimeZone();

        private static TimeZoneInfo ResolveAzerbaijanTimeZone()
        {
            // Windows: "Azerbaijan Standard Time", Linux/Docker: "Asia/Baku".
            // .NET 8 hər iki adı əksər mühitlərdə tanıyır (ICU), amma hər ehtimala qarşı fallback saxlanılır.
            var primaryId = OperatingSystem.IsWindows() ? "Azerbaijan Standard Time" : "Asia/Baku";
            var fallbackId = OperatingSystem.IsWindows() ? "Asia/Baku" : "Azerbaijan Standard Time";

            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById(primaryId);
            }
            catch (TimeZoneNotFoundException)
            {
                return TimeZoneInfo.FindSystemTimeZoneById(fallbackId);
            }
        }

        /// <summary>Sistem timestamp-ları üçün UTC "indi".</summary>
        public static DateTime UtcNow => DateTime.UtcNow;

        /// <summary>Bakı divar saatı ilə "indi" (Kind = Unspecified).</summary>
        public static DateTime BakuNow => ToBaku(DateTime.UtcNow);

        /// <summary>Bakı təqviminə görə bugünkü tarix.</summary>
        public static DateOnly BakuToday => DateOnly.FromDateTime(BakuNow);

        /// <summary>
        /// Bakı divar saatını (frontend-dən gələn "2026-08-21T18:00:00" kimi dəyəri) UTC-yə çevirir.
        /// 18:00 Bakı → 14:00 UTC.
        /// Artıq Kind=Utc olan dəyər olduğu kimi qaytarılır (ikiqat çevirməyə qarşı qoruma).
        /// </summary>
        public static DateTime ToUtc(DateTime bakuDateTime)
        {
            if (bakuDateTime.Kind == DateTimeKind.Utc)
                return bakuDateTime;

            var unspecified = DateTime.SpecifyKind(
                bakuDateTime,
                DateTimeKind.Unspecified);

            return TimeZoneInfo.ConvertTimeToUtc(
                unspecified,
                AzerbaijanTimeZone);
        }

        /// <summary>
        /// UTC dəyəri Bakı divar saatına çevirir. 14:00 UTC → 18:00 Bakı (Kind = Unspecified).
        /// </summary>
        public static DateTime ToBaku(DateTime utcDateTime)
        {
            var utc = utcDateTime.Kind == DateTimeKind.Utc
                ? utcDateTime
                : DateTime.SpecifyKind(utcDateTime, DateTimeKind.Utc);

            return TimeZoneInfo.ConvertTimeFromUtc(
                utc,
                AzerbaijanTimeZone);
        }

        /// <summary>UTC anının Bakı təqvimindəki tarixi (cache açarları, gün qruplaması üçün).</summary>
        public static DateOnly ToBakuDate(DateTime utcDateTime)
            => DateOnly.FromDateTime(ToBaku(utcDateTime));
    }
}
