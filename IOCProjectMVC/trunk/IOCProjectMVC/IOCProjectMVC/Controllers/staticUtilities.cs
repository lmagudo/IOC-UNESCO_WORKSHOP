using Microsoft.Win32;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Data.Entity;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Security;
using IOCProjectMVC.Models;

namespace IOCProjectMVC.Usr
{
    public static class staticUtilities
    {
        

        public static usuario getLoggedUser() 
        {
            try
            {
                HttpCookie cookie = HttpContext.Current.Request.Cookies["gaslogin"];

                FormsAuthenticationTicket tk = FormsAuthentication.Decrypt(cookie.Value);

                string logeduser = tk.Name;

                //gasnaturalHelper helper = new gasnaturalHelper()
                unescoEntities db = new unescoEntities();

                usuario user = db.usuarios.Where(u => u.username == logeduser).First();

                return user;
            }
            catch 
            {
                return null;
            }


        }

        public static List<string> getModelColumns(Type obj)
        {


            var names = new List<string>();
            //var properties = obj.GetProperties(BindingFlags.Public | BindingFlags.Static);
            var properties = obj.GetProperties();
            //var attr2 = obj.GetCustomAttribute(typeof(DisplayNameAttribute), false);

            foreach (var item in properties)
            {


                //var enumType = typeof(obj);
              

                //return attribute.Name;


                

                //propInfo.CustomAttribute
                //DisplayNameAttribute dpname = (DisplayNameAttribute)propInfo.GetCustomAttribute(typeof(DisplayNameAttribute), false);

                
                //MetadataTypeAttribute mt = new MetadataTypeAttribute(item.GetType());
                var attrs = obj.GetCustomAttributes(obj,false);
                // at = obj.GetCustomAttribute(obj, false);
                //var x  = mt.MetadataClassType.GetCustomAttribute(typeof(DisplayNameAttribute),false);

                
                //var attribute = (DisplayNameAttribute)mt.MetadataClassType.GetCustomAttribute(typeof(DisplayNameAttribute), true);

                //var prop = obj.GetProperty(item.Name).CustomAttributes;
                

                //var attribute = (DisplayNameAttribute)item.GetCustomAttribute(obj, true);
                var attribute = (DisplayNameAttribute)item.GetCustomAttribute(typeof(DisplayNameAttribute),true);
                if (attribute != null)
                {
                    names.Add(attribute.DisplayName);
                }
                else
                {
                    names.Add(item.Name);
                }
            }

            return names;
        }

        public static string getHasString(string pass)
        {

            byte[] encData_byte = new byte[pass.Length];

            encData_byte = System.Text.Encoding.UTF8.GetBytes(pass);


            SHA512 shaM = new SHA512Managed();

            byte[] enc_pass_byte = shaM.ComputeHash(encData_byte);

            var sb = new StringBuilder();
            for (var i = 0; i < enc_pass_byte.Length; i++)
            {
                sb.Append(enc_pass_byte[i].ToString("X2"));
            }

            return sb.ToString();
        }

      
      
    }
}