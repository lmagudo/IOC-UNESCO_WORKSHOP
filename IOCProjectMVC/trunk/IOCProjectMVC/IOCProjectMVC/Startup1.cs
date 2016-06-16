using System;
using System.Threading.Tasks;
using Microsoft.Owin;
using Owin;
using Microsoft.Owin.Security.Cookies;
using Microsoft.AspNet.Identity;

[assembly: OwinStartup(typeof(IOCProjectMVC.Startup1))]

namespace IOCProjectMVC
{
    public class Startup1
    {
        public void Configuration(IAppBuilder app)
        {
            app.UseCookieAuthentication(new
        CookieAuthenticationOptions
            {
                AuthenticationType =
                DefaultAuthenticationTypes.ApplicationCookie,
                LoginPath = new PathString("/AccountManager/Login")
            });

            app.UseExternalSignInCookie(
            DefaultAuthenticationTypes.ExternalCookie);
        }
    }
}
