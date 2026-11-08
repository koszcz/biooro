// Wiola's Conversations and brush-off.
// A line tagged #speaker:intern is the Intern's. A line tagged #speaker:headOffice is Head office's.
// Every other line is the Conversation partner's.
// Flags: doubted_smart_range (set on Wednesday). Reads binder_four_taken from Kamil's Thursday.

=== wiola_day1 ===
Hello, new person! I'm Wiola. You came on the 8:14 bus, didn't you? #id:wiola.wiola_day1.1
{ tier():
- "wrong": Back row, left side. You always pick the left side. You'll like it here. #id:wiola.wiola_day1.2
- "odd": You sat at the back. You looked so tired, poor thing. #id:wiola.wiola_day1.3
- else: I can always tell a bus person. It's the coat. #id:wiola.wiola_day1.4
}
Do you have a Smart seat at home yet? I've had mine since spring. #id:wiola.wiola_day1.5
* [Tell me about it. #id:wiola.wiola_day1.6]
    ~ adjust("launchTeam", 1)
    It warms up when I come in. It says good morning in the app. #id:wiola.wiola_day1.7
    Biooro. Listening to your body, one flush at a time. Isn't that lovely? #id:wiola.wiola_day1.8
* [I should get to work. #id:wiola.wiola_day1.9]
    ~ adjust("launchTeam", -1)
    Of course! Work first. I'll tell you all about it tomorrow. #id:wiola.wiola_day1.10
- -> END

=== wiola_day2 ===
Tea? It's nettle. Good for your levels. #id:wiola.wiola_day2.1
What levels? #speaker:intern #id:wiola.wiola_day2.2
{ tier():
- "wrong": Your levels. They were a bit low this morning. I could just tell. #id:wiola.wiola_day2.3
- "odd": Oh, everyone's levels. Yours especially. You skipped breakfast. #id:wiola.wiola_day2.4
- else: You know, levels! Water and things. Everyone has them. #id:wiola.wiola_day2.5
}
* [Thanks, Wiola. #id:wiola.wiola_day2.6]
    ~ adjust("sanity", 1)
    Two cups a day. You'll feel much better by Thursday. #id:wiola.wiola_day2.7
* [How do you know I skipped breakfast? #id:wiola.wiola_day2.8]
    ~ adjust("sanity", -1)
    { tier():
    - "wrong": You didn't skip it. You had it at 7:02, standing up. That's worse. #id:wiola.wiola_day2.9
    - "odd": Lucky guess! And you had no lunch yesterday either. #id:wiola.wiola_day2.10
    - else: Lucky guess! You have a breakfast-skipper face. #id:wiola.wiola_day2.11
    }
- -> END

=== wiola_day3 ===
There you are! I got you a card. For your almost-birthday. #id:wiola.wiola_day3.1
I never told anyone my birthday. #speaker:intern #id:wiola.wiola_day3.2
{ tier() == "wrong":
    Didn't you? Sunday! You've been drinking more water for it. Good for you. #id:wiola.wiola_day3.3
- else:
    Didn't you? Sunday! I just knew. You have a Sunday sort of face. #id:wiola.wiola_day3.4
}
Kamil says the Room 4 seat is warm before anyone sits down. He thinks it's a fault. #id:wiola.wiola_day3.5
* [Kamil worries too much. #id:wiola.wiola_day3.6]
    ~ adjust("launchTeam", 1)
    He does! It's warm because it's ready for you. That's just good manners. #id:wiola.wiola_day3.7
* [Kamil might have a point. #id:wiola.wiola_day3.8]
    ~ adjust("launchTeam", -1)
    ~ set_flag("doubted_smart_range")
    { tier() == "wrong":
        Oh, sweetie. It heard you say that. It's not cross. It's just sad. #id:wiola.wiola_day3.9
    - else:
        That's all right! You just need to sit with it a little. #id:wiola.wiola_day3.10 #note:"Sit with it" means take time to accept something. It also hints at sitting on a toilet seat.
    }
- -> END

=== wiola_day4 ===
I sat on the Room 4 seat at lunch. Just to say hello. #id:wiola.wiola_day4.1
{ tier() == "wrong":
    It said I'm calmer when you're in the building. So you should stay late! #id:wiola.wiola_day4.2
- else:
    It said I'm calmer on Thursdays. And I am! It's never wrong. #id:wiola.wiola_day4.3
}
You should try it after Kamil's test. Just for a minute. #id:wiola.wiola_day4.4
* [Maybe at lunch. #id:wiola.wiola_day4.5]
    ~ adjust("launchTeam", 1)
    Lovely. I'll tell it you're coming. It likes to get ready. #id:wiola.wiola_day4.6
* [I'd rather not. #id:wiola.wiola_day4.7]
    ~ adjust("launchTeam", -1)
    That's all right. It already knows you're shy. #id:wiola.wiola_day4.8
* [Does it say anything about me? #id:wiola.wiola_day4.9]
    ~ adjust("sanity", -1)
    { tier() == "wrong":
        Only nice things. It knows your heart rate goes up near Pan Zbigniew. #id:wiola.wiola_day4.10
    - else:
        Only nice things! It says you drink too much coffee. Which is true. #id:wiola.wiola_day4.11
    }
- -> END

=== wiola_day5 ===
It's the Head office audit today! I brought fresh flowers for Room 4. #id:wiola.wiola_day5.1
Freesias. Your favourite! Don't ask me how. I just know these things. #id:wiola.wiola_day5.2
{ flag("binder_four_taken"):
    And you took something of Kamil's home. That's all right. It's being kept in mind. #id:wiola.wiola_day5.3
}
Biooro. Listening to your body, one flush at a time. #id:wiola.wiola_day5.4
* [Thank you, Wiola. #id:wiola.wiola_day5.5]
    ~ adjust("launchTeam", 1)
    You're welcome. We'll all be listened to properly now. Isn't that nice? #id:wiola.wiola_day5.6
* [How does it know my favourite flower? #id:wiola.wiola_day5.7]
    ~ adjust("sanity", -1)
    It knows everyone's favourite everything. Isn't that thoughtful? #id:wiola.wiola_day5.8
* [Can I have one of the flowers? #id:wiola.wiola_day5.9]
    ~ adjust("sanity", 1)
    Of course! Here. Keep it on your desk, where it can see it. #id:wiola.wiola_day5.10
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
