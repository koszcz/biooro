// Wiola's Conversations and brush-off. Placeholders until the Colleague Conversations ticket writes them.
// A line tagged #speaker:intern is the Intern's. A line tagged #speaker:headOffice is Head office's.
// Every other line is the Conversation partner's.

=== wiola_day1 ===
-> wiola_placeholder
=== wiola_day2 ===
-> wiola_placeholder
=== wiola_day3 ===
-> wiola_placeholder
=== wiola_day4 ===
-> wiola_placeholder
=== wiola_day5 ===
-> wiola_placeholder

=== wiola_placeholder ===
Placeholder: Wiola says good morning. #id:wiola.wiola_placeholder.1
Placeholder: Head office sends its regards. #speaker:headOffice #id:wiola.wiola_placeholder.2
* [Placeholder: Thanks, I feel better. #id:wiola.wiola_placeholder.3]
    ~ adjust("sanity", 1)
    Placeholder: Wiola smiles. #id:wiola.wiola_placeholder.4
* [Placeholder: Not now, Wiola. #id:wiola.wiola_placeholder.5]
    ~ adjust("launchTeam", -1)
    Placeholder: Wiola stops smiling. #id:wiola.wiola_placeholder.6
- -> END

=== wiola_brush_off ===
{ tier():
- "wrong": Placeholder: Wiola is busy, in a wrong way. #id:wiola.wiola_brush_off.1
- "odd": Placeholder: Wiola is busy, in an odd way. #id:wiola.wiola_brush_off.2
- else: Placeholder: Wiola is busy. #id:wiola.wiola_brush_off.3
}
-> END
