using Arenio.Application.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Abstracts.Helpers
{
    public static class PermissionHelper
    {
        public static Dictionary<string, List<string>> GetAllPermissions()
        {
            var result = new Dictionary<string, List<string>>();
            var nestedTypes = typeof(Permissions).GetNestedTypes(BindingFlags.Public | BindingFlags.Static);

            foreach (var moduleType in nestedTypes)
            {
                var allField = moduleType.GetField("All", BindingFlags.Public | BindingFlags.Static);

                if (allField != null)
                {
                    var permissions = allField.GetValue(null) as List<string>;
                    if (permissions != null && permissions.Any())
                    {
                        result.Add(moduleType.Name, permissions);
                    }
                }
            }
            return result;
        }

        public static List<string> GetAllPermissionsList()
        {
            return GetAllPermissions()
                .SelectMany(x => x.Value)
                .ToList();
        }
    }
}
