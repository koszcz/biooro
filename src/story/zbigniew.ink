// Pan Zbigniew's brush-off. A placeholder until the brush-offs ticket writes it.

=== zbigniew_brush_off ===
{ tier():
- "wrong": Placeholder: Pan Zbigniew is busy, in a wrong way. #id:zbigniew.zbigniew_brush_off.1
- "odd": Placeholder: Pan Zbigniew is busy, in an odd way. #id:zbigniew.zbigniew_brush_off.2
- else: Placeholder: Pan Zbigniew is busy. #id:zbigniew.zbigniew_brush_off.3
}
-> END

// Pan Zbigniew's voice anchor. A sample scene from docs/writing/voice.md that the game never starts.
// A line tagged #speaker:intern is the Intern's. Every other line is Pan Zbigniew's.

=== zbigniew_voice_anchor ===
Ah, my newest team member! Come in, come in. #id:zbigniew.zbigniew_voice_anchor.1
Pan Zbigniew, a customer says her Smart seat beeps at night. #speaker:intern #id:zbigniew.zbigniew_voice_anchor.2
{ tier():
- "wrong": Yes. It does that. It is listening to her body, one flush at a time. #id:zbigniew.zbigniew_voice_anchor.3
- "odd": Beeping. Good. That means it is awake. Let's keep this one between friends. #id:zbigniew.zbigniew_voice_anchor.4
- else: Beeping! That's the seat saying hello. What a lovely feedback moment. #id:zbigniew.zbigniew_voice_anchor.5
}
* [Should I log it as a complaint? #id:zbigniew.zbigniew_voice_anchor.6]
    { tier():
    - "wrong": Such a heavy word. Let's put it down. Opportunities are lighter. #id:zbigniew.zbigniew_voice_anchor.7
    - "odd": An opportunity. Say it with me. Op-por-tu-ni-ty. #note: He says the word one syllable at a time. Split the translated word the same way. #id:zbigniew.zbigniew_voice_anchor.8
    - else: Let's call it an opportunity. Log it as an opportunity. #id:zbigniew.zbigniew_voice_anchor.9
    }
* [I'll close it, then. #id:zbigniew.zbigniew_voice_anchor.10]
    { tier():
    - "wrong": Wonderful. You learn so fast. Head office will be so pleased to hear it. #id:zbigniew.zbigniew_voice_anchor.11
    - "odd": Wonderful. Quietly, please. Quiet is a skill. #id:zbigniew.zbigniew_voice_anchor.12
    - else: Wonderful! You're a natural. You'll go far here. #id:zbigniew.zbigniew_voice_anchor.13
    }
-
{ tier():
- "wrong": My door is always open. Always. #id:zbigniew.zbigniew_voice_anchor.14
- else: My door is always open! #id:zbigniew.zbigniew_voice_anchor.15
}
-> END
