[kb_limit: 256000]
[ms_limit: 1000]
[rating: 320]
[creation: 2023-08-28T16:00]

Mugs is back at the strawberry fields! There are $N$ strawberry patches which are arranged in a line such that there are $1 \le N \le 5 \cdot 10^4$ patches and patch $i$ is located at $x = i$. Moreover, patch $i$ initially has a juiciness of $1 \le j_i \le 10^5$.

Mugs wonders how much tastiness he can acquire if he starts in various locations. Formally, he wants to know if he starts at $x = x_0$, keeps jumping with a constant size of $-N \le K \le N$, and eats at every single patch he lands at, how much tastiness he can acquire. Note that Mugs can jump backwards, but he cannot jump past $x = 1$ or $x = N$. Also, the tastiness of his entire journey is the sum of the juiciness of the patches he jumps too.

You will be given $1 \le Q \le 2 \cdot 10^4$ queries. If a query is of type $1$, then you should output the tastiness of his journey given the starting location and jump size. If a query is of type $2$, you will be tasked with updating the juiciness of a patch. In all future queries of type $1$, you must use the updated juice factor.

# Input

The first line of input contains the integers $N$ and $Q$. The second line contains $N$ integers, $s_1 \ldots s_N$.

The next $Q$ lines contain $3$ integers, $t, x$ and $y$. 
If $t = 1$, then $1 \le x \le N, -N \le y \le N, y \ne 0$ you should print the tastiness of his journey given the starting location $x$ and jump size $y$. 
If $t = 2$, then $1 \le x \le N, 1 \le y \le 10^5$ you should update the juiciness of patch $x$ to $y$.

# Output

For each query of type $1$, output the tastiness of his journey given the starting location and jump size on a new line. Remember to use `long long`!

# Example

```in
3 3
3 3 3
1 1 1
2 1 2
1 3 -2
```

```out 
9
5
```

In the first query, Mugs starts at $x = 1$ and jumps with a size of $1$. He lands at $x = 1, 2, 3$ and acquires $3 + 3 + 3 = 9$ tastiness. In the third query, Mugs starts at $x = 1$ and jumps with a size of $-2$. He lands at $x = 3, 1$ and acquires $3 + 2 = 5$ tastiness. Note that the juice factor of patch $1$ had been updated to $2$.

Problem Credits: Manu, not very complicated so likely a duplicate. Tested by Jiaming (who also contributed a faster solution).