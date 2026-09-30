"""SVG images for the GitHub README.

    python tools/readme_svgs.py

GitHub shows these through <img>, so there is no script: motion is CSS keyframes and SMIL
(<animateMotion>, <animate>). Fonts are system fonts only, because an <img> cannot load web fonts.

Numbers and names mirror js/data/archive.js. When a feature changes status there, change it here too.
The car is an original design. It is not modelled on any real make or model.
"""
import math
import pathlib

OUT = pathlib.Path(__file__).resolve().parent.parent / 'assets' / 'readme'

INK0, INK1, INK2 = '#0a0a0a', '#141414', '#1f1f1f'
PAPER, WHITE, MUTED, DIM = '#efede7', '#ffffff', '#8e8c86', '#3a3a38'
CRIMSON, RED, EMBER = '#b3121c', '#e0242f', '#ff4a3d'
HEAVY = "'Arial Black','Helvetica Neue',Arial,sans-serif"
BODY = "'Helvetica Neue',Arial,sans-serif"
MONO = "'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace"
JP = "'Hiragino Sans','Yu Gothic','Meiryo','Noto Sans CJK JP','Noto Sans JP',sans-serif"

PERSON = {
    'name': ('Mochammad Bisma', 'Prasetya'),
    'role': 'IT Developer at Spindo',
    'status': 'Active. Open to remote work.',
    'run': 'RUN-01 · MTOA Access Link Register',
    'dyno': 'Docker, cloud, pentest, API design, LLM',
}
ALR = {'implemented': 9, 'progress': 4, 'planned': 1}
GEARS = ['Groundwork', 'Practice laps', 'Street runs', 'Deeper systems', 'Safety build', 'Current']

TONE = (f'<pattern id="tone" width="5" height="5" patternUnits="userSpaceOnUse">'
        f'<circle cx="2.5" cy="2.5" r="1" fill="{PAPER}" fill-opacity=".13"/></pattern>')


def car(num='42'):
    """Top-down coupe facing +x, centred on 0,0. About 60 x 30."""
    return f'''
      <polygon points="30,-9 30,9 190,62 190,-62" fill="url(#beam)"/>
      <rect x="-27" y="-12" width="58" height="28" rx="7" fill="{INK0}" opacity=".6"/>
      <rect x="-30" y="-14" width="60" height="28" rx="7" fill="{PAPER}" stroke="{INK0}" stroke-width="2"/>
      <path d="M14 -11 L26 -9 M14 11 L26 9" stroke="{INK0}" stroke-width="1.4"/>
      <rect x="-9" y="-11" width="21" height="22" rx="3" fill="{INK0}"/>
      <rect x="-5" y="-8.5" width="12" height="17" rx="1.5" fill="{PAPER}"/>
      <text x="1" y="0" transform="rotate(90 1 0)" text-anchor="middle" dominant-baseline="central" font-family="{HEAVY}" font-weight="900" font-size="8" fill="{INK0}">{num}</text>
      <rect x="-33" y="-15.5" width="6" height="31" fill="{INK0}" stroke="{PAPER}" stroke-width="1.2"/>
      <rect x="-31" y="-12" width="3" height="7" fill="{RED}"/><rect x="-31" y="5" width="3" height="7" fill="{RED}"/>
      <rect x="-40" y="-13" width="10" height="26" fill="{RED}" opacity=".22" filter="url(#glow)"/>'''


