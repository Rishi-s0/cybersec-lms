# 🎯 Interactive Quizzes - 80% Pass Requirement

## ✅ Feature Implemented

Students must now **pass the quiz with 80% or higher** (4 out of 5 correct answers) before they can complete a lesson and move to the next one.

---

## 🎯 How It Works

### 1. **Interactive Quiz System**
- 5 multiple-choice questions per lesson
- Real-time answer selection
- Instant feedback after submission
- Detailed explanations for each question

### 2. **80% Pass Requirement**
- Students must get **4 out of 5 questions correct** (80%)
- "Complete Lesson" button is **disabled** until quiz is passed
- Can retry quiz if failed
- Visual indicators show pass/fail status

### 3. **Combined Requirements**
- ✅ Watch 90% of video (if video exists)
- ✅ Pass quiz with 80%+ (if quiz exists)
- ✅ Both requirements must be met to complete lesson

---

## 🎨 Quiz UI Features

### Quiz Header:
```
┌─────────────────────────────────────────────┐
│ 🎯 Lesson Quiz - 5 Questions                │
│                        Pass: 80% (4/5 correct)│
└─────────────────────────────────────────────┘
```

### Question Display:
```
1. What is the primary goal of cybersecurity?
   ○ Making money
   ● Protecting digital assets  (Selected)
   ○ Creating software
   ○ Managing databases
```

### After Submission - Correct Answer:
```
1. What is the primary goal of cybersecurity?
   ○ Making money
   ✓ Protecting digital assets  (Correct!)
   ○ Creating software
   ○ Managing databases

✓ Correct! Cybersecurity primarily focuses on 
  protecting digital assets from various threats.
```

### After Submission - Wrong Answer:
```
1. What is the primary goal of cybersecurity?
   ✗ Making money  (Your answer - Incorrect)
   ✓ Protecting digital assets  (Correct answer)
   ○ Creating software
   ○ Managing databases

✗ Incorrect. Cybersecurity primarily focuses on 
  protecting digital assets from various threats.
```

---

## 🎮 User Experience Flow

### Step 1: Complete Video Requirement
```
Student watches 90% of video
↓
Green checkmark appears
"✅ Video requirement met!"
```

### Step 2: Take Quiz
```
Student scrolls to quiz section
↓
Reads 5 questions
↓
Selects answers (radio buttons)
↓
"Submit Quiz" button enabled when all answered
```

### Step 3: Submit Quiz
```
Student clicks "Submit Quiz"
↓
Answers are checked instantly
↓
Results displayed with explanations
```

### Step 4A: Quiz Passed (80%+)
```
✅ Quiz Passed!
Score: 4/5 (80%)
↓
"Complete Lesson" button becomes enabled
↓
Can proceed to next lesson
```

### Step 4B: Quiz Failed (<80%)
```
❌ Quiz Failed
Score: 2/5 (40%)
↓
"Retry Quiz" button appears
↓
Can try again (unlimited attempts)
```

---

## 📊 Quiz States

### State 1: Not Started
- All questions visible
- Radio buttons enabled
- No answers selected
- "Submit Quiz" button disabled

### State 2: In Progress
- Student selecting answers
- Selected options highlighted in blue
- "Submit Quiz" button enabled when all answered

### State 3: Submitted - Passed
```
┌─────────────────────────────────────────────┐
│ ✅ Quiz Passed!                              │
│ Score: 4/5 (80%)                            │
└─────────────────────────────────────────────┘
```
- Green success box
- Correct answers shown in green with ✓
- Wrong answers shown in red with ✗
- Explanations displayed
- Can't change answers

### State 4: Submitted - Failed
```
┌─────────────────────────────────────────────┐
│ ❌ Quiz Failed                               │
│ Score: 2/5 (40%)          [Retry Quiz]      │
└─────────────────────────────────────────────┘
```
- Red failure box
- "Retry Quiz" button available
- Can try again unlimited times

