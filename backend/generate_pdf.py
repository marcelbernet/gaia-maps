"""
generate_star_pdf.py

A Python script that generates a single-page PDF for "Your Star" outreach,
using ReportLab and PIL for layout and visuals, and approximates spectral type
from Gaia color and absolute magnitude.

Dependencies:
- reportlab
- pillow

Usage:
    python generate_star_pdf.py

Ensure you have two image files in the working directory:
- milky_way.png    # Background Milky Way map
- hr_diagram.png   # HR diagram background
"""
import matplotlib
matplotlib.use('Agg')
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib import colors
import os
# Add these imports for HR diagram overlay
import numpy as np
import matplotlib.pyplot as plt
# Add for Milky Way overlay
from astropy import units as u
from astropy.coordinates import SkyCoord, Galactocentric

# --- Add at the top, after imports ---
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
import os
FONT_DIR = os.path.join(os.path.dirname(__file__), "fonts")
pdfmetrics.registerFont(TTFont("Montserrat", os.path.join(FONT_DIR, "Montserrat-VariableFont_wght.ttf")))
pdfmetrics.registerFont(TTFont("Montserrat-Italic", os.path.join(FONT_DIR, "Montserrat-Italic-VariableFont_wght.ttf")))
pdfmetrics.registerFont(TTFont("OpenSans", os.path.join(FONT_DIR, "OpenSans-VariableFont_wdth,wght.ttf")))
pdfmetrics.registerFont(TTFont("OpenSans-Italic", os.path.join(FONT_DIR, "OpenSans-Italic-VariableFont_wdth,wght.ttf")))

# --- Set background to pure black ---
COLORS = {
    "bg": colors.black,
    "primary": colors.Color(0.95, 0.95, 1.0),
    "secondary": colors.Color(0.7, 0.8, 1.0),
    "text": colors.Color(0.92, 0.93, 0.97),
    "divider": colors.Color(0.25, 0.32, 0.45, alpha=0.25),
    "card_bg": colors.Color(0, 0, 0, alpha=0.0),
}

# --- Spacing constants ---
MARGIN_X = 5 * mm       # 5mm horizontal margin
MARGIN_Y = 30 * mm      # 30mm top/bottom margin
SPACING = 24            # gap between panels
LED = 14                # leading for body text

# --- Typography settings ---
TITLE_FONT = 'Montserrat'
TEXT_FONT = 'OpenSans'

# Configuration for layout dimensions
PAGE_WIDTH, PAGE_HEIGHT = A4
# MARGIN = 5 * mm  # horizontal margin
# TOP_MARGIN = 40 * mm
# BOTTOM_MARGIN = 40 * mm
# CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN

# Paths to assets
MILKY_WAY_PATH = os.path.join(os.path.dirname(__file__), 'milky_way.jpeg')
HR_DIAGRAM_PATH = os.path.join(os.path.dirname(__file__), 'hr_diagram.jpeg')

# ---------- Spectral Type Classifier ----------
def classify_spectral_type(color_index, abs_mag):
    """
    Approximate spectral type based on Gaia BP-RP color index and absolute magnitude.
    Uses coarse boundaries:
      O: color < -0.3
      B: -0.3 <= color < 0.0
      A: 0.0 <= color < 0.3
      F: 0.3 <= color < 0.7
      G: 0.7 <= color < 1.1
      K: 1.1 <= color < 1.8
      M: color >= 1.8

    Returns a string spectral class (e.g., 'G2 V').
    """
    # Determine main class
    if color_index < -0.3:
        spec = 'O'
    elif color_index < 0.0:
        spec = 'B'
    elif color_index < 0.3:
        spec = 'A'
    elif color_index < 0.7:
        spec = 'F'
    elif color_index < 1.1:
        spec = 'G'
    elif color_index < 1.8:
        spec = 'K'
    else:
        spec = 'M'
    # Approximate subclass number (0-9)
    boundaries = {
        'O': (-1.0, -0.3),
        'B': (-0.3, 0.0),
        'A': (0.0, 0.3),
        'F': (0.3, 0.7),
        'G': (0.7, 1.1),
        'K': (1.1, 1.8),
        'M': (1.8, 3.0)
    }
    lo, hi = boundaries[spec]
    frac = (color_index - lo) / (hi - lo)
    digit = min(max(int(frac * 10), 0), 9)
    lum = 'V' if abs_mag > 2 else 'III'
    return f"{spec}{digit} {lum}"

