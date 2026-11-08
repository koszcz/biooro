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

// Ryszard's voice anchor. A sample scene from docs/writing/voice.md that the game never starts.
// A line tagged #speaker:intern is the Intern's. Every other line is Ryszard's.

=== ryszard_voice_anchor ===
Sit down, sit down. Nineteen years in this chair. You learn things. #id:ryszard.ryszard_voice_anchor.1
A customer wrote four pages about her Smart seat. #speaker:intern #id:ryszard.ryszard_voice_anchor.2
Four pages. Did you read them? #id:ryszard.ryszard_voice_anchor.3
* [Yes, all of them. #id:ryszard.ryszard_voice_anchor.4]
    That's your first mistake. Here. Template 12. #id:ryszard.ryszard_voice_anchor.5
* [Only the first page. #id:ryszard.ryszard_voice_anchor.6]
    Already improving. Here. Template 12. #id:ryszard.ryszard_voice_anchor.7
-
{ tier():
- "wrong":
    "Dear valued customer. Yes, it is normal that it knows. Your case has been resolved." #id:ryszard.ryszard_voice_anchor.8
    I didn't write that one. It was just in the folder. #id:ryszard.ryszard_voice_anchor.9
- "odd":
    "Dear valued customer, we regret any inconvenience." #id:ryszard.ryszard_voice_anchor.10
    Hm. She wants to know why it knows her name. #id:ryszard.ryszard_voice_anchor.11
    There's no template for that. Anyway. Lunch. #id:ryszard.ryszard_voice_anchor.12
- else:
    "Dear valued customer, we regret any inconvenience. Your case has been resolved." #id:ryszard.ryszard_voice_anchor.13
    Done. Closed. #id:ryszard.ryszard_voice_anchor.14
}
Nineteen years. Three case closure awards. Not one case read. #id:ryszard.ryszard_voice_anchor.15
-> END
