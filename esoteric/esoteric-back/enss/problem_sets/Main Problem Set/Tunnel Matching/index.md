[kb_limit: 256000]
[ms_limit: 1000]
[rating: 330]
[creation: 2023-08-14T16:00]

At Wilson Park, there are $1 \le N \le 10^5$ burrowing entrances. As it happens to turn out, these entrances are connected by $N - 1$ bidirectional tunnels such that you can reach any burrow from any other burrow. 

Also present at the field are $1 \le M \le 10^5$ rabbits. Each rabbit is currently located at one of the burrowing entrances (multiple rabbits may be at the same entrance), and has a target burrow it must reach. Moreover, bunnies will take the direct path to their target. At the simulation start, all rabbits will begin moving at the same time and at the same pace.

For this version of the problem, rabbits are able to use their sense of smell to determine any bunnies that have been (or are) in the current burrow. Knowing this crucial fact, Mugs would like to find out the amount of pairs of bunnies $(u, v)$ such that either $u$ was able to track down the scent of $v$ or vice-versa.

For a flavortext-removed problem :(, you are given a tree with $N$ nodes and $M$ paths specified by starting and ending locations. Output the amount of pairs of paths such that two paths share a node, endpoints inclusive.

# Input 

The first line contains the integers $N$ and $M$. The next $N - 1$ lines contain two integers: $1 \le u_i, v_i \le N, u_i \ne v_i$, indicating that there is a tunnel between burrows $u_i$ and $v_i$. The next $M$ lines contain two integers: $s_i$ and $t_i$, indicating that rabbit $i$ starts at node $s_i$ and wants to reach $e_i$. It is possible that $s_i = e_i$.

# Output

Output one line, the amount of unordered pairs of rabbits $(u, v)$ such that either $u$ was able to track down the scent of $v$ or vice-versa. Remember to use `long long`!

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
3 2
1 5
4 7
7 6
```
```out
4
```
Path 1 intersects with Path 2 and Path 4. Path 2 also intersects with Path 4. Finally, Path 3 intersects with Path 4. This gives us a total of 4 pairs.

# Variations
While you don't need HLD to solve this problem as stated, here are two followups that you might want to try:

Challenge 1: What if instead of everyone starting at the same time, rabbit 1 first completes his journey, then rabbit 2 starts, then rabbit 3, etc.? Essentially, for each rabbit compute the number of rabbits before it that it can track down the scent of. I was unable to do this without HLD, but it might be possible.

Challenge 2: What if the scent evaporates instantly, and thus bunnies are only able to recognize bunnies in exact same burrow as them (or crossing the same tunnel) at the exact same timestamp? This is a much harder problem, but I think HLD along with some clever graph manipulations gets you the majority of the way there.

Problem Credits: Manu