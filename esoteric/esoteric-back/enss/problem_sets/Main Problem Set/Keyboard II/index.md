[kb_limit: 256000]
[ms_limit: 1000]
[rating: 320]
[creation: 2023-08-21T16:00]

Mugs is learning to type! Because his arms are stubby, this keyboard is at most $1 \le K \le 4$ rows tall and can be thought of as a narrow two-dimensional grid. In rabbit-lang, there are $KC$ consonants and $KV$ vowels such that $1 \le C \le 10^4$ and $1 \le V \le 50$. Moreover, consonants and vowels must be placed in $K \times 1$ horizontal or vertical blocks. For instance if $K = 3$, then the following is valid configuration:

```text
C C C V
V V V V
C C C V 
```

But this is not (some of the vowels and consonants are not in a single block):

```text
C C C V
C V V V
C C V C
```

Mugs is exploring alternatives to the standard QWERTY keyboard layout. He has decided to create a custom keyboard layout that is optimal for him. To score certain layouts, he has developed a metric. For each $i \in \{1, \ldots, C + V\}$ and $j \in \{1, \ldots, K\}$, a keyboard receives $-10^4 \le x_{j, i} \le 10^4$ points if a consonant is present and $-10^4 \le y_{j, i} \le 10^4$ points if a vowel is a present. The keyboard's total score is the sum of the individual contributions, across all $i$ and $j$. Of course, a keyboard must ensure that there exactly $KC$ consonants and $KV$ vowels, and that they must be placed into the appropriate blocks.

Given the number of consonants and vowels, and the points for each letter, what is the maximum score a keyboard can achieve?

# Input

The first line of input is $K, C$ and $V$, where $C$ represents the number of consonant blocks and $V$ represents the number of vowel blocks.

The next K lines contain $C + V$ integers, where the $j$th line of the block contains $x_{j, i}, \ldots, x_{j, C+V}$.

The final K lines also contain $C + V$ integers, where the $j$th line of the block contains $y_{j, 1}, \ldots, y_{j, C+V}$.

# Output

Output one line, the maximum number of points a keyboard can achieve.

# Example
```in
2 2 1
1 2 3
4 5 6
-31 8 8
-31 0 0

```
```out
32
```

In this example, if a keyboard is laid out as:
```text
C V V
C C C
```
The key board will receive a score of $1 + 4 + 8 + 8 + 5 + 6 = 32$. It can be shown this is the maximal possible score.

Problem Credits: Manu. Tested by Jiaming.