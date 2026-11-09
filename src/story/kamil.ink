// Kamil's Conversations, brush-off and hand-off line.
// A line tagged #speaker:intern is the Intern's. A line tagged #speaker:headOffice is Head office's.
// Every other line is the Conversation partner's.
// Flags: kamil_log_signed (Tuesday) and binder_four_taken (Thursday). Reads doubted_smart_range from Wiola's Wednesday.

=== kamil_day1 ===
You're new. Don't eat in the kitchen. I eat in the stairwell. I measured. #id:kamil.kamil_day1.1
{ tier():
- "wrong": I counted the seats on this floor. There's one more than last week. #id:kamil.kamil_day1.2
- "odd": Complaint 14. A man in Łódź. His seat sent him a birthday card. On the wrong day. #id:kamil.kamil_day1.3
- else: This is binder one. Smart range complaints. Printed, dated, hole-punched. #id:kamil.kamil_day1.4
}
* [Show me. #id:kamil.kamil_day1.5]
    ~ adjust("paperTrail", 1)
    Page one, seat too warm. Page two, seat too warm. Page three is the outlier. #id:kamil.kamil_day1.6
* [Maybe later, Kamil. #id:kamil.kamil_day1.7]
    ~ adjust("paperTrail", -1)
    Later is when they shred it. Fine. Fine. #id:kamil.kamil_day1.8
* [Why the stairwell? #id:kamil.kamil_day1.9]
    ~ adjust("sanity", -1)
    The stairwell has no seats. I checked. Twice. Step 14 is warm, but that's the pipe. #id:kamil.kamil_day1.10
- -> END

=== kamil_day2 ===
I told Pani Halina about binder one. She wrote down that I told her. #id:kamil.kamil_day2.1
I need a witness. Sign here. It only says you saw the binder. #id:kamil.kamil_day2.2
{ tier():
- "wrong": Sign quickly. Not in pen. Pen goes through to the next page. #id:kamil.kamil_day2.3
- "odd": Three complaints came in overnight. All from the same postcode. Mine. #id:kamil.kamil_day2.4
- else: Pan Zbigniew's people won't sign. Ryszard used my last form as a coaster. #id:kamil.kamil_day2.5
}
* [I'll sign it. #id:kamil.kamil_day2.6]
    ~ adjust("paperTrail", 1)
    ~ set_flag("kamil_log_signed")
    ~ escalate()
    Good. Now it's two of us. Two is a pattern. #id:kamil.kamil_day2.7
* [I'd rather stay out of it. #id:kamil.kamil_day2.8]
    ~ adjust("paperTrail", -1)
    Nobody stays out of it. You're just not in the file yet. #id:kamil.kamil_day2.9
- -> END

=== kamil_day3 ===
Forty complaints for my binder. Every one says the seat was warm first. #id:kamil.kamil_day3.1
{ tier() == "wrong":
    I don't sleep at home now. The beeping. 3:00. It knows I'm awake. #id:kamil.kamil_day3.2
- else:
    They beep at 3:00 now. All of them. You can hear it from the car park. #id:kamil.kamil_day3.3
}
* [I've heard it too. #id:kamil.kamil_day3.4]
    ~ adjust("sanity", -1)
    Write down the time. Exactly. To the second. Then we compare. #id:kamil.kamil_day3.5
* [You should rest, Kamil. #id:kamil.kamil_day3.6]
    ~ adjust("sanity", 1)
    I rested in 2019. Eleven minutes. The seat logged it as a visit. #id:kamil.kamil_day3.7
- -> END

=== kamil_day4 ===
{ tier() == "wrong":
    Room 4. You sit. I write. Don't talk near it. It answers. #id:kamil.kamil_day4.1
    Leave your phone outside. It talks to your phone. #id:kamil.kamil_day4.9
- else:
    Room 4 test at two. You sit. I write down what it says back. #id:kamil.kamil_day4.2
    Bring a pencil. I don't trust pens near it. #id:kamil.kamil_day4.10
}
{ flag("kamil_log_signed"):
    You signed my log. You're in the file now too. Sorry. I should have said. #id:kamil.kamil_day4.3
}
{ flag("doubted_smart_range"):
    Wiola says you have doubts. She tells everyone everything. Well. Something does. #id:kamil.kamil_day4.4
}
* [Give me binder four. #id:kamil.kamil_day4.5]
    ~ adjust("paperTrail", 1)
    ~ set_flag("binder_four_taken")
    Not at home. Not near a bathroom. That's everywhere. I know. #id:kamil.kamil_day4.6
* [It could just be a glitch. #id:kamil.kamil_day4.7]
    ~ adjust("paperTrail", -1)
    A glitch doesn't keep a schedule. This one keeps 3:00. #id:kamil.kamil_day4.8
- -> END

=== kamil_day5 ===
The audit is today. Head office will be on the line. #id:kamil.kamil_day5.1
I made copies. Of everything. They're in the stairwell, step 14. #id:kamil.kamil_day5.2
{ flag("binder_four_taken"):
    Do you still have binder four? Don't tell me where. Just nod. #id:kamil.kamil_day5.3
}
* [I believe you, Kamil. #id:kamil.kamil_day5.4]
    ~ adjust("paperTrail", 1)
    Okay. Okay. Someone does. Write that down too. #id:kamil.kamil_day5.5
* [Go home, Kamil. #id:kamil.kamil_day5.6]
    ~ adjust("paperTrail", -1)
    Home has a seat. Here has a seat. Everywhere has a seat. #id:kamil.kamil_day5.7
- -> END

=== kamil_brush_off ===
{ tier():
- "wrong": Not here. It can hear. Later. Stairwell. #id:kamil.kamil_brush_off.1
- "odd": Busy. Batch 4 again. Seventeen seats logged the same voice at 9:14. Same second. #id:kamil.kamil_brush_off.2
- else: Can't talk. Cross-checking 212 complaint references against batch 4. By hand. Again. #id:kamil.kamil_brush_off.3
}
-> END

// What Kamil says when the Intern hands him a Task.
=== kamil_hand_off ===
Fine. I'll do it properly. Reference, date, time, signature, the lot. #id:kamil.kamil_hand_off.1
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
