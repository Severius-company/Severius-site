export function SignalStatic() {
  return <svg className="signal-svg" viewBox="0 0 720 430" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Signals connect into routes, systems and impact">
    <defs><pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="currentColor" opacity=".25"/></pattern></defs>
    <rect width="720" height="430" fill="url(#dots)"/>
    <g className="signal-routes" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path className="route route-1" d="M58 298 C158 120 232 330 355 187 S562 84 668 151"/><path className="route route-2" d="M51 142 C183 256 260 77 376 236 S548 348 674 268"/><path className="route route-3" d="M110 210 L205 157 L306 242 L410 135 L526 226 L627 185" opacity=".45"/>
    </g>
    <g className="signal-nodes"><circle cx="58" cy="298" r="5"/><circle cx="110" cy="210" r="4"/><circle cx="205" cy="157" r="6"/><circle cx="306" cy="242" r="4"/><circle cx="355" cy="187" r="7"/><circle cx="410" cy="135" r="4"/><circle cx="526" cy="226" r="6"/><circle cx="627" cy="185" r="4"/><circle cx="668" cy="151" r="5"/><circle className="human-node" cx="376" cy="236" r="8"/></g>
  </svg>
}
