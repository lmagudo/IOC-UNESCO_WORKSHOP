using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Mvc;
using Microsoft.Owin.Security;
using IOCProjectMVC.Models;
using Microsoft.Owin.Host.SystemWeb;
using System.Web.Security;
using IOCProjectMVC.Usr;


namespace IOCProjectMVC.Controllers
{
    public class AccountManagerController : Controller
    {
        //// GET: ValidateLogin
        //public ActionResult Index()
        //{
        //    return View();
        //}

        public ActionResult Login()
        {
            return View();
        }


        // GET: Login
        [HttpPost]
        public ActionResult Login(string email, string pass, string returnView){

            unescoEntities db = new unescoEntities();


            var L2EQuery = db.usuarios.Where(s => s.username == email);
            usuario logged_user = L2EQuery.FirstOrDefault();



            if (logged_user != null)
            {

                if (isvalidLogin(logged_user, pass))
                {



                    FormsAuthenticationTicket ticket = new FormsAuthenticationTicket(email, true, 30);


                    //' Encrypt the ticket.
                    //Dim encTicket As String = FormsAuthentication.Encrypt(ticket)
                    string encTicket = FormsAuthentication.Encrypt(ticket);

                    //Dim ck As New HttpCookie(FormsAuthentication.FormsCookieName, encTicket)

                    HttpCookie ck = new HttpCookie(FormsAuthentication.FormsCookieName, encTicket);
                    //' Create the cookie.
                    Response.Cookies.Add(ck);
                    if (returnView == "")
                    {
                        return Redirect("/Home/Index");
                    }
                    else
                    {
                        return Redirect(returnView);
                    }

                }
               else
                {
                    ModelState.AddModelError("", "Nombre de usuario o contraseña no válido.");

                    ViewData["user"] = email;

                    return RedirectToAction("Login", "AccountManager", new { user = email });

                }
            }
            else 
            {
                ModelState.AddModelError("", "Nombre de usuario no válido.");

                ViewData["user"] = email;

                return RedirectToAction("Login", "AccountManager", new { user = email });
            

            }
        }

        public ActionResult LogOff() 
        {

            FormsAuthentication.SignOut();
            Session.Abandon();
        
            HttpCookie cookie1 =  new HttpCookie(FormsAuthentication.FormsCookieName, "");
            cookie1.Expires = DateTime.Now.AddYears(-1);
            Response.Cookies.Add(cookie1);
       
            HttpCookie cookie2 =  new HttpCookie("ASP.NET_SessionId", "");
            cookie2.Expires = DateTime.Now.AddYears(-1);
            Response.Cookies.Add(cookie2);
        
            return RedirectToAction("Index", "Home");
        }

        public bool isvalidLogin(usuario user, string pass)
        {
            string encpass = staticUtilities.getHasString(pass);

            string storedpass = user.pass;

            if (storedpass == encpass)
            {

                return true;
            }
            else
            {
                return false;
            }




        }

      

        
        public ContentResult getLogin()
        {
            usuario user = staticUtilities.getLoggedUser();

            if (user != null)
            {
                return Content(user.username.ToString());
            }
            else { return Content(""); }
           
        }
    }
}