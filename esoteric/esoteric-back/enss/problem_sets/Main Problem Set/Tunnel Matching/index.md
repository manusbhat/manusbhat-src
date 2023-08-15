[kb_limit: 256000]
[ms_limit: 1000]
[rating: 340]
[creation: 2023-08-14T16:00]

At Wilson Field, there are $1 \le N \le 10^5$ burrowing entrances. As it happens to turn out, these entrances are connected by $N - 1$ bidirectional tunnels such that you can reach any burrow from any other burrow. 

Also present at the field are $1 \le M \le 10^5$ rabbits. Each rabbit is currently located at one of the burrowing entrances (multiple rabbits may be at the same entrance), and has a target burrow it must reach. Moreover, they will take the direct path to their target. At the simulation start, all rabbits will begin moving at the same time and at the same pace.

For this version of the problem, rabbits are able to use their sense of smell to determine any prior bunnies that have been (or are) in the current burrow. Knowing this crucial fact, Mugs would like to find out the amount of pairs of bunnies $(u, v)$ such that either $u$ was able to track down the scent of $v$ or vice-versa.

For a flavortext-removed problem :(, you are given a tree with $N$ nodes and $M$ paths specified by starting and ending locations. Output the amount of pairs of paths such that two paths share a node, endpoints inclusive.

# Input 

The first line contains the integers $N$ and $M$. The next $N - 1$ lines contain two integers: $1 \le u_i, v_i \le N, u_i \ne v_i$, indicating that there is a tunnel between burrows $u_i$ and $v_i$. The next $M$ lines contain two integers: $s_i$ and $t_i$, indicating that rabbit $i$ starts at node $s_i$ and wants to reach $e_i$. It is possible that $s_i = e_i$.

# Output

Output one line, the amount of unordered pairs of rabbits $(u, v)$ such that either $u$ was able to track down the scent of $v$ or vice-versa. Make sure to use `long long`!

# Example
```in
8 4
1 2
1 3
2 4
3 5
3 6
4 7
5 8
// empty line for visuals, will not be in stdin
3 2
1 5
4 7
7 6
```
```out
5
```
Path 1 intersects with Path 2 and Path 4. Path 2 also intersects with Path 4. Finally, Path 3 intersects with Path 4. This gives us a total of 5 pairs.

# Variations
For a challenge, consider a harder problem where rabbits can only identify bunnies in the same burrow as them at the same points in time (or crossing the same tunnel as them). I was unable to do this fully without using Plat techniques (HLD in particular), but you can actually get pretty far using just Gold algorithms.

Problem Credits: Manu