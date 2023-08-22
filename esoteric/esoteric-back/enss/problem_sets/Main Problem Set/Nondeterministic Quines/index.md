[kb_limit: 256000]
[ms_limit: 1000]
[rating: 270]
[creation: 2023-08-14T16:00]
[close:    2023-08-14T16:00]

Mugs and Alice have been watching a lot of wrestling matches lately. They have been watching so much wrestling that they have decided to start their own wrestling league! The two have already recruited $1 \le N \le 10^5$ rabbits to join their league. Conveniently, $N = 2^K$ for some integer $K \ge 0$.

To prepare for the logistics of the competition, the two would like to know the total amount of brackets that could potentially occur. Formally, a bracket specifies which rabbit wins each of the $N - 1$ matches. Two brackets are considered different if for any given match their predicted winner differs. Because apparently no one is able to understand how a tournament bracket is supposed to be set up (see Rabbit Wrestling League II fmi), for this problem we will initially have rabbit $1$ face $2$, $3$ face $4$, and so on. Then, the winner of $1$ vs $2$ faces the winner of $3$ vs $4$ and so on (essentially a perfect binary tree where the leaves are labelled with the natural numbers).

However, there's a catch! For some $0 \le P \le \min\left(10^5, 2\binom{N}{2}\right)$ pairs of rabbits, Alice is confident that bunny $a_i$ will definitively win over bunny $b_i$ should the two ever face each other. Therefore, Mugs and Alice would like to discount all brackets that violate Alice's observations.

How many brackets are possible under Alice's constraints, mod $10^9 + 7$?

# Input

The first line contains $N$ and $P$. The next $P$ lines contain two integers $1 \le a_i, b_i \le N$, denoting that rabbit $a_i$ is guaranteed to out-wrestle rabbit $b_i$. 

# Output

Output one line, the total amount of possible brackets consistent with Alice's observations, mod $10^9 + 7$.

# Example

```in
4 0
```
```out
8
```

When $P = 0$, it can be shown that the answer is always $2^{N-1}$ (subject to mods).

```in
4 2
1 2
2 3
```
```out
4
```
Since $1$ always beats $2$, the second condition never even applies. From here, the winner of $3$ and $4$ has two options. Then, the winner of $1$ vs the previous winner also has two options, giving us a total of $4$ possible brackets.

# Variations
Consider how to deal with first-round byes in the event that $N$ is not a power of 2. Also, take a look at Rabbit Wrestling League II to incorporate a proper tournament bracket set up.

Problem Credits: Manu