# Star info placeholder (replace with real data or pass programmatically)
star_info = {
    'title': "Ana & Claudia's Wedding Star",
    'subtitle': '12 June 2024 – Cusco, Peru',
    'gaia_id': '1343151594763346304',
    'position': {'ra': '276.78\u00b0', 'dec': '6.47\u00b0'},
    'distance_ly': 323,
    'color_index': 0.79,
    'abs_mag': 4.6,
    'proper_motion': '44.2 mas/yr',
    'narrative': (
        "This star, likely never noticed by any human before, "
        "shone directly above you on your special day..."
    )
}

# Compute spectral type
star_info['spectral_type'] = classify_spectral_type(
    star_info['color_index'], star_info['abs_mag']
)


def draw_centered_image_auto_resized(c, img_path, x_center, y_center, draw_width, draw_height):
    """Draw an image centered at (x, y), scaled to the given draw_width x draw_height exactly."""
    if not os.path.exists(img_path):
        raise FileNotFoundError(f"Image file not found: {img_path}")
    try:
        from PIL import Image
        img = Image.open(img_path)
        img_width, img_height = img.size
    except Exception as e:
        raise RuntimeError(f"Could not open image {img_path}: {e}")
    x = x_center - draw_width / 2
    y = y_center - draw_height / 2
    c.drawImage(img_path, x, y, draw_width, draw_height, preserveAspectRatio=False, anchor='c')


def generate_hr_diagram_overlay(bp_rp, m_app, p_mas, hr_diagram_path=HR_DIAGRAM_PATH, output_path='hr_diagram_overlay.png'):
    """
    Overplot the star on the HR diagram and save as a new image.
    Use a colorful inverted colormap for the background.
    """
    import matplotlib.pyplot as plt
    import numpy as np
    img = plt.imread(hr_diagram_path)
    fig = plt.figure(figsize=(8, 12))
    ax_full = fig.add_axes((0, 0, 1, 1))
    ax_full.imshow(img[..., :3], origin='upper', cmap='inferno')
    ax_full.axis('off')
    left   =  0.176
    width  = 0.648
    bottom = 0.105
    height = 0.701
    ax = fig.add_axes((left, bottom, width, height), facecolor='none', frame_on=False)
    ax.axis('off')
    x_min, x_max = -0.8, 5
    y_min, y_max = 16, -5
    ax.set_xlim(x_min, x_max)
    ax.set_ylim(y_min, y_max)
    ax.invert_yaxis()
    if p_mas > 0:
        M_G = m_app - 10 + 5 * np.log10(p_mas)
    else:
        M_G = np.nan
    # --- Use same marker style as MW overlay ---
    ax.scatter(bp_rp, M_G, s=900, marker='*', facecolor='yellow', edgecolor='black', linewidth=2.5, zorder=10)
    plt.subplots_adjust(left=0, right=1, top=1, bottom=0)
    plt.savefig(output_path, bbox_inches='tight', pad_inches=0, dpi=150, transparent=True)
    plt.close(fig)
    return output_path


