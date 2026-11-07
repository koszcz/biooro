// Kamil's Conversations and brush-off. Placeholders until the Colleague Conversations ticket writes them.
// A line tagged #speaker:intern is the Intern's. A line tagged #speaker:headOffice is Head office's.
// Every other line is the Conversation partner's.

=== kamil_day1 ===
-> kamil_placeholder
=== kamil_day2 ===
-> kamil_placeholder
=== kamil_day3 ===
-> kamil_placeholder
=== kamil_day4 ===
-> kamil_placeholder
=== kamil_day5 ===
-> kamil_placeholder

=== kamil_placeholder ===
Placeholder: Kamil says the test results are bad. #id:kamil.kamil_placeholder.1
* [Placeholder: I believe you. #id:kamil.kamil_placeholder.2]
    ~ adjust("paperTrail", 1)
    Placeholder: Kamil nods. #id:kamil.kamil_placeholder.3
* [Placeholder: Are you sure? #id:kamil.kamil_placeholder.4]
    ~ adjust("sanity", -1)
    Placeholder: Kamil sighs. #id:kamil.kamil_placeholder.5
- -> END

=== kamil_brush_off ===
{ tier():
- "wrong": Placeholder: Kamil is busy, in a wrong way. #id:kamil.kamil_brush_off.1
- "odd": Placeholder: Kamil is busy, in an odd way. #id:kamil.kamil_brush_off.2
- else: Placeholder: Kamil is busy. #id:kamil.kamil_brush_off.3
}
-> END
