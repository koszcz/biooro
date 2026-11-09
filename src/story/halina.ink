// Pani Halina's brush-off.

=== halina_brush_off ===
{ tier():
- "wrong": Your visit has been noted. The file will decide what it meant. #id:halina.halina_brush_off.1
- "odd": This visit was not scheduled. Say your name again, slowly. For the log. #id:halina.halina_brush_off.2
- else: Visits are by appointment. Form 7B, at reception. Thank you. #id:halina.halina_brush_off.3
}
-> END

// Pani Halina's voice anchor. A sample scene from docs/writing/voice.md that the game never starts.
// A line tagged #speaker:intern is the Intern's. Every other line is Pani Halina's.

=== halina_voice_anchor ===
Sit. Not that chair. That chair is for witnesses. #id:halina.halina_voice_anchor.1
Noted: the Intern came to me first. For the file. #id:halina.halina_voice_anchor.2
Pani Halina, Kamil says the Smart seats run warm. #speaker:intern #id:halina.halina_voice_anchor.3
{ tier():
- "wrong": Concerns have been raised. The file will show who raised them. #id:halina.halina_voice_anchor.4
- "odd": Concerns have been raised. By you. Please say it again, slowly. #id:halina.halina_voice_anchor.5
- else: Concerns have been raised. That is a sentence I can use. #id:halina.halina_voice_anchor.6
}
* [Will you send it to Head office? #id:halina.halina_voice_anchor.7]
    { tier():
    - "wrong": Head office already knows what it needs to know. The file will tell them the rest. #id:halina.halina_voice_anchor.8
    - "odd": It will be forwarded, when it is safe to have forwarded it. #id:halina.halina_voice_anchor.9
    - else: It will be forwarded. In due course. Through the proper form. #id:halina.halina_voice_anchor.10
    }
* [Can this stay between us? #id:halina.halina_voice_anchor.11]
    { tier():
    - "wrong": There is no "us". There is you, and there is the file. #id:halina.halina_voice_anchor.12
    - "odd": Between us and the file. The file is very discreet. #id:halina.halina_voice_anchor.13
    - else: Nothing stays between us. That is what the file is for. #id:halina.halina_voice_anchor.14
    }
-
{ tier():
- "wrong": Initial here. And here. It will look better for you. #id:halina.halina_voice_anchor.15
- else: Thank you. Please initial here, here and here. #id:halina.halina_voice_anchor.16
}
-> END
