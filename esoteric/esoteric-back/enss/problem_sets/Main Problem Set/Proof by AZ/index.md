[kb_limit: 256000]
[ms_limit: 1000]
[rating: 140]
[creation: 2023-08-21T16:00]
[close:    2023-08-21T16:00]

TODO

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

Problem Credits: Manu