def header():
    """Opening shot, matching the website: car 42 from the side, cruising at night, lights smeared into streaks."""
    import random
    rnd = random.Random(42)
    w, h = 1200, 460
    sx0, sy0, sx1, sy1 = 16, 16, 1184, 316          # scene panel
    horizon = 212

    def wavy(x0, y0, length, amp, step=8):
        pts = []
        for x in range(0, int(length) + 1, step):
            y = y0 + math.sin((x + x0) * .045) * amp + math.sin((x + y0) * .31) * amp * .4
            pts.append(f'{x0 + x:.0f},{y:.1f}')
        return 'M' + ' L'.join(pts)

    streaks = []
    for i in range(12):
        soft = i % 4 == 0
        y = rnd.uniform(40, 180)
        ln = rnd.uniform(120, 360)
        dur = rnd.uniform(2.2, 4.5)
        col, sw, op = ('#9aa6d8', rnd.uniform(5, 8), .14) if soft else ('#e9eef0', rnd.uniform(1.4, 2.4), rnd.uniform(.4, .8))
        streaks.append(f'<path class="mv" style="animation-duration:{dur:.2f}s;animation-delay:-{rnd.uniform(0, dur):.2f}s" d="{wavy(-ln, y, ln, 1.2)}" '
                       f'fill="none" stroke="{col}" stroke-width="{sw:.1f}" stroke-linecap="round" opacity="{op:.2f}" filter="url(#soft)"/>')
    hero = (f'<path class="mv" style="animation-duration:11s;animation-delay:-4s" d="{wavy(-640, 150, 640, 2.2)}" fill="none" '
            f'stroke="{RED}" stroke-width="6" stroke-linecap="round" opacity=".9" filter="url(#redglow)"/>')

    bands = []
    for i in range(46):
        y = rnd.uniform(horizon + 6, sy1)
        near = (y - horizon) / (sy1 - horizon)
        lane = rnd.random() < .1
        ln = rnd.uniform(200, 900)
        hh = 1 + near * rnd.uniform(2, 8)
        dur = 1.6 - near * 1.1
        op = rnd.uniform(.4, .7) if lane else rnd.uniform(.2, .55) * (1 - near * .35)
        bands.append(f'<rect class="mv" style="animation-duration:{dur:.2f}s;animation-delay:-{rnd.uniform(0, dur):.2f}s" x="{-ln:.0f}" y="{y:.1f}" '
                     f'width="{ln:.0f}" height="{hh:.1f}" fill="url(#{"lane" if lane else "band"})" opacity="{op:.2f}"/>')

    WR, R, off = 7.8, 9.4, 1.8
    dx = math.sqrt(R * R - off * off)
    body = (f'M49 -6 L{32 + dx:.3f} -6 A{R} {R} 0 1 0 {32 - dx:.3f} -6 L{-29 + dx:.3f} -6 A{R} {R} 0 1 0 {-29 - dx:.3f} -6 '
            f'L-49.5 -6 Q-52 -8 -51 -10.5 L-49 -13.5 L-18 -17 L-4 -26.5 Q5 -27.8 13 -27.3 L33 -20 L47 -19.5 Q50.5 -19 50.5 -15.5 L50 -8 Z')
    top = 'M-49 -13.5 L-18 -17 L-4 -26.5 Q5 -27.8 13 -27.3 L33 -20 L47 -19.5'
    win = 'M-14.8 -17.8 L-4.4 -25.2 Q5 -26.4 12.4 -26 L28.5 -20.6 Z'

    def wheel(x):
        spokes = ''.join(f'<path d="M0 0 L{math.cos(a) * 4.6:.2f} {math.sin(a) * 4.6:.2f}"/>' for a in [k * 2 * math.pi / 5 for k in range(5)])
        return (f'<g transform="translate({x} {-WR})"><circle r="{WR}" fill="#030507"/><circle r="5" fill="url(#rim)"/>'
                f'<g stroke="#96aab0" stroke-opacity=".14" stroke-width="1.1">{spokes}'
                f'<animateTransform attributeName="transform" type="rotate" from="0" to="-360" dur=".24s" repeatCount="indefinite"/></g>'
                f'<circle r="1.1" fill="#0a0e10"/><path d="M-6.2 -4.2 A7.4 7.4 0 0 1 -2.6 -6.9" fill="none" stroke="#4d8d93" stroke-opacity=".4" stroke-width=".4"/></g>')

    s = 3.8
    n1, n2 = PERSON['name']
    css = '''
    @keyframes mv { from { transform: translateX(0); } to { transform: translateX(1900px); } }
    .mv { animation: mv linear infinite; }
    @keyframes bob { from { transform: translateY(0); } to { transform: translateY(-.3px); } }
    .bob { animation: bob .32s ease-in-out infinite alternate; }
    @keyframes sweep { from { transform: translateX(-70px); } to { transform: translateX(70px); } }
    .sweep { animation: sweep 3.4s linear infinite; }
    @keyframes in { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: none; } }
    .in { opacity: 0; animation: in .5s ease-out forwards; }
    @keyframes pulse { 50% { opacity: .2; } }
    .live { animation: pulse 1.6s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) { .mv, .bob, .sweep, .live { animation: none; } .in { opacity: 1; animation: none; } }
'''
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
  <defs>
    {TONE}
    <clipPath id="scene"><rect x="{sx0}" y="{sy0}" width="{sx1 - sx0}" height="{sy1 - sy0}"/></clipPath>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03040d"/><stop offset=".7" stop-color="#0a0e33"/><stop offset="1" stop-color="#16194a"/></linearGradient>
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c326e" stop-opacity="0"/><stop offset="1" stop-color="#3c326e" stop-opacity=".4"/></linearGradient>
    <linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16262b"/><stop offset=".4" stop-color="#0c1519"/><stop offset="1" stop-color="#05080a"/></linearGradient>
    <linearGradient id="band"><stop offset="0" stop-color="#2e4a4c" stop-opacity="0"/><stop offset=".3" stop-color="#2e4a4c"/><stop offset=".8" stop-color="#2e4a4c"/><stop offset="1" stop-color="#2e4a4c" stop-opacity="0"/></linearGradient>
    <linearGradient id="lane"><stop offset="0" stop-color="#7a7440" stop-opacity="0"/><stop offset=".3" stop-color="#7a7440"/><stop offset=".8" stop-color="#7a7440"/><stop offset="1" stop-color="#7a7440" stop-opacity="0"/></linearGradient>
    <linearGradient id="paint" gradientUnits="userSpaceOnUse" x1="0" y1="-28" x2="0" y2="-6"><stop offset="0" stop-color="#123039"/><stop offset=".55" stop-color="#0a1a22"/><stop offset="1" stop-color="#05090f"/></linearGradient>
    <linearGradient id="doorref" gradientUnits="userSpaceOnUse" x1="0" y1="-12" x2="0" y2="-6"><stop offset="0" stop-color="#4d8d93" stop-opacity="0"/><stop offset="1" stop-color="#4d8d93" stop-opacity=".35"/></linearGradient>
    <linearGradient id="cabin" gradientUnits="userSpaceOnUse" x1="-15" y1="0" x2="28" y2="0"><stop offset="0" stop-color="#c81e30" stop-opacity=".9"/><stop offset=".55" stop-color="#780e1c" stop-opacity=".95"/><stop offset="1" stop-color="#28060c"/></linearGradient>
    <linearGradient id="glare" gradientUnits="userSpaceOnUse" x1="-50" y1="0" x2="-120" y2="0"><stop offset="0" stop-color="#ffc46b" stop-opacity=".55"/><stop offset="1" stop-color="#ffc46b" stop-opacity="0"/></linearGradient>
    <linearGradient id="tail" gradientUnits="userSpaceOnUse" x1="50" y1="0" x2="105" y2="0"><stop offset="0" stop-color="#d8283a" stop-opacity=".75"/><stop offset="1" stop-color="#d8283a" stop-opacity="0"/></linearGradient>
    <linearGradient id="sweepg" gradientUnits="userSpaceOnUse" x1="-12" y1="0" x2="12" y2="0"><stop offset="0" stop-color="#e9eef0" stop-opacity="0"/><stop offset=".5" stop-color="#e9eef0" stop-opacity=".22"/><stop offset="1" stop-color="#e9eef0" stop-opacity="0"/></linearGradient>
    <radialGradient id="shadow"><stop offset="0" stop-color="#000" stop-opacity=".85"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <radialGradient id="rim"><stop offset="0" stop-color="#283034"/><stop offset=".75" stop-color="#12181b"/><stop offset="1" stop-color="#222a2d"/></radialGradient>
    <radialGradient id="vig" cx=".5" cy=".55" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
    <clipPath id="bodyclip"><path d="{body}"/></clipPath>
    <clipPath id="winclip"><path d="{win}"/></clipPath>
    <filter id="soft" x="-5%" y="-200%" width="110%" height="500%"><feGaussianBlur stdDeviation=".8"/></filter>
    <filter id="redglow" x="-5%" y="-300%" width="110%" height="700%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .09 0"/></filter>
    <filter id="lamp" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <style>{css}</style>
  <rect width="{w}" height="{h}" fill="{INK0}"/>

  <!-- the night shot -->
  <g clip-path="url(#scene)">
    <rect x="{sx0}" y="{sy0}" width="{sx1 - sx0}" height="{horizon - sy0}" fill="url(#sky)"/>
    {''.join(streaks)}
    {hero}
    <rect x="{sx0}" y="{horizon - 40}" width="{sx1 - sx0}" height="40" fill="url(#haze)"/>
    <rect x="{sx0}" y="{horizon}" width="{sx1 - sx0}" height="{sy1 - horizon}" fill="url(#road)"/>
    <rect x="{sx0}" y="{horizon - 4}" width="{sx1 - sx0}" height="1.5" fill="#a0afd2" opacity=".35"/>
    {''.join(bands)}
    <g transform="translate(600 286) scale({s})">
      <rect x="-120" y="-12.2" width="70" height="2.2" fill="url(#glare)"/>
      <rect x="-130" y="-1.2" width="85" height="1.6" fill="url(#glare)" opacity=".3"/>
      <rect x="50" y="-15.4" width="55" height="3" fill="url(#tail)"/>
      <ellipse cx="0" cy=".3" rx="58" ry="3.4" fill="url(#shadow)"/>
      {wheel(-29)}{wheel(32)}
      <g class="bob">
        <path d="{body}" fill="url(#paint)"/>
        <g clip-path="url(#bodyclip)">
          <rect x="-55" y="-12" width="110" height="7" fill="url(#doorref)"/>
          <path d="M-47 -12.8 L48 -16.2" stroke="#78bec4" stroke-opacity=".55" stroke-width=".5"/>
          <rect class="sweep" x="-12" y="-29" width="24" height="25" fill="url(#sweepg)"/>
        </g>
        <path d="{win}" fill="url(#cabin)"/>
        <g clip-path="url(#winclip)" fill="#140408" fill-opacity=".85">
          <circle cx="3.5" cy="-22.4" r="2.3"/>
          <path d="M.4 -19.6 Q3.5 -20.8 7 -19.4 L8 -17 L-.5 -17 Z"/>
          <path d="M1.6 -18.8 L-4 -19.6" stroke="#140408" stroke-width="1.1"/>
          <ellipse cx="-5" cy="-19.4" rx=".7" ry="2" transform="rotate(-17 -5 -19.4)" fill="none" stroke="#140408" stroke-width="1.1"/>
          <path d="M11 -27 L14.5 -27 L17 -17.5 L13.5 -17.5 Z" fill="#060b10" fill-opacity="1"/>
          <path d="M-8.5 -27 L-5 -27 L-11.5 -17.5 L-15 -17.5 Z" fill="#ffbec8" fill-opacity=".12"/>
        </g>
        <path d="{top}" fill="none" stroke="{RED}" stroke-opacity=".65" stroke-width=".5" filter="url(#lamp)"/>
        <path d="M-15 -17.4 L-13.8 -7 M14.5 -17.4 L13.2 -7" stroke="#000" stroke-opacity=".7" stroke-width=".35"/>
        <rect x="8" y="-14.6" width="3.2" height=".6" fill="#78bec4" fill-opacity=".5"/>
        <path d="M-12.6 -18.4 L-9.8 -20 L-9 -18 Z" fill="#060b10"/>
        <circle cx="-1" cy="-11.4" r="3.3" fill="none" stroke="#e9eef0" stroke-opacity=".35" stroke-width=".4"/>
        <text x="-1" y="-10.1" text-anchor="middle" font-family="{MONO}" font-weight="700" font-size="3.6" fill="#e9eef0" fill-opacity=".5">42</text>
        <g fill="#060b10"><rect x="40" y="-23.4" width=".9" height="4"/><rect x="45.5" y="-23.2" width=".9" height="3.8"/><path d="M36.5 -24 L51 -24.7 L51 -23 L37 -22.8 Z"/></g>
        <path d="M36.5 -24 L51 -24.7" stroke="{RED}" stroke-opacity=".7" stroke-width=".35"/>
        <path d="M-50.2 -11.4 L-45 -12.6 L-45.2 -11.4 Z" fill="#ffc46b" filter="url(#lamp)"/>
        <rect x="49.6" y="-15.6" width="1.2" height="4" fill="#ff3346" filter="url(#lamp)"/>
      </g>
    </g>
    <rect x="{sx0}" y="{sy0}" width="{sx1 - sx0}" height="{sy1 - sy0}" fill="url(#vig)"/>
    <rect x="{sx0}" y="{sy0}" width="{sx1 - sx0}" height="{sy1 - sy0}" filter="url(#grain)"/>
    <rect x="30" y="278" width="104" height="24" fill="{WHITE}"/>
    <text x="82" y="295" text-anchor="middle" font-family="{MONO}" font-weight="700" font-size="12" letter-spacing="2" fill="{INK0}">MBP 42-50</text>
    <text x="1168" y="296" text-anchor="end" font-family="{MONO}" font-size="11" letter-spacing="2" fill="{MUTED}">NIGHT RUN · LANE 2 · SIXTH GEAR</text>
  </g>
  <rect x="{sx0}" y="{sy0}" width="{sx1 - sx0}" height="{sy1 - sy0}" fill="none" stroke="{PAPER}" stroke-width="4"/>

  <!-- the driver -->
  <rect x="{sx0}" y="332" width="{sx1 - sx0}" height="112" fill="{INK1}" stroke="{PAPER}" stroke-width="4"/>
  <rect x="{sx0}" y="332" width="{sx1 - sx0}" height="112" fill="url(#tone)" opacity=".6"/>
  <g class="in" style="animation-delay:.2s"><text x="40" y="362" font-family="{MONO}" font-size="11" letter-spacing="2.4" fill="{RED}">DRIVER 42 · NIGHT RUN</text></g>
  <g class="in" style="animation-delay:.35s"><text x="38" y="400" font-family="{HEAVY}" font-weight="900" font-size="30" fill="{WHITE}">{n1} {n2}</text></g>
  <g class="in" style="animation-delay:.5s"><text x="40" y="426" font-family="{BODY}" font-size="15" fill="{PAPER}">{PERSON['role']}</text></g>
  <g class="in" style="animation-delay:.65s" font-family="{MONO}" font-size="12">
    <rect x="690" y="350" width="3" height="78" fill="{RED}"/>
    <text x="706" y="366" letter-spacing="1.6" fill="{MUTED}">STATUS</text>
    <rect class="live" x="818" y="358" width="7" height="7" fill="{RED}"/>
    <text x="832" y="366" fill="{EMBER}">{PERSON['status']}</text>
    <text x="706" y="392" letter-spacing="1.6" fill="{MUTED}">ON TRACK</text>
    <text x="818" y="392" fill="{PAPER}">{PERSON['run']}</text>
    <text x="706" y="418" letter-spacing="1.6" fill="{MUTED}">ON THE DYNO</text>
    <text x="818" y="418" fill="{PAPER}">{PERSON['dyno']}</text>
  </g>
