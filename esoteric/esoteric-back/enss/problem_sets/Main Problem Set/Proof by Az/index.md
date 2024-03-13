[kb_limit: 256000]
[ms_limit: 1000]
[rating: 150]
[creation: 2023-10-22T16:00]

Mugs is trying to eat strawberry jam, but there appears to be a slight predicament. The jam is sticky and not pouring out of the jar properly!

In particular, there are $1 \le N \le 10^5$ chunks of jam, each of which is a contiguous segment of the jar. The $i$th chunk can be represented as an interval on a number line, spanning $1 \le s_i < f_i \le 10^9$. No two chunks overlap at the start. Initially every $1 \le t_i \le 10^4$ seconds, it advances one unit left. However, if a chunk moves to the left and collides with another chunk, it will join forces with that chunk and they will move together. The newly joined chunk will continue move to the left using the speed of the left most chunk in the collision. Note that in the simulation, in each timestep, chunks are moved in order of increasing $s_i$. This means that there cannot be a case where a chunk collides with another chunk for only $0$ seconds. Also, once a chunk fully crosses $x = 0$, it is removed from the simulation.

Now that we have the situation in hand, Mugs is trying to convince Alice that he will be able to pour the entirety of the jar fast enough, however Alice does not believe him and wants a proof. Inspired by the competitive programmer's favorite proof strategy of Proof by AC, Mugs tries to convince Alice. However, Mugs misheard and instead try to use the strategy Proof by Az instead!

Therefore, Az, you will have to help Mugs determine the amount of time it will take for every single chunk to entirely cross the $x = 0$ point.

# Input

The first line contains $N$.
The next $N$ lines each contain $s_i$, $f_i$, and $t_i$, denoting the range of the chunk and the amount of seconds it takes to move one unit left initially.

# Output

Output $N$ space separated integers on a single line, denoting the time it takes for each chunk to cross the $x = 0$ point. We say a chunk crosses the $x = 0$ point the moment its right boundary crosses.

# Example

```in
4
1 3 3
4 5 1
6 7 2
8 10 1
```
```out
9 12 14 18
```

The first chunk takes $9$ seconds to fully cross. While the second would normally take $5$ seconds, it collides with the first chunk at $t = 1$, and moves together with it from there. The third chunk will not intersect any other chunks on its journey, and thus takes $14$ seconds. The final chunk would normally take $9$ seconds, but collides with the third chunk at $t = 1$, and thus takes $18$ seconds total.

Problem Credits: Manu.