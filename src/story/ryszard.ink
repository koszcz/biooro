// Ryszard's Conversations and brush-off.
// His Monday Conversation is the onboarding, so his first knot is for Tuesday.
// A line tagged #speaker:intern is the Intern's. A line tagged #speaker:headOffice is Head office's.
// Every other line is the Conversation partner's.
// Reads kamil_log_signed and binder_four_taken from Kamil's Tuesday and Thursday.

=== ryszard_day2 ===
Pani Halina wants every complaint on a shelf. Pan Zbigniew wants them gone. I want lunch. #id:ryszard.ryszard_day2.1
Nineteen years. Here's the secret. A closed case is a happy case. #id:ryszard.ryszard_day2.2
{ tier():
- "wrong": Template 4. "Thank you for your patience. We are aware of you." Good for everything. #id:ryszard.ryszard_day2.3
- "odd": Template 4. Good for most things. Not the ones about the seat knowing your name. #id:ryszard.ryszard_day2.4
- else: Template 4. "Thank you for your patience." Good for everything. #id:ryszard.ryszard_day2.5
}
* [Show me the shortcut. #id:ryszard.ryszard_day2.6]
    ~ adjust("launchTeam", 1)
    Copy, paste, close. Don't scroll down. Scrolling is where the trouble is. #id:ryszard.ryszard_day2.7
* [Shouldn't we read them first? #id:ryszard.ryszard_day2.8]
    ~ adjust("launchTeam", -1)
    That's how Kamil started. Now look at him. Eats on a staircase. #id:ryszard.ryszard_day2.9
- -> END

=== ryszard_day3 ===
Thirty Smart range cases, Template 12. I'll have them closed by coffee. #id:ryszard.ryszard_day3.1
{ tier() == "wrong":
    "Dear valued customer. Yes, it heard that. Your case has been resolved." #id:ryszard.ryszard_day3.2
    Funny. Nobody asked it anything. #id:ryszard.ryszard_day3.3
- else:
    Hm. This one says the seat answered back. There's no template for answering back. #id:ryszard.ryszard_day3.4
    Anyway. Have you tried the new soup? #id:ryszard.ryszard_day3.5
}
* [Let's get lunch. #id:ryszard.ryszard_day3.6]
    ~ adjust("sanity", 1)
    Good. Soup first. Cases after. Cases are patient. #id:ryszard.ryszard_day3.7
* [What else does the case say? #id:ryszard.ryszard_day3.8]
    ~ adjust("sanity", -1)
    { tier() == "wrong":
        It says your name. Twice. Template 12 covers that. Closed. #id:ryszard.ryszard_day3.9
    - else:
        Four pages. I read the first line by accident. I won't do that again. #id:ryszard.ryszard_day3.10
    }
- -> END

=== ryszard_day4 ===
I'm up for case closure of the year. Three awards. This would be four. #id:ryszard.ryszard_day4.1
You can second me. It's one signature. Nobody reads the form. #id:ryszard.ryszard_day4.2
{ flag("kamil_log_signed"):
    I hear you signed Kamil's log. Bad habit. Sign mine and it cancels out. #id:ryszard.ryszard_day4.3
}
{ tier() == "wrong":
    Category: cases closed without opening. I've been doing that one since before it existed. #id:ryszard.ryszard_day4.4
- else:
    Pani Halina has a form like this too. Hers is the dangerous kind. #id:ryszard.ryszard_day4.5
}
* [I'll sign your nomination. #id:ryszard.ryszard_day4.6]
    ~ adjust("launchTeam", 1)
    That's the spirit. We regret any inconvenience. Mostly we don't. #id:ryszard.ryszard_day4.7
* [Pani Halina asked me to sign something too. #id:ryszard.ryszard_day4.8]
    ~ adjust("launchTeam", -1)
    Then you've got a choice. I've never made one. Look how I turned out. #id:ryszard.ryszard_day4.9
- -> END

=== ryszard_day5 ===
Head office audit. Template 1. "No issues found." Nineteen years and it's never been wrong. #id:ryszard.ryszard_day5.1
"No issues found. No issues found. Your body has been heard." #id:ryszard.ryszard_day5.2 #note:"Your body has been heard" echoes the mission statement, "Listening to your body". Keep the echo.
That last bit's new. Someone updated the template. Wasn't me. #id:ryszard.ryszard_day5.3
{ flag("binder_four_taken"):
    Is that Kamil's binder four? Put it in the drawer. The drawer gets shredded at three. #id:ryszard.ryszard_day5.4
}
* [Nineteen years. Well done, Ryszard. #id:ryszard.ryszard_day5.5]
    ~ adjust("launchTeam", 1)
    Thank you. Two years to retirement. The seat says I'll make it. #id:ryszard.ryszard_day5.6
* [Does any of this bother you? #id:ryszard.ryszard_day5.7]
    ~ adjust("sanity", -1)
    It used to. Then I found a template for that too. #id:ryszard.ryszard_day5.8
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
