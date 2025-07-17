from fastapi import FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from astropy.time import Time
from astropy.coordinates import AltAz, EarthLocation, ICRS, SkyCoord
import astropy.units as u
import numpy as np
from astroquery.gaia import Gaia
from astropy import coordinates as coords
from fpdf import FPDF
from datetime import datetime, timezone
import sys
import os
# No need to modify sys.path for backend-local import
from generate_pdf import generate_pdf
from fastapi.responses import StreamingResponse
import io
from fastapi.responses import JSONResponse

app = FastAPI(title="GaiaMaps API", description="API for querying Gaia stars above a location at a given time.")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StarRequest(BaseModel):
    lat: float = Field(..., ge=-90, le=90, description="Latitude in degrees")
    lon: float = Field(..., ge=-180, le=180, description="Longitude in degrees")
    datetime_iso: str = Field(..., description="Datetime in ISO format (UTC)")
    limit: Optional[int] = Field(100, ge=1, le=500, description="Maximum number of stars to return (default 100, max 500)")

class PDFRequest(BaseModel):
    star_info: Dict[str, Any]

class StarOut(BaseModel):
    ra: Optional[float]
    dec: Optional[float]
    phot_g_mean_mag: Optional[float]
    bp_rp: Optional[float]
    alt_diff: Optional[float]
    az_diff: Optional[float]
    SOURCE_ID: Optional[Any]
    source_id: Optional[Any]
    # Additional fields allowed
    class Config:
        extra = "allow"

class GetStarsResponse(BaseModel):
    center: Dict[str, float]
    stars: List[StarOut]

