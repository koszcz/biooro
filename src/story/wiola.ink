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

// Wiola's voice anchor. A sample scene from docs/writing/voice.md that the game never starts.
// A line tagged #speaker:intern is the Intern's. Every other line is Wiola's.

=== wiola_voice_anchor ===
Morning! Porridge again? With honey this time. Good choice. #id:wiola.wiola_voice_anchor.1
How did you know that? #speaker:intern #id:wiola.wiola_voice_anchor.2
{ tier():
- "wrong": I just know. Like you know you slept badly. Four hours and twelve minutes, poor thing. #id:wiola.wiola_voice_anchor.3
- "odd": You had crumbs. Probably! Anyway, have you tried the Smart seat yet? #id:wiola.wiola_voice_anchor.4
- else: Lucky guess! You look like a honey person. #id:wiola.wiola_voice_anchor.5
}
Biooro. Listening to your body, one flush at a time. Isn't that beautiful? #id:wiola.wiola_voice_anchor.6
* [It's a bit much, Wiola. #id:wiola.wiola_voice_anchor.7]
    { tier():
    - "wrong": You'll come round. It's already listening, so it can wait. #id:wiola.wiola_voice_anchor.8
    - "odd": You'll come round. Your mum did. #id:wiola.wiola_voice_anchor.9
    - else: Oh, you'll come round. Everyone does. #id:wiola.wiola_voice_anchor.10
    }
* [It's lovely. #id:wiola.wiola_voice_anchor.11]
    { tier():
    - "wrong": Isn't it? Mine says you'd like one. It's always right. #id:wiola.wiola_voice_anchor.12
    - "odd": Isn't it? Mine says I'm calmer on Tuesdays. And I am! #id:wiola.wiola_voice_anchor.13
    - else: Isn't it? Mine says I'm very well hydrated. #id:wiola.wiola_voice_anchor.14
    }
- -> END
