using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Settings
{
    public static class Permissions
    {
        public static class Role
        {
            public const string Create = "Role.Create";
            public const string Update = "Role.Update";
            public const string Delete = "Role.Delete";
            public const string GetAllPermissions = "Role.GetAllPermissions";
            public const string GetAllRoles = "Role.GetAllRoles";
            public static List<string> All = new()
            {
                Create,
                Update,
                Delete,
                GetAllPermissions,
                GetAllRoles
            };
        }
        public static class User
        {
            public const string Create = "User.Create";
            public const string ResetPassword = "User.ResetPassword";
            public const string GetAll = "User.GetAll";
            public const string GetById = "User.GetById";
            public const string Block = "User.Block";
            public const string UnBlock = "User.UnBlock";
            public static List<string> All = new()
            {
                Create,
                ResetPassword,
                GetAll,
                GetById,
                Block
                ,UnBlock
            };
        }
        public static class Stadium
        {
            public const string View = "Stadium.View";
            public const string ViewDetails = "Stadium.ViewDetails";
            public const string ViewAnalytics = "Stadium.ViewAnalytics";
            public const string Activate = "Stadium.Activate";
            public const string DeActivate = "Stadium.DeActivate";
            public const string Verify = "Stadium.Verify";
          
            public const string ManageImages = "Stadium.ManageImages";
            public const string ManagePrices = "Stadium.ManagePrices";
            public const string ManageSchedule = "Stadium.ManageSchedule";
            public const string Create = "Stadium.Create";
            public const string Update = "Stadium.Update";
            public const string Delete = "Stadium.Delete";
            
            public const string GetById = "Stadium.GetById";
            public const string GetByUserId = "Stadium.GetByUserId";
            public const string GetMyStadiums = "Stadium.GetMyStadiums";
            public static List<string> All = new()
            {
                Create,
                Update,
                Delete,
                
                GetById,
                GetByUserId,
                View,
                ViewDetails,
                ViewAnalytics,
                Activate,
                DeActivate,
                Verify,
                 ManageImages,ManagePrices,ManageSchedule,GetMyStadiums

            };



        }
       
        public static class Booking
        {
            public const string Create = "Booking.Create";
            public const string Update = "Booking.Update";
            public const string Delete = "Booking.Delete";
            public const string GetAll = "Booking.GetAll";
            public const string GetById = "Booking.GetById";
            public const string GetUserBookings = "Booking.GetUserBookings";
            public const string View = "Booking.View";
            public const string ViewOwn = "Booking.ViewOwn";
            public const string ViewAll = "Booking.ViewAll";
            public const string ViewDetails = "Booking.ViewDetails";
            public const string Cancel = "Booking.Cancel";
            public const string Approve = "Booking.Approve";
            public const string Reject = "Booking.Reject";
            public static List<string> All = new()
            {
                Create,Update,Delete,GetAll,GetById,View,ViewDetails,Cancel,Approve,Reject,ViewOwn,ViewAll,GetUserBookings
            };
        }
        public static class OwnerRequest
        {
            public const string Create = "OwnerRequest.Create";
            public const string GetMyRequest = "OwnerRequest.GetMyRequest";
            public const string GetPendingRequests = "OwnerRequest.GetPendingRequests";
            public const string GetById = "OwnerRequest.GetById";
            public const string Approve = "OwnerRequest.Approve";
            public const string Reject = "OwnerRequest.Reject";
            public static List<string> All = new()
            {
                Create,GetMyRequest,GetPendingRequests,GetById,Approve,Reject
            };
        }
     
    }
}