</svg>
'''


def pit():
    w, h = 1200, 128
    lines = ''.join(
        f'<rect class="sl" style="animation-delay:-{(i * .21) % 1.2:.2f}s" x="{860 + (i * 37) % 300}" y="{20 + (i * 29) % 88}" width="{40 + (i * 23) % 90}" height="1.4" fill="{PAPER}" opacity=".4"/>'
        for i in range(12))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
  <defs>{TONE}<clipPath id="c"><rect x="8" y="8" width="{w - 16}" height="{h - 16}"/></clipPath></defs>
  <style>
    @keyframes sl {{ from {{ transform: translateX(0); }} to {{ transform: translateX(-420px); }} }}
    .sl {{ animation: sl 1.2s linear infinite; }}
    @keyframes nudge {{ 0%, 100% {{ transform: translateX(0); }} 50% {{ transform: translateX(8px); }} }}
    .arrow {{ animation: nudge 1.4s ease-in-out infinite; }}
    @media (prefers-reduced-motion: reduce) {{ .sl, .arrow {{ animation: none; }} }}
  </style>
  <rect width="{w}" height="{h}" fill="{INK0}"/>
  <g clip-path="url(#c)">
    <rect x="8" y="8" width="{w - 16}" height="{h - 16}" fill="{INK1}"/>
    <rect x="8" y="8" width="{w - 16}" height="{h - 16}" fill="url(#tone)"/>
    {lines}
    <polygon points="8,8 196,8 168,120 8,120" fill="{CRIMSON}"/>
    <text x="96" y="76" text-anchor="middle" font-family="{JP}" font-weight="900" font-size="30" fill="{WHITE}">ガレージ</text>
  </g>
  <rect x="8" y="8" width="{w - 16}" height="{h - 16}" fill="none" stroke="{PAPER}" stroke-width="4"/>
  <text x="224" y="62" font-family="{HEAVY}" font-weight="900" font-size="34" fill="{WHITE}">ENTER THE GARAGE</text>
  <text x="226" y="92" font-family="{MONO}" font-size="14" fill="{MUTED}">masbismaa.github.io/Masbismaa  ·  run sheets, pit radio, and the Night Pass game</text>
  <g class="arrow"><path d="M1100 44 L1140 64 L1100 84" fill="none" stroke="{RED}" stroke-width="8" stroke-linejoin="miter"/></g>
</svg>
'''


