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

// Kamil's voice anchor. A sample scene from docs/writing/voice.md that the game never starts.
// A line tagged #speaker:intern is the Intern's. Every other line is Kamil's.

=== kamil_voice_anchor ===
Don't sit there. Sit there. The step. The step is cleaner. I measured. #id:kamil.kamil_voice_anchor.1
Look. Binder three. Complaints 41 to 77. Smart seats, all of them. #id:kamil.kamil_voice_anchor.2
Kamil, can you give me the short version? #speaker:intern #id:kamil.kamil_voice_anchor.3
The short version is the long version. #id:kamil.kamil_voice_anchor.4
Seat temperature, seat weight, seat Wi-Fi. Why does a seat need Wi-Fi? #id:kamil.kamil_voice_anchor.5
{ tier():
- "wrong": I've stopped saying it out loud. Write it down. Not here. Not near the bathroom. #id:kamil.kamil_voice_anchor.6
- "odd": And they all report at 3:00. Every night. All at once. You've heard the beeping too, haven't you? #id:kamil.kamil_voice_anchor.7
- else: Nobody asks. I asked. Pani Halina wrote it down. That's all that happened. #id:kamil.kamil_voice_anchor.8
}
* [I believe you. #id:kamil.kamil_voice_anchor.9]
    { tier():
    - "wrong": Then you should eat lunch out here too. #id:kamil.kamil_voice_anchor.10
    - "odd": You do? Okay. Okay. Then take binder four. I don't want it at home. #id:kamil.kamil_voice_anchor.11
    - else: Great. Good. Then read binder one. And two. Then three. #id:kamil.kamil_voice_anchor.12
    }
* [It could just be a glitch. #id:kamil.kamil_voice_anchor.13]
    { tier():
    - "wrong": Sure. A glitch. Say that near the seat. It likes that. #id:kamil.kamil_voice_anchor.14
    - "odd": Thirty-seven glitches at the same minute is a schedule. #id:kamil.kamil_voice_anchor.15
    - else: A glitch is one seat. This is thirty-seven seats. That's a pattern, and a pattern is a fact. #id:kamil.kamil_voice_anchor.16
    }
- -> END