def generate_mw_overlay(alpha_deg, delta_deg, parallax_mas, mw_path=MILKY_WAY_PATH, output_path='milky_way_overlay.png'):
    import matplotlib.pyplot as plt
    import numpy as np
    from astropy import units as u
    from astropy.coordinates import SkyCoord, Galactocentric
    img = plt.imread(mw_path)
    fig_width = 8
    mw_aspect = img.shape[0] / img.shape[1]
    fig_height = fig_width * mw_aspect
    fig, ax = plt.subplots(figsize=(fig_width, fig_height))
    if img.shape[-1] == 3:
        alpha = np.ones(img.shape[:2])
    else:
        alpha = img[..., 3]
    mask = np.all(img[..., :3] < 0.1, axis=-1)
    alpha[mask] = 0.0
    ax.imshow(img[..., :3], extent=(-20, 20, -20, 20), origin='lower', aspect='auto', zorder=0, alpha=alpha)
    ax.set_xlim(-20, 20)
    ax.set_ylim(-20, 20)
    ax.axis('off')
    try:
        d_pc = 1000.0 / parallax_mas if parallax_mas > 0 else 1e6
        d = d_pc * u.pc
        c_icrs = SkyCoord(ra=alpha_deg * u.deg,
                          dec=delta_deg * u.deg,
                          distance=d,
                          frame='icrs')
        c_galcen = c_icrs.transform_to(Galactocentric(galcen_distance=8*u.kpc, z_sun=0*u.pc))
        star_x_to = getattr(c_galcen.y, 'to', None)
        star_y_to = getattr(c_galcen.x, 'to', None)
        if star_x_to is not None and star_y_to is not None:
            star_x = c_galcen.y.to(u.kpc).value  # type: ignore
            star_y = c_galcen.x.to(u.kpc).value  # type: ignore
            print(f"[MW Overlay] parallax: {parallax_mas} mas, galactocentric x: {star_x:.3f} kpc, y: {star_y:.3f} kpc")
            # --- Use same marker style as HR overlay ---
            ax.scatter(star_x, star_y, s=900, marker='*', facecolor='yellow', edgecolor='black', linewidth=2.5, zorder=20)
        # --- Add sun position as red dot at (0, -8.3) kpc ---
        ax.scatter(0, -8.3, s=360, marker='o', facecolor='red', edgecolor='black', linewidth=1.5, zorder=30)
    except Exception as e:
        print(f"[ERROR] Could not transform coordinates: {e}")
    plt.subplots_adjust(left=0, right=1, top=1, bottom=0)
    plt.savefig(output_path, bbox_inches='tight', pad_inches=0, dpi=150, transparent=True)
    plt.close(fig)
    return output_path

# --- Helper: draw header ---
def draw_header(c, title, subtitle, narrative, margin_top):
    c.setFont("Montserrat", 36)
    c.setFillColor(COLORS["primary"])
    title_y = PAGE_HEIGHT - margin_top
    c.drawCentredString(PAGE_WIDTH/2, title_y, title)
    c.setFont("OpenSans", 16)
    c.setFillColor(COLORS["secondary"])
    subtitle_y = title_y - 1.5 * LED
    c.drawCentredString(PAGE_WIDTH/2, subtitle_y, subtitle)
    c.setFont("OpenSans-Italic", 13)
    c.setFillColor(COLORS["text"])
    narrative_y = subtitle_y - 1.5 * LED
    c.drawCentredString(PAGE_WIDTH/2, narrative_y, narrative)
    return narrative_y

# --- Helper: draw info card ---
def draw_info_card(c, x, y, label, value, icon=None):
    card_width = PAGE_WIDTH * 0.38
    card_height = 2.5 * LED
    c.setFillColor(COLORS["divider"])
    c.roundRect(x, y - card_height, card_width, card_height, 12, fill=1, stroke=0)
    c.setFont("OpenSans", 12)
    c.setFillColor(COLORS["text"])
    text_x = x + 0.5 * LED
    text_y = y - LED
    if icon:
        c.drawString(text_x, text_y, f"{icon} {label} {value}")
    else:
        c.drawString(text_x, text_y, f"{label} {value}")

# --- Helper: draw divider ---
def draw_divider(c, y):
    c.setStrokeColor(COLORS["divider"])
    c.setLineWidth(2)
    c.line(MARGIN_X, y, PAGE_WIDTH - MARGIN_X, y)

# --- Helper: draw footer ---
def draw_footer(c, margin_x, margin_y):
    import datetime
    today = datetime.date.today().strftime("%B %d, %Y")
    c.setFont("OpenSans-Italic", 8)
    c.setFillColor(COLORS["divider"])
    c.drawString(margin_x, margin_y / 2, f"Generated with love on {today}")