def run01():
    w, h = 1200, 420
    nodes = [('Browser', 60), ('routes', 250), ('services', 440), ('models', 630), ('PostgreSQL', 820)]
    y = 168
    boxes = ''.join(
        f'<rect x="{x}" y="{y - 26}" width="150" height="52" fill="{INK2 if n not in ("routes", "services") else INK1}" stroke="{PAPER}" stroke-width="2"/>'
        f'<text x="{x + 75}" y="{y + 5}" text-anchor="middle" font-family="{MONO}" font-size="15" fill="{PAPER}">{n}</text>'
        for n, x in nodes)
    arrows = ''.join(f'<path d="M{x + 150} {y} H{nx}" stroke="{MUTED}" stroke-width="2"/><path d="M{nx - 8} {y - 5} L{nx} {y} L{nx - 8} {y + 5}" fill="none" stroke="{MUTED}" stroke-width="2"/>'
                     for (_, x), (_, nx) in zip(nodes, nodes[1:]))
    total = sum(ALR.values())
    cells = []
    cw = 36
    for i in range(total):
        cx = 60 + i * (cw + 6)
        if i < ALR['implemented']:
            cells.append(f'<rect x="{cx}" y="330" width="{cw}" height="22" fill="{PAPER}"/>')
        elif i < ALR['implemented'] + ALR['progress']:
            cells.append(f'<rect x="{cx}" y="330" width="{cw}" height="22" fill="url(#hatch)" stroke="{RED}" stroke-width="2"/>')
        else:
            cells.append(f'<rect x="{cx + 1}" y="331" width="{cw - 2}" height="20" fill="none" stroke="{MUTED}" stroke-width="2" stroke-dasharray="4 3"/>')
    flow = f'M135 {y} H895'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
  <defs>{TONE}
    <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="6" fill="{RED}" fill-opacity=".7"/></pattern>
  </defs>
  <style>
    @keyframes stamp {{ 0% {{ opacity: 0; transform: rotate(-6deg) scale(1.4); }} 100% {{ opacity: 1; transform: rotate(-6deg) scale(1); }} }}
    .stamp {{ transform-box: fill-box; transform-origin: center; opacity: 0; animation: stamp .3s cubic-bezier(.2,.7,.2,1) .6s forwards; }}
    @media (prefers-reduced-motion: reduce) {{ .stamp {{ opacity: 1; animation: none; transform: rotate(-6deg); }} }}
  </style>
  <rect width="{w}" height="{h}" fill="{INK0}"/>
  <rect x="8" y="8" width="{w - 16}" height="{h - 16}" fill="{INK1}" stroke="{PAPER}" stroke-width="4"/>
  <rect x="8" y="8" width="{w - 16}" height="{h - 16}" fill="url(#tone)" opacity=".5"/>
  <text x="60" y="56" font-family="{MONO}" font-size="13" letter-spacing="2" fill="{RED}">RUN-01 · RUN SHEET</text>
  <text x="58" y="94" font-family="{HEAVY}" font-weight="900" font-size="32" fill="{WHITE}">MTOA Access Link Register</text>
  <g class="stamp"><rect x="1000" y="44" width="140" height="40" fill="none" stroke="{RED}" stroke-width="3"/><text x="1070" y="70" text-anchor="middle" font-family="{MONO}" font-weight="700" font-size="15" letter-spacing="3" fill="{RED}">ON TRACK</text></g>

  <rect x="232" y="118" width="376" height="100" fill="none" stroke="{RED}" stroke-width="2" stroke-dasharray="7 5"/>
  <text x="240" y="134" font-family="{MONO}" font-size="11" letter-spacing="1.5" fill="{RED}">ROLL CAGE · auth, OTP, RBAC, CSRF, validation</text>
  {arrows}
  <circle r="6" fill="{RED}"><animateMotion dur="3.2s" repeatCount="indefinite" path="{flow}"/></circle>
  {boxes}
  <rect x="440" y="240" width="150" height="40" fill="{INK2}" stroke="{MUTED}" stroke-width="2"/>
  <text x="515" y="265" text-anchor="middle" font-family="{MONO}" font-size="13" fill="{PAPER}">audit log</text>
  <path d="M515 194 V240" stroke="{MUTED}" stroke-width="2" stroke-dasharray="4 4"/>
  <text x="604" y="265" font-family="{MONO}" font-size="11" fill="{MUTED}">append-only: who, when, what, IP, old and new</text>
  <text x="1000" y="160" font-family="{MONO}" font-size="12" fill="{MUTED}">Flask · SQLAlchemy</text>
  <text x="1000" y="180" font-family="{MONO}" font-size="12" fill="{MUTED}">Alembic · Pytest</text>
  <text x="1000" y="200" font-family="{MONO}" font-size="12" fill="{MUTED}">Private, company GitLab</text>

  <text x="60" y="318" font-family="{MONO}" font-size="12" letter-spacing="1.6" fill="{MUTED}">FEATURES</text>
  {''.join(cells)}
  <g font-family="{MONO}" font-size="12">
    <rect x="690" y="332" width="14" height="14" fill="{PAPER}"/><text x="712" y="344" fill="{PAPER}">{ALR['implemented']} implemented</text>
    <rect x="850" y="332" width="14" height="14" fill="url(#hatch)" stroke="{RED}" stroke-width="2"/><text x="872" y="344" fill="{PAPER}">{ALR['progress']} in progress</text>
    <rect x="1010" y="332" width="14" height="14" fill="none" stroke="{MUTED}" stroke-width="2" stroke-dasharray="4 3"/><text x="1032" y="344" fill="{PAPER}">{ALR['planned']} planned</text>
  </g>
  <text x="60" y="386" font-family="{BODY}" font-size="14" fill="{MUTED}">Private entries stay hidden from the admin too. That one rule shaped the whole permission model.</text>
