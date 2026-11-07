# Character and art direction

Type: prototype
Status: resolved
Blocked by:

## Question

How should the people and the wider office look? The look prototype covered one room. The spec needs more than that.

Build a rough Three.js prototype to react to. It should cover:
- How each cast member is told apart on screen, using the Kenney Mini Characters (colour, outfit, props, or accessories), and how the Intern stands out.
- How the Launch Team and the Paper Trail read as two Factions at a glance.
- What a second room looks like (for example Customer Complaints versus a bathroom-equipment showroom), and how rooms join into one floor.
- The palette and lighting that carry the mundane-with-a-sinister-leak tone from the Company identity decision.

Reuse the prototype in `prototype/office-look`. Stay inside the chosen assets unless the prototype shows a gap.

## Answer

Tell people apart by uniform colour and one small prop each. Tell Factions apart by vest colour and floor turf. Carry the tone with a steady palette that greys as Escalation rises.

### Cast on screen (Kenney Mini Characters)

- **Character size:** use the native size (x1). Seated characters are lifted 0.13 units so they sit tall at the desk. Bosses are 12% taller.
- **Faction cue:** every cast member wears a coloured box vest over the torso. It reads at whole-floor zoom, where tints and textures do not.
  - **Launch Team:** teal vest (`#18b6c8`) and a white lanyard with a badge.
  - **Paper Trail:** manila vest (`#c9ab6b`) and a folder under the arm.
- **The Intern:** the only fully saturated orange (`#ff7a1a`) on the floor, with a white stripe. An orange ring sits under the feet and a bobbing arrow floats above the head.
- **Bosses:** each has a tie or a record light.
  - **Pogodny:** a dark teal tie, taller than the others.
  - **Teczka:** reading glasses and a blinking red "recording" light on her chest.
- **Colleagues:**
  - **Szablon:** teal vest only. Template-reply props can come later.
  - **Ufna:** teal vest, stands beside the Smart toilet in the Showroom.
  - **Przeciek:** manila vest, sunglasses, folder. Sits on the corridor bench by the stairwell.
- Each cast member uses a different base model, so skin, hair and outfit already differ. No custom textures are needed.
- Rejected: tinting the body mesh (muddy, hardly visible) and x1.4 scale (too big for the desks).

### Factions as places

- Launch Team desks stand on a faint teal rug, with "LAUNCH TEAM" and "WE LOVE FEEDBACK" signs and a stack of closed complaint boxes in the corner.
- Paper Trail desks stand on a manila rug, with bookcases along the wall, desk lamps, loose books and a sign reading "IT IS ALL IN WRITING".
- The Launch Team is bigger, so its turf is larger.

### The floor

- One floor of 21 by 11 tiles. Three rooms (Customer Complaints, Product Safety, Showroom) sit side by side. A two-tile corridor runs along the near side. Each room joins the corridor through a one-tile doorway, and Complaints joins Product Safety, and Product Safety joins the Showroom, through one-tile doorways in their shared walls.
- Walls: the back and west walls stay full height. All inner walls and the near outer walls are low stubs (0.5 and 0.2 units), so every room stays visible. Doorways are dark thresholds with a doormat and a small room sign in the corridor.
- **Customer Complaints:** beige carpet, mint walls, rows of identical desks, some with empty chairs.
- **Product Safety:** cold grey-blue floor, pale walls, paper everywhere.
- **Showroom:** white glossy floor, warm walls, toilets and sinks on small white podiums, a teal runner. The middle toilet is the Smart range, with a small red LED and a "SMART RANGE" sign that glows.
- **Corridor:** grey lino, a stairwell at the west end, a bench, a coat rack and plants.
- Kenney furniture origins sit at a corner, not the centre. Centre each piece on its cell. A desk is 0.73 by 0.39 units, so put a chair about 0.42 units from the desk centre. Snap bookcases to the back wall.
- Everything stays inside the chosen assets plus a few primitives (vests, lanyards, rugs, podiums, signs drawn on canvas). No gap forced a new asset.

### Palette and lighting

- Monday is bright, warm and boring. The Smart toilet LED is off.
- Wednesday is slightly greyer and greener, and the LED glows faintly.
- Friday is greyer, dimmer and sickly green, and the LED pulses with a red glow.
- Only one saturated accent leaks into the scene: the red LED. The Intern's orange is the only other saturated colour.
- Lighting is steady. A flicker was tried and rejected because it read as a bug.

### Prototype

`prototype/office-look/art.html` with `src/art.ts` (run `pnpm --dir prototype/office-look dev --port 5174`, then open `/art.html`). Panel buttons jump the camera between rooms and a cast lineup, set the Escalation tier and toggle name tags. Click the floor to walk the Intern across rooms with A* through the doorways.