# --- Helper: draw info grid (2x3 transparent) ---
def draw_info_grid(c, x, y, col_w, row_h, entries):
    c.setFont("OpenSans", 12)
    c.setFillColor(COLORS["text"])
    for i, (label, value, icon) in enumerate(entries):
        row = i // 2
        col = i % 2
        cell_x = x + col * col_w
        cell_y = y - row * row_h
        # Transparent card background
        c.setFillColor(COLORS["card_bg"])
        c.roundRect(cell_x, cell_y - row_h, col_w - 8, row_h - 4, 12, fill=1, stroke=0)
        c.setFillColor(COLORS["text"])
        c.drawString(cell_x + 10, cell_y - row_h/2 + 4, f"{icon} {label} {value}")

# --- Main PDF generation (replace body of generate_pdf) ---
def generate_pdf(info, output_path='your_star.pdf'):
    from PIL import Image
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    # Map ra_deg, dec_deg, parallax_mas from ra, dec, parallax if present
    if 'ra_deg' not in info:
        if 'ra' in info:
            info['ra_deg'] = info['ra']
    if 'dec_deg' not in info:
        if 'dec' in info:
            info['dec_deg'] = info['dec']
    if 'parallax_mas' not in info:
        if 'parallax' in info:
            info['parallax_mas'] = info['parallax']
        elif 'parallax_mas' in info:
            info['parallax_mas'] = info['parallax_mas']
    if hasattr(output_path, 'write'):
        c = canvas.Canvas(output_path, pagesize=A4)
    else:
        c = canvas.Canvas(output_path, pagesize=A4)
    # --- Page background ---
    c.setFillColor(COLORS["bg"])
    c.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)
    # --- Header ---
    narrative_y = draw_header(c, info['title'], info['subtitle'], info['narrative'], MARGIN_Y)
    # Robust Gaia ID handling
    gaia_id = info.get('gaia_id') or info.get('source_id') or info.get('SOURCE_ID') or 'N/A'
    # Robust position handling
    position = info.get('position')
    def fmt_deg(val):
        try:
            if isinstance(val, str) and '°' in val:
                return val
            return f"{float(val):.2f}°"
        except Exception:
            return str(val)
    if position and 'ra' in position and 'dec' in position:
        pos_str = f"RA {fmt_deg(position['ra'])}, Dec {fmt_deg(position['dec'])}"
    else:
        ra = info.get('ra')
        dec = info.get('dec')
        if ra is not None and dec is not None:
            pos_str = f"RA {fmt_deg(ra)}, Dec {fmt_deg(dec)}"
        else:
            pos_str = "N/A"
    # Robust other fields
    distance_ly = info.get('distance_ly', 'N/A')
    color_index = info.get('color_index')
    color_index_str = f"{color_index:.2f}" if color_index is not None else 'N/A'
    abs_mag = info.get('abs_mag')
    abs_mag_str = f"{abs_mag:.2f}" if abs_mag is not None else 'N/A'
    proper_motion = info.get('proper_motion', 'N/A')
    # --- Info grid (2x3, more compact) ---
    grid_entries = [
        (u'Gaia EDR3:', gaia_id, u'🔢'),
        (u'Position:', pos_str, u'📍'),
        (u'Distance:', f"{distance_ly} ly", u'📏'),
        (u'Color index:', color_index_str, u'🌈'),
        (u'Abs. Mag:', abs_mag_str, u'🔭'),
        (u'Proper motion:', proper_motion, u'🔄'),
    ]
    grid_cols = 2
    grid_rows = 3
    grid_w = PAGE_WIDTH * 0.7
    grid_h = LED * 2.1 * grid_rows
    grid_x = (PAGE_WIDTH - grid_w) / 2
    grid_y = narrative_y - SPACING + 2
    col_w = grid_w / grid_cols
    row_h = grid_h / grid_rows
    draw_info_grid(c, grid_x, grid_y, col_w, row_h, grid_entries)
    # --- Images (MW and HR overlays, use full page width, not grid) ---
    image_top = grid_y - grid_h - (SPACING / 2)
    image_bottom = MARGIN_Y
    available_height = image_top - image_bottom
    images_width = PAGE_WIDTH - 2 * MARGIN_X
    single_img_width = (images_width - SPACING) / 2
    mw_overlay_path = generate_mw_overlay(
        info.get('ra_deg', 0.0),
        info.get('dec_deg', 0.0),
        info.get('parallax_mas', 10.0),
        mw_path=MILKY_WAY_PATH,
        output_path='milky_way_overlay.png'
    )
    mw_img = Image.open(mw_overlay_path)
    mw_w, mw_h = mw_img.size
    mw_aspect = mw_h / mw_w
    overlay_path = generate_hr_diagram_overlay(
        info.get('color_index', 1.0),
        info.get('m_app', 10.0),
        info.get('parallax_mas', 10.0),
        hr_diagram_path=HR_DIAGRAM_PATH,
        output_path='hr_diagram_overlay.png'
    )
    hr_img = Image.open(overlay_path)
    hr_w, hr_h = hr_img.size
    hr_aspect = hr_h / hr_w
    max_img_height = available_height
    mw_draw_w = single_img_width
    mw_draw_h = mw_draw_w * mw_aspect
    hr_draw_w = single_img_width
    hr_draw_h = hr_draw_w * hr_aspect
    scale = min(1.0, max_img_height / max(mw_draw_h, hr_draw_h))
    mw_draw_w *= scale
    mw_draw_h *= scale
    hr_draw_w *= scale
    hr_draw_h *= scale
    left_x = MARGIN_X + mw_draw_w / 2
    right_x = MARGIN_X + single_img_width + SPACING + hr_draw_w / 2
    images_y = image_bottom + max_img_height / 2
    draw_centered_image_auto_resized(c, mw_overlay_path, left_x, images_y, mw_draw_w, mw_draw_h)
    draw_centered_image_auto_resized(c, overlay_path, right_x, images_y, hr_draw_w, hr_draw_h)
    # --- Bottom text ---
    c.setFont("OpenSans", 12)
    c.setFillColor(COLORS["secondary"])
    bottom_text = (
        "Left: Your star’s location in the Milky Way, seen from above the Galaxy. "
        "The red dot marks the Sun’s position.\n"
        "Right: Your star’s place among the stars, by color and brightness."
    )
    box_width = PAGE_WIDTH * 0.65
    box_left = (PAGE_WIDTH - box_width) / 2
    box_bottom = MARGIN_Y / 2
    import textwrap
    wrapped = []
    for paragraph in bottom_text.split('\n'):
        wrapped += textwrap.wrap(paragraph, width=80)
        wrapped.append('')
    if wrapped and wrapped[-1] == '':
        wrapped.pop()
    line_height = LED + 1
    for i, line in enumerate(wrapped):
        y = box_bottom + (len(wrapped) - 1 - i) * line_height
        c.drawString(box_left, y, line)
    # --- Footer ---
    draw_footer(c, MARGIN_X, MARGIN_Y)
    # --- (Optional) Add subtle stars in background ---
    import random
    c.setFillColorRGB(1, 1, 1)
    for _ in range(80):
        x = random.uniform(0, PAGE_WIDTH)
        y = random.uniform(0, PAGE_HEIGHT)
        r = random.uniform(0.3, 1.1)
        c.circle(x, y, r, fill=1, stroke=0)
    c.showPage()
    c.save()
    print(f"PDF generated: {output_path}")


if __name__ == '__main__':
    # Add apparent magnitude and parallax to star_info for overlay
    star_info['m_app'] = 9.22  # Example value, replace with real data
    star_info['parallax_mas'] = 25.4  # Example value, replace with real data
    # Add RA/Dec for Milky Way overlay
    star_info['ra_deg'] = 276.78  # Example value, replace with real data
    star_info['dec_deg'] = 6.47   # Example value, replace with real data
    generate_pdf(star_info)
