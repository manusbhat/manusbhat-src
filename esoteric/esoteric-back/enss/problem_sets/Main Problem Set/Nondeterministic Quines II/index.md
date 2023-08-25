[kb_limit: 256000]
[ms_limit: 1000]
[rating: 340]
[creation: 2023-08-14T16:00]
[close:    2023-08-14T16:00]

mat expo of a markov chain, but "compiler" errors change it every so often.

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