// Ryszard's Conversations and brush-off. Placeholders until the Colleague Conversations ticket writes them.
// His Monday Conversation is the onboarding, so his first knot is for Tuesday.
// A line tagged #speaker:intern is the Intern's. A line tagged #speaker:headOffice is Head office's.
// Every other line is the Conversation partner's.

=== ryszard_day2 ===
-> ryszard_placeholder
=== ryszard_day3 ===
-> ryszard_placeholder
=== ryszard_day4 ===
-> ryszard_placeholder
=== ryszard_day5 ===
-> ryszard_placeholder

=== ryszard_placeholder ===
Placeholder: Ryszard offers you a template. #id:ryszard.ryszard_placeholder.1
Placeholder: I will think about it. #speaker:intern #id:ryszard.ryszard_placeholder.2
* [Placeholder: Take the template. #id:ryszard.ryszard_placeholder.3]
    ~ adjust("launchTeam", 1)
    Placeholder: Ryszard approves. #id:ryszard.ryszard_placeholder.4
* [Placeholder: Write it yourself. #id:ryszard.ryszard_placeholder.5]
    ~ adjust("sanity", -1)
    Placeholder: Ryszard shrugs. #id:ryszard.ryszard_placeholder.6
- -> END

=== ryszard_brush_off ===
{ tier():
- "wrong": Placeholder: Ryszard is busy, in a wrong way. #id:ryszard.ryszard_brush_off.1
- "odd": Placeholder: Ryszard is busy, in an odd way. #id:ryszard.ryszard_brush_off.2
- else: Placeholder: Ryszard is busy. #id:ryszard.ryszard_brush_off.3
}
-> END