---

## 🔒 Complete Lesson Requirements

### Lesson with Video + Quiz:
```
Requirements:
• Watch 90% of video ✓
• Pass quiz (80%+) ✓

[Complete Lesson] (Enabled)
```

### Lesson with Only Video:
```
Requirements:
• Watch 90% of video ✓

[Complete Lesson] (Enabled)
```

### Lesson with Only Quiz:
```
Requirements:
• Pass quiz (80%+) ✓

[Complete Lesson] (Enabled)
```

### Requirements Not Met:
```
Requirements:
• Watch 90% of video ✗
• Pass quiz (80%+) ✗

[Complete Lesson] (Disabled - Grey)
```

---

## 📝 Quiz Questions Added

### Lesson 1: What is Cybersecurity? (5 Questions)
1. Primary goal of cybersecurity
2. CIA Triad components
3. Confidentiality definition
4. Network security focus
5. Cyberattack frequency

### Lesson 2: Common Cyber Threats (5 Questions)
1. Worm characteristics
2. Spear phishing definition
3. WannaCry ransomware
4. DDoS acronym
5. Human error percentage

---

## 🎯 Scoring System

### Calculation:
```
Score = (Correct Answers / Total Questions) × 100
Pass Threshold = 80%

Examples:
5/5 correct = 100% ✅ Pass
4/5 correct = 80%  ✅ Pass
3/5 correct = 60%  ❌ Fail
2/5 correct = 40%  ❌ Fail
```

### Pass/Fail Logic:
- **Pass**: Score ≥ 80% → Can complete lesson
- **Fail**: Score < 80% → Must retry quiz

---

## 🚫 Anti-Cheat Features

### What Students CANNOT Do:
- ❌ Skip quiz and complete lesson
- ❌ Complete lesson with <80% score
- ❌ Change answers after submission
- ❌ See correct answers before submitting

### What Students CAN Do:
- ✅ Take unlimited attempts
- ✅ See explanations after submission
- ✅ Learn from mistakes
- ✅ Retry immediately after failing

---

## 🧪 Testing Instructions

### Test the Quiz Feature:

1. **Login**
   ```
   Email: student@hackademy.com
   Password: password123
   ```

2. **Enroll & Open Lesson**
   - Enroll in "Introduction to Cybersecurity"
   - Open Lesson 1
   - Watch video to 90%

3. **Take Quiz**
   - Scroll to quiz section
   - See 5 questions
   - Select answers (try getting 2-3 wrong)
   - Click "Submit Quiz"

4. **See Results**
   - If failed: See red box, "Retry Quiz" button
   - If passed: See green box, can complete lesson

5. **Retry (if failed)**
   - Click "Retry Quiz"
   - Quiz resets
   - Try again with correct answers

6. **Complete Lesson**
   - Pass quiz with 80%+
   - "Complete Lesson" button becomes enabled
   - Click to complete and unlock next lesson

---

## 💡 Educational Benefits

### For Students:
- ✅ Reinforces learning
- ✅ Immediate feedback
- ✅ Learn from mistakes
- ✅ Unlimited attempts (no pressure)
- ✅ Clear explanations

### For Instructors:
- ✅ Ensures comprehension
- ✅ Prevents rushing through content
- ✅ Quality control
- ✅ Better completion metrics
- ✅ Engaged learners

---

## 🔄 Future Enhancements

Possible improvements:
1. **Timed Quizzes** - Add time limits
2. **Question Bank** - Randomize questions
3. **Difficulty Levels** - Adaptive quizzes
4. **Analytics** - Track attempt history
5. **Leaderboards** - Gamification

---

## ✅ Status: COMPLETE

**Interactive quizzes with 80% pass requirement are now live!**

Students must:
1. ✅ Watch 90% of video
2. ✅ Pass quiz with 80%+ (4/5 correct)
3. ✅ Then complete lesson and proceed

**Quality learning guaranteed!** 🎓🎯