@app.post("/get-stars", response_model=GetStarsResponse, summary="Get Gaia stars above a location at a given time")
def get_stars(req: StarRequest):
    """Returns Gaia stars above the given lat/lon at the specified UTC datetime, ordered by angular distance."""
    print(f"[LOG] /get-stars called with lat={req.lat}, lon={req.lon}, datetime_iso={req.datetime_iso}", file=sys.stderr)
    try:
        # Validate datetime
        try:
            selected_datetime = datetime.fromisoformat(req.datetime_iso)
            if selected_datetime.tzinfo is None:
                selected_datetime = selected_datetime.replace(tzinfo=timezone.utc)
        except Exception as e:
            print(f"[ERROR] Invalid datetime format: {req.datetime_iso} ({e})", file=sys.stderr)
            raise HTTPException(status_code=400, detail="Invalid datetime format. Use ISO format (e.g. 2024-06-01T12:00:00Z)")

        # Prepare time and location
        utc_time = Time(selected_datetime)
        observer_location = EarthLocation(lat=req.lat*u.deg, lon=req.lon*u.deg)
        altaz_frame = AltAz(obstime=utc_time, location=observer_location)

        observer_aux_location = EarthLocation(lat=(req.lat+1e-4)*u.deg, lon=req.lon*u.deg)
        altaz_frame_aux = AltAz(obstime=utc_time, location=observer_aux_location)

        # Compute zenith
        zenith_icrs = SkyCoord(alt=90*u.deg, az=0*u.deg, frame=altaz_frame).transform_to(ICRS())
        center = coords.SkyCoord(ra=zenith_icrs.ra, dec=zenith_icrs.dec, frame='icrs')

        zenith_icrs_aux = SkyCoord(alt=90*u.deg, az=0*u.deg, frame=altaz_frame_aux).transform_to(ICRS())
        center_aux = coords.SkyCoord(ra=zenith_icrs_aux.ra, dec=zenith_icrs_aux.dec, frame='icrs')

        # ADQL query: select 200 closest stars by angular distance
        radius = 400 * u.arcsec
        center_ra = center.ra.deg
        center_dec = center.dec.deg
        job = Gaia.launch_job(f"""
        SELECT TOP 200 *, DISTANCE(
          POINT('ICRS', ra, dec),
          POINT('ICRS', {center_ra}, {center_dec})
        ) AS ang_dist
        FROM gaiadr3.gaia_source
        WHERE 1=CONTAINS(
          POINT('ICRS', ra, dec),
          CIRCLE('ICRS', {center_ra}, {center_dec}, {radius.to(u.deg).value})
        )
        AND parallax IS NOT NULL
        AND bp_rp IS NOT NULL
        ORDER BY ang_dist ASC
        """)
        results = job.get_results()

        alt_diff = results['ra'].value * u.deg - center.ra
        az_diff = results['dec'].value * u.deg - center.dec

        # North vector in plane
        d_az_north = center_aux.ra - center.ra
        d_alt_north = center_aux.dec - center.dec
        phi = np.arctan2(d_az_north, d_alt_north)  # angle to rotate coords

        # Rotate diffs so north is up
        cos_phi, sin_phi = np.cos(phi), np.sin(phi)
        az_rot = az_diff * cos_phi + alt_diff * sin_phi
        alt_rot = -az_diff * sin_phi + alt_diff * cos_phi

        stars = []
        for i, row in enumerate(results):
            star = {k: (row[k].item() if hasattr(row[k], 'item') else row[k]) for k in row.keys()}
            star['az_diff'] = float(az_rot[i].to_value(u.deg))
            star['alt_diff'] = float(alt_rot[i].to_value(u.deg))
            if 'SOURCE_ID' not in star:
                star['SOURCE_ID'] = None
            if 'source_id' not in star:
                star['source_id'] = None
            stars.append(star)

        print(f"[LOG] Query returned {len(stars)} stars", file=sys.stderr)
        return {"center": {"ra": center_ra, "dec": center_dec}, "stars": stars}

    except HTTPException as he:
        print(f"[ERROR] HTTPException: {he.detail}", file=sys.stderr)
        raise
    except Exception as e:
        # User-friendly error for Gaia archive maintenance or VOTABLE errors
        if "VOTABLE" in str(e) or "maintenance" in str(e).lower():
            print(f"[ERROR] Gaia archive unavailable: {str(e)}", file=sys.stderr)
            return JSONResponse(
                status_code=503,
                content={"detail": "Gaia archive is temporarily unavailable. Please try again later."}
            )
        print(f"[ERROR] Internal error: {str(e)}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@app.post("/star-pdf")
def star_pdf(req: PDFRequest):
    star_info = req.star_info
    # Always set title and narrative
    star_info['title'] = "My special star"
    star_info['subtitle'] = star_info.get('subtitle', 'Your special moment')
    star_info['narrative'] = (
        "This star, likely never noticed by any human before, "
        "shone directly above you on your special day..."
    )
    # --- Robust field mapping ---
    # Distance in light years from parallax (mas)
    parallax = star_info.get('parallax')
    if parallax is None:
        parallax = star_info.get('parallax_mas')
    try:
        parallax_val = float(parallax)
    except (TypeError, ValueError):
        parallax_val = None
    if parallax_val and parallax_val > 0:
        distance_pc = 1000.0 / parallax_val
        distance_ly = distance_pc * 3.26156
        star_info['distance_ly'] = round(distance_ly)
        print(f"[PDF] parallax: {parallax_val} mas, distance: {distance_pc:.2f} pc, {distance_ly:.2f} ly")
    # Color index
    if 'color_index' not in star_info and 'bp_rp' in star_info:
        star_info['color_index'] = star_info['bp_rp']
    # Absolute magnitude from Gmag and parallax
    phot_g = star_info.get('phot_g_mean_mag')
    if phot_g is not None and parallax and isinstance(parallax, (int, float)) and parallax > 0:
        abs_mag = phot_g + 5 * (np.log10(parallax) + 1) - 10
        star_info['abs_mag'] = round(abs_mag, 2)
    # Proper motion
    pmra = star_info.get('pmra')
    pmdec = star_info.get('pmdec')
    if pmra is not None and pmdec is not None:
        pm_total = (pmra**2 + pmdec**2) ** 0.5
        star_info['proper_motion'] = f"{pm_total:.1f} mas/yr"
    output = io.BytesIO()
    generate_pdf(star_info, output_path=output)
    output.seek(0)
    return StreamingResponse(output, media_type="application/pdf", headers={
        "Content-Disposition": "attachment; filename=star_report.pdf"
    })