</svg>
'''


def gearbox():
    w, h = 1200, 320
    cols = [260, 600, 940]
    top, mid, bot = 84, 160, 236
    pos = {1: (cols[0], top), 2: (cols[0], bot), 3: (cols[1], top), 4: (cols[1], bot), 5: (cols[2], top), 6: (cols[2], bot)}
    gate = f'M{cols[0]} {mid} H{cols[2]} ' + ''.join(f'M{c} {top} V{bot} ' for c in cols)
    route = [pos[1], (cols[0], mid), pos[2], (cols[0], mid), (cols[1], mid), pos[3], (cols[1], mid), pos[4], (cols[1], mid), (cols[2], mid), pos[5], (cols[2], mid), pos[6]]
    path = 'M' + ' L'.join(f'{x} {y}' for x, y in route)
    labels = []
    for g, (x, y) in pos.items():
        cur = g == 6
        ty = y - 30 if y == top else y + 44
        labels.append(
            f'<circle cx="{x}" cy="{y}" r="16" fill="{INK0}" stroke="{RED if cur else PAPER}" stroke-width="2"/>'
            f'<text x="{x}" y="{y + 6}" text-anchor="middle" font-family="{HEAVY}" font-weight="900" font-size="16" fill="{RED if cur else PAPER}">{g}</text>'
            f'<text x="{x + 30}" y="{ty}" font-family="{MONO}" font-size="14" fill="{EMBER if cur else PAPER}">{GEARS[g - 1]}{"  · in gear now" if cur else ""}</text>')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
  <defs>{TONE}</defs>
  <rect width="{w}" height="{h}" fill="{INK0}"/>
  <rect x="8" y="8" width="{w - 16}" height="{h - 16}" fill="{INK1}" stroke="{PAPER}" stroke-width="4"/>
  <rect x="8" y="8" width="{w - 16}" height="{h - 16}" fill="url(#tone)" opacity=".5"/>
  <text x="40" y="44" font-family="{MONO}" font-size="12" letter-spacing="2" fill="{RED}">GEARBOX · 段</text>
  <path d="{gate}" fill="none" stroke="{DIM}" stroke-width="14" stroke-linecap="round"/>
  <path d="{gate}" fill="none" stroke="{INK0}" stroke-width="8" stroke-linecap="round"/>
  {''.join(labels)}
  <circle r="10" fill="{RED}" stroke="{WHITE}" stroke-width="2">
    <animateMotion dur="9s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.7;1" calcMode="linear" path="{path}"/>
  </circle>
  <text x="40" y="296" font-family="{MONO}" font-size="11" fill="{MUTED}">nobody skips second gear</text>
</svg>
'''


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in (('header', header), ('pit', pit), ('run-01', run01), ('gearbox', gearbox)):
        (OUT / f'{name}.svg').write_text(fn(), encoding='utf-8')
    print('written to', OUT)


if __name__ == '__main__':
    main()
