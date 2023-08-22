[kb_limit: 256000]
[ms_limit: 1000]
[rating: 130]
[creation: 2023-08-21T16:00]


Mugs is learning to type! Because his arms are stubby, this keyboard is one row and can be thought of as one dimensional. In rabbit-lang, there are $C$ consonants and $V$ vowels such that $1 \le  C + V \le 10^5$ and both $C$ and $V$ are non-negative. 

Mugs is exploring alternatives to the standard QWERTY keyboard layout. He has decided to create a custom keyboard layout that is optimal for him. To score certain layouts, he has developed a metric. For each $i \in \{1, \ldots, C + V\}$, a keyboard receives $-10^4 \le x_i \le 10^4$ points if a consonant is present and $-10^4 \le y_i \le 10^4$ points if a vowel is a present. The keyboard's total score is the sum of the individual contributions, across all $i$. Of course, a keyboard must ensure that there exactly $C$ consonants and $V$ vowels.

Given the number of consonants and vowels, and the points for each letter, what is the maximum score a keyboard can achieve?

# Input

The first line of input is $C$ and $V$. 
The second line contains $C + V$ integers, $x_1, \ldots, x_{C+V}$.
The third line contains $C + V$ integers, $y_1, \ldots, y_{C+V}$.

# Output

Output one line, the maximum number of points a keyboard can achieve.

# Example
```in
3 2
5 -2 0 0 -1
-4 -3 2 5 -2
```
```out
9
```

In this example, if a keyboard is layed out as `C C V V C`, its score will be $x_1 + x_2 + y_3 + y_4 + x_5 = 5 - 2 + 2 + 5 - 1 = 9$. It can be shown this is the maximal possible score. 

# Variations

See Keyboard II for a more challenging version of this problem!

Problem Credits: Manu