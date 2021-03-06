﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace IOCProjectMVC.Controllers
{
    public class HomeController : Controller
    {
        [Authorize]
        public ActionResult Index()
        {
            return View();
        }
        [Authorize]
        public ActionResult BathymetricTransects()
        {
            return View("BathymetricTransects");
        }
        [Authorize]
        public ActionResult UpwellingIndex()
        {
            return View("UpwellingIndex");
        }
        [Authorize]
        public ActionResult PrecipitationDischarges()
        {
            return View("PrecipitationDischarges");
        }
        [Authorize]
        public ActionResult TideGauge()
        {
            return View("TideGauge");
        }
        [Authorize]
        public ActionResult Argo3D()
        {
            return View("Argo3D");
        }
        [Authorize]
        public ActionResult OceanographicAnomalies()
        {
            return View("OceanographicAnomalies");
        }
        [Authorize]
        public ActionResult SpatioTemporalViewer()
        {
            return View("SpatioTemporalViewer");
        }
        [Authorize]
        public ActionResult OceanographicTransects()
        {
            return View("OceanographicTransects");
        }
        [Authorize]
        public ActionResult BiologicalData()
        {
            return View("BiologicalData");
        }
        [Authorize]
        public ActionResult UsingOwnData()
        {
            return View("UsingOwnData");
        }
        [Authorize]
        public ActionResult InterpolationTools()
        {
            return View("InterpolationTools");
        }
        [Authorize]
        public ActionResult TimeSeries()
        {
            return View("TimeSeries");
        }
        [Authorize]
        public ActionResult FlotCharts()
        {
            return View("FlotCharts");
        }
        [Authorize]
        public ActionResult MorrisCharts()
        {
            return View("MorrisCharts");
        }
        [Authorize]
        public ActionResult Tables()
        {
            return View("Tables");
        }
        [Authorize]
        public ActionResult Forms()
        {
            return View("Forms");
        }
        [Authorize]
        public ActionResult Panels()
        {
            return View("Panels");
        }
        [Authorize]
        public ActionResult Buttons()
        {
            return View("Buttons");
        }
        [Authorize]
        public ActionResult Notifications()
        {
            return View("Notifications");
        }
        [Authorize]
        public ActionResult Typography()
        {
            return View("Typography");
        }
         [Authorize]
        public ActionResult Icons()
        {
            return View("Icons");
        }
         [Authorize]
        public ActionResult Grid()
        {
            return View("Grid");
        }
         [Authorize]
        public ActionResult Blank()
        {
            return View("Blank");
        }
        
        public ActionResult Login()
        {
            return View("Login");
        }

    }
}