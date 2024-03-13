[kb_limit: 256000]
[ms_limit: 1000]
[rating: 260]
[creation: 2023-08-14T16:00]

$1 \le N \le 10^5$ bunnies are placed along $N$ burrows, such that each burrow contains exactly $1$ rabbit and $N$ is even. These burrows are connected by $N - 1$ bidirectional tunnels such that you can reach any burrow from any other burrow.

Every rabbit has a unique sister rabbit. This property is commutative. That is if rabbit $a$ is the sister of rabbit $b$, then rabbit $b$ is the sister of rabbit $a$. Moreover, no rabbit is the sister of itself. 

Mugs is slightly disappointed that the sister rabbits are currently separated. He needs your help! In a single operation, you can swap the position of any two rabbits (sisters or not). What is the minimum number of operations required to ensure that every rabbit is next to its sister? We say that a rabbit is next to its sister if by the end of the simulation, the two rabbits are in adjacent burrows.

# Input

The first line contains a single integer, $N$. The next $N - 1$ lines contain two integers $1 \le a_i, b_i \le N$, denoting that burrows $a_i$ and $b_i$ are connected by a tunnel. The final $\frac{N}{2}$ lines contain two integers $1 \le c_i, d_i \le N$, denoting that rabbit $c_i$ is the sister of rabbit $d_i$. It is guaranteed that each rabbit has exactly one sister rabbit. Note that initially, rabbit $i$ is located in burrow $i$.

# Output

Output one line, the minimum number of operations required to ensure that every rabbit is next to its sister. If this is impossible, output $-1$.

# Example

```in
4 
1 2
2 3
3 4
1 4
2 3
```
```out
1
```

In this example, where the tree is a linked list, we can swap bunnies $1$ and $3$, resulting in the configuration of $3, 2, 1, 4$. Since $2$ and $3$ are sisters, and $1$ and $4$ are sisters, this is a valid configuration. Thus, the answer is $1$.

# Variations
For a slightly harder challenge, in addition to outputting the minimum amount of swaps, output the number of sequences of swaps that achieve this minimum. You can do this in $O(N^2)$ time, which I believe is optimal. I also considered a problem where you can only swap rabbits in adjacent fields. My friends and I came up with possible solutions, though we were never able to prove them.

Problem Credits: Manu. Tested by Jiaming.